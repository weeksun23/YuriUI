define(["avalon","text!./avalon.tab.html","base"],function(avalon,templete,base){
	//扫描dom 获取配置数据
	function getData(el,tagName){
		if(!el) return [];
		var children = el.children;
		var result = [];
		var num = 0;
		var curIndex;
		var isHeader = tagName === "li";
		avalon.each(children,function(i,item){
			if(item.tagName.toLowerCase() == tagName){
				var options = avalon(item).data();
				if(isHeader){
					if(options.selected && curIndex === undefined){
						curIndex = num;
					}
					result.push({
						title : item.innerHTML.replace(/\s*$/,"") || options.title,
						closeable : options.closeable ? true : false,
						iconCls : options.iconCls || null,
						selected : curIndex === num,
						$init : false,
						href : options.href || "javascript:void(0)"
					});
				}else{
					result.push({
						content : options.iframeSrc ? "" : item.innerHTML,
						$iframeSrc : options.iframeSrc,
						width : options.width ? Number(options.width) : null,
						height : options.height ? Number(options.height) : null
					});
				}
 				num++;
			}
		});
		return result;
	}
	//初始化监控属性
	function initData(target,data){
		avalon.each(data,function(i,item){
			for(var j in target){
				if(item[j] === undefined){
					item[j] = target[j];
				}
			}
		});
	}
	function initTabData(data){
		initData({
			title : '',
			closeable : false,
			iconCls : null,
			$init : false,
			selected : false,
			href : 'javascript:void(0)'
		},data);
	}
	function initPanelData(data){
		initData({
			content : "",
			height : null,
			width : null,
			$iframeSrc : null
		},data);
	}
	function showScroll(header,position){
		var $ul = avalon(header.getElementsByTagName("ul")[0]);
		var $header = avalon(header);
		var method = position === "top" ? "width" : "height";
		if($ul[method]() > avalon(header.children[0])[method]()){
			$header.addClass("tab-header-scroll");
		}else{
			$header.removeClass("tab-header-scroll");
		}
	}
	function getIndex(vmodel,target){
		if(typeof target == 'string'){
			avalon.each(vmodel.tabData,function(i,item){
				if(item.title === target){
					target = i;
					return false;
				}
			});
		}
		if(typeof target == 'string') return false;
		return target;
	}
	var widget = avalon.ui.tab = function(element, data, vmodels){
		var options = data.tabOptions;
		if(options.tabData){
			initTabData(options.tabData);
		}else{
			options.tabData = getData(element.getElementsByTagName("ul")[0],"li");
		}
		if(options.panelData){
			initPanelData(options.panelData);
		}else{
			options.panelData = getData(element.getElementsByTagName("div")[0],"div");
		}
		//点击标题事件处理
		function doSelTab(vmodel,index){
			var target = vmodel.tabData[index];
			if(target !== doSelTab.curSelected){
				target.selected = true;
				doSelTab.curSelected.selected = false;
				doSelTab.curSelected = target;
				if(!target.$init){
					var targetContent = vmodel.panelData[index];
					if(targetContent.$iframeSrc){
						targetContent.content = "<iframe class='tab-iframe' ms-class='tab-iframe-fit:fit || position===\"left\"'  scrolling='no' frameborder='0' src='"+targetContent.$iframeSrc+"'></iframe>";
					}
					vmodel.onSelect.call(vmodel,false,target);
					target.$init = true;
				}else{
					vmodel.onSelect.call(vmodel,true,target);
				}
			}
			vmodel.onClick.call(vmodel,target);
		}
		//当前选中的选项卡对象
		doSelTab.curSelected = {};
		//删除tab
		function doCloseTab(vmodel,index){
			var tabData = vmodel.tabData;
			var target = tabData[index];
			if(doSelTab.curSelected === target){
				if(tabData.length > 1){
					doSelTab.curSelected = tabData[index > 0 ? index - 1 : 1];
					doSelTab.curSelected.selected = true;
				}else{
					doSelTab.curSelected = {};
				}
			}
			vmodel.panelData.removeAt(index);
			tabData.removeAt(index);
		}
		var resizer;
		var vmodel = avalon.define(data.tabId,function(vm){
			avalon.mix(vm, options);
			vm.$skipArray = ["position","autoResize","border","fit","onSelect","onClick","isTriggerOnHover","addTab","removeTab","onContextMenu","exsits"];
			vm.$init = function(){
				var $el = avalon(element);
				var position = vmodel.position;
				$el.addClass("tab tab-" + position);
				if(position === 'top'){
					$el.attr("ms-css-width",vmodel.width);
				}else{
					$el.attr("ms-css-height",vmodel.height);
				}
				vmodel.fit && $el.addClass("tab-fit abfit");
				vmodel.border && $el.addClass("tab-border");
				element.innerHTML = templete;
				var selIndex;
				var tabData = vmodel.tabData;
				avalon.each(tabData,function(i,item){
					if(item.selected){
						doSelTab(vmodel,selIndex = i);
						return false;
					}
				});
				if(selIndex === undefined && tabData.length > 0){
					doSelTab(vmodel,0);
				}
				avalon.scan(element,vmodel);
				var chs = element.children;
				var header = chs[0];
				if(vmodel.fit || position === 'left'){
					if(position === 'top'){
						chs[1].style.top = avalon(header).outerHeight() + 'px';
					}else{
						chs[1].style.left = avalon(header).outerWidth() + 'px';
					}
				}
				chs = header.children;
				var wrap = chs[0];
				var tool = chs[1];
				if(position === 'top'){
					wrap.style.marginRight = avalon(tool).outerWidth() + "px";
				}else{
					wrap.style.marginBottom = avalon(tool).outerHeight() + "px";
				}
				showScroll(header,position);
				if(vmodel.autoResize && vmodel.fit){
					var t;
					resizer = avalon.bind(window,"resize",function(){
						//分流
						if(t){
							clearTimeout(t);
						}
						t = setTimeout(function(){
							showScroll(header,position);
						},100);
					});
				}
			};
			vm.$remove = function(){
				if(resizer){
					avalon.unbind(window,"resize",resizer);
					resizer = null;
				}
				element.innerHTML = element.textContent = "";
			};
			vm.$clickTab = function(e){
				base.propagation.call(this,{
					tabLink : function(){
						doSelTab(vmodel,Number(this.getAttribute("data-index")));
					},
					tabClose : function(e){
						e.stopPropagation();
						doCloseTab(vmodel,Number(this.parentNode.getAttribute("data-index")));
					}
				},e);
			};
			vm.$mousedownTab = function(e){
				if(e.button === 2){
					base.propagation.call(this,{
						tabLink : function(e){
							vmodel.onContextMenu.call(this,e,Number(this.getAttribute("data-index")));
						}
					},e);
				}
			};
			vm.$enterTab = function(index){
				vmodel.isTriggerOnHover && doSelTab(vmodel,index);
			};
			vm.$doScroll = function(distance){
				var $wrap = avalon(this.parentNode.children[0]);
				var target = vmodel.position === "top" ? "scrollLeft" : "scrollTop";
				var scroll = $wrap[target]();
				scroll += distance;
				$wrap[target](scroll);
			};
			vm.$toolClick = function(el){
				el.click && el.click.call(vmodel,el);
			};
			/*******************************方法*******************************/
			vm.select = function(target){
				target = getIndex(vmodel,target);
				if(target !== false){
					doSelTab(vmodel,target);
				}
			};
			vm.resize = function(){
				showScroll(element.children[0],vmodel.position);
			};
			vm.exists = function(title){
				var result = false;
				avalon.each(vmodel.tabData,function(i,item){
					if(item.title === title){
						result = true;
						return false;
					}
				});
				return result;
			};
			vm.addTab = function(obj){
				var tabData = obj.tabData;
				if(tabData && tabData.length > 0){
					var sel;
					avalon.each(tabData,function(i,item){
						if(item.selected){
							item.selected = false;
							if(sel === undefined){
								sel = i;
							}
						}
					});
					initTabData(tabData);
					initPanelData(obj.panelData);
					if(sel !== undefined){
						sel += vmodel.tabData.length;
					}
					vmodel.tabData.pushArray(tabData);
					vmodel.panelData.pushArray(obj.panelData);
					sel !== undefined && doSelTab(vmodel,sel);
				}
			};
			vm.removeTab = function(target){
				target = getIndex(vmodel,target);
				if(target !== false){
					doCloseTab(vmodel,target);
				}
			};
		});
		vmodel.tabData.$watch("length",function(){
			showScroll(element.children[0],vmodel.position);
		});
		return vmodel;
	};
	widget.defaults = {
		position : 'top',
		autoResize : true,
		tabData : null,
		panelData : null,
		border : true,
		//position为top，内容高度；position为left，整个tab高度
		height : null,
		//position为top，整个tab宽度；position为left，内容宽度
		width : null,
		//postion为非top时生效，标题宽度
		headerWidth : 80,
		fit : false,
		tools : [],
		isTriggerOnHover : false,
		onSelect : avalon.noop,
		onClick : avalon.noop,
		onContextMenu : avalon.noop
	};
});