define(["avalon.uibase"],function(avalon){
	avalon.mix(avalon.uibase,{
		initBinding : function(data, vmodels, name, defaults) {
	        var args = data.value.match(avalon.rword) || [];
	        var ID = (args[0] || "$").trim(), 
	            //向model暴露处理完后的options对应的属性名
	            exportField = args[1],
	            opts = exportField || '$' + name;
	        var model, vmOptions;
	        if (ID && ID != "$") {
	            model = avalon.vmodels[ID];//如果指定了此VM的ID
	            if (!model) {
	                return;
	            }
	        }
	        if (!model) {//如果使用$或绑定值为空，那么就默认取最近一个VM，没有拉倒
	            model = vmodels.length ? vmodels[0] : null;
	        }
	        if (model && typeof model[opts] === "object") {//如果指定了配置对象，并且有VM
	            vmOptions = model[opts]
	            if (vmOptions.$model) {
	                vmOptions = vmOptions.$model
	            }
	        }
	        var element = data.element;
	        element.removeAttribute("ms-" + name);
	        var $element = avalon(element);
	        var options = avalon.mix({}, defaults, vmOptions || {}, avalon.getWidgetData(element, name));
	        if(exportField){
	            model[exportField] = options;
	    	}
	    	return options;
	    }
	});
	return avalon;
});