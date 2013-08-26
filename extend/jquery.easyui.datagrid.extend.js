/**
 * Created with IntelliJ IDEA.
 * Licensed under the GPL licenses
 * http://www.gnu.org/licenses/gpl.txt
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
 * 24、修复当列字段过长时，加载的数据个数为0时，列字段显示不全问题。
 *
 *
 * 25、新增方法 addEventListener，用于初始化之后动态注册事件，支持一个事件可以注册多个处理方法。
 *      25.1 事件对象属性说明
 *          name:       事件名称
 *          override:   是否覆盖原事件处理方法，值: true|false, 默认:false
 *          handler:    事件处理
 *
 *      25.2 单个事件处理方法注册
 *          $('#dg').datagrid('addEventListener', {
 *              name: 'onClickRow',
 *              handler: function(rowIndex, rowData){}
 *          });
 *
 *      25.3 多个事件处理方法注册
 *          $('#dg').datagrid('addEventListener', [{
 *              name: 'onLoadSuccess',
 *              handler: function(data){}
 *          },{
 *              name: 'onClickRow',
 *              handler: function(rowIndex, rowData){}
 *          }]);
 *
 *      25.4 覆盖默认事件处理方法
 *          $('#dg').datagrid('addEventListener', {
 *              name: 'onClickRow',
 *              override: true,
 *              handler: function(rowIndex, rowData){}
 *          });
 *
 *
 * 26、增加 getAllExpandRowIndex 方法，返回值：数组，用于在detailView视图下获取当前页下所有展开行索引。
 *
 * 27、增加 getExpandRowIndex 方法，返回是number,用于在detailView视图下获取当前页下第一个展开行索引。没有展开行，则返回-1.
 *
 * 28、增加 fixDetailRowWidth 方法，用于detailView视图下处理rowDetail中内容宽度，
 *      此方法主要用于在拖拽列宽度时改变rowDetail中内容宽度
 *
 *      28.1 参数说明，此方法接收一个简单对象
 *          index: row索引号，可以是一个整数或整数数组
 *          handler: 处理函数,此函数接收两个参数index:行索引 , width: header2宽度
 *
 *          eg-1.
 *              $('#dg').datagrid('fixDetailRowWidth',{
 *                  index: 1,
 *                  handler: function(index, width){
 *                      $('#sub_dg').datagrid('resize', width);
 *                  }
 *              });
 *
 *
 *         eg-2. 前提，当前展开1、2、3、4行，现修改展开这几行中嵌套datagrid的宽度
 *              $('#dg').datagrid('fixDetailRowWidth', {
 *                  index: [1,2,3,4],
 *                  handler: function(index, width){
 *                      $('#sub_dg').datagrid('resize', width);
 *                  }
 *              });
 *
 *
 * 29、 增加自定义事件 onConfirmEdit 用于 Ext.rowediting 编辑风格。
 *          a) 在点击确认按钮触发
 *          b) 当此事件返回值为false时终止 endEdit 方法执行
 *          c) 接收一个rowIndex 参数
 *
 *          $('dg').datagrid({
 *              .....
 *              customAttr: {
 *                  rowediting: true,
 *                  onConfirmEdit: function(rowIndex){
 *                      return confirm('提交修改？');
 *                  }
 *              }
 *          });
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

    function getDefaultHeaderContextMenuItems(target){
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
//        ,'-',{
//            id: menuid + '_freezeColumn',
//            text: '冻结此列',
//            iconCls: 'icon-lock',
//            disabled: true,
//            onclick: function(item, field, datagrid){
//                $.fn.datagrid.headerContextMenu.defaultEvents.freezeColumn(datagrid, field, item, true);
//            }
//        },{
//            id: menuid + '_unfreezeColumn',
//            text: '取消冻结',
//            iconCls: 'icon-unlock',
//            disabled: true,
//            onclick: function(item, field, datagrid){
//                $.fn.datagrid.headerContextMenu.defaultEvents.unfreezeColumn(datagrid, field, item);
//            }
//        }


        var getFieldFromMenuItemId = function(id){
            return id.substr(id.lastIndexOf('_')+1, id.length);
        }

        var columnFieldsItem = [];
        var frozenCloumnFields = $(target).datagrid('getColumnFields', true);
        var columnFields = $(target).datagrid('getColumnFields');
//        columnSubMenuHandle(frozenCloumnFields, true);
        columnSubMenuHandle(columnFields, false);

        function columnSubMenuHandle(columnFields, disabled){
            $.each(columnFields, function(i, field){
                if(!field || field == 'ck') return true;
                var columnOption = $(target).datagrid('getColumnOption', field);
                columnOption._hidden=columnOption.hidden;

                columnFieldsItem.push({
                    id: menuid+'_'+field,
                    text: columnOption.title,
                    disabled: disabled,
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
        }

        $.merge(defaultMenuItems[0].submenu, columnFieldsItem);

        return defaultMenuItems;
    }

    function initHeaderContextMenu(target){
        var options = $.extend(true, {}, $.fn.datagrid.defaults, $(target).datagrid('options'));
        var headerContentMenuOptions = options.customAttr.headerContextMenu;
        if(!headerContentMenuOptions.isShow) return;

        if(options.columns[0][0].checkbox){
            options.columns[0][0].field = 'ck';
        }

        var menuitems = getDefaultHeaderContextMenuItems(target);
        if(headerContentMenuOptions.isMerge){
            $.merge(menuitems, headerContentMenuOptions.items);
        }

        if(!headerContentMenuOptions.isMerge &&
                $.isArray(headerContentMenuOptions.items) &&
                    headerContentMenuOptions.items.length > 0){
            menuitems = headerContentMenuOptions.items;
        }


        var onClickHandlerCache = getMenuItemOnClickHandler(menuitems);
        var headerContextMenu = buildContextMenu(target, menuitems, 'headerContextMenu');

        $(target).datagrid('addEventListener',{
            name: 'onHeaderContextMenu',
            handler: function(e, field){
                e.preventDefault();
                headerContextMenu.menu('addEventListener', [{
                    name: 'onClick',
                    override: true,
                    handler: function(item){
                        var name = item.id || item.text;
                        if(onClickHandlerCache[name]){
                            onClickHandlerCache[name].call(this, item, field, target);
                        }
                    }
                },{
                    name: 'onShow',
                    override: true,
                    handler: function(){
//                        switchFreezeAndUnfreezeMenuItem(field, target);
                        headerContentMenuOptions.onShow && headerContentMenuOptions.onShow.call(this, field, target);
                    }
                },{
                    name: 'onHide',
                    override: true,
                    handler: function(){
                        headerContentMenuOptions.onHide && headerContentMenuOptions.onHide.call(this);
                    }
                }]).menu('show',{
                    left: e.pageX,
                    top: e.pageY
                });
            }
        });
    }

    function getDefaultRowContextMenuItems(target){
        var menuid = getContextMenuId(target, 'rowContextMenu');
        var defaultMenuItems=[{
            id: menuid + '_delete',
            text: '删除',
            iconCls: 'icon-remove',
            onclick: function(item, rowIndex, rowData, t){
                $.fn.datagrid.rowContextMenu.defaultEvents.doDelete(item, rowIndex, rowData, t);
            }
        },'-',{
            id: menuid + '_reload',
            text: '刷新',
            iconCls: 'icon-reload',
            onclick: function(item, rowIndex, rowData, t){
                $.fn.datagrid.rowContextMenu.defaultEvents.doReload(item, rowIndex, rowData, t);
            }
        },{
            id: menuid + '_reload_this_page',
            text: '刷新当前页',
            onclick: function(item, rowIndex, rowData, t){
                $.fn.datagrid.rowContextMenu.defaultEvents.doReloadThisPage(item, rowIndex, rowData, t);
            }
        }]

        return defaultMenuItems;
    }

    function initRowContextMenu(target){
        var options = $.extend(true, {}, $.fn.datagrid.defaults, $(target).datagrid('options'));
        var rowContentMenuOptions = options.customAttr.rowContextMenu;
        if(!rowContentMenuOptions.isShow) return;

        var menuitems = getDefaultRowContextMenuItems(target);
        if(rowContentMenuOptions.isMerge){
            $.merge(menuitems, rowContentMenuOptions.items);
        }

        if(!rowContentMenuOptions.isMerge &&
            $.isArray(rowContentMenuOptions.items) &&
                rowContentMenuOptions.items.length>0){
            menuitems = rowContentMenuOptions.items;
        }

        var onClickHandlerCache = getMenuItemOnClickHandler(menuitems);
        var rowContextMenu = buildContextMenu(target, menuitems, 'rowContextMenu');

        $(target).datagrid('addEventListener',{
            name: 'onRowContextMenu',
            handler: function(e, rowIndex, rowData){
                e.preventDefault();
                $(target).datagrid('selectRow', rowIndex);

                rowContextMenu.menu('addEventListener', {
                    name: 'onClick',
                    override: true,
                    handler: function(item){
                        var name = item.id || item.text;
                        if(onClickHandlerCache[name]){
                            onClickHandlerCache[name].call(this, item, rowIndex, rowData, target);
                        }
                    }
                }).menu('show', {
                    left: e.pageX,
                    top: e.pageY
                });
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

            jq.datagrid('addEventListener', {
                name: 'onDblClickRow',
                handler: function(rowIndex, rowData){
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

        var deltaX = 120;
        var buildEditorButtonsPanel = function(target){
            var panelId = getEditorButtonsPanelId(target);
            if($('#'+panelId).length > 0) return;

            var panel = $(target).datagrid('getPanel');
            var state = $.data(target, 'datagrid');
            var datagrid_body = state.dc.body2;
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
                    'left': parseInt(panel.width()/2)-deltaX,
                    'z-index': 2013,
                    'display': 'none',
                    'padding': '4px 5px'
                });

            $('<a href="javascript:void(0)">确定</a>')
                .css('margin-left','0px')
                .linkbutton({iconCls: 'icon-ok'})
                .click(function(){
                    var editIndex = $(target).datagrid('getRowIndex', $(target).datagrid('getEditingRow'));
                    if(!options.customAttr.onConfirmEdit.call(target, editIndex)) return;
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
            var tr = opts.finder.getTr(target, index, "body", 2);
            var position = tr.position();

            var edtBtnPanelId = '#'+getEditorButtonsPanelId(target);
            var state = $.data(target, 'datagrid');
            var datagrid_body = state.dc.body2;

            var fixPosition = function(){
                var trHeight = tr.height(), trWidth = tr.width();
                var top = position.top + datagrid_body.scrollTop(), left = position.left;
                var delta = 11;

                if(trWidth > datagrid_body.width()){
                    left = datagrid_body.width()/2 - deltaX;
                }else{
                    left = trWidth/2 - deltaX;
                }

                if(position.top + (trHeight * 2 + delta) > datagrid_body.height()){
                    top = top - (trHeight  + delta)
                }else{
                    top = top + trHeight;
                }

                return {top: top, left: left};
            }

            $(edtBtnPanelId).css(fixPosition()).show();
        }

        var hideEditorButtonsPanel = function(target){
            var edtBtnPanelId = '#'+getEditorButtonsPanelId(target);
            $(edtBtnPanelId).hide();
        }


        $(target).datagrid('addEventListener', [{
            name: 'onLoadSuccess',
            handler: function(data){
                buildEditorButtonsPanel(this);
            }
        },{
            name: 'onBeforeEdit',
            handler: function(index, data){
                buildEditorButtonsPanel(target);
                showEditorButtonsPanel(target, index);
            }
        },{
            name: 'onAfterEdit',
            handler: function(index, data, changes){
                hideEditorButtonsPanel(target);
            }
        },{
            name: 'onCancelEdit',
            handler: function(index, data){
                hideEditorButtonsPanel(target);
            }
        }]);
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
            var content = formatter ? formatter(rowData, rowIndex) : getDefaultContent(rowData);
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
                    var state = $.data(target, 'datagrid');
                    var datagrid_body = state.dc.body2;
                    $.each(options.customAttr.tooltip.fields, function(){
                        var field = this;
                        bindCell($('td[field='+field+']', datagrid_body), options.customAttr.tooltip.formatter);
                    });
                }

            }
        }


        $(target).datagrid('addEventListener', {
            name: 'onLoadSuccess',
            handler: function(data){
                initTooltip();
            }
        });

    }

    function initPagination(target){
        var options = $.extend(true, {}, $.fn.datagrid.defaults, $(target).datagrid('options'));
        if(!options.pagination) return;

        $(target).datagrid('addEventListener', {
            name: 'onLoadSuccess',
            handler: function(data){
                $(target).datagrid('setPagination', options.customAttr.pagination);
            }
        });
    }

    function fixNoDataBug(target){
        var options = $(target).datagrid('options');

        var fixBug = function(data){
            var panel = $(target).datagrid('getPanel');
            if(data.rows.length == 0){
                var header = $('div.datagrid-view2>div.datagrid-header>div.datagrid-header-inner>table', panel)[0];
                var body = $('>div.datagrid-view>div.datagrid-view2>div.datagrid-body', panel);
                $('<div>').html('&nbsp;').width($(header).width()).appendTo(body);
            }else{
                $('div.datagrid-view2>div.datagrid-body>div', panel).remove();
            }

        }

        $(target).datagrid('addEventListener', [{
            name: 'onLoadSuccess',
            handler: function(data){
                fixBug(data);
            }
        },{
            name: 'onLoadError',
            handler: function(){
                fixBug({rows: []});
            }
        }])
    }

    /**
     * 只对当前数据页有效，重新加载数据后失效（类似freezeRow）
     * 只冻结columns属性中定义的列
     */
    function _freezeColumn1(target, field){
        var options = $(target).datagrid('options');
        var frozenColumnFields = $(target).datagrid('getColumnFields', true);
        var firstColumn = options.columns[0][0];
        if(frozenColumnFields.length == 0 && firstColumn.checkbox){
            moveColumn(target, 'ck', 2, 1);
        }


        setMenuFieldItemState(target, field, true);
        moveColumn(target, field, 2, 1);
    }

    /**
     * 对所有数据页有效，重新加载数据后仍然有效
     */
    function _freezeColumn2(target, field){
        var options = $(target).datagrid('options');
        if(!options.frozenColumns[0]){
            options.frozenColumns=[[]];
        }

        var fieldOption = $(target).datagrid('getColumnOption', field);
        options.frozenColumns[0].push(fieldOption);
        removeColumn(fieldOption);
        $(target).datagrid(options);
        var fielditem = $(target).datagrid('getHeaderContextMenu').menu('findItem', fieldOption.title);
        $(target).datagrid('getHeaderContextMenu').menu('disableItem', fielditem.target);

        function removeColumn(fieldOption){
            for(var i=0; i<options.columns.length; i++){
                for(var j=0; j<options.columns[i].length; j++){
                    if(options.columns[i][j].field == fieldOption.field){
                        options.columns[i].splice(j, 1);
                        return;
                    }
                }
            }
        }
    }

    /**
     * 列移动
     */
    function moveColumn(target, field, from, to){
        var options = $(target).datagrid('options');
        var dc = $.data(target, "datagrid").dc;
        var headerTd = null;

        var headerTd = (from==1 ? dc.header1 : dc.header2).find('>table>tbody>tr.datagrid-header-row>td[field=' + field + ']');
        if(from > to){
            //datagrid-view2 -> datagrid-view1
            (to == 1 ? dc.header1 : dc.header2).find('>table>tbody>tr.datagrid-header-row').append(headerTd);
        }else{
            //datagrid-view1 -> datagrid-view2
            (to == 1 ? dc.header1 : dc.header2).find('>table>tbody>tr.datagrid-header-row').children('td[field]').each(function(){
                if(isBefore(field, $(this).attr('field'))){
                    $(this).before(headerTd);
                    return false;
                }
            });
        }


        var bodyTd = (from == 1 ? dc.body1 : dc.body2).find('>table>tbody>tr>td[field=' + field + ']');
        if(from > to){
            //datagrid-view2 -> datagrid-view1
            $.each(bodyTd, function(i, td){
                options.finder.getTr(target, i, 'body', to).append(td);
            });
        }else{
            //datagrid-view1 -> datagrid-view2
            $.each(bodyTd, function(i, td){
                options.finder.getTr(target, i, 'body', to).children('td[field]').each(function(){
                    if(isBefore(field, $(this).attr('field'))){
                        $(this).before(td);
                        return false;
                    }
                });
            });
        }

        $(target).datagrid('fixColumnSize');


        function isBefore(f1, f2){
            return getFieldIndex(f1) < getFieldIndex(f2);
        }

        function getFieldIndex(field){
            return $.inArray(field, $(target).datagrid('getColumnFields'));
        }
    }

    function setMenuFieldItemState(target, field, disabled){
        var index = getFieldIndex(field);
        var fieldOption = $(target).datagrid('getColumnOption', field);
        $.extend(fieldOption, {index: index});

        var headerContextMenu = $(target).datagrid('getHeaderContextMenu');
        var item = headerContextMenu.menu('findItem', fieldOption.title);
        if(!item) return;

        if(disabled){
            headerContextMenu.menu('disableItem', item.target);
        }else{
            headerContextMenu.menu('enableItem', item.target);
        }

        function getFieldIndex(field){
            return $.inArray(field, $(target).datagrid('getColumnFields'));
        }
    }

    /**
     * 根据'显示/隐藏'子菜单中字段项是否可用来控制，当前列右键菜单中的"冻结此列"和"取消冻结"是否可用
     */
    function switchFreezeAndUnfreezeMenuItem(field, target){
        var headerContextMenu = $(target).datagrid('getHeaderContextMenu');
        var fieldOption = $(target).datagrid('getColumnOption', field);
        var fieldItem = headerContextMenu.menu('findItem', fieldOption.title);

        if(fieldItem){
            if(!fieldItem.disabled){
                enableItem('冻结此列');
                disableItem('取消冻结');
            }else{
                enableItem('取消冻结');
                disableItem('冻结此列');
            }
        }else{
            disableItem('冻结此列');
            disableItem('取消冻结');
        }


        function disableItem(title){
            var item = headerContextMenu.menu('findItem', title);
            if(item){
                headerContextMenu.menu('disableItem', item.target);
            }
        }

        function enableItem(title){
            var item = headerContextMenu.menu('findItem', title);
            if(item){
                headerContextMenu.menu('enableItem', item.target);
            }
        }
    }

    function freezeColumn(target, field, isTemporary){
        if(isTemporary){
            _freezeColumn1(target, field);
        }else{
            _freezeColumn2(target, field);
        }
    }

    function unfreezeColumn(target, field){
        setMenuFieldItemState(target, field, false);
        moveColumn(target, field, 1, 2);
    }


    function addEventListener(target, eventName, handler, override){
        var options = $(target).datagrid('options');
        var defaultActionEvent = options[eventName];
        switch (eventName){
            case 'onLoadSuccess':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(data){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onLoadError':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onBeforeLoad':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(param){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onClickRow':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex, rowData){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onDblClickRow':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex, rowData){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onClickCell':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex, field, value){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onDblClickCell':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex, field, value){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onSortColumn':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(sort, order){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onResizeColumn':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(field, width){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onSelect':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex, rowData){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onUnselect':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex, rowData){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onSelectAll':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rows){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onUnselectAll':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rows){
                        defaultActionEvent.apply(this, arguments);
                        handlerapply(this, arguments);
                    }
                }
                break;
            case 'onCheck':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex,rowData){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onUncheck':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex,rowData){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onCheckAll':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rows){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onUncheckAll':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rows){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onBeforeEdit':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex, rowData){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onAfterEdit':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex, rowData, changes){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onCancelEdit':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex, rowData){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onHeaderContextMenu':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(e, field){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onRowContextMenu':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(e, rowIndex, rowData){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onExpandRow':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(index, row){
                        defaultActionEvent && defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onCollapseRow':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(index, row){
                        defaultActionEvent && defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            default :
                break;
        }
    }

    function getAllExpandRowIndex(target){
        var options = $(target).datagrid('options');
        var index = [];
        options.finder.getTr(target, '', 'allbody', 1).each(function(){
            if($('span.datagrid-row-collapse', this).length>0){
                index.push($(this).attr('datagrid-row-index'));
            }
        });
        return index;
    }


    $.fn.datagrid.headerContextMenu = {};
    $.fn.datagrid.headerContextMenu.defaultEvents = {
        /**
         *  对frozenColumns属性中的列不做隐藏控制
         */
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
                if(item){
                    menu.menu('setIcon',{target: item.target, iconCls: 'icon-checked'});
                }
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
                    item && menu.menu('setIcon',{target: item.target, iconCls: 'icon-checked'});
                }else{
                    $(target).datagrid('hideColumn', fields[i]);
                    item && menu.menu('setIcon',{target: item.target, iconCls: 'icon-unchecked'});
                }
            }
        }

    };

    $.fn.datagrid.rowContextMenu = {};
    $.fn.datagrid.rowContextMenu.defaultEvents = {
        doAdd: function(item, rowIndex, rowData, target){
//            console.log('===>doAdd');
        },
        doEdit: function(item, rowIndex, rowData, target){
//            console.log('===>doEdit');
        },
        doDelete: function(item, rowIndex, rowData, target){
            $.messager.confirm('疑问','您确定要删除已选中的行？', function(r){
                if(r){
                    $(target).datagrid('deleteRows', $(target).datagrid('getSelections'));
                }
            })
        },
        doReload: function(item, rowIndex, rowData, target){
            $(target).datagrid('load');
        },
        doReloadThisPage: function(item, rowIndex, rowData, target){
            $(target).datagrid('reload');
        },
        doExportThisPage: function(item, rowIndex, rowData, target){
//            console.log('===>doExportThisPage');
        },
        doExprotAll: function(item, rowIndex, rowData, target){
//            console.log('===>doExprotAll');
        }
    }

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
            items:[],
            onShow: function(field, target){},
            onHide: function(){}
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
        },
        onConfirmEdit: function(rowIndex){return true;}
    };

    $.extend($.fn.datagrid.methods, {
        followCustomHandle: function(jq){
            return jq.each(function(){
                fixNoDataBug(this);
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
            var editingRows = jq.datagrid('getEditingRows');
            return editingRows.length ? editingRows[0] : null;
        },
        getEditingRows: function(jq){
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

            return editingRow;
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
        },
        freezeColumn: function(jq, field){
            return jq.each(function(){
                freezeColumn(this, field, true);
            });
        },
        unfreezColumn: function(jq, field){
            return jq.each(function(){
                unfreezeColumn(this, field);
            });
        },
        addEventListener: function(jq, param){
            return jq.each(function(){
                var eventList = $.isArray(param) ? param : [param];
                var target = this;
                $.each(eventList, function(i, event){
                    addEventListener(target, event.name, event.handler|| function(){}, event.override);
                });
            });
        },
        /**
         * 用于detail View视图下，修改detailRow的宽度
         * @param jq
         * @param options 接收两个参数
         *          index: row索引
         *          handler: function(index, width) 可以在此方法中操作需要修改宽度的组件
         *
         * @returns {*}
         */
        fixDetailRowWidth: function(jq, options){
            return jq.each(function(){
                var state = $.data(this, 'datagrid');
                var table = state.dc.header2.children();
                options.handler && options.handler.call(this, options.index, table.width());
            });
        },
        /**
         * 用于DetailView视图，获取所有展开行的索引
         * @param jq
         * @returns {*}
         */
        getAllExpandRowIndex: function(jq){
            return getAllExpandRowIndex(jq[0]);
        },
        /**
         * 用于DetailView视图，获取第一个展开行索引
         * @param jq
         * @returns {*}
         */
        getExpandRowIndex: function(jq){
            var indexArr = jq.datagrid('getAllExpandRowIndex');
            return indexArr.length > 0 ? indexArr[0] : -1;
        }
    });
})(jQuery);
