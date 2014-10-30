define(["avalon.uibase"],function(avalon){
	function bindDrag(element,vmodel,handle){
		handle = handle || element;
		avalon.bind(handle,"mousedown",function(e){
			e.preventDefault();
			if(vmodel.disabled || vmodel.onBeforeDrag.call(this,e) === false) return;
			var $el = avalon(element);
			var position = $el.position();
			var sL = position.left;
			var sT = position.top;
			var sX = e.pageX;
            var sY = e.pageY;
            var overEdge = vmodel.overEdge;
            var axis = vmodel.axis;
            if(!overEdge){
            	var posP = avalon.uibase.getPosParent(element);
            	var $posP = avalon(posP);
            	var maxL = $posP.innerWidth() - $el.outerWidth(true);
            	var maxT = $posP.innerHeight() - $el.outerHeight(true);
            }
            vmodel.onStartDrag.call(this,e);
            var move = avalon.bind(document,"mousemove",function(moveE){
            	moveE.preventDefault();
            	vmodel.onDrag.call(this,moveE);
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
            	vmodel.onStopDrag.call(this,upE);
                avalon.unbind(document,"mouseup",up);
                avalon.unbind(document,"mousemove",move);
            });
		});
	}
	avalon.bindingHandlers.draggable = function(data, vmodels){
		var args = data.value.match(avalon.rword) || ["$", "draggable"];
		var ID = args[0].trim(), opts = args[1], model, vmOptions;
        if (ID && ID != "$") {
            model = avalon.vmodels[ID];//如果指定了此VM的ID
            if (!model) {
                return;
            }
        }
        data.element.removeAttribute("ms-draggable");
        if (!model) {//如果使用$或绑定值为空，那么就默认取最近一个VM，没有拉倒
            model = vmodels.length ? vmodels[0] : null
        }

	};
	var widget = avalon.ui.draggable = function(element, data, vmodels){
		var options = data.draggableOptions;
		var vmodel = avalon.define(data.draggableId,function(vm){
			avalon.mix(vm,options);
			vm.$skipArray = ["overEdge","dragCursor",
			"axis","onBeforeDrag","onStartDrag","onDrag","onStopDrag"];
			vm.$init = function(){
				var pos = avalon(element).css('position');
				if(pos !== 'absolute' && pos !== 'fixed'){
					element.style.position = 'absolute';
				}
				avalon.scan(element,[vmodel].concat(vmodels));
				var handle;
				avalon.each(element.getElementsByTagName("*"),function(i,el){
					if(el.getAttribute("data-drag-handle")){
						element.handle = handle = el;
						el.removeAttribute("data-drag-handle");
						return false;
					}
				});
				vmodel.$fire("disabled",vmodel.disabled);
				bindDrag(element,vmodel,handle);
			};
			/****************************方法*****************************/
		});
		vmodel.$watch("disabled",function(r){
			var str = r ? "default" : vmodel.dragCursor;
			var target = element;
			if(element.handle){
				target = element.handle;
			}
			target.style.cursor = str;
		});
		return vmodel;
	};
	widget.version = 1.0;
	widget.defaults = {
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
});