define(["avalon.uibase","text!./avalon.dialog.html"],function(avalon,templete){
	var getZIndex = (function(){
		var zindex = 90;
		return function(){
			zindex += 10;
			return zindex;
		};
	})();
	//遍历父节点 找到position不为static的父节点或是body标签 
	//查看其是否已经生成mask 若没 则生成并返回
	function getMask(el){
		var p = el.parentNode;
		while(p.tagName.toLowerCase() !== 'body'){
			var $p = avalon(p);
			var pos = $p.css("position");
			if(pos === 'relative' || pos === 'absolute' || pos === 'fixed') break;
			p = p.parentNode;
		}
		var mask;
		avalon.each(p.children,function(i,node){
			if(avalon(node).hasClass("dialog-mask")){
				mask = node;
				return false;
			}
		});
		if(!mask){
			mask = document.createElement("div");
			mask.className = "dialog-mask abfit";
			//关联的dialog数目
			mask.setAttribute("data-dialog-num",'0');
			p.appendChild(mask);
		}
		return mask;
	}
	var isNeedCenter = false;
	var widget = avalon.ui.dialog = function(element, data, vmodels){
		var options = data.dialogOptions;
		if(!options.title){
			options.title = element.title;
		}
		element.title = "";
		if(!options.content){
			options.content = element.innerHTML;
		}
		var vmodel = avalon.define(data.dialogId,function(vm){
			avalon.mix(vm,options);
			vm.$skipArray = [];
			vm.$init = function(){
				var $el = avalon(element);
				$el.addClass("dialog ball").css("z-index",getZIndex());
				avalon.uibase.setAttr($el,{
					"ms-class" : "dialog-noclose:!closeable",
					"ms-class-1" : "dialog-center:centered",
					"ms-visible" : "!closed",
					"ms-css-width" : "width"
				});
				element.innerHTML = templete;
				avalon.scan(element, vmodel);
				isNeedCenter = vmodel.centered;
				vmodel.modal && vmodel.$fire("modal",true);
				!vmodel.closed && vmodel.$fire("closed",false);
			};
			vm.$titleClick = function(e){
				avalon.uibase.propagation.call(this,{
					tools : function(){
						
					},
					close : function(e){
						e.stopPropagation();
						vmodel.closed = true;
					}
				},e);
			};
			/****************************方法*****************************/
		});
		vmodel.$watch("centered",function(r){
			var $el = avalon(element);
			if(r){
				if(element.style.display === 'none'){
					isNeedCenter = true;
				}else{
					$el.css("margin-top",-$el.outerHeight() / 2)
						.css("margin-left",-$el.outerWidth() / 2);
				}
			}else{
				$el.css("margin-top","")
					.css("margin-left","");
			}
		});
		vmodel.$watch("modal",function(r){
			var mask = getMask(element);
			var $mask = avalon(mask);
			var num = Number($mask.attr("data-dialog-num"));
			if(r){
				element.mask = mask;
				num++;
			}else{
				element.mask = null;
				num--;
			}
			$mask.attr("data-dialog-num",num);
		});
		vmodel.$watch("closed",function(r){
			var mask = element.mask;
			if(!r){
				var zIndex = getZIndex();
				element.style.zIndex = zIndex;
			}
			if(!mask) return;
			mask.style.display = r ? "none" : "block";
			if(!r){
				//打开窗口
				if(isNeedCenter){
					vmodel.$fire("centered",true);
					isNeedCenter = false;
				}
				mask.style.zIndex = --zIndex;
			}
		});
		return vmodel;
	};
	widget.version = 1.0;
	widget.defaults = {
		//dialog宽度
		width : 300,
		//工具栏按钮数组
		tools : null,
		//dialog图标 显示在标题左旁边
		iconCls : null,
		//内容高度 不包含标题
		height : null,
		//是否模态
		modal : true,
		//标题 支持html
		title : null,
		//dialog内容 支持html
		content : null,
		//是否含右上关闭按钮
		closeable : true,
		//窗口是否关闭(隐藏)
		closed : true,
		//是否居中 设置为true后 窗口就不能移动
		centered : false
	};
});