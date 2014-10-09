define(["avalon","text!./avalon.tab.html"],function(avalon,templete){
	//扫描dom 获取配置数据
	function getData(el,tagName){
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
			$iframeSrc : null
		},data);
	}
	function showScroll(header){
		var $ul = avalon(header.getElementsByTagName("ul")[0]);
		var $header = avalon(header);
		if($ul.width() > $header.width()){
			$header.addClass("tab-header-scroll");
		}else{
			$header.removeClass("tab-header-scroll");
		}
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
						targetContent.content = "<iframe class='tab-iframe' scrolling='no' frameborder='0' src='"+targetContent.$iframeSrc+"'></iframe>";
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
		var vmodel = avalon.define(data.tabId,function(vm){
			avalon.mix(vm, options);
			vm.$skipArray = ["border","fit","onSelect","onClick","isTriggerOnHover","addTab"];
			vm.$init = function(){
				var $el = avalon(element);
				$el.addClass("tab");
				$el.attr("ms-css-width",vmodel.width);
				vmodel.fit && $el.addClass("tab-fit");
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
				if(vmodel.fit){
					var h = avalon(header).outerHeight();
					chs[1].style.top = h + 'px';
				}
				showScroll(header);
			};
			vm.$remove = function(){
				element.innerHTML = element.textContent = "";
			};
			vm.$clickTab = function(e){
				var target = e.target;
				var type = target.getAttribute("data-type");
				if(type === "tabLink"){
					doSelTab(vmodel,Number(target.getAttribute("data-index")));
				}else if(type === "tabClose"){
					e.stopPropagation();
					doCloseTab(vmodel,Number(target.parentNode.getAttribute("data-index")));
				}else{
					var pNode = target.parentNode;
					while(pNode.tagName.toLowerCase() !== 'body'){
						if(pNode.getAttribute("data-type") === "tabLink"){
							doSelTab(vmodel,Number(pNode.getAttribute("data-index")));
							return;
						}
						pNode = pNode.parentNode;
					}
				}
			};
			vm.$enterTab = function(index){
				vmodel.isTriggerOnHover && doSelTab(vmodel,index);
			};
			vm.$doScroll = function(distance){
				var $wrap = avalon(this.parentNode.children[0]);
				var scroll = $wrap.scrollLeft();
				scroll += distance;
				$wrap.scrollLeft(scroll);
			};
			/*******************************方法*******************************/
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
				if(typeof target == 'string'){
					avalon.each(vmodel.tabData,function(i,item){
						if(item.title === target){
							target = i;
							return false;
						}
					});
				}
				if(typeof target == 'string') return;
				doCloseTab(vmodel,target);
			};
		});
		vmodel.tabData.$watch("length",function(){
			showScroll(element.children[0]);
		});
		return vmodel;
	};
	widget.defaults = {
		tabData : null,
		panelData : null,
		border : true,
		height : null,
		width : null,
		fit : false,
		isTriggerOnHover : false,
		onSelect : avalon.noop,
		onClick : avalon.noop
	};
});