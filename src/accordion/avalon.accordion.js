define(["avalon.uibase","text!./avalon.accordion.html"],function(avalon,templete){
	function getData(element){
		var result = [];
		var selectedIndex = null;
		avalon.each(element.children,function(i,item){
			var title = item.title;
			if(title){
				var data = avalon.uibase.parseOptions(item);
				if(item.selected){
					if(selectedIndex === null){
						selectedIndex = i;
					}else{
						item.selected = false;
					}
				}
				result.push({
					title : title,
					content : item.innerHTML,
					iconCls : data.iconCls,
					tools : data.tools || null,
					selected : data.selected
				});
			}
		});
		return result;
	}
	function getSelections(multiple,data){
		var selections = [];
		for(var i=0,item;item=data[i++];){
			if(multiple){
				item.selected && selections.push(item);
			}else{
				if(item.selected){
					if(selections.length === 0){
						selections.push(item);
					}else{
						item.selected = false;
					}
				}
			}
		}
		return selections;
	}
	function getIndexByTitle(vmodel,t){
		if(typeof t == 'string'){
			avalon.each(vmodel.data,function(i,item){
				if(item.title === t){
					t = i;
					return false;
				}
			});
		}
		if(typeof t != 'number') return false;
		return t;
	}
	function initData(data,func){
		avalon.uibase.initData({
			title : null,
			content : null,
			iconCls : null,
			tools : null,
			selected : false
		},data,func);
	}
	var widget = avalon.ui.accordion = function(element, data, vmodels){
		var options = data.accordionOptions;
		if(options.data){
			initData(options.data);
		}else{
			options.data = getData(element);
		}
		function toggleSelect(index,isSelect){
			var target = vmodel.data[index];
			var isSelected = false;
			var selections = toggleSelect.selections;
			avalon.each(selections,function(i,item){
				if(item === target){
					if(isSelect){
						//目标已经被选择 直接触发选择事件
						vmodel.onSelect.call(item);
					}else{
						selections.splice(i,1);
						target.selected = false;
						vmodel.onUnselect.call(item);
					}
					isSelected = true;
					return false;
				}
			});
			if(!isSelected){
				if(isSelect === false){
					//目标已经被取消选择 直接触发反选事件
					vmodel.onUnselect.call(target);
				}else{
					target.selected = true;
					vmodel.onSelect.call(target);
					if(!vmodel.multiple && selections.length > 0){
						selections[0].selected = false;
						selections.splice(0,1);
					}
					selections.push(target);
				}
			}
		}
		toggleSelect.selections = null;
		var vmodel = avalon.define(data.accordionId,function(vm){
			avalon.mix(vm,options);
			vm.$skipArray = ["toolClick","getSelected","getSelections","getPanel",
				"select","unselect","add","remove","onSelect","onUnselect"];
			vm.$init = function(){
				var $el = avalon(element);
				$el.addClass("accordion");
				avalon.uibase.setAttr($el,{
					"ms-class" : "accordion-border:border",
					"ms-css-width" : "width"
				});
				element.innerHTML = templete;
				toggleSelect.selections = getSelections(vmodel.multiple,vmodel.data);
				avalon.scan(element, vmodel);
			};
			vm.$toggleSelect = function(e,index){
				avalon.uibase.propagation.call(this,{
					title : function(e){
						toggleSelect(Number(this.getAttribute("data-index")));
					},
					toolItem : function(e){
						e.stopPropagation();
						var index = Number(this.parentNode.parentNode.getAttribute("data-index"));
						var el = vmodel.data[index];
						var item = this["data-item"];
						item.click && item.click.call(item,el);
						vmodel.toolClick.call(item,Number(this.getAttribute("data-index")),el);
					}
				},e);
			};
			/****************************方法*****************************/
			//获取第一个选择的panel
			vm.getSelected = function(){
				return toggleSelect.selections[0];
			};
			//获取选择的panels
			vm.getSelections = function(){
				return toggleSelect.selections;
			};
			//根据索引或标题获取panel
			vm.getPanel = function(t){
				if(typeof t == 'number') return vmodel.data[t];
				var target;
				avalon.each(vmodel.data,function(i,item){
					if(item.title === t){
						target = item;
						return false;
					}
				});
				return target;
			};
			//根据索引或标题选中panel
			vm.select = function(t){
				var i = getIndexByTitle(vmodel,t);
				if(i === false) return;
				toggleSelect(i,true);
			};
			//根据索引或标题反选panel
			vm.unselect = function(t){
				var i = getIndexByTitle(vmodel,t);
				if(i === false) return;
				toggleSelect(i,false);
			};
			//增加panel
			vm.add = function(data){
				if(avalon.type(data) === 'object'){
					data = [data];
				}
				var selArr = [];
				initData(data,function(i,el){
					if(vmodel.multiple){
						el.selected && selArr.push(i);
					}else{
						if(el.selected){
							if(selArr.length === 0){
								selArr.push(i);
							}else{
								el.selected = false;
							}
						}
					}
				});
				var vmData = vmodel.data;
				var len = vmData.length;
				var selections = toggleSelect.selections;
				vmData.pushArray(data);
				if(selArr.length > 0){
					if(vmodel.multiple){
						avalon.each(selArr,function(i,item){
							selections.push(vmData[len + item]);
						});
					}else{
						if(selections.length > 0){
							selections[0].selected = false;
							selections.splice(0,1);
						}
						selections.push(vmData[len + selArr[0]]);
					}
				}
			};
			//删除panel
			vm.remove = function(t){
				var i = getIndexByTitle(vmodel,t);
				if(i === false) return;
				var target = vmodel.data[i];
				avalon.each(toggleSelect.selections,function(i,item){
					if(item === target){
						toggleSelect.selections.splice(i,1);
					}
				});
				vmodel.data.splice(i,1);
			};
		});
		vmodel.$watch("multiple",function(newVal){
			if(!newVal){
				var selections = toggleSelect.selections;
				var len = selections.length;
				//true -> false
				if(len === 1) return;
				for(var i=len-1;i>=0;i--){
					selections[i].selected = i === 0;
				}
				selections.splice(1);
			}
		});
		return vmodel;
	};
	widget.version = 1.0;
	widget.defaults = {
		data : null,
		//每个panel的内容高度，不包含title
		height : null,
		//整个accordion的宽度
		width : null,
		border : true,
		multiple : false,
		/****************************事件*****************************/
		toolClick : avalon.noop,
		onSelect : avalon.noop,
		onUnselect : avalon.noop
	};
});