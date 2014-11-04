define(["avalon.uibase.function"],function(avalon){
	function bindDrag(element,options){
		avalon.bind(element.handle || element,"mousedown",function(e){
			e.preventDefault();
			if(options.disabled || options.onBeforeDrag.call(this,e) === false) return;
			var $el = avalon(element);
            var isRelative = /^r/.test($el.css("position"));
            if(isRelative){
                var sL = parseInt(element.style.left,10);
                var sT = parseInt(element.style.top,10);
            }else{
                var position = $el.position();
                sL = position.left;
                sT = position.top;
            }
			var sX = e.pageX;
            var sY = e.pageY;
            var overEdge = options.overEdge;
            var axis = options.axis;
            if(!overEdge){
            	var posP = avalon.uibase.getPosParent(element);
            	var $posP = avalon(posP);
                if(isRelative){
                    position = $el.position();
                    minL = sL - position.left;
                    minT = sT - position.top;
                    maxL = $posP.innerWidth() - $el.outerWidth(true) - Math.abs(minL);
                    maxT = $posP.innerHeight() - $el.outerHeight(true) - Math.abs(minT);
                }else{
                    var maxL = $posP.innerWidth() - $el.outerWidth(true);
                    var maxT = $posP.innerHeight() - $el.outerHeight(true);
                    var minL = 0;
                    var minT = 0;
                }
            }
            options.onStartDrag.call(this,e);
            var t = new Date;
            var gap = document.querySelector ? 12 : 30;
            var move = avalon.bind(document,"mousemove",function(moveE){
                moveE.preventDefault();
            	var cur = new Date;
				if(cur - t <= gap) return;
				t = cur;
            	options.onDrag.call(this,moveE);
            	var newL = sL + (moveE.pageX - sX);
            	var newT = sT + (moveE.pageY - sY);
            	if(!overEdge){
            		if(newL > maxL){
            			newL = maxL;
            		}else if(newL < minL){
            			newL = minL;
            		}
            		if(newT > maxT){
            			newT = maxT;
            		}else if(newT < minT){
            			newT = minT;
            		}
            	}
            	if(axis === null || axis === 'x'){
            		$el.css("left",newL);
            	}
            	if(axis === null || axis === 'y'){
            		$el.css("top",newT);
            	}
            });
            var up = avalon.bind(document,"mouseup",function(upE){
            	options.onStopDrag.call(this,upE);
                avalon.unbind(document,"mouseup",up);
                avalon.unbind(document,"mousemove",move);
            });
		});
	}
	//逐层遍历子节点 寻找移动代理
	function findHandle(target,element){
		var children = target.children;
		if(!children || children.length === 0) return;
		var find = false; 
		avalon.each(children,function(i,el){
			if(el.getAttribute("data-drag-handle") === ''){
				find = true;
				element.handle = el;
				return false;
			}
			if(el.getAttribute("ms-draggable") === null && findHandle(el,element)){
				find = true;
				return false;
			}
		});
		return find;
	}
	var defaults = {
		//是否可以滑出已定位的父容器
		overEdge : false,
		//滑动elment或代理的鼠标样式
		dragCursor : "move",
		//是否禁止drag
		disabled : false,
		//定义能向什么方向滑动 若为x则只能向x轴滑动，y同理，若为null则可自由滑动
		axis : null,
		/****************************事件*****************************/
		onBeforeDrag : avalon.noop,
		onStartDrag : avalon.noop,
		onDrag : avalon.noop,
		onStopDrag : avalon.noop
	};
	var draggable = avalon.bindingHandlers.draggable = function(data, vmodels) {
        var options = avalon.uibase.initBinding(data, vmodels, "draggable", defaults);
        var element = data.element;
        var $element = avalon(element);
        avalon.mix(options,{
        	//方法
        	doDisable : function(isDisable){
        		var str = isDisable ? "default" : options.dragCursor;
				var target = element;
				if(element.handle){
					target = element.handle;
				}
				target.style.cursor = str;
				options.disabled = isDisable;
        	}
        });
        var csspos = $element.css("position");
        if(!/^[a|f|r]/.test(csspos)){
        	csspos = element.style.position = 'relative';
        }
        if(/^r/.test(csspos)){
            //处理relative的情况 
            //不知道怎么获取relative元素相对自身的偏移值 只能通过如下取巧的方法
            var pos = $element.position();
            element.style.position = 'static';
            var _pos = $element.position();
            element.style.position = 'relative';
            element.style.left = (pos.left - _pos.left) + "px";
            element.style.top = (pos.top - _pos.top) + "px";
        }
        //开始初始化
        findHandle(element,element);
        options.doDisable(options.disabled);
        bindDrag(element,options);
    };
	draggable.version = 1.0;
	draggable.defaults = defaults;
});