define(["avalon"],function(avalon){
	var nodeAttr = {
		id : null,
		iconCls : "",
		openIconCls : "",
		text : "",
		loading : false,
		selected : false,
		state : null
		//children : []
	};
	function eachNode(list){
		for(var i=0,ii=list.length;i<ii;i++){
			var item = list[i];
			var ch = item.children;
			if(!ch){
				ch = item.children = [];
			}
			for(var j in nodeAttr){
				if(item[j] === undefined){
					item[j] = nodeAttr[j];
				}
			}
			if(ch.length > 0){
				eachNode(ch);
			}
		}
	}
	function findNode(list,target,func){
		for(var i=0,ii=list.length;i<ii;i++){
			var item = list[i];
			if((typeof target == 'object' && target === item) || item.id === target){
				func(item,i,list);
				return false;
			}
			if(item.children && findNode(item.children,target,func) === false){
				return false;
			}
		}
	}
	function getTreeStr(HTML_OR_TPL){
		return "<li ms-repeat='"+HTML_OR_TPL+"' ms-class-1='tree-node' ms-class='tree-node-last:$last'>" + 
			"<i ms-class='tree-bg:el.state || line' " +
				"ms-class-1='tree-collapsed:el.state===\"closed\"' " +
				"ms-class-2='tree-expanded:el.state===\"open\"' " +
				"ms-class-3='tree-indent:!el.state' " +
				"ms-class-5='tree-join:line && !$last' " +
				"ms-class-6='tree-joinbottom:line && $last' " +
				"ms-click='$toggleOpenExpand(el)'></i>" +
			"<span ms-class='tree-node-content' ms-class-1='tree-node-select:el.selected' ms-click='$selectNode(el)'>" +
				"<i ms-if='icon && el.iconCls !== false' " +
					"ms-class='{{el.iconCls}}:el.iconCls && (!el.state || el.state === \"closed\" || (el.state === \"open\" && !el.openIconCls))' "+
					"ms-class-1='{{el.openIconCls}}:el.openIconCls && el.state === \"open\"' " +
					"ms-class-3='tree-indent tree-bg:!el.iconCls' " +
					"ms-class-2='tree-folder:!el.iconCls && el.state===\"closed\"' " +
					"ms-class-4='tree-folder-open:!el.iconCls && el.state===\"open\"' " +
					"ms-class-5='tree-file:!el.state && !el.iconCls' " +
					"ms-class-6='tree-icon-loading:el.loading'></i>" +
				"<span class='tree-title'>{{el.text}}</span>" +
			"</span>" +
			"<ul ms-if='el.children&&el.children.length' ms-visible='el.state===\"open\"' ms-include-src='\"TREE_TPL\"'></ul>" +
		"</li>";
	}
	var widget = avalon.ui.tree = function(element, data, vmodels){
		if(!avalon.templateCache["TREE_TPL"]){
			avalon.templateCache["TREE_TPL"] = getTreeStr("el.children");
		}
		var curSelEl = null;
		var vmodel = avalon.define(data.treeId,function(vm){
			var options = data.treeOptions;
			eachNode(options.treeList);
			avalon.mix(vm, options);
			vm.widgetElement = element;
			vm.template = getTreeStr("treeList");
			vm.$init = function(){
				var $el = avalon(element);
				$el.addClass('tree');
				$el.attr("ms-class","tree-line:line");
				element.innerHTML = vmodel.template;
				avalon.scan(element, vmodel);
			};
			vm.$remove = function(){
				element.innerHTML = element.textContent = "";
			};
			vm.$selectNode = function(el){
				if(el === curSelEl){
					return;
				}
				if(curSelEl){
					curSelEl.selected = false;
				}
				el.selected = true;
				curSelEl = el;
				vmodel.$onSelect.call(this,el);
			};
			vm.$toggleOpenExpand = function(el){
				if(!el.state) return;
				if(el.loading) return;
				if(el.state === 'closed'){
					if(el.children && el.children.length){
						el.state = 'open';
					}else{
						var me = this;
						el.loading = true;
						setTimeout(function(){
							el.loading = false;
							el.state = 'open';
							var ch = [{
								text : "children",
								state : "closed"
							},{
								text : "children",
								state : "closed"
							}];
							eachNode(ch);
							el.children = ch;
						},1000);
					}
				}else{
					el.state = 'closed';
				}
			};
			vm.$getSelected = function(){
				return curSelEl;
			};
			vm.$removeNode = function(target){
				findNode(vmodel.treeList,target,function(item,i,list){
					if(item.loading) return;
					if(item === curSelEl){
						curSelEl = null;
					}
					list.removeAt(i);
				});
			};
			vm.$appendNodes = function(data,parent){
				var target;
				if(parent){
					if(typeof parent == 'object'){
						target = parent;
					}else{
						findNode(vmodel.treeList,parent,function(item){
							target = item;
						});
					}
					target.state = 'open';
					target = target.children;
				}else{
					target = vmodel.treeList;
				}
				if(target){
					eachNode(data);
					target.pushArray(data);
				}
			};
		});
		return vmodel;
	};
	widget.defaults = {
		treeList : [],
		line : false,
		icon : true,
		$onSelect : avalon.noop
	};
});