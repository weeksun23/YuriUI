define(["avalon","text!./avalon.tree.html","avalon.live"],function(avalon,template){
	var nodeAttr = {
		//id : null,
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
	//遍历list中的所有节点，若传入回调则执行回调，否则初始化节点属性
	function eachNode(list,func,parent){
		for(var i=0,ii=list.length;i<ii;i++){
			var item = list[i];
			var ch = item.children;
			if(func){
				if(func(item) === false){
					return false;
				}
			}else{
				item.$parent = parent;
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
			}
			if(ch.length > 0 && eachNode(ch,func,item) === false){
				return false;
			}
		}
	}
	//查找指定节点并执行回调
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
	//遍历并获取所有父节点
	function getParents(target,func){
		var pArr = [];
		var parent = target.$parent;
		while(parent){
			func && func(parent);
			pArr.push(parent);
			parent = parent.$parent;
		}
		return pArr;
	}
	var widget = avalon.ui.tree = function(element, data, vmodels){
		if(!avalon.templateCache["TREE_TPL"]){
			avalon.templateCache["TREE_TPL"] = template.replace("HTML_OR_TPL","el.children");
		}
		var curSelEl = null;
		var vmodel = avalon.define(data.treeId,function(vm){
			var options = data.treeOptions;
			eachNode(options.treeList);
			avalon.mix(vm, options);
			vm.widgetElement = element;
			vm.template = template.replace("HTML_OR_TPL","treeList");
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
							eachNode(ch,null,el);
							el.children = ch;
							if(!el.chLoaded){
								el.chLoaded = true;
							}
						},300);
					}
				}else{
					el.state = 'closed';
				}
			};
			vm.$getSelected = function(){
				return curSelEl;
			};
			/*
			勾选或反选节点
			*/
			vm.$toggleCheck = function(el){
				var _checked = el.checked;
				if(_checked === 1){
					var checked = el.checked = 0;
				}else{
					checked = el.checked = 1;
				}
				if(vmodel.$cascadeCheck){
					if(el.children.length){
						//勾选或反选所有子节点
						eachNode(el.children,function(item){
							item.checked = checked;
						});
					}
					if(checked === 1){
						//如果是勾选 则将所有父节点置为预选状态
						getParents(el,function(p){
							p.checked = 2;
						});
					}else{
						//如果是反选 则遍历所有父节点 查看其下所有子节点是否都没有勾选，若是则置为反选
						getParents(el,function(p){
							var flag = true;
							eachNode(p.children,function(el){
								if(el.checked === 1){
									flag = false;
									return false;
								}
							});
							if(flag){
								p.checked = 0;
							}
						});
					}
				}
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
					eachNode(data,null,el);
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
		$cascadeCheck : true,
		$onSelect : avalon.noop
	};
});