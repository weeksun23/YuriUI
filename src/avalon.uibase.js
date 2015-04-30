define(["avalon"],function(avalon){
	var base = avalon.uibase = {
		//模仿冒泡
		//向上遍历父节点 直到找到 data-prop-type 不为null 或是 当前点击的元素为止
		propagation : function(obj,e){
			var target = e.target;
			var propType = "data-prop-type";
			var type = target.getAttribute(propType);
			if(obj[type]){
				obj[type].call(target,e);
			}else{
				if(target === this) return;
				var pNode = target.parentNode;
				while(pNode){
					if(obj[type = pNode.getAttribute(propType)]){
						obj[type].call(pNode,e);
						return;
					}
					if(pNode === this || pNode.tagName.toLowerCase() === 'body'){
						return;
					}
					pNode = pNode.parentNode;
				}
			}
		},
		//遍历data数组，初始化每一个对象中的监控属性
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
		//递归遍历树形list数组，初始化每一个对象中的监控属性
		eachItem : function(target,list,chKey,func){
			base.initData(target,list,function(i,item){
				var ch = item[chKey];
				func && func(i,item);
				if(ch && ch.length){
					base.eachItem(target,ch,chKey,func);
				}
			});
		},
		setAttr : function($el,attr){
			for(var i in attr){
				$el.attr(i,attr[i]);
			}
			return $el;
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
				if(pos && /^[r|a|f]/.test(pos.toLowerCase())) break;
				p = p.parentNode;
			}
			return p;
		}
	};
	return avalon;
});