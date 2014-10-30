define(["avalon.uibase"],function(avalon){
	function bindDrag(element,options){
		avalon.bind(element.handle || element,"mousedown",function(e){
			e.preventDefault();
			if(options.disabled || options.onBeforeDrag.call(this,e) === false) return;
			var $el = avalon(element);
			var position = $el.position();
			var sL = position.left;
			var sT = position.top;
			var sX = e.pageX;
            var sY = e.pageY;
            var overEdge = options.overEdge;
            var axis = options.axis;
            if(!overEdge){
            	var posP = avalon.uibase.getPosParent(element);
            	var $posP = avalon(posP);
            	var maxL = $posP.innerWidth() - $el.outerWidth(true);
            	var maxT = $posP.innerHeight() - $el.outerHeight(true);
            }
            options.onStartDrag.call(this,e);
            //var t = new Date;
            //var gap = document.querySelector ? 12 : 30;
            var move = avalon.bind(document,"mousemove",function(moveE){
            	//var cur = new Date;
				//if(cur - t <= gap) return;
				//t = cur;
            	moveE.preventDefault();
            	options.onDrag.call(this,moveE);
            	var newL = sL + (moveE.pageX - sX);
            	var newT = sT + (moveE.pageY - sY);
            	if(!overEdge){
            		if(newL > maxL){
            			newL = maxL;
            		}else if(newL < 0){
            			newL = 0;
            		}
            		if(newT > maxT){
            			newT = maxT;
            		}else if(newT < 0){
            			newT = 0;
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
        var ID = data.value || "$";
        var opts = "$draggable";
        var model, vmOptions;
        if (ID && ID != "$") {
            model = avalon.vmodels[ID];//如果指定了此VM的ID
            if (!model) {
                return;
            }
        }
        if (!model) {//如果使用$或绑定值为空，那么就默认取最近一个VM，没有拉倒
            model = vmodels.length ? vmodels[0] : null;
        }
        if (model && typeof model[opts] === "object") {//如果指定了配置对象，并且有VM
            vmOptions = model[opts];
        }
        var element = data.element;
        element.removeAttribute("ms-draggable");
        var $element = avalon(element);
        var options = avalon.mix({}, defaults, vmOptions || {}, avalon.getWidgetData(element, "draggable"),{
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
        model[opts] = options;
        if(!/^[a|f]/.test($element.css("position"))){
        	element.style.position = 'absolute';
        }
        //开始初始化
        avalon.log(element.innerHTML);
        findHandle(element,element);
        options.doDisable(options.disabled);
        bindDrag(element,options);
    };
	draggable.version = 1.0;
	draggable.defaults = defaults;
});