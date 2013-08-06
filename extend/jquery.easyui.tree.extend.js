/**
 * Created with IntelliJ IDEA.
 * Licensed under the GPL licenses
 * http://www.gnu.org/licenses/gpl.txt
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
 *          attributes:     自定义属性字段,数组类型,将要当作属性的字段名写入数组
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
 *                  parentField: '_parentId',
 *                  attributes: ['f1', 'f2', 'f3']
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
 *
 *  6、增强expandTo方法，参数target支持两种类型：
 *      1) Dom对象（原始用法，看easyui API说明）
 *      2) 数字， 层级数（增强功能），表示从根开始，展开到第几层
 *
 *
 *  7、新增方法 addEventListener，用于初始化之后动态注册事件，支持一个事件可以注册多个处理方法。
 *      7.1 事件对象属性说明
 *          name:       事件名称
 *          override:   是否覆盖事件默认处理行为，值:true|false，默认:false
 *          handler:    定义事件处理行为
 *
 *      7.1 单个事件处理方法注册
 *          $('#tt').tree('addEventListener', {
 *              name: 'onClick',
 *              handler: function(node){}
 *          });
 *
 *      7.2 多个事件处理方法注册
 *          $('#tt').tree('addEventListener', [{
 *              name: 'onClick',
 *              handler: function(node){}
 *          },{
 *              name: 'onLoadSuccess',
 *              handler: function(node, data){}
 *          }])
 *
 *      7.3 覆盖事件默认处理行为
 *          $('#tt').tree('addEventListener', {
 *              name: 'onClick',
 *              override: true,
 *              handler: function(node){}
 *          });
 *
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

        $(target).tree('addEventListener', {
            name: 'onContextMenu',
            handler: function(e, node){
                e.preventDefault();

                $(target).tree('select', node.target);
                contextmenu.menu('addEventListener', {
                    name: 'onClick',
                    override: true,
                    handler: function(item){
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

    function getChildren(target, nodeTarget, isAll){
        if(isAll){
            return $(target).tree('getChildren', nodeTarget);
        }else{
            var children = [];
            $(nodeTarget).next().find('>li>div.tree-node').each(function(){
                children.push($(target).tree('getNode', this));
            });

            return children;
        }
    }


    function expandHandler(target){
        var options = $.extend(true, {}, $.fn.tree.defaults, $(target).tree('options'));
        if(!options.customAttr.expandOnNodeClick && !options.customAttr.expandOnDblClick) return;


        if(options.customAttr.expandOnNodeClick){
            $(target).tree('addEventListener', {
                name: 'onClick',
                handler: function(node){
                    $(target).tree('toggle', node.target);
                }
            });

            return;
        }

        if(options.customAttr.expandOnDblClick){
            $(target).tree('addEventListener', {
                name: 'onDblClick',
                handler: function(node){
                    $(target).tree('toggle', node.target);
                }
            });
        }

    }

    function getLevel(target, node){
//        var p = $(node.target).parentsUntil('ul.tree', 'ul');
//        return p.length + 1;

        var n = 1;
        var parentNode = $(target).tree('getParent', node.target);
        if(!parentNode){
            return 1;
        }
        return n + getLevel(target, parentNode);
    }

    function expandTo(target, level, node){
        var nodes = node ? [node] : $(target).tree('getRoots');
        for(var i= 0; i<nodes.length; i++){
            var children = getChildren(target, nodes[i].target, false);
            for(var j=0; j<children.length; j++){
                $(target).tree('expandTo', children[j].target);
            }

            level--;
            if(level > 0){
                for(var j=0; j<children.length; j++){
                    expandTo(target, level, children[j]);
                }
            }
        }
    }

    function onlyNodeExpandHandler(target){
        var options = $.extend(true, {}, $.fn.tree.defaults, $(target).tree('options'));
        if(!options.customAttr.onlyNodeExpand) return;

        $(target).tree('addEventListener', {
            name: 'onBeforeExpand',
            handler: function(node){
                var parent = $(target).tree('getParent', node.target);
                if(parent){
                    var children = getChildren(target, parent.target, false);
                    for(var i=0; i<children.length; i++){
                        if(children[i].state == 'open'){
                            $(target).tree('collapseAll', children[i].target);
                        }
                    }
                }else{
                    $(target).tree('collapseAll');
                }
            }
        });
    }

    function addEventListener(target, eventName, handler, override){
        var options = $(target).tree('options');
        var defaultActionEvent = options[eventName];
        switch (eventName){
            case 'onBeforeLoad':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(node, param){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onLoadSuccess':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(node, data){
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
            case 'onBeforeCheck':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(node, checked){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onCheck':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(node, checked){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onContextMenu':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(e, node){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onDragEnter':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(target, source){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onDragOver':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(target, source){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onDragLeave':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(target, source){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onBeforeDrop':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(target,source,point){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onDrop':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(target,source,point){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            default :
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(node){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
        }
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
        attributes: null,
        /**
         * 单击节点展开收缩
         */
        expandOnNodeClick: false,
        /**
         * 双击节点展开收缩
         */
        expandOnDblClick: false,
        onlyNodeExpand: false,
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
                parentField = cusOptions.parentField || 'pid',
                attributes = cusOptions.attributes;


            var addNodeAttributes = function(node){
                if(null == attributes && !$.isArray(attributes)){
                    return;
                }

                node['attributes'] = {};
                for(var j=0; j<attributes.length; j++){
                    node['attributes'][attributes[j]] = node[attributes[j]];
                }
            }

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
                    addNodeAttributes(data[i]);
                    tmpMap[data[i][parentField]]['children'].push(data[i]);
                }else{
                    data[i]['text'] = data[i][textField];
                    addNodeAttributes(data[i]);
                    treeData.push(data[i]);
                }
            }

            return treeData;
        }

        return data;
    }

    var defaultMethods = $.extend({}, $.fn.tree.methods);

    $.extend($.fn.tree.methods, {
        followCustomHandle: function(jq){
            return jq.each(function(){
                initContextMenu(this);
                expandHandler(this);
                onlyNodeExpandHandler(this);
            });
        },
        /**
         * 获得节点层级
         */
        getLevel: function(jq, node){
            return getLevel(jq[0], node);
        },
        expandTo: function(jq, target){
            return jq.each(function(){
                if($.type(target) == 'number'){
                    var level = target;
                    expandTo(this, level);
                }else{
                    defaultMethods.expandTo(jq, target);
                }
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
        }
    });
})(jQuery);
