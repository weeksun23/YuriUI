define(["avalon.uibase","text!./avalon.dialog.html"],function(avalon,templete){
	var widget = avalon.ui.dialog = function(element, data, vmodels){
		var options = data.dialogOptions;
		if(!options.title){
			options.title = element.title;
		}
		element.title = "";
		if(!options.content){
			options.content = element.innerHTML;
		}
		var vmodel = avalon.define(data.dialogId,function(vm){
			avalon.mix(vm,options);
			vm.$skipArray = [];
			vm.$init = function(){
				var $el = avalon(element);
				$el.addClass("dialog ball");
				avalon.uibase.setAttr($el,{
					"ms-class" : "dialog-noclose:!closeable",
					"ms-css-width" : "width"
				});
				element.innerHTML = templete;
				avalon.scan(element, vmodel);
			};
			/****************************方法*****************************/
		});
		return vmodel;
	};
	widget.version = 1.0;
	widget.defaults = {
		width : 300,
		tools : null,
		iconCls : null,
		//内容高度 不包含标题
		height : null,
		modal : true,
		title : null,
		content : null,
		//是否含右上关闭按钮
		closeable : true
	};
});