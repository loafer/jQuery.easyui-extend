var scrollview2 = $.extend({}, $.fn.datagrid.defaults.view, {
	addExpandColumn: function(target, index){
		var opts = $.data(target, 'datagrid').options;
		if (index >= 0){
			_add(index);
		} else {
			var length = this.rows.length;
			for(var i=0; i<length; i++){
				_add(this.index+i);
			}
			opts.finder.getTr(target, 0, 'allfooter', 1).each(function(){
				var s = '<td><div style="width:25px"></div></td>';
				var tr = $(this);
				if (tr.is(':empty')){
					tr.html(s);
				} else if (tr.children('td.datagrid-td-rownumber').length){
					$(s).insertAfter(tr.children('td.datagrid-td-rownumber'));
				} else {
					$(s).insertBefore(tr.children('td:first'));
				}
			});
		}
		
		function _add(rowIndex){
			var tr = opts.finder.getTr(target, rowIndex, 'body', 1);
			if (tr.find('span.datagrid-row-expander').length){return;}	// the expander is already exists
			var cc = [];
			cc.push('<td>');
			cc.push('<div style="text-align:center;width:25px;height:16px;">');
			cc.push('<span class="datagrid-row-expander datagrid-row-expand" style="display:inline-block;width:16px;height:16px;cursor:pointer;" />');
			cc.push('</div>');
			cc.push('</td>');
			if (tr.is(':empty')){
				tr.html(cc.join(''));
			} else if (tr.children('td.datagrid-td-rownumber').length){
				$(cc.join('')).insertAfter(tr.children('td.datagrid-td-rownumber'));
			} else {
				$(cc.join('')).insertBefore(tr.children('td:first'));
			}
			$(target).datagrid('fixRowHeight', rowIndex);
			tr.find('span.datagrid-row-expander').unbind('.datagrid').bind('click.datagrid', function(e){
				var rowIndex = $(this).closest('tr').attr('datagrid-row-index');
				if ($(this).hasClass('datagrid-row-expand')){
					$(target).datagrid('expandRow', rowIndex);
				} else {
					$(target).datagrid('collapseRow', rowIndex);
				}
				$(target).datagrid('fixRowHeight');
				return false;
			});
		}
	},
	
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
		
		var index = this.index;
		var table = ['<table class="datagrid-btable" cellspacing="0" cellpadding="0" border="0"><tbody>'];
		for(var i=0; i<rows.length; i++) {
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
			// get the class and style attributes for this row
//			var cls = (index % 2 && opts.striped) ? 'class="datagrid-row datagrid-row-alt"' : 'class="datagrid-row"';
//			var styleValue = opts.rowStyler ? opts.rowStyler.call(target, index, rows[i]) : '';
//			var style = styleValue ? 'style="' + styleValue + '"' : '';
			var rowId = state.rowIdPrefix + '-' + (frozen?1:2) + '-' + index;
			table.push('<tr id="' + rowId + '" datagrid-row-index="' + index + '" ' + cls + ' ' + style + '>');
			table.push(this.renderRow.call(this, target, fields, frozen, index, rows[i]));
			table.push('</tr>');
			
			// render the detail row
			table.push('<tr style="display:none;">');
			if (frozen){
				table.push('<td colspan=' + (fields.length+2) + ' style="border-right:0">');
			} else {
				table.push('<td colspan=' + (fields.length) + '>');
			}
			table.push('<div class="datagrid-row-detail">');
			if (frozen){
				table.push('&nbsp;');
			} else {
				table.push(opts.detailFormatter.call(target, i, rows[i]));
			}
			table.push('</div>');
			table.push('</td>');
			table.push('</tr>');
			
			index++;
		}
		table.push('</tbody></table>');
		
		$(container).html(table.join(''));
	},
	
	onBeforeRender: function(target){
		var state = $.data(target, 'datagrid');
		var opts = state.options;
		var dc = state.dc;
		var view = this;
		
		// erase the onLoadSuccess event, make sure it can't be triggered
		state.onLoadSuccess = opts.onLoadSuccess;
		opts.onLoadSuccess = function(){};
		
		opts.finder.getRow = function(t, p){
			var index = (typeof p == 'object') ? p.attr('datagrid-row-index') : p;
			var row = $.data(t, 'datagrid').data.rows[index];
			if (!row){
				var v = $(t).datagrid('options').view;
				row = v.rows[index - v.index];
			}
			return row;
		};
		
		dc.body1.add(dc.body2).empty();
		this.rows = undefined;	// the rows to be rendered
		this.r1 = this.r2 = [];	// the first part and last part of rows
		dc.body2.unbind('.datagrid').bind('scroll.datagrid', function(e){
			if (state.onLoadSuccess){
				opts.onLoadSuccess = state.onLoadSuccess;	// restore the onLoadSuccess event
				state.onLoadSuccess = undefined;
			}
			if (view.scrollTimer){
				clearTimeout(view.scrollTimer);
			}
			view.scrollTimer = setTimeout(function(){
				scrolling.call(view);
			}, 50);
		});
		
		function scrolling(){
			if (dc.body2.is(':empty')){
				reload.call(this);
			} else {
				var firstTr = opts.finder.getTr(target, this.index, 'body', 2);
				var lastTr = opts.finder.getTr(target, 0, 'last', 2);
				var headerHeight = dc.view2.children('div.datagrid-header').outerHeight();
				var top = firstTr.position().top - headerHeight;
				var bottom = lastTr.position().top + lastTr.outerHeight() - headerHeight;
				
				if (top > dc.body2.height() || bottom < 0){
					reload.call(this);
				} else if (top > 0){
					var page = Math.floor(this.index/opts.pageSize);
					this.getRows.call(this, target, page, function(rows){
						this.r2 = this.r1;
						this.r1 = rows;
						this.index = (page-1)*opts.pageSize;
						this.rows = this.r1.concat(this.r2);
						this.populate.call(this, target);
					});
				} else if (bottom < dc.body2.height()){
					var page = Math.floor(this.index/opts.pageSize)+2;
					if (this.r2.length){
						page++;
					}
					this.getRows.call(this, target, page, function(rows){
						if (!this.r2.length){
							this.r2 = rows;
						} else {
							this.r1 = this.r2;
							this.r2 = rows;
							this.index += opts.pageSize;
						}
						this.rows = this.r1.concat(this.r2);
						this.populate.call(this, target);
					});
				}
			}
			
			function reload(){
				var top = $(dc.body2).scrollTop();
				var index = Math.floor(top/25);
				var page = Math.floor(index/opts.pageSize) + 1;
				
				this.getRows.call(this, target, page, function(rows){
					this.index = (page-1)*opts.pageSize;
					this.rows = rows;
					this.r1 = rows;
					this.r2 = [];
					this.populate.call(this, target);
					dc.body2.triggerHandler('scroll.datagrid');
				});
			}
		}
	},
	
	onAfterRender: function(target){
		var opts = $.data(target, 'datagrid').options;
		var dc = $.data(target, 'datagrid').dc;
		
		$.fn.datagrid.defaults.view.onAfterRender.call(this, target);
		
		var t = dc.view1.children('div.datagrid-header').find('table');
		if (t.find('div.datagrid-header-expander').length){
			return;
		}
		var td = $('<td rowspan="'+opts.frozenColumns.length+'"><div class="datagrid-header-expander" style="width:25px;"></div></td>');
		if ($('tr',t).length == 0){
			td.wrap('<tr></tr>').parent().appendTo($('tbody',t));
		} else if (opts.rownumbers){
			td.insertAfter(t.find('td:has(div.datagrid-header-rownumber)'));
		} else {
			td.prependTo(t.find('tr:first'));
		}
	},
	
	getRows: function(target, page, callback){
		var state = $.data(target, 'datagrid');
		var opts = state.options;
		var index = (page-1)*opts.pageSize;
		var rows = state.data.rows.slice(index, index+opts.pageSize);
		if (rows.length){
			callback.call(this, rows);
			
		} else {
			var param = $.extend({}, opts.queryParams, {
				page: page,
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
				callback.call(opts.view, data.rows);
//				opts.onLoadSuccess.call(target, data);
			}, function(){
				$(target).datagrid('loaded');
				opts.onLoadError.apply(target, arguments);
			});
			if (result == false){
				$(target).datagrid('loaded');
			}
		}
	},
	
	populate: function(target){
		var state = $.data(target, 'datagrid');
		var opts = state.options;
		var dc = state.dc;
		var rowHeight = 25;
		
		if (this.rows.length){
			opts.view.render.call(opts.view, target, dc.body2, false);
			opts.view.render.call(opts.view, target, dc.body1, true);
			dc.body1.add(dc.body2).children('table.datagrid-btable').css({
				paddingTop: this.index*rowHeight,
				paddingBottom: state.data.total*rowHeight - this.rows.length*rowHeight - this.index*rowHeight
			});
			opts.onLoadSuccess.call(target, {
				total: state.data.total,
				rows: this.rows
			});
			
			this.addExpandColumn(target);
		}
	}
});

$.extend($.fn.datagrid.methods, {
	fixDetailRowHeight: function(jq, index){
		return jq.each(function(){
			var opts = $.data(this, 'datagrid').options;
			var dc = $.data(this, 'datagrid').dc;
			var tr1 = opts.finder.getTr(this, index, 'body', 1).next();
			var tr2 = opts.finder.getTr(this, index, 'body', 2).next();
			// fix the detail row height
			if (tr2.is(':visible')){
				tr1.css('height', '');
				tr2.css('height', '');
				var height = Math.max(tr1.height(), tr2.height());
				tr1.css('height', height);
				tr2.css('height', height);
			}
			dc.body2.triggerHandler('scroll');
		});
	},
	getExpander: function(jq, index){	// get row expander object
		var opts = $.data(jq[0], 'datagrid').options;
		return opts.finder.getTr(jq[0], index, 'body', 1).find('span.datagrid-row-expander');
	},
	// get row detail container
	getRowDetail: function(jq, index){
		var opts = $.data(jq[0], 'datagrid').options;
		var tr = opts.finder.getTr(jq[0], index, 'body', 2);
		return tr.next().find('div.datagrid-row-detail');
	},
	expandRow: function(jq, index){
		return jq.each(function(){
			var opts = $(this).datagrid('options');
			var dc = $.data(this, 'datagrid').dc;
			var expander = $(this).datagrid('getExpander', index);
			if (expander.hasClass('datagrid-row-expand')){
				expander.removeClass('datagrid-row-expand').addClass('datagrid-row-collapse');
				var tr1 = opts.finder.getTr(this, index, 'body', 1).next();
				var tr2 = opts.finder.getTr(this, index, 'body', 2).next();
				tr1.show();
				tr2.show();
				$(this).datagrid('fixDetailRowHeight', index);
				if (opts.onExpandRow){
					var row = $(this).datagrid('getRows')[index];
					opts.onExpandRow.call(this, index, row);
				}
			}
		});
	},
	collapseRow: function(jq, index){
		return jq.each(function(){
			var opts = $(this).datagrid('options');
			var dc = $.data(this, 'datagrid').dc;
			var expander = $(this).datagrid('getExpander', index);
			if (expander.hasClass('datagrid-row-collapse')){
				expander.removeClass('datagrid-row-collapse').addClass('datagrid-row-expand');
				var tr1 = opts.finder.getTr(this, index, 'body', 1).next();
				var tr2 = opts.finder.getTr(this, index, 'body', 2).next();
				tr1.hide();
				tr2.hide();
				dc.body2.triggerHandler('scroll');
				if (opts.onCollapseRow){
					var row = $(this).datagrid('getRows')[index];
					opts.onCollapseRow.call(this, index, row);
				}
			}
		});
	}
});

