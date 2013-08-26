/**
 * Created with IntelliJ IDEA.
 * Licensed under the GPL licenses
 * http://www.gnu.org/licenses/gpl.txt
 * @author: 爱看书不识字<zjh527@163.com>
 *
 * depend on:
 *  jquery.easyui.menu.extend.js
 *
 *
 * 扩展说明：
 *      1、增强简单JSON格式数据加载。
 *          1.1 属性说明：
 *              iconField:      节点图标字段
 *              parentField:    父节点字段，无此属性设置，则增强功能不会生效。
 *
 *
 *          1.2 当符合以下条件时，节点被视为树的根节点
 *              a) idField和parentField属性指向的字段对应值相等。
 *              b) 数据中不含有parentField属性指定的字段。
 *              c) parentField属性指定的字段值为0
 *
 *          1.3 加载时iconField默认查找icon
 *
 *          1.4 示例
 *              $('#tt').treegrid({
 *                  url: '../treegrid/treegrid_data2.json',
 *                  idField: 'id',
 *                  treeField: 'name',
 *                  columns: [[
 *                      {field: 'name', title: 'Name', width: 220},
 *                      {field: 'size', title: 'Size', width: 100},
 *                      {field: 'date', title: 'Date', width: 150}
 *                  ]],
 *                  customAttr: {
 *                      parentField: 'pid',
 *                      iconField: 'icon'
 *                  }
 *              }).treegrid('followCustomHandle');
 *
 *
 *
 *      2、右键菜单
 *          2.1 菜单显示控制属性：
 *              isShow:     是否显示右键菜单,默认值: false
 *              items:      自定义菜单项内容，支持'-'定义菜单项分割符
 *              isMerge:    是否将items中自定义菜单项与默认右键菜单项合并，默认值:true
 *
 *              eg.
 *                  $('#tt').treegrid({
 *                      url: '../treegrid/treegrid_data1.json',
 *                      idField: 'id',
 *                      treeField: 'name',
 *                      columns: [[
 *                          {field: 'name', title: 'Name', width: 220},
 *                          {field: 'size', title: 'Size', width: 100},
 *                          {field: 'date', title: 'Date', width: 150}
 *                      ]],
 *                      customAttr: {
 *                          contextMenu: {
 *                              isShow: true
 *                          }
 *                      }
 *                  }).treegrid('followCustomHandle');
 *
 *
 *          2.2 自定义菜单项
 *              $('#tt').treegrid({
 *                  url: '../treegrid/treegrid_data1.json',
 *                  idField: 'id',
 *                  treeField: 'name',
 *                  columns: [[
 *                      {field: 'name', title: 'Name', width: 220},
 *                      {field: 'size', title: 'Size', width: 100},
 *                      {field: 'date', title: 'Date', width: 150}
 *                  ]],
 *                  customAttr: {
 *                      contextMenu: {
 *                          isShow: true,
 *                          items: {
 *                              text: 'others',
 *                              submenu: [{
 *                                  text: 'item1',
 *                                  iconCls: 'icon-add',
 *                                  onclick: function(item, row, target){}
 *                              },{
 *                                  text: 'item2'
 *                              }]
 *                          }
 *                      }
 *                  }
 *              }).treegrid('followCustomHandle');
 *
 *
 *         2.3 菜单项onclick事件参数说明:
 *              item:       当前点击的菜单项
 *              row:        触发右键菜单的treegrid行数据
 *              target:     一个指向treegrid的引用，非jquery对象
 *
 *              示例，请参考2.2
 *
 *
 *         2.4 默认支持行删除、刷新操作。
 *
 *
 *      3、节点收缩、展开控制
 *          3.1 点击节点展开、收缩控制
 *              控制属性：expandOnNodeClick  默认值：false
 *
 *              $('#tt').treegrid({
 *                  url: '../treegrid/treegrid_data1.json',
 *                  idField: 'id',
 *                  treeField: 'name',
 *                  columns: [[
 *                      {field: 'name', title: 'Name', width: 220},
 *                      {field: 'size', title: 'Size', width: 100},
 *                      {field: 'date', title: 'Date', width: 150}
 *                  ]],
 *                  customAttr: {
 *                      expandOnNodeClick: true
 *                  }
 *              }).treegrid('followCustomHandle');
 *
 *
 *         3.2 双击节点展开、收缩控制
 *              控制属性：expandOnDblClick，  默认值：false
 *
 *              $('#tt').treegrid({
 *                  url: '../treegrid/treegrid_data1.json',
 *                  idField: 'id',
 *                  treeField: 'name',
 *                  columns: [[
 *                      {field: 'name', title: 'Name', width: 220},
 *                      {field: 'size', title: 'Size', width: 100},
 *                      {field: 'date', title: 'Date', width: 150}
 *                  ]],
 *                  customAttr: {
 *                      expandOnDblClick: true
 *                  }
 *              }).treegrid('followCustomHandle');
 *
 *
 *         3.3 当expandOnNodeClick、 expandOnDblClick同时为true时，expandOnNodeClick起作用。
 *
 *
 *      4、支持Ext.grid的rowEditing风格 ,默认关闭。 控制属性rowediting，默认值false
 *          eg.
 *              $('#tt').treegrid({
 *                  url: '../treegrid/treegrid_data1.json',
 *                  idField: 'id',
 *                  treeField: 'name',
 *                  columns: [[
 *                      {field: 'name', title: 'Name', width: 220, editor: 'text'},
 *                      {field: 'size', title: 'Size', width: 100, editor: 'text'},
 *                      {field: 'date', title: 'Date', width: 150, editor: 'my97'}
 *                  ]],
 *                  customAttr: {
 *                      rowediting: true
 *                  }
 *              }).treegrid('followCustomHandle');
 *
 *
 *      5、增加getEditingRow方法，返回当前正在编辑的行数据（row data）
 *
 *
 *      6、执行followCustomHandle，扩展属性才能生效。
 *
 *
 *      7、支持tooltip显示
 *          7.1 控制属性
 *              tooltip: {
 *                  enable：         tooltip显示开关，true|false
 *                  target：         tooltip触发对象，
 *                                   值：row或cell。row整行触发，cell只在指定的field对应的cell中触发。
 *                                   默认值：row
 *                  position：       tooltip显示位置
 *                  fields：         定义触发显示tooltip的列
 *                  formatter：      定义tooltip内容显示风格，方法接收参数受target属性影响。
 *                                   a) 当target:'row'时：
 *                                          formatter: function(nodeid, node){}
 *
 *                                   b) 当target:'cell'时：
 *                                          formatter: function(value, field, nodeid, node){}
 *
 *                                   c) 方法返回值String或Object
 *                                      i) 当返回String时, 其值直接作为tooltip内容显示
 *                                     ii) 当返回Object时, Object包含如下属性:
 *                                          content: tooltip显示内容
 *                                          css: tooltip显示样式，此属性值为一个Object
 *              }
 *
 *
 *          7.2 row触发设置
 *              $('#tt').treegrid({
 *                  url: '../treegrid/treegrid_data1.json',
 *                  idField: 'id',
 *                  treeField: 'name',
 *                  columns:[[
 *                      {field: 'name', title: 'Name', width: 220},
 *                      {field: 'size', title: 'Size', width: 100},
 *                      {field: 'date', title: 'Date', width: 150}
 *                  ]],
 *                  customAttr: {
 *                      tooltip: {
 *                          enable: true
 *                      }
 *                  }
 *              }).treegrid('followCustomHandle');
 *
 *
 *          7.3 row触发设置，自定义显示风格
 *              $('#tt').treegrid({
 *                  url: '../treegrid/treegrid_data1.json',
 *                  idField: 'id',
 *                  treeField: 'name',
 *                  columns: [[
 *                      {field: 'name', title: 'Name', width: 220},
 *                      {field: 'size', title: 'Size', width: 100},
 *                      {field: 'date', title: 'Date', width: 150}
 *                  ]],
 *                  customAttr: {
 *                      tooltip: {
 *                          enable: true,
 *                          formatter: function(nodeid, node){
 *                              return {
 *                                  content: $.param(node),
 *                                  css: {
 *                                      backgroundColor: '#FFFF88',
 *                                      borderColor: '#df8505'
 *                                  }
 *                              }
 *                          }
 *                      }
 *                  }
 *              }).treegrid('followCustomHandle');
 *
 *
 *          7.4 cell触发设置
 *              $('#tt').treegrid({
 *                  url: '../treegrid/treegrid_data1.json',
 *                  idField: 'id',
 *                  treeField: 'name',
 *                  columns: [[
 *                      {field: 'name', title: 'Name', width: 220},
 *                      {field: 'size', title: 'Size', width: 100},
 *                      {field: 'date', title: 'Date', width: 150}
 *                  ]],
 *                  customAttr: {
 *                      tooltip: {
 *                          enable: true,
 *                          target: 'cell'
 *                      }
 *                  }
 *              }).treegrid('followCustomHandle');
 *
 *
 *          7.5  cell触发设置，自定义显示风格
 *              $('#tt').treegrid({
 *                  url: '../treegrid/treegrid_data1.json',
 *                  idField: 'id',
 *                  treeField: 'name',
 *                  columns: [[
 *                      {field: 'name', title: 'Name', width: 220},
 *                      {field: 'size', title: 'Size', width: 100},
 *                      {field: 'date', title: 'Date', width: 150}
 *                  ]],
 *                  customAttr: {
 *                      tooltip: {
 *                          enable: true,
 *                          target: 'cell',
 *                          fields: ['name', 'date'],
 *                          formatter: function(value, field, nodeid, node){
 *                              return {
 *                                  content: value,
 *                                  css: {
 *                                      backgroundColor: '#FFFF88',
 *                                      borderColor: '#df8505'
 *                                  }
 *                              }
 *                          }
 *                      }
 *                  }
 *              }).treegrid('followCustomHandle');
 *
 *
 *      8、支持列头显示ContextMenu
 *          8.1 控制属性
 *              headerContextMenu: {
 *                  isShow:     右键菜单显示控制开关，值:true|false，默认:false
 *                  isMerge:    自定义菜单项与默认菜单项合并控制开关，值:true|false，默认:true
 *                  items:      自定义菜单项内容，类型:数组,支持'-'定义菜单项分割符
 *              }
 *
 *
 *          8.2 默认菜单项支持列的显示和隐藏（被控制的列必须是在columns属性中定义的），
 *              treeField属性指定的列不支持此操作。
 *
 *
 *          8.3 显示默认菜单项
 *              $('#tt').treegrid({
 *                  url: '../treegrid/treegrid_data1.json',
 *                  idField: 'id',
 *                  treeField: 'name',
 *                  columns: [[
 *                      {field: 'name', title: 'Name', width: 220},
 *                      {field: 'size', title: 'Size', width: 100},
 *                      {field: 'date', title: 'Date', width: 150}
 *                  ]],
 *                  customAttr: {
 *                      headerContextMenu: {
 *                          isShow: true
 *                      }
 *                  }
 *              }).treegrid('followCustomHandle');
 *
 *         8.4 自定义右键菜单项
 *              $('#tt').treegrid({
 *                  url: '../treegrid/treegrid_data1.json',
 *                  idField: 'id',
 *                  treeField: 'name',
 *                  columns: [[
 *                      {field: 'name', title: 'Name', width: 220},
 *                      {field: 'size', title: 'Size', width: 100},
 *                      {field: 'date', title: 'Date', width: 150}
 *                  ]],
 *                  customAttr: {
 *                      headerContextMenu: {
 *                          isShow: true,
 *                          items: [{
 *                              text: 'item1',
 *                              onclick: function(item, field, target){}
 *                          }]
 *                      }
 *                  }
 *              }).treegrid('followCustomHandle');
 *
 *        8.5 菜单项onclick事件参数说明
 *              item:       当前点击的菜单项
 *              field:      触发右键菜单的列字段
 *              target:     一个指向当前treegrid的引用，非jquery对象
 *
 *
 *
 *  9、新增方法 addEventListener ,用于初始化之后动态注册事件，支持一个事件可以注册多个处理方法。
 *      9.1 事件对象属性说明
 *          name:       事件名称
 *          override:   是否覆盖默认事件处理行为
 *          handler:    定义事件处理行为
 *
 *      9.2 单事件处理方法注册
 *          $('#tt').treegrid('addEventListener', {
 *              name: 'onClickRow',
 *              handler: function(row){}
 *          });
 *
 *      9.3 多事件处理方法注册
 *          $('#tt').treegrid('addEventListener', [{
 *              name: 'onClickRow',
 *              handler: function(row){}
 *          },{
 *              name: 'onExpand',
 *              handler: function(row){}
 *          }]);
 *
 *      9.4 覆盖事件默认行为
 *          $('#tt').treegrid('addEventListener', {
 *              name: 'onClickRow',
 *              override: true,
 *              handler: function(row){}
 *          });
 *
 *
 *  10、增加自定义事件 onConfirmEdit， 用于 Ext.rowediting 编辑风格。
 *      a) 在点击确认按钮触发
 *      b) 当此事件返回值为false时终止 endEdit 方法执行
 *      c) 接收一个 node 参数，(当前编辑行数据)
 *
 *      $('dg').treegrid({
 *          ....,
 *          customAttr: {
 *              rowediting: true,
 *              onConfirmEdit: function(row){
 *                  //此处添加你的逻辑，例如确定前的检查
 *              }
 *          }
 *      })
 *
 *
 */
(function($){
    function getContextMenuId(target, surfix){
        return $(target).attr('id')+'_'+surfix;
    }

    function buildContextMenu(target, menuitems, type){
        var menuid = getContextMenuId(target, type);
        var contextmenu = $('#'+menuid);
        if(contextmenu.length==0){
            contextmenu = $('<div>', {id: menuid}).menu();
            contextmenu.menu('appendItems', menuitems);
        }
        return contextmenu;
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


    function getDefaultContextMenuItems(target){
        var menuid = getContextMenuId(target, 'rowContextMenu');
        return [
            {
                id: menuid+'_delete',
                text: '删除',
                iconCls: 'icon-remove',
                onclick: $.fn.treegrid.headerContextMenu.defaultEvents.doRemove
            },
            '-',
            {
                id: menuid+'_reload',
                text: '刷新',
                iconCls: 'icon-reload',
                onclick: $.fn.treegrid.headerContextMenu.defaultEvents.doReload
            }
        ];
    }

    function initContextMenu(target){
        var options = $.extend(true, {}, $.fn.treegrid.defaults, $(target).treegrid('options'));
        var menuOpts = options.customAttr.contextMenu;
        if(!menuOpts.isShow) return;

        var menuitems = getDefaultContextMenuItems(target);
        if(menuOpts.isMerge && $.isArray(menuOpts.items) && menuOpts.items.length>0){
            $.merge(menuitems, menuOpts.items);
        }

        if(!menuOpts.isMerge && $.isArray(menuOpts.items) && menuOpts.items.length>0){
            menuitems = menuOpts.items;
        }

        var onClickHandlerCache = getMenuItemOnClickHandler(menuitems);
        var contextmenu = buildContextMenu(target, menuitems, 'rowContextMenu');

        $(target).treegrid('addEventListener', {
            name: 'onContextMenu',
            handler: function(e, row){
                e.preventDefault();
                $(target).treegrid('select', row[options.idField]);

                var menuOptions = contextmenu.menu('options');
                menuOptions.onClickCallback = menuOptions.onClickCallback || menuOptions.onClick;

                contextmenu.menu('addEventListener', {
                    name: 'onClick',
                    override: true,
                    handler: function(item){
                        var name = item.id || item.text;
                        if(onClickHandlerCache[name]){
                            onClickHandlerCache[name].call(this, item, row, target);
                        }
                    }
                }).menu('show', {
                    left: e.pageX,
                    top: e.pageY
                });
            }
        });
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


        var getFieldFromMenuItemId = function(id){
            return id.substr(id.lastIndexOf('_')+1, id.length);
        }

        var columnFieldsItem = [];
        var columnFields = $(target).treegrid('getColumnFields');
        var treeField = $(target).treegrid('options').treeField;
        $.each(columnFields, function(i, field){
            if(!field) return true;

            var disabled = field == treeField ? true : false;
            var columnOption = $(target).treegrid('getColumnOption', field);
            columnOption._hidden=columnOption.hidden;

            columnFieldsItem.push({
                id: menuid+'_'+field,
                text: columnOption.title,
                iconCls: columnOption.hidden?'icon-unchecked':'icon-checked',
                disabled: disabled,
                onclick: function(item, fd, dg){
                    var field = getFieldFromMenuItemId(item.id);
                    var hidden = $(dg).treegrid('getColumnOption', field).hidden;
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
        var options = $.extend(true, {}, $.fn.treegrid.defaults, $(target).treegrid('options'));
        var headerContentMenuOptions = options.customAttr.headerContextMenu;
        if(!headerContentMenuOptions.isShow) return;

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

        $(target).treegrid('addEventListener', {
            name: 'onHeaderContextMenu',
            handler: function(e, field){
                e.preventDefault();
                headerContextMenu.menu('addEventListener', {
                    name: 'onClick',
                    override: true,
                    handler: function(item){
                        var name = item.id || item.text;
                        if(onClickHandlerCache[name]){
                            onClickHandlerCache[name].call(this, item, field, target);
                        }
                    }
                }).menu('show', {
                    left: e.pageX,
                    top: e.pageY
                });
            }
        });
    }

    function expandHandle(target){
        var options = $.extend(true, {}, $.fn.treegrid.defaults, $(target).treegrid('options'));
        if(!options.customAttr.expandOnNodeClick && !options.customAttr.expandOnDblClick) return;


        var treeField = options.treeField;
        var idField = options.idField;
        if(options.customAttr.expandOnNodeClick){
            $(target).treegrid('addEventListener', {
                name: 'onClickCell',
                handler: function(field, row){
                    if(treeField == field){
                        $(target).treegrid('toggle', row[idField]);
                    }
                }
            });

            return;
        }

        if(options.customAttr.expandOnDblClick){
            $(target).treegrid('addEventListener', {
                name: 'onDblClickCell',
                handler: function(field, row){
                    if(treeField == field){
                        $(target).treegrid('toggle', row[idField]);
                    }
                }
            });
        }
    }

    function registRowEditingHandler(target){
        var options = $.extend(true, {}, $.fn.treegrid.defaults, $(target).treegrid('options'));
        if(!options.customAttr.rowediting) return;

        var getEditorButtonsPanelId = function(target){
            return $(target).attr('id')+'_editor_buttons_panel';
        }

        var deltaX = 120;
        var buildEditorButtonsPanel = function(target){
            var panelId = getEditorButtonsPanelId(target);
            if($('#'+panelId).length > 0) return;

            var panel = $(target).treegrid('getPanel');
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
                    'left': parseInt(panel.width()/2)-deltaX,
                    'z-index': 2013,
                    'display': 'none',
                    'padding': '4px 5px'
                });


            $('<a href="javascript:void(0)">确定</a>')
                .css('margin-left','0px')
                .linkbutton({iconCls: 'icon-ok'})
                .click(function(){
                    var idField = options.idField;
                    var editingRow = $(target).treegrid('getEditingRow');
                    if(!options.customAttr.onConfirmEdit.call(target, editingRow)) return;
                    $(target).treegrid('endEdit', editingRow[idField]);
                })
                .appendTo(edtBtnPanel);

            $('<a href="javascript:void(0)">取消</a>')
                .css('margin-left', '6px')
                .linkbutton({iconCls: 'icon-cancel'})
                .click(function(){
                    var idField = options.idField;
                    var editingRow = $(target).treegrid('getEditingRow');
                    $(target).treegrid('cancelEdit', editingRow[idField]);
                })
                .appendTo(edtBtnPanel);
        }

        var showEditorButtonsPanel = function(target, row){
            var idField = options.idField;
            var tr = options.finder.getTr(target, row[idField], "body", 2);
            var position = tr.position();

            var edtBtnPanelId = '#'+getEditorButtonsPanelId(target);
            var panel = $(target).treegrid('getPanel');
            var datagrid_body = $('>div.datagrid-view>div.datagrid-view2>div.datagrid-body', panel);

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
                    top = top - (trHeight + delta)
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

        $(target).treegrid('addEventListener', [{
            name: 'onLoadSuccess',
            handler: function(row, data){
                buildEditorButtonsPanel(this);
            }
        },{
            name: 'onBeforeEdit',
            handler: function(row){
                showEditorButtonsPanel(target, row);
            }
        },{
            name: 'onAfterEdit',
            handler: function(row, changes){
                hideEditorButtonsPanel(target);
            }
        },{
            name: 'onCancelEdit',
            handler: function(row){
                hideEditorButtonsPanel(target);
            }
        }]);

    }


    function buildTooltip(target){
        var options = $.extend(true, {}, $.fn.treegrid.defaults, $(target).treegrid('options'));
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


        var bindRow = function(tr, formatter){
            var nodeid = $(tr).attr('node-id');
            var node = $(target).treegrid('find', nodeid);
            var getDefaultContent = function(node){
                var result = [];
                //排除没有设置field的column
                var fields = $.grep(
                    $.merge($(target).treegrid('getColumnFields',true),
                    $(target).treegrid('getColumnFields')),
                    function(n, i){
                        return $.trim(n).length>0;
                });

                $.each(fields, function(){
                    var field = this;
                    var title = $(target).treegrid('getColumnOption', field).title;
                    result.push(title + ': ' + node[field]);
                });

                return result.join('<br>');
            }
            var content = formatter ? formatter(nodeid, node) : getDefaultContent(node);
            $(tr).mouseover(function(){
                showTooltip(this, content);
            });
        }

        var bindCell = function(cell, formatter){
            cell.mouseover(function(){
                var nodeid = $(this).parent().attr('node-id');
                var node = $(target).treegrid('find', nodeid);
                var field = $(this).attr('field');
                var value = node[field];
                var content = formatter ? formatter(value, field, nodeid, node) : value;
                showTooltip(this, content);
            });
        }


        var initTooltip = function(){
            if(options.customAttr.tooltip.target == 'row'){
                options.finder.getTr(target, '', 'allbody').each(function(){
                    if($(this).hasClass('datagrid-row')){
                        bindRow(this, options.customAttr.tooltip.formatter);
                    }
                });
            }else{
                if(options.customAttr.tooltip.fields &&
                    $.isArray(options.customAttr.tooltip.fields)){
                    var panel = $(target).treegrid('getPanel');
                    var datagrid_body = $('>div.datagrid-view>div.datagrid-view2>div.datagrid-body', panel);
                    $.each(options.customAttr.tooltip.fields, function(){
                        var field = this;
                        bindCell($('td[field='+field+']', datagrid_body), options.customAttr.tooltip.formatter);
                    });
                }
            }
        }

        $(target).treegrid('addEventListener', {
            name: 'onLoadSuccess',
            handler: function(row, data){
                initTooltip();
            }
        });
    }

    function addEventListener(target, eventName, handler, override){
        var options = $(target).treegrid('options');
        var defaultActionEvent = options[eventName];
        switch (eventName){
            case 'onClickRow':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(row){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onDblClickRow':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(row){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onClickCell':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(field, row){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onDblClickCell':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(field, row){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onBeforeLoad':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(row, param){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onLoadSuccess':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(row, data){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onLoadError':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(arguments){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onBeforeExpand':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(row){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onExpand':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(row){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onBeforeCollapse':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(row){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onCollapse':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(row){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onContextMenu':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(e, row){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onBeforeEdit':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(row){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onAfterEdit':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(row, changes){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onCancelEdit':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(row){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            default :
                $(target).datagrid('addEventListener', {
                    name: eventName,
                    override: override,
                    handler: handler
                });
                break;
        }
    }

    $.fn.treegrid.headerContextMenu = {};
    $.fn.treegrid.headerContextMenu.defaultEvents={
        doRemove: function(item, row, target){
            $.messager.confirm('疑问','您确定要删除已选中的行？', function(r){
                if(r){
                    var idField = $(target).treegrid('options').idField;
                    var id = row[idField];
                    $(target).treegrid('remove', id);
                }
            });
        },
        doReload: function(item, row, target){
            $(target).treegrid('reload');
        }
    }

    $.fn.treegrid.defaults.customAttr={
        iconField: null,
        parentField: null,
        expandOnNodeClick: false,
        expandOnDblClick: false,
        headerContextMenu: {
            isShow: false,
            isMerge: true,
            items: []
        },
        contextMenu: {
            isShow: false,
            isMerge: true,
            items: []
        },
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
        onConfirmEdit: function(node){return true}
    }

    $.fn.treegrid.defaults.loadFilter = function(data, parentId){
        var options = $(this).treegrid('options');
        var cusOtpions = options.customAttr;
        if(cusOtpions && cusOtpions.parentField){
            var idField = options.idField,
                parentField = cusOtpions.parentField,
                iconField = cusOtpions.iconField || 'icon';

            for(var i=0, len=data.rows.length; i<len; i++){
                if(data.rows[i][parentField] && data.rows[i][parentField] != '0' && data.rows[i][idField] != data.rows[i][parentField]){
                    data.rows[i]['_parentId'] = data.rows[i][parentField];
                }else{
                    delete data.rows[i][parentField];
                }

                data.rows[i]['iconCls'] = data.rows[i][iconField];
            }
        }

        return data;
    }

    $.extend($.fn.treegrid.methods, {
        followCustomHandle: function(jq){
            return jq.each(function(){
                initHeaderContextMenu(this);
                initContextMenu(this);
                expandHandle(this);
                registRowEditingHandler(this);
                buildTooltip(this);
            });
        },
        getEditingRow: function(jq){
            var editingRows = jq.treegrid('getEditingRows');
            return editingRows.length ? editingRows[0] : null;
        },
        getEditingRows: function(jq){
            var options = jq.treegrid('options');
            var editingRow = [];
            options.finder.getTr(jq[0], "", "allbody").each(function(){
                if($(this).hasClass('datagrid-row-editing')){
                    var nodeid = $(this).attr('node-id');
                    editingRow.push(jq.treegrid('find', nodeid));
                }
            });

            return editingRow;
        },
        addEventListener: function(jq, param){
            return jq.each(function(){
                var eventList = $.isArray(param) ? param : [param];
                var target = this;
                $.each(eventList, function(i, event){
                    addEventListener(target, event.name, event.handler|| function(){}, event.override);
                });
            });
        }
    });
})(jQuery);
