define(["avalon.uibase.function"],function(avalon){
	var defaults = {
		minWidth : 20,
		minHeight : 20,
		maxWidth : null,
		maxHeight : null,
		edge : 5,
		disabled : false,
        defaultCursor : "default",
		onStartResize : avalon.noop,
		onResize : avalon.noop,
		onStopResize : avalon.noop
	};
	function getMinMax(options,hw,target){
		var min = options["min" + hw];
		var max = options["max" + hw];
		if(target < min){
			return min;
		}else if(max && target > max){
			return max;
		}
		return target;
	}
	//支持left top定位的元素
	var resizable = avalon.bindingHandlers.resizable = function(data, vmodels) {
        var options = avalon.uibase.initBinding(data, vmodels, "resizable", defaults);
        var cursor;
        var isChanging = false;
        avalon.bind(data.element,"mousemove",function(e){
            if(e.target !== this){
                return this.style.cursor = options.defaultCursor;
            }
        	if(!isChanging && !options.disabled){
                cursor = null;
                var element = this;
                var $this = avalon(this);
                var offset = $this.offset();
                var w = $this.outerWidth();
                var h = $this.outerHeight();
                var x = e.pageX - offset.left;
                var y = e.pageY - offset.top;
                var edge = options.edge;
                if(y < edge){
                    if(x < edge){
                        //左上角
                        cursor = "nw-resize";
                    }else if(x > w - 5){
                        //右上角
                        cursor = "ne-resize";
                    }else{
                        //中间
                        cursor = "n-resize";
                    }
                }else if(y > h - 5){
                    if(x < edge){
                        //左下角
                        cursor = "sw-resize";
                    }else if(x > w - 5){
                        //右下角
                        cursor = "se-resize";
                    }else{
                        //中间
                        cursor = "s-resize";
                    }
                }else{
                    if(x < edge){
                        //左边
                        cursor = "w-resize";
                    }else if(x > w - 5){
                        //右边
                        cursor = 'e-resize';
                    }
                }
                this.style.cursor = cursor || "default";
            }
        });
		avalon.bind(data.element,"mousedown",function(e){
			if(e.target === this && !options.disabled && cursor){
				e.preventDefault();
				var element = this;
				var sX = e.pageX;
				var sY = e.pageY;
				var $this = avalon(this);
				var isChangePos = /^[a|f]/.test($this.css("position"));
				///^(nw|ne|n|sw|w)/.test(cursor) && 
	        	var w = $this.width();
	        	var h = $this.height();
	        	if(isChangePos){
	        		var offset = $this.offset();
	        	}
	        	isChanging = true;
	        	options.onStartResize.call(this,e,{
	        		width : w,
	        		height : h,
	        		left : offset ? offset.left : null,
	        		top : offset ? offset.top : null
	        	});
        		var move = avalon.bind(document,"mousemove",function(e){
        			e.preventDefault();
        			var dx = e.pageX - sX;
        			var dy = e.pageY - sY;
        			switch(cursor){
        				case "nw-resize":
        					var obj = {
        						width : w - dx,
        						height : h - dy
        					};
    						isChangePos && avalon.mix(obj,{
    							left : offset.left + dx,
    							top : offset.top + dy
    						});
	        				break;
	        			case "ne-resize":
	        				obj = {
        						width : w + dx,
        						height : h - dy
        					};
    						isChangePos && avalon.mix(obj,{
    							top : offset.top + dy
    						});
	        				break;
	        			case "n-resize" : 
	        				obj = {
        						height : h - dy
        					};
    						isChangePos && avalon.mix(obj,{
    							top : offset.top + dy
    						});
	        				break;
	        			case "sw-resize" :
	        				obj = {
        						width : w - dx,
        						height : h + dy
        					};
    						isChangePos && avalon.mix(obj,{
    							left : offset.left + dx
    						});
	        				break;
	        			case "se-resize":
	        				obj = {
        						width : w + dx,
        						height : h + dy
        					};
	        				break;
	        			case "s-resize" :
	        				obj = {
        						height : h + dy
        					};
	        				break;
	        			case "w-resize" : 
	        				obj = {
        						width : w - dx
        					};
    						isChangePos && avalon.mix(obj,{
    							left : offset.left + dx
    						});
	        				break;
	        			case "e-resize" : 
	        				obj = {
        						width : w + dx
        					};
	        				break;
        			}
        			if(obj){
        				if(obj.width){
        					var _w = obj.width;
        					obj.width = getMinMax(options,"Width",_w);
        					if(obj.left !== undefined && obj.width !== _w){
        						obj.left = offset.left + w - obj.width;
        					}
        				}
        				if(obj.height){
        					var _h = obj.height;
        					obj.height = getMinMax(options,"Height",_h);
        					if(obj.top !== undefined && obj.height !== _h){
        						obj.top = offset.top + h - obj.height;
        					}
        				}
        				for(var i in obj){
        					element.style[i] = obj[i] + "px";
        				}
        				options.onResize.call(element,e,obj);
        			}
        		});
        		var up = avalon.bind(document,"mouseup",function(e){
        			isChanging = false;
                    cursor = null;
	                avalon.unbind(document,"mouseup",up);
	                avalon.unbind(document,"mousemove",move);
	                options.onStopResize.call(element,e);
	            });
	            return false;
        	}
		});
    };
	resizable.defaults = defaults;
});