define(["avalon.uibase","text!./avalon.combobox.html"],function(avalon,templete){
	var widget = avalon.ui.combobox = function(element, data, vmodels){
		var options = data.comboboxOptions;
		avalon.uibase.initData({
			selected : false
		},options.data);
		function toggleSelectItem(el){
			var selected = toggleSelectItem.selected;
			if(vmodel.multiple){

			}else{
				var s0 = selected[0];
				if(el === s0) return;
				s0 && (s0.selected = false);
				el.selected = true;
				selected[0] = el;
			}
		}
		function getNextEl(el){
			var next = el.nextSibling;
			while(next && next.nodeType !== 1){
				next = next.nextSibling;
			}
			return next;
		}
		toggleSelectItem.selected = [];
		var vmodel = avalon.define(data.comboboxId,function(vm){
			avalon.mix(vm,options);
			vm.widgetElement = element;
			vm.$skipArray = ['widgetElement','onSelect','textField','valueField','width',
			'panelWidth','editable','multiple','formatter','loadData'];
			vm.isItemsVisible = false;
			vm.text = '';
			vm.$init = function(){
				avalon(element).addClass("combobox");
				element.innerHTML = templete
					.replace("MS_OPTIONS_NAME",element.name ? (" name='" + element.name + "'") : "")
					.replace("MS_OPTIONS_FORMATTER",vmodel.formatter);
				avalon.scan(element, vmodel);
				vmodel.$fire("value",vmodel.value);
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
						vmodel.isItemsVisible = false;
						var el = this["data-el"];
						vmodel.value = el[vmodel.valueField];
					}
				},e);
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
			vm.loadData = function(){
				
			};
		});
		vmodel.$watch("value",function(newValue){
			var valueField = vmodel.valueField;
			avalon.each(vmodel.data,function(i,item){
				if(item[valueField] === newValue){
					vmodel.text = item[vmodel.textField];
					toggleSelectItem(item);
					vmodel.onSelect.call(this,item);
					return false;
				}
			});
		});
		return vmodel;
	};
	widget.version = 1.0;
	widget.defaults = {
		panelWidth : null,
		width : null,
		formatter : "{{el.text}}",
		textField : "text",
		valueField : "value",
		multiple : false,
		editable : false,
		data : [],
		value : null,
		/*事件*/
		onSelect : avalon.noop
	};
});