define(["avalon","text!./avalon.ui.html"],function(avalon,templete){
	var widget = avalon.ui.accordion = function(element, data, vmodels){
		var options = data.uiOptions;
		var vmodel = avalon.define(data.uiId,function(vm){
			avalon.mix(vm,options);
			vm.$skipArray = [];
			vm.$init = function(){
				element.innerHTML = templete;
				avalon.scan(element, vmodel);
			};
			/****************************·½·¨*****************************/
		});
		return vmodel;
	};
	widget.version = 1.0;
	widget.defaults = {
	};
});