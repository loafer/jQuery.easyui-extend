/**
 * Created with IntelliJ IDEA.
 * @author: 爱看书不识字<zjh527@163.com>
 *
 * depend on:
 *  jquery.easyui.menu.extend.js
 *
 * 扩展说明：
 *  1、支持简单JSON格式数据加载。
 *
 *     1.1、属性说明：
 *          idField:        值字段
 *          textField:      节点文本字段
 *          iconField:      节点图标字段
 *          parentField:    父节点字段，无此属性设置，则不会执行简单JSON数据格式加载
 *
 *     1.2、如果某条数据中idField和parentField属性指向的字段对应值相等，或者不包含
 *          parentField属性指定的字段时，则这条数据被视为根（子数根）节点。
 *
 *
 *     1.3、加载时idField、textField、 iconField、parentField 分别默认查找id、text、icon、pid
 *
 *     1.4、示例：
 *          $('#tt').tree({
 *              url: '../tree/tree_data1.json',
 *              customAttr: {
 *                  textField: 'region',
 *                  iconField: 'icon',
 *                  parentField: '_parentId'
 *              }
 *          }).tree('followCustomHandle');
 *
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
 *          }).tree('followCustomHandle');
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
 *          }).tree('followCustomHandle');
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
 *          }).tree('followCustomHandle');
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
 *          }).tree('followCustomHandle');
 *
 *
 *      2.5 默认支持节点位置上移、下移操作
 *
 *
 *  3、节点收缩、展开控制
 *      3.1、点击节点展开、收缩控制。
 *          控制属性： expandOnNodeClick  ，默认值：false
 *
 *          $('#tt').tree({
 *              lines: true,
 *              url: '../tree/tree_data2.json',
 *              customAttr:{
 *                  expandOnNodeClick: true
 *              }
 *          }).tree('followCustomHandle');
 *
 *      3.2、双击节点展开、收缩控制。
 *          控制属性：expandOnDblClick，默认值：false
 *
 *          $('#tt').tree({
 *              lines: true,
 *              url: '../tree/tree_data2.json',
 *              customAttr: {
 *                  expandOnNodeClick: false,
 *                  expandOnDblClick: true
 *              }
 *          }).tree('followCustomHandle');
 *
 *      3.3、当expandOnNodeClick、 expandOnDblClick同时为true时，expandOnNodeClick起作用。
 *
 *
 *  4、增加getLevel方法，返回节点层级
 *
 *
 *  5、增加onAfterMove事件，节点位置上移、下移操作之后被触发。
 *      此事件接收两个参数：
 *          target:     被互换位置的节点对象
 *          source:     当前被操作要改变位置的节点对象
 *
 *      eg.
 *          $('#tt').tree({
 *              url: '../tree/tree_data2.json',
 *              customAttr: {
 *                  contextMenu: {
 *                      isShow: true
 *                  },
 *                  onAfterMove: function(target, source){
 *                      var msg = '位置互换节点为：[ ' + target.text + ' ]和[ ' + source.text + ' ]';
 *                      $.messager.alert('信息', msg, 'info');
 *                  }
 *              }
 *          }).tree('followCustomHandle');
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
            {id: menuid+'_moveup', text: '位置上移', iconCls: 'icon-moveup', onclick: $.fn.tree.contextmenu.defaultEvents.moveup},
            {id: menuid+'_movedown', text: '位置下移', iconCls: 'icon-movedown', onclick: $.fn.tree.contextmenu.defaultEvents.movedown}
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
        var children = getChildren(target, parent.target, false);
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
        var children = getChildren(target, parent.target, false);
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

    function getChildren(target, nodeTarget, depth){
        if(depth){
            return $(target).tree('getChildren', nodeTarget);
        }else{
            var children = [];
            $(nodeTarget).next().find('>li>div.tree-node').each(function(){
                children.push($(target).tree('getNode', this));
            });

            return children;
        }
    }

    function expandHandle(target){
        var options = $.extend(true, {}, $.fn.tree.defaults, $(target).tree('options'));
        if(!options.customAttr.expandOnNodeClick && !options.customAttr.expandOnDblClick) return;


        if(options.customAttr.expandOnNodeClick){
            var onClickCallback = options.onClick;
            $(target).tree({
                onClick: function(node){
                    $(target).tree('toggle', node.target);
                    onClickCallback && onClickCallback.call(this, node);
                }
            });
            return;
        }

        if(options.customAttr.expandOnDblClick){
            var onDblClickCallback = options.onDblClick;
            $(target).tree({
                onDblClick: function(node){
                    $(target).tree('toggle', node.target);
                    onDblClickCallback && onDblClickCallback.call(this, node);
                }
            });
        }

    }

    function getLevel(target, node){
        var n = 1;
        var parentNode = $(target).tree('getParent', node.target);
        if(!parentNode){
            return 1;
        }

        return n + getLevel(target, parentNode);
    }

    $.fn.tree.contextmenu={};
    $.fn.tree.contextmenu.defaultEvents={
        moveup: function(item, node, target){
            var options = $.extend(true, {}, $.fn.tree.defaults, $(target).tree('options'));
            var prevnode = getPrevNode(target, node);
            if(prevnode){
                var nodeData = $(target).tree('pop', node.target);
                $(target).tree('insert',{
                    before: prevnode.target,
                    data: nodeData
                });
                options.customAttr.onAfterMove.call(this, prevnode, node);
            }
        },
        movedown: function(item, node, target){
            var options = $.extend(true, {}, $.fn.tree.defaults, $(target).tree('options'));
            var nextnode = getNextNode(target, node);
            if(nextnode){
                var nodeData = $(target).tree('pop', node.target);
                $(target).tree('insert', {
                    after: nextnode.target,
                    data: nodeData
                });
                options.customAttr.onAfterMove.call(this, nextnode, node);
            }
        }
    }


    $.fn.tree.defaults.customAttr = {
        idField: null,
        textField: null,
        parentField: null,
        iconField: null,
        /**
         * 单击节点展开收缩
         */
        expandOnNodeClick: false,
        /**
         * 双击节点展开收缩
         */
        expandOnDblClick: false,
        contextMenu: {
            isShow: false,
            isMerge: true,
            items:[]
        },
        /**
         * 节点位置上、下移动后触发事件
         * @param target    被互换位置的节点对象
         * @param source    当前被操作要改变位置的节点对象
         */
        onAfterMove: function(target, source){}
    };

    $.fn.tree.defaults.loadFilter = function(data, parent){
        var cusOptions = $(this).tree('options').customAttr;
        if(cusOptions && cusOptions.parentField){
            var idField = cusOptions.idField || 'id',
                textField = cusOptions.textField || 'text',
                iconField = cusOptions.iconField || 'icon',
                parentField = cusOptions.parentField || 'pid';

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
                    data[i][iconField] && (data[i]['iconCls'] = data[i][iconField]);
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
                expandHandle(this);
            });
        },
        /**
         * 获得节点层级
         */
        getLevel: function(jq, node){
            return getLevel(jq[0], node);
        }
    });
})(jQuery);
