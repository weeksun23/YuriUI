define(function(){
	var base = {
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
		}
	};
	return base;
});