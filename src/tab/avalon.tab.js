define(["avalon","text!./avalon.tab.html"],function(avalon,templete){
	//扫描dom 获取配置数据
	function getData(el,tagName,isHeader){
		var children = el.childNodes;
		var result = [];
		var num = 0;
		var curIndex;
		avalon.each(children,function(i,item){
			if(item.tagName && item.tagName.toLowerCase() == tagName){
				var options = avalon(item).data();
				if(options.selected){
					curIndex = String(num);
				}
				result.push(isHeader ? {
					title : item.innerHTML,
					closeable : options.closeable ? true : false,
					iconCls : options.iconCls || null,
					href : options.href || "javascript:void(0)"
				} : {
					content : item.innerHTML
				});
				num++;
			}
		});
		return {
			curIndex : curIndex,
			result : result
		};
	}
	//初始化监控属性
	function initTabData(target,data){
		avalon.each(data,function(i,item){
			for(var j in target){
				if(item[j] === undefined){
					item[j] = target[j];
				}
			}
		});
	}
	//点击标题事件处理
	function doClickTab(vmodel,target){
		var i = target.getAttribute("data-index");
		vmodel.curIndex = i;
		var ii = Number(i);
		var el = vmodel.tabData[ii];
		vmodel.onSelect(el.$init,ii);
		el.$init = true;
	}
	//删除tab
	function doCloseTab(vmodel,index){
		if(vmodel.curIndex === index + ""){
			if(index > 0){
				vmodel.curIndex = String(index - 1);
			}
		}
		vmodel.tabData.removeAt(index);
		vmodel.panelData.removeAt(index);
	}
	var widget = avalon.ui.tab = function(element, data, vmodels){
		var options = data.tabOptions;
		if(options.tabData){
			initTabData({
				title : '',
				closeable : false,
				iconCls : null,
				href : 'javascript:void(0)'
			},options.tabData);
		}else{
			var tabResult = getData(element.getElementsByTagName("ul")[0],"li",true);
			options.tabData = tabResult.result;
			options.curIndex = tabResult.curIndex ? tabResult.curIndex : options.curIndex;
		}
		if(options.panelData){
			initTabData({
				content : ""
			},options.panelData);
		}else{
			options.panelData = getData(element.getElementsByTagName("div")[0],"div",false).result;
		}
		var vmodel = avalon.define(data.tabId,function(vm){
			avalon.mix(vm, options);
			vm.$skipArray = ["border","fit","onSelect"];
			vm.$init = function(){
				var $el = avalon(element);
				$el.attr("ms-css-width",vmodel.width);
				vmodel.fit && $el.addClass("tab-fit");
				vmodel.border && $el.addClass("tab-border");
				element.innerHTML = templete;
				avalon.scan(element,vmodel);
			};
			vm.$remove = function(){
				element.innerHTML = element.textContent = "";
			};
			vm.$clickTab = function(e){
				var target = e.target;
				var type = target.getAttribute("data-type");
				if(type === "tabLink"){
					doClickTab(vmodel,target);
				}else if(type === "tabClose"){
					e.stopPropagation();
					doCloseTab(vmodel,Number(target.parentNode.getAttribute("data-index")));
				}else{
					var pNode = target.parentNode;
					while(pNode.tagName.toLowerCase() !== 'body'){
						if(pNode.getAttribute("data-type") === "tabLink"){
							doClickTab(vmodel,pNode);
							return;
						}
						pNode = pNode.parentNode;
					}
				}
			};
		});
		return vmodel;
	};
	widget.defaults = {
		tabData : null,
		panelData : null,
		curIndex : '0',
		border : true,
		height : null,
		width : null,
		fit : false,
		onSelect : avalon.noop
	};
});