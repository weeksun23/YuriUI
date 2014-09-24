define(["avalon"],function(avalon){
	var nodeAttr = {
		id : null,
		iconCls : "",
		openIconCls : "",
		text : "",
		loading : false,
		selected : false,
		checked : 0,
		//chLoaded : false,
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
			//是否已加载子节点标志
			item.chLoaded = item.state === 'open';
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
	function getClassStr(arr){
		var result = [];
		for(var i=0,ii=arr.length;i<ii;i++){
			result.push("ms-class-" + i + "='"+arr[i]+"'");
		}
		return result.join(" ");
	}
	function getTreeStr(HTML_OR_TPL){
		return "<li ms-repeat='"+HTML_OR_TPL+"' ms-class-1='tree-node' ms-class='tree-node-last:$last'>" + 
			"<i " + getClassStr([
					'tree-bg:el.state || line',
					'tree-collapsed:el.state===\"closed\"',
					'tree-expanded:el.state===\"open\"',
					'tree-indent:!el.state',
					'tree-join:line && !$last',
					'tree-joinbottom:line && $last'
				]) +
				" ms-click='$toggleOpenExpand(el)'></i>" +
			"<i ms-if='checkbox' ms-click='$toggleCheck(el)' " + getClassStr(["tree-bg tree-checkbox tree-checkbox{{el.checked}}"]) +"></i>" +
			"<span ms-class='tree-node-content' ms-class-1='tree-node-select:el.selected' ms-click='$selectNode(el)'>" +
				"<i ms-if='icon && el.iconCls !== false' " +
					getClassStr([
						'{{el.iconCls}}:el.iconCls && (!el.state || el.state === \"closed\" || (el.state === \"open\" && !el.openIconCls))',
						'{{el.openIconCls}}:el.openIconCls && el.state === \"open\"',
						'tree-indent tree-bg:!el.iconCls',
						'tree-folder:!el.iconCls && el.state===\"closed\"',
						'tree-folder-open:!el.iconCls && el.state===\"open\"',
						'tree-file:!el.state && !el.iconCls',
						'tree-icon-loading:el.loading'
					]) + "></i>" +
				"<span class='tree-title'>{{el.text}}</span>" +
			"</span>" +
			"<ul ms-if='el.chLoaded&&el.children&&el.children.length' ms-visible='el.state===\"open\"' ms-include-src='\"TREE_TPL\"'></ul>" +
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
						if(!el.chLoaded){
							el.chLoaded = true;
						}
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
							if(!el.chLoaded){
								el.chLoaded = true;
							}
						},1000);
					}
				}else{
					el.state = 'closed';
				}
			};
			vm.$getSelected = function(){
				return curSelEl;
			};
			vm.$toggleCheck = function(el){
				el.checked = el.checked ? 0 : 1;
			};
			/*
			移除指定节点
			target : 节点id或节点监控对象
			*/
			vm.$removeNode = function(target){
				findNode(vmodel.treeList,target,function(item,i,list){
					if(item.loading) return;
					if(item === curSelEl){
						curSelEl = null;
					}
					list.removeAt(i);
				});
			};
			/*
			增加节点
			data : 节点数据数组
			parent : 若不指定则默认添加到根节点，若为string或number则是节点id，若为object则是节点的监控对象
			*/
			vm.$appendNodes = function(data,parent){
				var target,el;
				if(parent){
					if(typeof parent == 'object'){
						el = parent;
					}else{
						findNode(vmodel.treeList,parent,function(item){
							el = item;
						});
					}
					if(!el){
						return avalon.log("找不到目标节点,appendNodes失败");
					}
					el.state = 'open';
					target = el.children;
				}else{
					target = vmodel.treeList;
				}
				if(target){
					eachNode(data);
					target.pushArray(data);
					if(el && !el.chLoaded){
						el.chLoaded = true;
					}
				}
			};
			vm.$loadData = function(data){
				eachNode(data);
				vmodel.treeList = data;
			};
		});
		return vmodel;
	};
	widget.defaults = {
		treeList : [],
		line : false,
		icon : true,
		checkbox : false,
		$onSelect : avalon.noop
	};
});