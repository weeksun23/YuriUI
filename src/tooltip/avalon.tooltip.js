define(["avalon"],function(avalon){
	var tpl = "<div class='tooltip ball' ms-visible='show' ms-class='tooltip-{{position}}' "+
		"ms-css-left='left' ms-css-top='top'>" +
        "<div class='tooltip-content'>{{content | html}}</div>" +
       	"<div class='tooltip-innerarrow tooltip-arrow ball'></div>" +
        "<div class='tooltip-outerarrow tooltip-arrow ball'></div>" +
    "</div>";
    var arrowWidth = 9;
	var widget = avalon.ui.tooltip = function(element, data, vmodels){
		var options = data.tooltipOptions;
		var vmodel = avalon.define(data.tooltipId,function(vm){
			avalon.mix(vm,options);
			vm.widgetElement = element;
			vm.show = false;
			vm.left = null;
			vm.top = null;
			vm.tipElement = null;
			vm.$skipArray = ['widgetElement','tipElement'];
			vm.$init = function(){
				var div = document.createElement("div");
				div.innerHTML = tpl;
				var tipNode = vmodel.tipElement = div.children[0];
				document.body.appendChild(tipNode);
				avalon.scan(tipNode, vmodel);
				avalon(element).bind("mouseover",function(){
					vmodel.show = true;
					var $this = avalon(this);
					var $tip = avalon(vmodel.tipElement);
					var offset = $this.offset();
					switch(vmodel.position){
						case "top" : 
							vmodel.left = offset.left + ($this.outerWidth() - $tip.outerWidth()) / 2;
							vmodel.top = offset.top - $tip.outerHeight();
							break;
						case "bottom" : 
							vmodel.left = offset.left + ($this.outerWidth() - $tip.outerWidth()) / 2;
							vmodel.top = offset.top + $this.outerHeight();
							break;
						case "left" : 
							vmodel.top = offset.top + ($this.outerHeight() - $tip.outerHeight()) / 2;
							vmodel.left = offset.left - $tip.outerWidth();
							break;
						case "right" : 
							vmodel.top = offset.top + ($this.outerHeight() - $tip.outerHeight()) / 2;
							vmodel.left = offset.left + $this.outerWidth();
							break;
					}
				});
				avalon(element).bind("mouseout",function(){
					vmodel.show = false;
				});
				avalon.scan(element, vmodel);
			};
			vm.$remove = function(){
				document.body.removeChild(vmodel.tipElement);
			};
			/****************************方法*****************************/
		});
		return vmodel;
	};
	widget.version = 1.0;
	widget.defaults = {
		position : 'right',
		content : ''
	};
});