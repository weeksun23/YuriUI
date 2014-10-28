define(["avalon"],function(avalon){
	avalon.uibase = {
		//Ä£·ÂÃ°ÅÝ
		propagation : function(obj,e){
			var target = e.target;
			var propType = "data-prop-type";
			var type = target.getAttribute(propType);
			if(obj[type]){
				obj[type].call(target,e);
			}else{
				if(target === this) return;
				var pNode = target.parentNode;
				while(pNode !== this){
					if(obj[type = pNode.getAttribute(propType)]){
						obj[type].call(pNode,e);
						return;
					}
					pNode = pNode.parentNode;
				}
			}
		},
		initData : function(target,data,func){
			avalon.each(data,function(i,item){
				for(var j in target){
					if(item[j] === undefined){
						item[j] = target[j];
					}
				}
				func && func(i,item);
			});
		},
		setAttr : function($el,attr){
			for(var i in attr){
				$el.attr(i,attr[i]);
			}
		},
		parseOptions : function(target){
			if(target.nodeType){
				target = target.getAttribute("data-options");
			}
			if (typeof target == 'string'){
				return (new Function('return {' + target + '};'))();
			}
			return {};
		}
	};
	return avalon;
});