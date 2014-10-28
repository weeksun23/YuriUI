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
		//dialog宽度
		width : 300,
		//工具栏按钮数组
		tools : null,
		//dialog图标 显示在标题左旁边
		iconCls : null,
		//内容高度 不包含标题
		height : null,
		//是否模态
		modal : true,
		//标题 支持html
		title : null,
		//dialog内容 支持html
		content : null,
		//是否含右上关闭按钮
		closeable : true,
		//是否居中
		center : false
	};
});