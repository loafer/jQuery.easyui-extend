var bufferview = $.extend({}, $.fn.datagrid.defaults.view, {
	render: function(target, container, frozen){
		var state = $.data(target, 'datagrid');
		var opts = state.options;
		var rows = this.rows || [];
		if (!rows.length) {
			return;
		}
		var fields = $(target).datagrid('getColumnFields', frozen);
		
		if (frozen){
			if (!(opts.rownumbers || (opts.frozenColumns && opts.frozenColumns.length))){
				return;
			}
		}
		
		var index = parseInt(opts.finder.getTr(target,'','last',(frozen?1:2)).attr('datagrid-row-index'))+1 || 0;
		var table = ['<table class="datagrid-btable" cellspacing="0" cellpadding="0" border="0"><tbody>'];
		for(var i=0; i<rows.length; i++) {
			// get the class and style attributes for this row
			var css = opts.rowStyler ? opts.rowStyler.call(target, index, rows[i]) : '';
			var classValue = '';
			var styleValue = '';
			if (typeof css == 'string'){
				styleValue = css;
			} else if (css){
				classValue = css['class'] || '';
				styleValue = css['style'] || '';
			}
			
			var cls = 'class="datagrid-row ' + (index % 2 && opts.striped ? 'datagrid-row-alt ' : ' ') + classValue + '"';
			var style = styleValue ? 'style="' + styleValue + '"' : '';
			var rowId = state.rowIdPrefix + '-' + (frozen?1:2) + '-' + index;
			table.push('<tr id="' + rowId + '" datagrid-row-index="' + index + '" ' + cls + ' ' + style + '>');
			table.push(this.renderRow.call(this, target, fields, frozen, index, rows[i]));
			table.push('</tr>');
			index++;
		}
		table.push('</tbody></table>');
		
		$(container).append(table.join(''));
	},
	
	onBeforeRender: function(target){
		var state = $.data(target, 'datagrid');
		var opts = state.options;
		var dc = state.dc;
		var view = this;
		this.renderedCount = 0;
		this.rows = [];
		
		// erase the onLoadSuccess event, make sure it can't be triggered
		state.onLoadSuccess = opts.onLoadSuccess;
		opts.onLoadSuccess = function(){};
		
		dc.body1.add(dc.body2).empty();
		dc.body2.unbind('.datagrid').bind('scroll.datagrid', function(e){
			if (state.onLoadSuccess){
				opts.onLoadSuccess = state.onLoadSuccess;	// restore the onLoadSuccess event
				state.onLoadSuccess = undefined;
			}
			if ($(this).scrollTop() >= getDataHeight()-$(this).height()){
				if (this.scrollTimer){
					clearTimeout(this.scrollTimer);
				}
				this.scrollTimer = setTimeout(function(){
					view.populate.call(view, target);
					while (getDataHeight() < dc.body2.height() && view.renderedCount < state.data.total){
						view.populate.call(view, target);
					}
				}, 50);
			}
		});
		
		function getDataHeight(){
			var h = 0;
			dc.body2.children('table.datagrid-btable').each(function(){
				h += $(this).outerHeight();
			});
			if (!h){
				h = view.renderedCount * 25;
			}
			return h;
		}
	},
	
	populate: function(target){
		var state = $.data(target, 'datagrid');
		var opts = state.options;
		var dc = state.dc;
		if (this.renderedCount >= state.data.total){return;}
		this.rows = state.data.rows.slice(this.renderedCount, this.renderedCount+opts.pageSize);
		if (this.rows.length){
			this.renderedCount += this.rows.length;
			opts.view.render.call(opts.view, target, dc.body2, false);
			opts.view.render.call(opts.view, target, dc.body1, true);
			opts.onLoadSuccess.call(target, {
				total: state.data.total,
				rows: this.rows
			});
		} else {
			var param = $.extend({}, opts.queryParams, {
				page: Math.floor(this.renderedCount/opts.pageSize)+1,
				rows: opts.pageSize
			});
			if (opts.sortName){
				$.extend(param, {
					sort: opts.sortName,
					order: opts.sortOrder
				});
			}
			if (opts.onBeforeLoad.call(target, param) == false) return;
			
			$(target).datagrid('loading');
			var result = opts.loader.call(target, param, function(data){
				$(target).datagrid('loaded');
				var data = opts.loadFilter.call(target, data);
				state.data.rows = state.data.rows.concat(data.rows);
				opts.view.rows = data.rows;
				opts.view.renderedCount += data.rows.length;
				opts.view.render.call(opts.view, target, dc.body2, false);
				opts.view.render.call(opts.view, target, dc.body1, true);
				opts.onLoadSuccess.call(target, data);
			}, function(){
				$(target).datagrid('loaded');
				opts.onLoadError.apply(target, arguments);
			});
			if (result == false){
				$(target).datagrid('loaded');
			}
		}
	}
});
