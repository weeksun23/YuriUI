define(["avalon"],function(avalon){
	function getMenuStr(HTML_OR_TPL){
		return "<div ms-repeat='"+HTML_OR_TPL+"' ms-class='menu-item' ms-class-1='disabled:el.disabled' ms-visible='!el.isHide' ms-click='$itemClick($event,el)' ms-hover='menu-item-hover'>"+
			"<i ms-if='el.iconCls' ms-class='{{el.iconCls}}'></i>" +
			"<i ms-if='!el.iconCls'></i>" +
			"<span ms-class='menu-text' ms-class-1='menu-text-noch:!el.subMenu || !el.subMenu.length'>{{el.text}}</span>" +
			"<span ms-if='el.subMenu && el.subMenu.length' class='menu-arrow'></span>" +
			"<div ms-if='el.subMenu && el.subMenu.length' ms-include-src='\"MENU_TPL\"' class='menu'></div>" +
		"</div>" +
		"<div class='menu-line'></div>";
	}
	function findMenuItem(list,id,func){
		for(var i=0,ii=list.length;i<ii;i++){
			var item = list[i];
			if(item.id === id){
				func(item);
				return false;
			}
			if(item.subMenu && findMenuItem(item.subMenu,id,func) === false){
				return false;
			}
		}
	}
	var widget = avalon.ui.menu = function(element, data, vmodels){
		if(!avalon.templateCache["MENU_TPL"]){
			avalon.templateCache["MENU_TPL"] = getMenuStr("el.subMenu");
		}
		var vmodel = avalon.define(data.menuId,function(vm){
			avalon.mix(vm, data.menuOptions);
			vm.$skipArray = ["show","updateAttr","target"];
			vm.widgetElement = element;
			vm.template = getMenuStr("menuList");
			vm.$itemClick = function(e,el){
				e.stopPropagation();
				if(el.disabled) return;
				var pp = avalon(this.parentNode.parentNode);
				if(pp.hasClass("menu-item")){
					pp.removeClass("menu-item-hover");
				}else{
					vmodel.isShow = false;
				}
				el.click && el.click.call(el,vmodel.target);
			};
			vm.$mouseleave = function(){
				vmodel.isShow = false;
			};
			vm.$init = function(){
				var $el = avalon(element);
				$el.attr("ms-css-left","left");
				$el.attr("ms-css-top","top");
				$el.attr("ms-visible","isShow");
				$el.attr("ms-mouseleave","$mouseleave");
				$el.addClass("menu");
				element.innerHTML = vmodel.template;
				avalon.scan(element, vmodel);
			};
			vm.$remove = function(){
				element.innerHTML = element.textContent = "";
			};
			/*******************************方法*******************************/
			vm.show = function(x,y,target){
				var oncontextmenu = document.oncontextmenu;
				document.oncontextmenu = function(){
					oncontextmenu && oncontextmenu.apply(this,arguments);
					vmodel.target = target;
					vmodel.isShow = true;
					vmodel.left = x - 1;
					vmodel.top = y - 1;
					document.oncontextmenu = oncontextmenu;
					return false;
				};
			};
			vm.updateAttr = function(id,attr){
				findMenuItem(vmodel.menuList,id,function(el){
					avalon.mix(el,attr);
				});
			};
		});
		return vmodel;
	};
	widget.defaults = {
		left : 0,
		//menu当前指向的对象
		target : null,
		top : 0,
		isShow : false,
		menuList : []
	};
});