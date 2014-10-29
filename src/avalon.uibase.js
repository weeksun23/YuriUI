define(["avalon"],function(avalon){
	avalon.uibase = {
		//模仿冒泡
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
		},
		//获取已定位的父容器
		getPosParent : function(el){
			var p = el.parentNode;
			while(p.tagName.toLowerCase() !== 'body'){
				var $p = avalon(p);
				var pos = $p.css("position");
				if(pos === 'relative' || pos === 'absolute' || pos === 'fixed') break;
				p = p.parentNode;
			}
			return p;
		}
	};
	return avalon;
});