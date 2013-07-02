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
 * 21、rowContextMenu菜单项的onclick接收4个参数，依次是item, rowIndex, rowData, target 。
 *      item: 当前点击菜单项
 *      rowIndex: 触发右键菜单row的索引号
 *      rowData: 触发右键菜单row的数据项
 *      target: 当前datagrid的引用，非jQuery对象。
 *
 *      eg:
 *          $('#dg').datagrid({
 *              ......,
 *              customAttr: {
 *                  rowContextMenu: {
 *                      isShow: true,
 *                      items: [{
 *                          text: 'item1',
 *                          iconCls: 'icon-exit',
 *                          onclick: function(item, rowIndex, rowData, target){
 *                              ......
 *                          }
 *                      }]
 *                  }
 *              }
 *          });
 *
 * 22、增加deleteRows方法批量删除行。参数row，数组类型。可以是一个rowIndex数组或是一个row数组
 *
 * 23、扩展rowContextMenu onClick事件，接收参数item, rowIndex, rowData, target。 当事件返回true时，覆盖原默认行为
 *      item:       当前点击的菜单项
 *      rowIndex:   触发rowContextMenu的row索引
 *      rowData:    触发rowContextMenu的row数据
 *      target:     当前datagrid的引用，非jQuery对象
 *
 *      eg:
 *          $('#dg').datagrid('getRowContextMenu').menu({
 *              onClick: function(item, rowIndex, rowData, target){
 *                  if(item.text == 'delete'){
 *                      return true //覆盖菜单delete的默认行为,即点击delete菜单项后，无动作。
 *                  }
 *              }
 *          });
 *
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
                    $.fn.datagrid.headerContextMenu.defaultEvents.doShowAll(datagrid);
                }
            },{
                id: menuid+'_restore',
                text: '还原',
                iconCls: 'icon-columns',
                onclick: function(item, field, datagrid){
                    $.fn.datagrid.headerContextMenu.defaultEvents.doRestore(datagrid);
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
                        $.fn.datagrid.headerContextMenu.defaultEvents.doHideColumn(dg, field, item);
                    }else{
                        $.fn.datagrid.headerContextMenu.defaultEvents.doShowColumn(dg, field, item);
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
            menuitems = $.isArray(headerContentMenuOptions.items) ? headerContentMenuOptions.items : [];
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

    function getDefaultRowContextMenuItems(target, customMenuItems){
        var menuItems = customMenuItems || [];
        if(!$.isArray(menuItems)) menuItems = [];

        var menuid = getContextMenuId(target, 'rowContextMenu');
        var defaultMenuItems=[{
            id: menuid + '_add',
            text: '增加',
            iconCls: 'icon-add',
            onclick: function(){}
        },{
            id: menuid + '_edit',
            text: '编辑',
            iconCls: 'icon-edit',
            onclick: function(){}
        },{
            id: menuid + '_delete',
            text: '删除',
            iconCls: 'icon-remove',
            onclick: function(item, rowIndex, rowData, t){
                $.messager.confirm('疑问','您确定要删除已选中的行？', function(r){
                    if(r){
                        $(t).datagrid('deleteRows', $(t).datagrid('getSelections'));
                    }
                })
            }
        },'-',{
            id: menuid + '_reload',
            text: '刷新',
            iconCls: 'icon-reload',
            onclick: function(item, rowIndex, rowData, t){
                $(t).datagrid('load');
            }
        },{
            id: menuid + '_reload_this_page',
            text: '刷新当前页',
            onclick: function(item, rowIndex, rowData, t){
                $(t).datagrid('reload');
            }
        },'-',{
            text: '导出',
            iconCls: 'icon-table-export',
            submenu:[{
                id: menuid + '_export_this_page',
                text: '本页',
                iconCls: 'icon-export-excel',
                onclick: function(){}
            },{
                id: menuid + '_export_all',
                text: '全部',
                iconCls: 'icon-table-excel',
                onclick: function(){}
            }]
        }]

        $.merge(defaultMenuItems, customMenuItems);
        return defaultMenuItems;
    }

    function initRowContextMenu(target){
        var options = $.extend(true, {}, $.fn.datagrid.defaults, $(target).datagrid('options'));
        var rowContentMenuOptions = options.customAttr.rowContextMenu;
        if(!rowContentMenuOptions.isShow) return;

        var menuitems = [];
        if(rowContentMenuOptions.isMerge){
            menuitems = getDefaultRowContextMenuItems(target, rowContentMenuOptions.items);
        }else{
            menuitems = $.isArray(rowContentMenuOptions.items) ? rowContentMenuOptions.items : [];
        }

        var onClickHandlerCache = getMenuItemOnClickHandler(menuitems);
        var onRowContextMenuCallback = options.onRowContextMenu;
        var rowContextMenu = buildContextMenu(target, menuitems, 'rowContextMenu');
        $(target).datagrid({
            onRowContextMenu: function(e, rowIndex, rowData){
                e.preventDefault();
//                $(target).datagrid('selectRow', rowIndex);
                var menuOptions = rowContextMenu.menu('options');
                menuOptions.onClickCallback = menuOptions.onClickCallback || menuOptions.onClick;

                rowContextMenu.menu({
                    onClick: function(item){
                        if(menuOptions.onClickCallback.call(this, item, rowIndex, rowData, target)) return;

                        var name = item.id || item.text;
                        if(onClickHandlerCache[name]){
                            onClickHandlerCache[name].call(this, item, rowIndex, rowData, target);
                        }

                    }
                }).menu('show', {
                    left: e.pageX,
                    top: e.pageY
                });
                onRowContextMenuCallback.call(this, e, rowIndex, rowData);
            }
        });
    }

    function setMasterSlave(target){
        var options = $.extend(true, {}, $.fn.datagrid.defaults, $(target).datagrid('options'));
        if(!$.isArray(options.customAttr.slaveList)) return;
        if(options.customAttr.slaveList.length == 0) return;

        var slaveOptions = {
            slaveList: options.customAttr.slaveList,
            activeSlave: options.customAttr.activeSlave
        };
        var jq = $(target);

        //{id: 'slave1', params: {name: 'slave1'}}
        var commands = [];
        for(var i in slaveOptions.slaveList){
            var cmd = {
                id: slaveOptions.slaveList[i].id,
                params:{}
            };

            var relatedfield = {}, relatedfieldName;
            if(!slaveOptions.slaveList[i].relatedfield){
                relatedfieldName = jq.datagrid('options').idField;
                relatedfield[relatedfieldName]='undefined';
            }else{
                relatedfieldName = slaveOptions.slaveList[i].relatedfield;
                relatedfield[slaveOptions.slaveList[i].relatedfield] = 'undefined';
            }

            $.extend(cmd.params, relatedfield, slaveOptions.slaveList[i].queryParams);
            commands.push(cmd);
        }


        if(slaveOptions.activeSlave == $.fn.datagrid.defaults.customAttr.activeSlave){
            jq.datagrid({
                onDblClickRow: function(rowIndex, rowData){
                    for(var j in commands){
                        commands[j].params[relatedfieldName] = rowData[relatedfieldName];
                        $('#' + commands[j].id).datagrid('load', commands[j].params);
                    }
                }
            });
        }
    }

    function registRowEditingHandler(target){
        var options = $.extend(true, {}, $.fn.datagrid.defaults, $(target).datagrid('options'));
        if(!options.customAttr.rowediting) return;

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
                var offset = tr.height() * 2 + 10;
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
                onBeforeEditCallBack.call(this, index, data);
            },
            onAfterEdit: function(index, data, changes){
                hideEditorButtonsPanel(target);
                onAfterEditCallBack.call(this, index, data, changes);
            },
            onCancelEdit: function(index, data){
                hideEditorButtonsPanel(target);
                onCancelEditCallBack.call(this, index, data);
            }
        });
    }

    function buildTooltip(target){
        var options = $.extend(true, {}, $.fn.datagrid.defaults, $(target).datagrid('options'));
        if(!options.customAttr.tooltip.enable) return;

        var showTooltip = function(target, opts){
            var initOptions = {
                position: options.customAttr.tooltip.position,
                trackMouse: true,
                onHide: function(){
                    $(target).tooltip('destroy');
                },
                onShow: function(){
                    if($.isPlainObject(opts) && opts.css){
                        $(this).tooltip('tip').css(opts.css);
                    }
                }
            };

            $.extend(initOptions, $.isPlainObject(opts) ? opts : {content: opts});

            $(target).tooltip(initOptions).tooltip('show');
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
                var field = $(this).attr('field');
                var value = rowData[field];
                var content = formatter ? formatter(value, field) : value;
                showTooltip(this, content);
            });
        }

        var initTooltip = function(){
            if(options.customAttr.tooltip.target == 'row'){
                options.finder.getTr(target, '', 'allbody').each(function(){
                    var row = $(this);
                    if(row.hasClass('datagrid-row')){
                        bindRow(row, options.customAttr.tooltip.formatter);
                    }
                });
            }else{
                if(options.customAttr.tooltip.fields && $.isArray(options.customAttr.tooltip.fields)){
                    var panel = $(target).datagrid('getPanel');
                    var datagrid_body = $('>div.datagrid-view>div.datagrid-view2>div.datagrid-body', panel);
                    $.each(options.customAttr.tooltip.fields, function(){
                        var field = this;
                        bindCell($('td[field='+field+']', datagrid_body), options.customAttr.tooltip.formatter);
                    });
                }

            }
        }


        var onLoadSuccessCallback = options.onLoadSuccess;
        $(target).datagrid({
           onLoadSuccess: function(data){
               onLoadSuccessCallback.call(this, data);
               initTooltip();
           }
        });

    }

    function initPagination(target){
        var options = $.extend(true, {}, $.fn.datagrid.defaults, $(target).datagrid('options'));
        if(!options.pagination) return;

        var onLoadSuccessCallback = options.onLoadSuccess;
        $(target).datagrid({
            onLoadSuccess: function(data){
                $(target).datagrid('setPagination', options.customAttr.pagination);
                onLoadSuccessCallback.call(this, data);

            }
        });
    }

    $.fn.datagrid.headerContextMenu = {};
    $.fn.datagrid.headerContextMenu.defaultEvents = {
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
        rowediting: false,
        /**
         * target: row|cell ,tooltip 的触发对象，默认row
         */
        tooltip:{
            enable: false,
            target: 'row',
            position: 'bottom',
            fields: undefined,
            formatter: undefined
        }

    };

    $.extend($.fn.datagrid.methods, {
        followCustomHandle: function(jq){
            return jq.each(function(){
                initHeaderContextMenu(this);
                initRowContextMenu(this);
                initPagination(this);
                setMasterSlave(this);
                registRowEditingHandler(this);
                buildTooltip(this);
            });
        },
        getHeaderContextMenu: function(jq){
            return $('#'+getContextMenuId(jq[0], 'headerContextMenu'));
        },
        getRowContextMenu: function(jq){
            return $('#'+getContextMenuId(jq[0], 'rowContextMenu'));
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
        },
        deleteRows: function(jq, rows){
            return jq.each(function(){
                var delRows = undefined;
                if(!$.isArray(rows)){
                    delRows = [rows];
                }else{
                    delRows = rows;
                }

                var target = this;
                $.each(delRows, function(i, row){
                    if($.isPlainObject(row)){
                        var index = $(target).datagrid('getRowIndex', row);
                        $(target).datagrid('deleteRow', index);
                    }else{
                        $(target).datagrid('deleteRow', row);
                    }
                });
            });
        }
    });
})(jQuery);
