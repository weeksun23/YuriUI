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
		var p = avalon.uibase.getPosParent(el);
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
	//设置窗口居中 非固定居中
	function setCenterPos(el,mask){
		if(!mask){
			mask = avalon.uibase.getPosParent(el);
		}
		var $mask = avalon(mask);
		var $el = avalon(el);
		$el.css("left",($mask.innerWidth() - $el.outerWidth()) / 2)
			.css("top",($mask.innerHeight() - $el.outerHeight()) / 2);
	}
	//显示或隐藏遮罩层
	//mask.activeDialog 存放所有可见的带遮罩的dialog
	function showHideMask(element,isHide){
		var mask = element.mask;
		if(!mask) return;
		var activeDialog = mask.activeDialog;
		if(activeDialog === undefined){
			activeDialog = mask.activeDialog = [];
		}
		if(isHide){
			avalon.Array.remove(activeDialog, element);
			var len = activeDialog.length;
			if(len > 0){
				var zIndex = Number(mask.style.zIndex);
				activeDialog[len - 1].style.zIndex = zIndex + 1;
			}else{
				mask.style.display = 'none';
			}
		}else{
			activeDialog.push(element);
			if(activeDialog.length === 1){
				mask.style.display = 'block';
			}
		}
		return mask;
	}
	var widget = avalon.ui.dialog = function(element, data, vmodels){
		//是否需要固定居中标志 只有当dialog可见的情况下 才能准确计算居中的位置数据
		var isAutoCenter = false;
		//是否需要居中 默认第一次打开的窗口都居中
		var isCenter = true;
		var options = data.dialogOptions;
		if(!options.title){
			options.title = element.title;
		}
		element.title = "";
		if(!options.content){
			options.content = element.innerHTML;
		}
		var dialogId = data.dialogId;
		var vmodel = avalon.define(dialogId,function(vm){
			avalon.mix(vm,options);
			vm.widgetElement = element;
			vm.$skipArray = ['widgetElement','resizeByDialogH'];
			vm.$init = function(){
				var $el = avalon(element).addClass("dialog ball").css("z-index",getZIndex());
				isAutoCenter = vmodel.centered;
				avalon.uibase.setAttr($el,{
					"ms-class" : "dialog-noclose:!closeable",
					"ms-class-1" : "dialog-center:centered",
					"ms-visible" : "!closed",
					"ms-css-width" : "width"
				});
				element.innerHTML = templete;
				avalon.scan(element, [vmodel].concat(vmodels));
				vmodel.modal && vmodel.$fire("modal",true);
				!vmodel.closed && vmodel.$fire("closed",false);
			};
			vm.$remove = function(){
				var mask = showHideMask(element,true);
				if(mask){
					vmodel.modal = false;
				}
				element.innerHTML = element.textContent = ""
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
			vm.$buttonsClick = function(e){
				avalon.uibase.propagation.call(this,{
					button : function(){
						var index = Number(this.getAttribute("data-index"));
						var btn = vmodel.buttons[index];
						btn.click && btn.click.call(this,vmodel);
						if(btn.doClose){
							vmodel.closed = true;
						}
					}
				},e);
			};
			/****************************方法*****************************/
			vm.resizeByDialogH = function(dialogH){
				var ch = element.children;
				var h = avalon(ch[0]).outerHeight(true);
				if(ch.length === 3){
					h += avalon(ch[2]).outerHeight();
				}
				var content = avalon(ch[1]);
				var dH = content.outerHeight() - content.height();
				vmodel.height = dialogH - h - dH;
			};
		});
		vmodel.$watch("centered",function(r){
			var $el = avalon(element);
			var display = element.style.display;
			if(r){
				isCenter = false;
				if(display === 'none'){
					isAutoCenter = true;
				}else{
					$el.css("margin-top",-$el.outerHeight() / 2)
						.css("margin-left",-$el.outerWidth() / 2)
						.css("left","")
						.css("top","");
				}
			}else{
				$el.css("margin-top","")
					.css("margin-left","");
				if(display === 'none'){
					isCenter = true;
				}else{
					setCenterPos(element,element.mask);
					isCenter = false;
				}
			}
		});
		vmodel.$watch("modal",function(r){
			var mask = element.mask || getMask(element);
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
			if(num === 0){
				mask.parentNode.removeChild(mask);
			}
		});
		vmodel.$watch("closed",function(r){
			showHideMask(element,r);
			if(!r){
				//打开窗口
				var zIndex = getZIndex();
				var mask = element.mask;
				mask && (mask.style.zIndex = zIndex - 1);
				element.style.zIndex = zIndex;
				if(isAutoCenter){
					//固定居中
					vmodel.$fire("centered",true);
					isAutoCenter = false;
				}else if(isCenter){
					//居中
					setCenterPos(element,mask);
					isCenter = false;
				}
			}
		});
		return vmodel;
	};
	widget.version = 1.0;
	widget.defaults = {
		//按钮组
		buttons : null,
		//内容style样式
		contentStyle : "",
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
		//是否固定居中
		centered : false
	};
});