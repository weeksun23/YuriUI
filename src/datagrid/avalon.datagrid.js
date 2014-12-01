/*avalon ui 模板*/
define(["avalon.uibase","text!./avalon.datagrid.html"],function(avalon,templete){
	var widget = avalon.ui.datagrid = function(element, data, vmodels){
		var options = data.datagridOptions;
		var vmodel = avalon.define(data.datagridId,function(vm){
			avalon.mix(vm,options);
			vm.widgetElement = element;
			vm.$skipArray = ['widgetElement','toolbar'];
			vm.$init = function(){
				element.setAttribute("ms-css-width","width");
				avalon(element).addClass("datagrid ball");
				element.innerHTML = templete;
				avalon.scan(element, vmodel);
			};
			vm.$remove = function(){
				element.innerHTML = element.textContent = ""
			};
			/****************************方法*****************************/
		});
		return vmodel;
	};
	widget.version = 1.0;
	widget.defaults = {
		title : null,
		toolbar : null,
		showHeader : true,
		columns : null,
		data : null,
		rowNumbers : false,
		width : null,
		height : null
	};
});