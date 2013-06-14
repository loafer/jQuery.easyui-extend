/**
 * Created with IntelliJ IDEA.
 * @author: 爱看书不识字<zjh527@163.com>
 *
 *
 * depend on:
 *  jquery.easyui.menu.extend.js
 *
 *  扩展如下：
 *  1、在column上支持右键菜单
 *  2、column右键菜单项支持自定义
 *  3、column默认右键菜单项包含：显示/隐藏列、全部显示、还原和所有列
 *  4、支持column默认右键菜单项和自定义菜单项合并控制
 *  5、row支持右键菜单
 *  6、row默认右键菜单项增加、编辑、删除、刷新、导出
 *  7、支持row右键菜单自定义
 *  8、支持row默认右键菜单项与自定义项合并
 *  9、支持分页栏属性设置
 *  10、级联操作
 *  11、支持级联操作触发条件设置
 *  12、支持类似Ext.rowediting编辑风格
 *  13、支持row显示tooltip
 *  14、支持row tooltip自定义显示风格
 *  15、增加如下editor:my97、datetimebox、numberspinner、timespinner、combogrid
 *  16、增加方法getHeaderContextMenu
 *  17、增加方法getRowContextMenu
 *  18、增加方法getEditingRow，返回当前正在编辑的row
 *  19、增加方法setPagination，设置分页栏样式
 *  20、headerContextMenu菜单项的onclick接收三个参数，依次是item, field, target。
 *      item:当前点击菜单项。
 *      field: datagrid中触发右键菜单的Column的field属性
 *      target: 当前datagrid的引用,非jQuery对象。
 *
 *      eg:
 *      $('#dg').datagrid({
 *          ....,
 *          customAttr:{
 *              headerContextMenu:{
 *                  isShow: true,
 *                  items:[{
 *                      text: 'add',
 *                      iconCls: 'icon-add',
 *                      onclick: function(item, field, target){
 *                          ......
 *                      }
 *                  }]
 *              }
 *          }
 *      })
 *
 */
(function($){
    function buildContextMenu(target, menuitems, type){
        var menuid = getContextMenuId(target, type);
        var contextmenu = $('#'+menuid);
        if(contextmenu.length==0){
            contextmenu = $('<div>', {id: menuid}).menu().menu('appendItems', menuitems);
        }
        return contextmenu;
    }

    function getContextMenuId(target, surfix){
        return $(target).attr('id')+'_'+surfix;
    }

    function getMenuItemOnClickHandler(menuitems){
        var onclickHandler={};

        $.each(menuitems, function(){
            var item = this;
            if(item.onclick){
                var index = item.id || item.text;
                onclickHandler[index] = item.onclick;
                delete item.onclick;
            }

            if(item.submenu && $.isArray(item.submenu) && item.submenu.length>0){
                $.extend(onclickHandler, getMenuItemOnClickHandler(item.submenu));
            }
        });

        return onclickHandler;
    }

    function getDefaultHeaderContextMenuItems(target, customMenuItems){
        var menuItems = customMenuItems || [];
        if(!$.isArray(menuItems)) menuItems = [];

        var menuid = getContextMenuId(target, 'headerContextMenu');
        var defaultMenuItems = [{
            text: '显示/隐藏列',
            iconCls: 'icon-columns',
            submenu:[{
                id: menuid+'_showAll',
                text: '全部显示',
                iconCls: 'icon-columns',
                onclick: function(item, field, datagrid){
                    $.fn.datagrid.headerContextMenu.defaults.events.doShowAll(datagrid);
                }
            },{
                id: menuid+'_restore',
                text: '还原',
                iconCls: 'icon-columns',
                onclick: function(item, field, datagrid){
                    $.fn.datagrid.headerContextMenu.defaults.events.doRestore(datagrid);
                }
            },
            '-']
        }];

        $.merge(defaultMenuItems, customMenuItems);

        var getFieldFromMenuItemId = function(id){
            return id.substr(id.lastIndexOf('_')+1, id.length);
        }

        var columnFieldsItem = [];
        var columnFields = $(target).datagrid('getColumnFields');
        $.each(columnFields, function(i, field){
            if(!field) return true;
            var columnOption = $(target).datagrid('getColumnOption', field);
            columnOption._hidden=columnOption.hidden;

            columnFieldsItem.push({
                id: menuid+'_'+field,
                text: columnOption.title,
                iconCls: columnOption.hidden?'icon-unchecked':'icon-checked',
                onclick: function(item, fd, dg){
                    var field = getFieldFromMenuItemId(item.id);
                    var hidden = $(dg).datagrid('getColumnOption', field).hidden;
                    if(!hidden){
                        $.fn.datagrid.headerContextMenu.defaults.events.doHideColumn(dg, field, item);
                    }else{
                        $.fn.datagrid.headerContextMenu.defaults.events.doShowColumn(dg, field, item);
                    }
                }
            });
        });

        $.merge(defaultMenuItems[0].submenu, columnFieldsItem);

        return defaultMenuItems;
    }

    function initHeaderContextMenu(target){
        var options = $.extend(true, {}, $.fn.datagrid.defaults, $(target).datagrid('options'));
        var headerContentMenuOptions = options.customAttr.headerContextMenu;
        if(!headerContentMenuOptions.isShow) return;

        var menuitems = [];
        if(headerContentMenuOptions.isMerge){
            menuitems = getDefaultHeaderContextMenuItems(target, headerContentMenuOptions.items);
        }else{
            menuitems = headerContentMenuOptions.items;
        }


        var onClickHandlerCache = getMenuItemOnClickHandler(menuitems);
        var onHeaderContextMenuCallback = options.onHeaderContextMenu;
        var headerContextMenu = buildContextMenu(target, menuitems, 'headerContextMenu');
        $(target).datagrid({
            onHeaderContextMenu: function(e, field){
                e.preventDefault();
                headerContextMenu.menu({
                    onClick: function(item){
                        var name = item.id || item.text;
                        if(onClickHandlerCache[name]){
                            onClickHandlerCache[name].call(this, item, field, target);
                        }
                    }
                }).menu('show',{
                    left: e.pageX,
                    top: e.pageY
                });

                onHeaderContextMenuCallback.call(this, e, field);
            }
        });
    }


    function buildMenu(menuid, menuitems){
        var contextMenu = $(menuid);
        if(contextMenu.length == 0){
            var contextMenu = $('<div>',{id: menuid}).menu();
            appendItems(contextMenu[0], menuitems);
        }

        return contextMenu;
    }

    function appendItems(target, menuitems){
        if(!menuitems && $.isArray(menuitems)) return;
        $(target).menu('appendItems', menuitems);
    }

    function getHeaderContentMenuId(target){
        return $(target).attr('id')+'_headerContextMenu';
    }

    function showRowContextMenu(target){
        var options = $.extend(true, {}, $.fn.datagrid.defaults, $(target).datagrid('options'));
        var rowContentMenuOptions = options.customAttr.rowContextMenu;
        if(!rowContentMenuOptions.isShow) return;

        if(rowContentMenuOptions.isMerge){
            var menuitems = buildRowContextMenuDefaultItems(target, rowContentMenuOptions.items);
        }else{
            var menuitems = rowContentMenuOptions.items;
        }

        var menuid = getRowContentMenuId(target);
        var rowContextMenu = buildMenu(menuid, menuitems);
        $(target).datagrid({
            onRowContextMenu: function(e, rowIndex, rowData){
                e.preventDefault();

                rowContextMenu.menu('show', {
                    left: e.pageX,
                    top: e.pageY
                });
            }
        });
    }

    function getRowContentMenuId(target){
        return $(target).attr('id')+'_rowContextMenu';
    }

    function buildRowContextMenuDefaultItems(target, customMenuItems){
        customMenuItems = customMenuItems || [];
        var menuitems = [
            {text: '增加', iconCls: 'icon-add'},
            {text: '编辑', iconCls: 'icon-edit'},
            {text: '删除', iconCls: 'icon-remove'},
            '-',
            {text: '刷新', iconCls: 'icon-reload'},
            {text: '刷新当前页', iconCls: 'icon-reload3'},
            '-',
            {text: '导出', iconCls: 'icon-table-export', submenu: [
                {text: '本页', iconCls: 'icon-export-excel'},
                {text: '全部', iconCls: 'icon-table-excel'}
            ]}
        ];

        $.merge(menuitems, customMenuItems);
        return menuitems;
    }

    function setMasterSlave(target, opts){
        if(!opts.slaveList && !$.isArray(opts.slaveList)) return;

        var jq = $(target);

        //{id: 'slave1', params: {name: 'slave1'}}
        var commands = [];
        for(i in opts.slaveList){
            var cmd = {
                id: opts.slaveList[i].id,
                params:{}
            };

            var relatedfield = {}, relatedfieldName;
            if(!opts.slaveList[i].relatedfield){
                relatedfieldName = jq.datagrid('options').idField;
                relatedfield[relatedfieldName]='undefined';
            }else{
                relatedfieldName = opts.slaveList[i].relatedfield;
                relatedfield[opts.slaveList[i].relatedfield] = 'undefined';
            }

            $.extend(cmd.params, relatedfield, opts.slaveList[i].queryParams);
            commands.push(cmd);
        }


        if(opts.activeSlave == $.fn.datagrid.defaults.customAttr.activeSlave){
            jq.datagrid({
                onDblClickRow: function(rowIndex, rowData){
                    for(i in commands){
                        commands[i].params[relatedfieldName] = rowData[relatedfieldName];
                        $('#' + commands[i].id).datagrid('load', commands[i].params);
                    }
                }
            });
        }
    }

    function registRowEditingHandler(target){
        var opts = $.extend(true, {}, $.fn.datagrid.defaults, $.data(target, 'datagrid').options);
        if(!opts.customAttr.rowediting) return;

        var getEditorButtonsPanelId = function(target){
            return $(target).attr('id')+'_editor_buttons_panel';
        }

        var buildEditorButtonsPanel = function(target){
            var panelId = getEditorButtonsPanelId(target);
            if($('#'+panelId).length > 0) return;

            var panel = $(target).datagrid('getPanel');
            var datagrid_body = $('>div.datagrid-view>div.datagrid-view2>div.datagrid-body', panel);
            datagrid_body.css('position', 'relative');

            var edtBtnPanel = $('<div>', {id: panelId})
                .addClass('dialog-button')
                .appendTo(datagrid_body)
                .css({
                    'position': 'absolute',
                    'display': 'block',
                    'border-bottom': '1px solid #ddd',
                    'border-left': '1px solid #ddd',
                    'border-right': '1px solid #ddd',
                    'left': parseInt(panel.width()/2)-120,
                    'z-index': 2013,
                    'display': 'none',
                    'padding': '4px 5px'
                });

            $('<a href="javascript:void(0)">确定</a>')
                .css('margin-left','0px')
                .linkbutton({iconCls: 'icon-ok'})
                .click(function(){
                    var editIndex = $(target).datagrid('getRowIndex', $(target).datagrid('getEditingRow'));
                    $(target).datagrid('endEdit', editIndex);
                })
                .appendTo(edtBtnPanel);
            $('<a href="javascript:void(0)">取消</a>')
                .css('margin-left', '6px')
                .linkbutton({iconCls: 'icon-cancel'})
                .click(function(){
                    var editIndex = $(target).datagrid('getRowIndex', $(target).datagrid('getEditingRow'));
                    $(target).datagrid('cancelEdit', editIndex);
                })
                .appendTo(edtBtnPanel);

        }

        var showEditorButtonsPanel = function(target, index){
            var opts = $.data(target, "datagrid").options;
            var tr = opts.finder.getTr(target, index);
            var position = tr.position();

            var fixPosition = function(){
                var offset = tr.width() * 2 + 10;
                var t = position.top + datagrid_body.scrollTop();

                if((position.top+offset) > datagrid_body.height()){
                    return {top: t - offset};
                }else{
                    return {top: t};
                }
            }

            var edtBtnPanelId = '#'+getEditorButtonsPanelId(target);
            var panel = $(target).datagrid('getPanel');
            var datagrid_body = $('>div.datagrid-view>div.datagrid-view2>div.datagrid-body', panel);

            $(edtBtnPanelId).css({
                top: fixPosition().top
            }).show();
        }

        var hideEditorButtonsPanel = function(target){
            var edtBtnPanelId = '#'+getEditorButtonsPanelId(target);
            $(edtBtnPanelId).hide();
        }


        var options = $.data(target, "datagrid").options;

        var onLoadSuccessCallBack = options.onLoadSuccess;
        var onBeforeEditCallBack = options.onBeforeEdit;
        var onAfterEditCallBack = options.onAfterEdit;
        var onCancelEditCallBack = options.onCancelEdit;

        $(target).datagrid({
            onLoadSuccess: function(data){
                onLoadSuccessCallBack.call(this, data);
                buildEditorButtonsPanel(this);
            },
            onBeforeEdit: function(index, data){
                showEditorButtonsPanel(target, index);
                onBeforeEditCallBack.call(this, target, index);
            },
            onAfterEdit: function(index, data){
                hideEditorButtonsPanel(target);
                onAfterEditCallBack.call(this, target);
            },
            onCancelEdit: function(index, data){
                hideEditorButtonsPanel(target);
                onCancelEditCallBack.call(this, index, data);
            }
        });
    }

    function buildTooltip(target){
        var opts = $.extend(true, {}, $.fn.datagrid.defaults, $.data(target, 'datagrid').options);
        if(!opts.customAttr.tooltip.enable) return;

        var showTooltip = function(target, content){
            $(target).tooltip({
                content: content,
                position: opts.customAttr.tooltip.position,
                trackMouse: true,
                onHide: function(){
                    $(target).tooltip('destroy');
                }
            }).tooltip('show');
        }

        var bindRow = function(row, formatter){
            var rowIndex = parseInt(row.attr('datagrid-row-index'));
            var rowData = $(target).datagrid('getRows')[rowIndex];
            var getDefaultContent = function(rowData){
                var result = [];
                //排除没有设置field的column
                var fields = $.grep($.merge($(target).datagrid('getColumnFields',true), $(target).datagrid('getColumnFields')), function(n, i){
                    return $.trim(n).length>0;
                });
                $.each(fields, function(){
                    var field = this;
                    var title = $(target).datagrid('getColumnOption', field).title;
                    result.push(title + ': '+rowData[field]);
                });

                return result.join('<br>');
            }
            var content = formatter ? formatter(null, rowData, rowIndex) : getDefaultContent(rowData);
            row.mouseover(function(){
                showTooltip(this, content);
            });
        }

        var bindCell = function(cell, formatter){
            cell.mouseover(function(){
                var rowIndex = $(this).parent().attr('datagrid-row-index');
                var rowData = $(target).datagrid('getRows')[rowIndex];
                var value = rowData[$(this).attr('field')];
                var content = formatter ? formatter(value, rowData, rowIndex) : value;
                showTooltip(this, content);
            });
        }

        var initTooltip = function(){
            if(opts.customAttr.tooltip.target == 'row'){
                opts.finder.getTr(target, '', 'allbody').each(function(){
                    var row = $(this);
                    if(row.hasClass('datagrid-row')){
                        bindRow(row, opts.customAttr.tooltip.formatter);
                    }
                });
            }else{
                if(opts.customAttr.tooltip.fields && $.isArray(opts.customAttr.tooltip.fields)){
                    var panel = $(target).datagrid('getPanel');
                    var datagrid_body = $('>div.datagrid-view>div.datagrid-view2>div.datagrid-body', panel);
                    $.each(opts.customAttr.tooltip.fields, function(){
                        var field = this;
                        bindCell($('td[field='+field+']', datagrid_body), opts.customAttr.tooltip.formatter);
                    });
                }

            }
        }


        var onLoadSuccessCallback = opts.onLoadSuccess;
        $(target).datagrid({
           onLoadSuccess: function(data){
               onLoadSuccessCallback.call(this, arguments);
               initTooltip();
           }
        });

    }


    $.fn.datagrid.headerContextMenu = {};
    $.fn.datagrid.headerContextMenu.defaults = {};
    $.fn.datagrid.headerContextMenu.defaults.events = {
        doHideColumn: function(target, field, item){
            $(target).datagrid('hideColumn', field);
            var menu = $(target).datagrid('getHeaderContextMenu');
            menu.menu('setIcon',{target: item.target, iconCls: 'icon-unchecked'});
        },
        doShowColumn: function(target, field, item){
            $(target).datagrid('showColumn', field);
            var menu = $(target).datagrid('getHeaderContextMenu');
            menu.menu('setIcon',{target: item.target, iconCls: 'icon-checked'});
        },
        doShowAll: function(target){
            var fields = $(target).datagrid('getColumnFields');
            var menu = $(target).datagrid('getHeaderContextMenu');
            for(i in fields){
                $(target).datagrid('showColumn', fields[i]);
                var columnOption = $(target).datagrid('getColumnOption', fields[i]);
                var item = menu.menu('findItem', columnOption.title);
                menu.menu('setIcon',{target: item.target, iconCls: 'icon-checked'});
            }
        },
        doRestore: function(target){
            var fields = $(target).datagrid('getColumnFields');
            var menu = $(target).datagrid('getHeaderContextMenu');
            for(i in fields){
                var columnOption = $(target).datagrid('getColumnOption', fields[i]);
                var item = menu.menu('findItem', columnOption.title);
                if(!columnOption._hidden){
                    $(target).datagrid('showColumn', fields[i]);
                    menu.menu('setIcon',{target: item.target, iconCls: 'icon-checked'});
                }else{
                    $(target).datagrid('hideColumn', fields[i]);
                    menu.menu('setIcon',{target: item.target, iconCls: 'icon-unchecked'});
                }
            }
        }
    };

    $.extend($.fn.datagrid.defaults.editors, {
        my97:{
            init: function(container, options){
                var input = $('<input type="text" class="Wdate">').appendTo(container);
                options = options || {};
                options = $.extend({}, options, {readOnly: true});
                return input.focus(function(){
                    WdatePicker();
                });
            },
            getValue: function(target){
                return $(target).val();
            },
            setValue: function(target, value){
                $(target).val(value);
            },
            resize: function(target, width){
                var input = $(target);
                if($.boxModel == true){
                    input.width(width - (input.outerWidth() - input.width()));
                }else{
                    input.width(width);
                }
            }
        },
        datetimebox: {
            init: function(container, options){
                var input = $('<input type="text" class="easyui-datetimebox">').appendTo(container);
                options = options || {};
                options = $.extend({}, options, {formatter: function(date){return $.dateFormat(new Date(date), 'yyyy-MM-dd hh:mm')}})
                return input.datetimebox(options);
            },
            getValue: function(target){
                return $(target).datetimebox('getValue');
            },
            setValue: function(target, value){
                $(target).datetimebox('setValue', value);
            },
            resize: function(target, width){
                $(target).datetimebox('resize', width);
            }
        },
        numberspinner: {
            init: function(container, options){
                var input = $('<input type="text">').appendTo(container);
                options = options || {};
                options = $.extend({}, options, {min:0, editable: false});
                return input.numberspinner(options);
            },
            getValue: function(target){
                return $(target).numberspinner('getValue');
            },
            setValue: function(target, value){
                $(target).numberspinner('setValue', value);
            },
            resize: function(target, width){
                $(target).numberspinner('resize', width);
            }
        },
        timespinner: {
            init: function(container, options){
                var input = $('<input type="text">').appendTo(container);
                options = options || {};
                return input.timespinner(options);
            },
            getValue: function(target){
                return $(target).timespinner('getValue');
            },
            setValue: function(target, value){
                $(target).timespinner('setValue', value);
            },
            resize: function(target, width){
                $(target).timespinner('resize', width);
            }
        },
        combogrid: {
            init: function(container, options){
                var input = $('<input type="text">').appendTo(container);
                options = options || {};
                options = $.extend({}, options, {panelWidth: 400, editable: false});
                return input.combogrid(options);
            },
            getValue: function(target){
                return $(target).combogrid('getValue');
            },
            setValue: function(target, value){
                $(target).combogrid('setValue', value);
            },
            resize: function(target, width){
                $(target).combogrid('resize', width);
            }
        }
    });

    $.fn.datagrid.defaults.customAttr={
        /**
         * column右键菜单设置
         *  isShow：是否显示
         *  isMerge: 自定义菜单项与默认菜单项是否合并
         *  items: 自定义菜单项
         */
        headerContextMenu:{
            isShow: false,
            isMerge: true,
            items:[]
        },
        rowContextMenu:{
            isShow: false,
            isMerge: true,
            items:[]
        },
        pagination:{
            showPageList: false,
            showRefresh: true,
            beforePageText: undefined,
            afterPageText: undefined,
            displayMsg: undefined
        },
        /**
         *  slave: 一个数组，数组中的每个元素应该包含如下内容的一个object
         *  id: 一个字符串值，用来表示关联datagrid组件的id
         *  relatedfield: 一个字符串值，用来表示datagrid之间用来关联的字段名，即外键字段名成而非外键值
         *  queryParams: 一个object，查询参数
         *
         *  Code example:
         *  $('#dg').datagrid({
         *      customAttr:{
         *          slave: [
         *              {
         *                  id: 'slave1',
         *                  relatedfield: 'id',
         *                  queryParams: {subject: 'datagrid', name: 'easyui'}
         *              }
         *          ]
         *      }
         *  })
         */
        slaveList: undefined,
        activeSlave: 'dblclickrow',
        rowediting: true,
        tooltip:{
            enable: true,
            target: 'row',
            position: 'bottom',
            fields: undefined,
            formatter: undefined
        }

    };

    $.extend($.fn.datagrid.methods, {
        followCustomHandle: function(jq){
            return jq.each(function(){
                var opts = $.extend(true, {}, $.fn.datagrid.defaults, $(this).datagrid('options'));

                initHeaderContextMenu(this);

                showRowContextMenu(this);

                //pagination
                if($(this).datagrid('options').pagination){
                    $(this).datagrid('setPagination', $(this).datagrid('options').pagination);
                }

                setMasterSlave(this, {slaveList: opts.customAttr.slaveList, activeSlave: opts.customAttr.activeSlave});

                registRowEditingHandler(this);

                buildTooltip(this);

            });
        },
        getHeaderContextMenu: function(jq){
            return $('#'+getHeaderContentMenuId(jq[0]));
        },
        getRowContextMenu: function(jq){
            return $('#'+getRowContentMenuId(jq[0]));
        },
        getEditingRow: function(jq){
            var datagrid = $.data(jq[0], "datagrid");
            var opts = datagrid.options;
            var data = datagrid.data;
            var editingRow = [];
            opts.finder.getTr(jq[0], "", "allbody").each(function(){
                if($(this).hasClass('datagrid-row-editing')){
                    var index = parseInt($(this).attr('datagrid-row-index'));
                    editingRow.push(data.rows[index]);
                }
            });

            return editingRow.length>0?editingRow[0]:null;
        },
        setPagination: function(jq, opts){
            return jq.each(function(){
                $(this).datagrid('getPager').pagination(opts);
            });
        }
    });
})(jQuery);
