/*avalon ui Ä£°å*/
define(["avalon","text!./avalon.uiName.html"],function(avalon,templete){
	var widget = avalon.ui.uiName = function(element, data, vmodels){
		var options = data.uiNameOptions;
		var vmodel = avalon.define(data.uiNameId,function(vm){
			avalon.mix(vm,options);
			vm.widgetElement = element;
			vm.$skipArray = ['widgetElement'];
			vm.$init = function(){
				element.innerHTML = templete;
				avalon.scan(element, vmodel);
				if (typeof options.onInit === "function") {
					options.onInit.call(element, vmodel, options, vmodels);
				}
			};
			vm.$remove = function(){
				element.innerHTML = element.textContent = ""
			};
			/****************************·½·¨*****************************/
		});
		return vmodel;
	};
	widget.version = 1.0;
	widget.defaults = {
	};
});