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
	var widget = avalon.ui.accordion = function(element, data, vmodels){
		var options = data.accordionOptions;
		if(options.data){
			avalon.uibase.initData({
				title : null,
				content : null,
				iconCls : null,
				tools : null,
				selected : false
			},options.data);
		}else{
			options.data = getData(element);
		}
		function toggleSelect(index){
			var target = vmodel.data[index];
			var isSelected = false;
			var selections = toggleSelect.selections;
			avalon.each(selections,function(i,item){
				if(item === target){
					selections.splice(i,1);
					isSelected = true;
					return target.selected = false;
				}
			});
			if(!isSelected){
				target.selected = true;
				if(!vmodel.multiple && selections.length > 0){
					selections[0].selected = false;
					selections.splice(0,1);
				}
				selections.push(target);
			}
		}
		toggleSelect.selections = null;
		var vmodel = avalon.define(data.accordionId,function(vm){
			avalon.mix(vm,options);
			vm.$skipArray = ["toolClick"];
			vm.$init = function(){
				var $el = avalon(element);
				$el.addClass("accordion");
				avalon.uibase.setAttr($el,{
					"ms-class" : "accordion-border:border",
					"ms-css-width" : "width",
					"ms-css-height" : "height"
				});
				element.innerHTML = templete;
				toggleSelect.selections = getSelections(vmodel.multiple,vmodel.data);
				avalon.scan(element, vmodel);
			};
			vm.$toggleSelect = function(e,index){
				avalon.uibase.propagation({
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
	widget.defaults = {
		data : null,
		height : null,
		width : null,
		border : true,
		multiple : false,
		toolClick : avalon.noop
	};
});