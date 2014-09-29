define(["avalon","text!./avalon.tab.html"],function(avalon,templete){
	/*
	tab : {
		title : 'aaaa',
		closeable : true,
		iconCls : "icon-save",
		href : 'javascript:void(0)'
	}
	panel : {
		content : "<div>hello avalon</div>"	
	}
	*/
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
	function doClickTab(vmodel,target){
		var i = target.getAttribute("data-index");
		vmodel.curIndex = i;
	}
	var widget = avalon.ui.tab = function(element, data, vmodels){
		var options = data.tabOptions;
		var tabResult = options.tabData || getData(element.getElementsByTagName("ul")[0],"li",true);
		options.tabData = tabResult.result;
		options.curIndex = tabResult.curIndex ? tabResult.curIndex : options.curIndex;
		options.panelData = options.panelData || getData(element.getElementsByTagName("div")[0],"div",false).result;
		var vmodel = avalon.define(data.tabId,function(vm){
			avalon.mix(vm, options);
			//vm.$skipArray = [];
			vm.$init = function(){
				element.innerHTML = templete;
				avalon.scan(element,vmodel);
			};
			vm.$remove = function(){
				element.innerHTML = element.textContent = "";
			};
			vm.$clickTab = function(e){
				var target = e.target;
				avalon.log(target);
				if(target.getAttribute("data-type") !== "tabLink"){
					var pNode = target.parentNode;
					while(pNode.tagName.toLowerCase() !== 'body'){
						if(pNode.getAttribute("data-type") === "tabLink"){
							doClickTab(vmodel,pNode);
							return;
						}
						pNode = pNode.parentNode;
					}
				}else{
					doClickTab(vmodel,target);
				}
			};
		});
		return vmodel;
	};
	widget.defaults = {
		tabData : null,
		panelData : null,
		curIndex : '3'
	};
});