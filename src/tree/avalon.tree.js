define(["avalon","text!./avalon.tree.html","avalon.live","mmRequest"],function(avalon,template){
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
	//初始化节点属性
	function initNodeAttr(item){
		if(!item.children){
			item.children = [];
		}
		//是否已加载子节点标志
		item.chLoaded = item.state === 'open';
		for(var j in nodeAttr){
			if(item[j] === undefined){
				item[j] = nodeAttr[j];
			}
		}
	}
	//遍历list中的所有节点，若传入回调则执行回调，否则初始化节点属性
	function eachNode(list,func){
		for(var i=0,ii=list.length;i<ii;i++){
			var item = list[i];
			if(func){
				if(func(item) === false){
					return false;
				}
			}else{
				initNodeAttr(item);
			}
			var ch = item.children;
			if(ch.length > 0 && eachNode(ch,func) === false){
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
	//获取target的所有父节点
	function getParents(list,target,pArr){
		for(var i=0,ii=list.length;i<ii;i++){
			var item = list[i];
			if((typeof target == 'object' && target === item) || item.id === target){
				return false;
			}
			var ch = item.children;
			if(ch.length > 0){
				pArr.push(item);
				if(getParents(ch,target,pArr) === false){
					return false;
				}
			}
		}
		pArr.pop();
	}
	//遍历所有父节点 查看其下所有子节点是否都没有勾选，若是则置为反选
	function eachParentsUncheck(pArr){
		avalon.each(pArr,function(i,p){
			var flag = 0;
			eachNode(p.children,function(el){
				if(el.checked === 1){
					flag = 2;
					return false;
				}
			});
			p.checked = flag;
		});
	}
	function ajaxLoad(el,vmodel,func){
		var callBackEl = el;
		if(!el){
			//如果节点为空 则说明树节点还没创建加载根数据
			callBackEl = null;
			el = {
				id : null
			};
		}
		el.loading = true;
		var param = {id : el.id};
		if(vmodel.$onBeforeLoad.call(vmodel,callBackEl,param) === false){
			return;
		}
		avalon.ajax({
			url : vmodel.$url,
			type : vmodel.$method,
			cache : false,
			data : param,
			dataType : 'json',
			complete : function(promise,result){
				el.loading = false;
				vmodel.$onLoadComplete.call(vmodel,callBackEl,promise,result);
			},
			success : function(ch){
				vmodel.$loadFilter.call(vmodel,ch,callBackEl);
				if(callBackEl){
					el.state = 'open';
					if(vmodel.checkbox && vmodel.$cascadeCheck){
						//如果存在勾选框且有级联检查
						eachNode(ch,function(item){
							initNodeAttr(item);
							item.checked = el.checked === 2 ? 0 : el.checked;
						},el);
					}else{
						eachNode(ch);
					}
					el.children = ch;
					if(!el.chLoaded){
						el.chLoaded = true;
					}
				}else{
					eachNode(ch);
					vmodel.treeList = ch
					func && func();
				}
				vmodel.$onLoadSuccess.call(vmodel,ch,callBackEl);
			},
			error : function(promise){
				vmodel.$onLoadError.call(vmodel,callBackEl,promise);
			}
		});
	}
	var widget = avalon.ui.tree = function(element, data, vmodels){
		var options = data.treeOptions;
		template = template.replace("MS_OPTIONS_FORMATTER",options.$formatter);
		if(!avalon.templateCache["TREE_TPL"]){
			avalon.templateCache["TREE_TPL"] = template.replace("HTML_OR_TPL","el.children");
		}
		var curSelEl = null;
		eachNode(options.treeList);
		var vmodel = avalon.define(data.treeId,function(vm){
			avalon.mix(vm, options);
			vm.$init = function(){
				var $el = avalon(element);
				$el.addClass('tree');
				$el.attr("ms-class","tree-line:line");
				element.innerHTML = template.replace("HTML_OR_TPL","treeList");
				if(vmodel.$url){
					ajaxLoad(null,vmodel,function(){
						avalon.scan(element, vmodel);
					});
				}else{
					avalon.scan(element, vmodel);
				}
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
				vmodel.$onSelect.call(this,curSelEl = el);
			};
			/*
			展开节点 如果节点的子节点数>0则直接展开，否则根据url异步加载数据
			*/
			vm.$toggleOpenExpand = function(el){
				if(!el.state) return;
				if(el.loading) return;
				if(el.state === 'closed'){
					if(el.children && el.children.length){
						el.state = 'open';
						if(!el.chLoaded){
							el.chLoaded = true;
						}
					}else if(vmodel.$url){
						ajaxLoad(el,vmodel);
					}
				}else{
					el.state = 'closed';
				}
			};
			//获取当前选中的节点
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
					var pArr = [];
					getParents(vmodel.treeList,el,pArr);
					if(checked === 1){
						//如果是勾选 则将所有父节点置为预选状态
						avalon.each(pArr,function(i,p){
							p.checked = 2;
						});
					}else{
						eachParentsUncheck(pArr);
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
					var pArr = [];
					getParents(vmodel.treeList,item,pArr);
					if(item === curSelEl){
						curSelEl = null;
					}
					list.removeAt(i);
					eachParentsUncheck(pArr);
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
					eachNode(data,null);
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
		//树数据
		treeList : [],
		//是否显示根脉
		line : false,
		//节点是否带图标
		icon : true,
		//节点是否带checkbox
		checkbox : false,
		//是否级联检查
		$cascadeCheck : true,
		//定义如何显示node text
		$formatter : '{{el.text}}',
		//异步获取数据的url，若被定义，则返回数据覆盖treeList属性
		$url : null,
		$method : 'GET',
		//$loader : null
		$onSelect : avalon.noop,
		$loadFilter : avalon.noop,
		$onBeforeLoad : avalon.noop,
		$onLoadSuccess : avalon.noop,
		$onLoadError : avalon.noop,
		$onLoadComplete : avalon.noop
	};
	widget.version = 1.0;
});