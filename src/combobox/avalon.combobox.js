define(["avalon.uibase","text!./avalon.combobox.html"],function(avalon,templete){
	function initData(data){
		avalon.uibase.initData({
			selected : false
		},data);
	}
	var widget = avalon.ui.combobox = function(element, data, vmodels){
		var options = data.comboboxOptions;
		initData(options.data);
		/*
		选中或反选项 所有选中的项存放在selected数组中
		*/
		function toggleSelectItem(el){
			var selected = toggleSelectItem.selected;
			if(vmodel.multiple){
				//当前el是否已选过
				var isSel = false;
				avalon.each(selected,function(i,item){
					if(el === item){
						el.selected = false;
						selected.splice(i,1);
						vmodel.values.splice(i,1);
						isSel = true;
						return false;
					}
				});
				if(!isSel){
					selected.push(el);
					vmodel.values.push(el[vmodel.textField]);
					el.selected = true;
				}
				return !isSel;
			}else{
				var s0 = selected[0];
				if(el === s0) return;
				s0 && (s0.selected = false);
				el.selected = true;
				selected[0] = el;
			}
		}
		function getSelVals(){
			var valArr = [];
			var valueField = vmodel.valueField;
			avalon.each(toggleSelectItem.selected,function(i,item){
				valArr.push(item[valueField]);
			});
			return valArr.join(",");
		}
		toggleSelectItem.selected = [];
		function getNextEl(el){
			var next = el.nextSibling;
			while(next && next.nodeType !== 1){
				next = next.nextSibling;
			}
			return next;
		}
		function getMultipleEl(){
			return avalon(element.children[0].children[0]);
		}
		function scrollMultiple(){
			getMultipleEl().scrollLeft(9999);
		}
		function doSelItem(item,isOnSel){
			var re = toggleSelectItem(item);
			isOnSel && vmodel[re ? "onSelect" : "onUnselect"].call(vmodel,item);
		}
		var vmodel = avalon.define(data.comboboxId,function(vm){
			avalon.mix(vm,options);
			vm.widgetElement = element;
			vm.$skipArray = ['widgetElement','onSelect','onUnselect','textField','valueField','width',
				'panelHeight','editable','multiple','formatter','loadData','clear','setValue'];
			vm.isItemsVisible = false;
			vm.text = '';
			if(vm.multiple){
				vm.values = [];
			}
			vm.$init = function(){
				var $el = avalon(element).addClass("combobox");
				element.innerHTML = templete
					.replace("MS_OPTIONS_NAME",element.name ? (" name='" + element.name + "'") : "")
					.replace("MS_OPTIONS_FORMATTER",vmodel.formatter);
				avalon.scan(element, vmodel);
				if(!vmodel.panelWidth){
					vmodel.panelWidth = $el.width() - 2;
				}
				vmodel.setValue(vmodel.value);
			};
			vm.$onItemsBlur = function(){
				vmodel.isItemsVisible = false;
			};
			vm.$onClickDown = function(){
				var next = getNextEl(this);
				vmodel.isItemsVisible = true;
				next.focus();
			};
			vm.$onClickItem = function(e){
				avalon.uibase.propagation.call(this,{
					item : function(e){
						var el = this["data-el"];
						if(vmodel.multiple){
							doSelItem(el,true);
							scrollMultiple();
						}else{
							vmodel.isItemsVisible = false;
							vmodel.setValue(el[vmodel.valueField],true);
						}
					}
				},e);
			};
			vm.$onKeydown = function(e){
				if(!vmodel.multiple) return;
				var code = e.keyCode;
				if(code === 37 || code === 39){
					var $this = getMultipleEl();
					var scrollLeft = $this.scrollLeft();
					scrollLeft += (code === 37 ? -20 : 20);
					$this.scrollLeft(scrollLeft);
				}
			};
			vm.$remove = function(){
				element.innerHTML = element.textContent = "";
			};
			vm.$onClickContent = function(){
				if(!vmodel.editable){
					vm.$onClickDown.call(getNextEl(this));
				}
			};
			/****************************方法*****************************/
			vm.loadData = function(data){
				initData(data);
				vmodel.clear();
				vmodel.data = data;
			};
			vm.clear = function(){
				vmodel.text = '';
				avalon.each(toggleSelectItem.selected,function(i,item){
					item.selected = false;
				});
				toggleSelectItem.selected = [];
				vmodel.values = [];
				vmodel.value = '';
			};
			/*
			选中或反选（multiple为true）项方法
			newValue 目标项的value值
			isOnSel 是否触发onSelect onUnselect事件
			*/
			vm.setValue = function(newValue,isOnSel){
				var valueField = vmodel.valueField;
				var multiple = vmodel.multiple;
				if(multiple){
					vmodel.clear();
					if(typeof newValue == 'string'){
						newValue = newValue.join(",");
					}else if(avalon.type(newValue) !== 'array'){
						newValue = [newValue];
					}
				}
				avalon.each(vmodel.data,function(i,item){
					var value = item[valueField];
					if(multiple){
						for(var j=0,jj=newValue.length;j<jj;j++){
							var val = newValue[j];
							if(value === val){
								doSelItem(item,isOnSel);
								newValue.splice(j,1);
								return false;
							}
						}
					}else{
						if(value === newValue){
							vmodel.value = newValue;
							vmodel.text = item[vmodel.textField];
							toggleSelectItem(item);
							isOnSel && vmodel.onSelect.call(vmodel,item);
							return false;
						}
					}
				});
				if(multiple){
					vmodel.value = getSelVals();
					scrollMultiple();
				}
			};
		});
		return vmodel;
	};
	widget.version = 1.0;
	widget.defaults = {
		panelWidth : null,
		panelHeight : null,
		width : null,
		formatter : "{{el.text}}",
		textField : "text",
		valueField : "value",
		multiple : false,
		editable : false,
		data : [],
		value : null,
		/*事件*/
		onSelect : avalon.noop,
		onUnselect : avalon.noop
	};
});