define(["avalon"],function(avalon){
	function getTreeStr(HTML_OR_TPL){
		return "<li ms-repeat='"+HTML_OR_TPL+"'>" + 
			"<i ms-if='el.state!==undefined' ms-class='tree-bg' ms-class-2='tree-collapsed:el.state===\"closed\"' ms-class-1='tree-expanded:el.state===\"open\"' ms-click='$toggleOpenExpand(el)'></i>" +
			"<i ms-class='{{el.iconCls}}'></i><span class='tree-title'>{{el.text}}</span>" +
			"<ul ms-if='el.children&&el.children.length' ms-visible='el.state===\"open\"' ms-include-src='\"TREE_TPL\"'></ul>"
		"</li>";
	}
	var widget = avalon.ui.tree = function(element, data, vmodels){
		if(!avalon.templateCache["TREE_TPL"]){
			avalon.templateCache["TREE_TPL"] = getTreeStr("el.children");
		}
		var vmodel = avalon.define(data.treeId,function(vm){
			var options = data.treeOptions;
			avalon.mix(vm, options);
			vm.widgetElement = element;
			vm.template = getTreeStr("treeList");
			vm.$init = function(){
				var $el = avalon(element);
				$el.addClass('tree');
				element.innerHTML = vmodel.template;
				avalon.scan(element, vmodel);
			};
			vm.$remove = function(){
				element.innerHTML = element.textContent = "";
			};
			vm.$toggleOpenExpand = function(el){
				var cls = el.iconCls;
				if(cls.indexOf('tree-icon-loading') !== -1) return;
				if(el.state === 'closed'){
					if(el.children && el.children.length){
						el.state = 'open';
					}else{
						el.iconCls = cls + " tree-icon-loading";
						var me = this;
						setTimeout(function(){
							el.iconCls = cls;
							el.state = 'open';
							el.children = [{
								text : "children",
								iconCls : "icon-reload",
								state : "closed",
								children : []
							},{
								text : "children",
								iconCls : "icon-reload",
								state : "closed",
								children : []
							}];
						},1000);
					}
				}else{
					el.state = 'closed';
				}
			};
		});
		return vmodel;
	};
	widget.defaults = {
		treeList : []
	};
});