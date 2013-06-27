/**
 * Created with IntelliJ IDEA.
 * @author: 爱看书不识字<zjh527@163.com>
 *
 * depend on:
 *  jquery.easyui.menu.extend.js
 *
 * 扩展说明：
 *  1、支持简单JSON格式数据加载，当简单JSON格式数据中，某条数据不带有表示父节点的字段，
 *     或父节点字段所存储的值与此节点id相同时，则视为根（子树根）节点下的第一级节点。
 *
 *          $('#tt').tree({
 *              url: '../tree/tree_data1.json',
 *              customAttr: {
 *                  textField: 'region',
 *                  parentField: '_parentId'
 *              }
 *          });
 *
 *  2、支持右键菜单
 *      2.1 显示菜单
 *          $('#tt').tree({
 *              url: '../tree/tree_data2.json',
 *              customAttr: {
 *                  contextMenu: {
 *                      isShow: true
 *                  }
 *              }
 *          });
 *
 *
 *      2.2  自定义菜单项
 *          $('#tt').tree({
 *              url: '../tree/tree_data2.json',
 *              customAttr:{
 *                  contextMenu:{
 *                      isShow: true,
 *                      isMerge: true,
 *                      items:['-',{
 *                          text: 'others',
 *                          submenu: [{
 *                              text: 'item1'
 *                          },{
 *                              text: 'item2'
 *                          }]
 *                      }]
 *                  }
 *              }
 *          });
 *
 *
 *      2.3  自定义菜单项替换默认菜单项
 *          $('#tt').tree({
 *              url: '../tree/tree_data2.json',
 *              customAttr: {
 *                  contextMenu: {
 *                      isShow: true,
 *                      isMerge: false,
 *                      items: [{
 *                          text: 'others'
 *                      }]
 *                  }
 *              }
 *          });
 *
 *
 *      2.4  菜单项onclick事件参数说明：
 *          item: 当前点击的item
 *          node: 触发右键菜单的节点
 *          target: 一个指向当前tree的，非jquery对象引用
 *
 *          $('#tt').tree({
 *              url: '../tree/tree_data2.json',
 *              customAttr: {
 *                  contextMenu: {
 *                      isShow: true,
 *                      items: [{
 *                          text: 'others',
 *                          onclick: function(item, node, target){......}
 *                      }]
 *                  }
 *              }
 *          });
 *
 *      2.5 默认支持节点上移、下移操作
 *
 */
(function($){
    function getContextMenuId(target){
        return $(target).attr('id')+'_contextmenu';
    }

    function buildContextMenu(target, menuitems){
        var menuid = getContextMenuId(target);
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
        var menuid = getContextMenuId(target);
        return [
            {text: '向上', iconCls: 'icon-moveup', onclick: $.fn.tree.contextmenu.defaultEvents.moveup},
            {text: '向下', iconCls: 'icon-movedown', onclick: $.fn.tree.contextmenu.defaultEvents.movedown}
        ];
    }

    function initContextMenu(target){
        var opts = $.extend(true, {}, $.fn.tree.defaults, $(target).tree('options'));
        var menuOpts = opts.customAttr.contextMenu;
        if(!menuOpts.isShow) return;

        var menuitems = getDefaultContextMenuItems(target);
        if(menuOpts.isMerge && $.isArray(menuOpts.items) && menuOpts.items.length>0){
            menuitems = $.merge(menuitems, menuOpts.items);
        }

        if(!menuOpts.isMerge && $.isArray(menuOpts.items) && menuOpts.items.length>0){
            menuitems = menuOpts.items;
        }

        var onClickHandlerCache = getMenuItemOnClickHandler(menuitems);
        var contextmenu = buildContextMenu(target, menuitems);
        $(target).tree({
            onContextMenu: function(e, node){
                e.preventDefault();

                $(target).tree('select', node.target);
                contextmenu.menu({
                    onClick: function(item){
                        var name = item.id || item.text;
                        if(onClickHandlerCache[name]){
                            onClickHandlerCache[name].call(this, item, node, target);
                        }
                    }
                }).menu('show',{
                    left: e.pageX,
                    top: e.pageY
                });
            }
        });
    }

    function getPrevNode(target, node){
        var nodeTag = node.id || node.text;
        var parent = $(target).tree('getParent', node.target);
        var children = $(target).tree('getChildren', parent.target);
        var prevNodeIndex = -1;
        for(var i= 0, len = children.length; i<len; i++){
            var childrenTag = children[i].id || children[i].text;
            if(nodeTag == childrenTag){
                prevNodeIndex = i-1;
                break;
            }
        }

        if(prevNodeIndex>-1){
            return children[prevNodeIndex];
        }
        return null;
    }

    function getNextNode(target, node){
        var nodeTag = node.id || node.text;
        var parent = $(target).tree('getParent', node.target);
        var children = $(target).tree('getChildren', parent.target);
        var nextNodeIndex = -1;
        for(var i= 0, len = children.length; i<len; i++){
            var childrenTag = children[i].id || children[i].text;
            if(nodeTag == childrenTag){
                nextNodeIndex = i+1;
                break;
            }
        }

        if(nextNodeIndex >-1 && nextNodeIndex < children.length){
            return children[nextNodeIndex];
        }
        return null;
    }

    $.fn.tree.contextmenu={};
    $.fn.tree.contextmenu.defaultEvents={
        moveup: function(item, node, target){
            var prevnode = getPrevNode(target, node);
            if(prevnode){
                var nodeData = $(target).tree('pop', node.target);
                $(target).tree('insert',{
                    before: prevnode.target,
                    data: nodeData
                });
            }
        },
        movedown: function(item, node, target){
            var nextnode = getNextNode(target, node);
            if(nextnode){
                var nodeData = $(target).tree('pop', node.target);
                $(target).tree('insert', {
                    after: nextnode.target,
                    data: nodeData
                });
            }
        }
    }


    $.fn.tree.defaults.customAttr = {
        idField: null,
        textField: null,
        parentField: null,
        contextMenu: {
            isShow: false,
            isMerge: true,
            items:[]
        }
    };

    $.fn.tree.defaults.loadFilter = function(data, parent){
        var cusOptions = $(this).tree('options').customAttr;
        if(cusOptions && cusOptions.parentField){
            var idField = cusOptions.idField || 'id',
                textField = cusOptions.textField || 'text',
                parentField = cusOptions.parentField;

            var treeData = [], tmpMap = [];

            for(var i= 0, len = data.length; i<len; i++){
                tmpMap[data[i][idField]] = data[i];
            }

            for(var i= 0, len = data.length; i<len; i++){
                if(tmpMap[data[i][parentField]] && data[i][idField] != data[i][parentField]){
                    if(!tmpMap[data[i][parentField]]['children']){
                        tmpMap[data[i][parentField]]['children'] = [];
                    }

                    data[i]['text'] = data[i][textField];
                    tmpMap[data[i][parentField]]['children'].push(data[i]);
                }else{
                    data[i]['text'] = data[i][textField];
                    treeData.push(data[i]);
                }
            }

            return treeData;
        }

        return data;
    }

    $.extend($.fn.tree.methods, {
        followCustomHandle: function(jq){
            return jq.each(function(){
                initContextMenu(this);
            });
        }
    });
})(jQuery);
