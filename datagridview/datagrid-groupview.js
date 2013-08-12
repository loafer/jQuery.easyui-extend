var groupview = $.extend({}, $.fn.datagrid.defaults.view, {
	render: function(target, container, frozen){
		var state = $.data(target, 'datagrid');
		var opts = state.options;
		var rows = state.data.rows;
		var fields = $(target).datagrid('getColumnFields', frozen);
		
		var table = [];
		var index = 0;
		var groups = this.groups;
		for(var i=0; i<groups.length; i++){
			var group = groups[i];
			
			table.push('<div class="datagrid-group" group-index=' + i + ' style="height:25px;overflow:hidden;border-bottom:1px solid #ccc;">');
			table.push('<table cellspacing="0" cellpadding="0" border="0" style="height:100%"><tbody>');
			table.push('<tr>');
			table.push('<td style="border:0;">');
			if (!frozen){
				table.push('<span>');
				table.push(opts.groupFormatter.call(target, group.fvalue, group.rows));
				table.push('</span>');
			}
			table.push('</td>');
			table.push('</tr>');
			table.push('</tbody></table>');
			table.push('</div>');
			
			table.push('<table class="datagrid-btable" cellspacing="0" cellpadding="0" border="0"><tbody>');
			for(var j=0; j<group.rows.length; j++) {
				var css = opts.rowStyler ? opts.rowStyler.call(target, index, group.rows[j]) : '';
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
//				var cls = (index % 2 && opts.striped) ? 'class="datagrid-row datagrid-row-alt"' : 'class="datagrid-row"';
//				var styleValue = opts.rowStyler ? opts.rowStyler.call(target, index, group.rows[j]) : '';
//				var style = styleValue ? 'style="' + styleValue + '"' : '';
				var rowId = state.rowIdPrefix + '-' + (frozen?1:2) + '-' + index;
				table.push('<tr id="' + rowId + '" datagrid-row-index="' + index + '" ' + cls + ' ' + style + '>');
				table.push(this.renderRow.call(this, target, fields, frozen, index, group.rows[j]));
				table.push('</tr>');
				index++;
			}
			table.push('</tbody></table>');
		}
		
		$(container).html(table.join(''));
	},
	
	onAfterRender: function(target){
		var opts = $.data(target, 'datagrid').options;
		var dc = $.data(target, 'datagrid').dc;
		var view = dc.view;
		var view1 = dc.view1;
		var view2 = dc.view2;
		
		$.fn.datagrid.defaults.view.onAfterRender.call(this, target);
		
		if (opts.rownumbers || opts.frozenColumns.length){
			var group = view1.find('div.datagrid-group');
		} else {
			var group = view2.find('div.datagrid-group');
		}
		$('<td style="border:0;text-align:center;width:25px"><span class="datagrid-row-expander datagrid-row-collapse" style="display:inline-block;width:16px;height:16px;cursor:pointer">&nbsp;</span></td>').insertBefore(group.find('td'));
		
		view.find('div.datagrid-group').each(function(){
			var groupIndex = $(this).attr('group-index');
			$(this).find('span.datagrid-row-expander').bind('click', {groupIndex:groupIndex}, function(e){
				if ($(this).hasClass('datagrid-row-collapse')){
					$(target).datagrid('collapseGroup', e.data.groupIndex);
				} else {
					$(target).datagrid('expandGroup', e.data.groupIndex);
				}
			});
		});
	},
	
	onBeforeRender: function(target, rows){
		var opts = $.data(target, 'datagrid').options;
		var groups = [];
		for(var i=0; i<rows.length; i++){
			var row = rows[i];
			var group = getGroup(row[opts.groupField]);
			if (!group){
				group = {
					fvalue: row[opts.groupField],
					rows: [row],
					startRow: i
				};
				groups.push(group);
			} else {
				group.rows.push(row);
			}
		}
		
		function getGroup(fvalue){
			for(var i=0; i<groups.length; i++){
				var group = groups[i];
				if (group.fvalue == fvalue){
					return group;
				}
			}
			return null;
		}
		
		this.groups = groups;
		
		var newRows = [];
		for(var i=0; i<groups.length; i++){
			var group = groups[i];
			for(var j=0; j<group.rows.length; j++){
				newRows.push(group.rows[j]);
			}
		}
		$.data(target, 'datagrid').data.rows = newRows;
	}
});

$.extend($.fn.datagrid.methods, {
    expandGroup:function(jq, groupIndex){
        return jq.each(function(){
            var view = $.data(this, 'datagrid').dc.view;
            if (groupIndex!=undefined){
                var group = view.find('div.datagrid-group[group-index="'+groupIndex+'"]');
            } else {
                var group = view.find('div.datagrid-group');
            }
            var expander = group.find('span.datagrid-row-expander');
            if (expander.hasClass('datagrid-row-expand')){
                expander.removeClass('datagrid-row-expand').addClass('datagrid-row-collapse');
                group.next('table').show();
            }
            $(this).datagrid('fixRowHeight');
        });
    },
    collapseGroup:function(jq, groupIndex){
        return jq.each(function(){
            var view = $.data(this, 'datagrid').dc.view;
            if (groupIndex!=undefined){
                var group = view.find('div.datagrid-group[group-index="'+groupIndex+'"]');
            } else {
                var group = view.find('div.datagrid-group');
            }
            var expander = group.find('span.datagrid-row-expander');
            if (expander.hasClass('datagrid-row-collapse')){
                expander.removeClass('datagrid-row-collapse').addClass('datagrid-row-expand');
                group.next('table').hide();
            }
            $(this).datagrid('fixRowHeight');
        });
    }
});

