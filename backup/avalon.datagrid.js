define(["avalon.uibase","text!./avalon.datagrid.html"],function(avalon,templete){
	function initColumns(columns){
		if(!columns) return;
		avalon.uibase.initData(widget.columnsDefaults,columns);
	}
	function initData(data){
		avalon.uibase.initData({
			_selected : false,
			_hover : false,
			_height : null
		},data);
	}
	function resizeTdWidth(vmodel){
		var columns = vmodel.columns;
		if(!columns) return;
		var mainElement = vmodel.mainElement;
		var frozenColumns = vmodel.frozenColumns;
		var hasFrozen = frozenColumns && frozenColumns.length > 0;
		var ch = mainElement.children;
		var len = ch.length;
		var g = 'getElementsByTagName';
		avalon.each(ch,function(i,el){
			var tables = el[g]("table");
			var target;
			if(len > 1 && i === 0){
				if(!hasFrozen) return;
				target = frozenColumns;
			}else{
				target = columns;
			}
			var tr0 = tables[1][g]('tr')[0];
			if(tr0){
				var tdFields = tr0.children;
			}
			var k = 0;
			avalon.each(tables[0][g]('th'),function(j,th){
				var $th = avalon(th);
				if($th.hasClass('th-field') && !target[k].width){
					avalon.log($th.width(),tdFields ? avalon(tdFields[k]).width() : 0);
					target[k].width = Math.max($th.width() + 5,tdFields ? avalon(tdFields[k]).width() : 0);
					k++;
				}
			});
		});
	}

	var widget = avalon.ui.datagrid = function(element, data, vmodels){
		var options = data.datagridOptions;
		initData(options.data);
		initColumns(options.columns);
		initColumns(options.frozenColumns);
		function toggleSelected(index){
			var row = vmodel.data[index];
			var selected = toggleSelected.selected;
			if(vmodel.singleSelect){
				for(var i in selected){
					break;
				}
				if(i !== undefined){
					vmodel.data[+i]._selected = false;
					delete selected[i];
				}
				if(+i !== index){
					selected[index] = true;
					row._selected = true;
				}
			}else{
				toggleSelected.selected[index] = (row._selected = !row._selected);
			}
		}
		toggleSelected.selected = {};
		var vmodel = avalon.define(data.datagridId,function(vm){
			avalon.mix(vm,options);
			vm.widgetElement = element;
			vm.$skipArray = ['mainElement','widgetElement','toolbar','rowNumbers'];
			vm.headerHeight = null;
			vm.$init = function(){
				var $el = avalon(element);
				$el.addClass("datagrid ball");
				element.setAttribute("ms-css-width","width");
				element.setAttribute("ms-css-height","height");
				element.innerHTML = templete;

				var t = new Date;
				avalon.scan(element, vmodel);
				avalon.log(new Date - t);
				//修正view2的marginLeft view1、view2 tbody的高度
				var h = 0;
				var $main;
				var view2;
				var view1;
				avalon.each(element.children,function(i,el){
					var $el = avalon(el);
					if($el.hasClass("datagrid-main")){
						vmodel.mainElement = el;
						var ch = el.children;
						if(ch.length === 1){
							view2 = ch[0]
						}else{
							view1 = ch[0];
							view2 = ch[1];
						}
						if(view1){
							view2.style.marginLeft = avalon(view1).outerWidth() + "px";
						}
						$main = $el;
					}else if(vmodel.height){
						h += $el.outerHeight();
					}
				});
				var bodyH = $el.height() - h - avalon(view2.children[0]).outerHeight();
				view2.children[1].style.height = bodyH + 'px';
				if(view1){
					view1.children[1].style.height = bodyH + 'px';
				}

				resizeTdWidth(vmodel);
			};
			vm.$remove = function(){
				element.innerHTML = element.textContent = ""
			};
			vm.$onClickBody = function(e){
				avalon.uibase.propagation.call(this,{
					row : function(e){
						toggleSelected(+this.getAttribute('data-index'));
					}
				},e);
			};
			vm.$hoverRow = function(i,r){
				vmodel.data[i]._hover = r;
			};
		});
		return vmodel;
	};
	widget.version = 1.0;
	widget.defaults = {
		title : null,
		toolbar : null,
		showHeader : true,
		columns : [],
		data : null,
		rowNumbers : false,
		width : null,
		height : null,
		singleSelect : false,
		striped : true,
		frozenColumns : []
	};
	widget.columnsDefaults = {
		title : "",
		field : null,
		formatter : null,
		width : null
	};
});