define(["avalon.uibase","text!./avalon.datagrid.html"],function(avalon,templete){
	var widget = avalon.ui.datagrid = function(element, data, vmodels){
		var options = data.datagridOptions;
		function toggleSelected(index){
			var row = vmodel.data[index];
			var selected = toggleSelected.selected;
			if(vmodel.singleSelect){
				for(var i in selected){
					break;
				}
				if(i !== undefined){
					vmodel.data[+i]._selected = false;
					delete selected[i];
				}
				if(+i !== index){
					selected[index] = true;
					row._selected = true;
				}
			}else{
				toggleSelected.selected[index] = (row._selected = !row._selected);
			}
		}
		toggleSelected.selected = {};
		function initData(data){
			avalon.uibase.initData({
				_selected : false,
				_hover : false,
				_height : 25
			},data);
		}
		var vmodel = avalon.define(data.datagridId,function(vm){
			initData(options.data);
			avalon.mix(vm,options);
			vm.widgetElement = element;
			vm.$skipArray = ['widgetElement','toolbar'];
			vm.$init = function(){
				avalon(element).addClass("datagrid ball");
				element.setAttribute("ms-css-width","width");
				element.setAttribute("ms-css-height","height");
				element.innerHTML = templete;
				var t = new Date;
				avalon.scan(element, vmodel);
				avalon.log(new Date - t);
				//reset datagrid-main marginLeft
				avalon.each(element.children,function(i,el){
					if(avalon(el).hasClass("datagrid-main")){
						var ch = el.children;
						ch[1].style.marginLeft = avalon(ch[0]).outerWidth() + "px";
						return false;
					}
				});
				
			};
			vm.$remove = function(){
				element.innerHTML = element.textContent = ""
			};
			vm.$onClickBody = function(e){
				avalon.uibase.propagation.call(this,{
					row : function(e){
						toggleSelected(+this.getAttribute('data-index'));
					}
				},e);
			};
			vm.$hoverRow = function(i,r){
				vmodel.data[i]._hover = r;
			};
		});
		return vmodel;
	};
	widget.version = 1.0;
	widget.defaults = {
		title : null,
		toolbar : null,
		showHeader : true,
		headerHeight : 25,
		columns : null,
		data : null,
		rowNumbers : false,
		width : null,
		height : null,
		singleSelect : false,
		striped : true,
		frozenColumns : null
	};
});