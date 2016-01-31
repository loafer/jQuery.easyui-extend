/**
 * Created with IntelliJ IDEA.
 * Licensed under the GPL licenses
 * http://www.gnu.org/licenses/gpl.txt
 * @author: 爱看书不识字<zjh527@163.com>
 *
 * depend on:
 *  jquery.easyui.menu.extend.js
 *
 * 扩展如下：
 * 1、通过自定义属性控制标签页显示右键菜单，可自定义右键菜单项，自定义右键菜单项支持'-'定义菜单分割符，自定义菜单项是否与默认菜单合并。
 *      1.1 右键菜单默认菜单项：
 *          重新加载
 *          固定标签页
 *          取消固定标签
 *          关闭标签页
 *          关闭其他标签页
 *          关闭右侧标签页
 *          关闭所有标签页
 *
 *
 *      1.2 右键菜单显示控制：
 *          customAttr:{
 *              contextMenu:{
 *                  isShow: true
 *              }
 *          }
 *
 *
 *      1.3 右键菜单自定义菜单项和使用'-'定义菜单项分割符：
 *          customAttr:{
 *              contextMenu:{
 *                  isShow: true,
 *                  items: [
 *                      {text: 'Add', iconCls: 'icon-add', onclick: function(item, title, index, target){}},
 *                      {text: 'Save', iconCls: 'icon-save'},
 *                      '-',
 *                      {text: 'Close', iconCls: 'icon-close'}
 *                  ]
 *              }
 *          }
 *
 *          菜单项onclick方法，参数说明：
 *              item： 菜单项
 *              title: 触发右键菜单的标签页的标题
 *              index: 处罚右键菜单的标签页的索引号
 *              target: 指向当前tabs组件
 *
 *      1.4 自定义菜单项与默认菜单项合并：
 *          customAttr:{
 *              contextMenu:{
 *                  isShow: true,
 *                  isMerge: true,
 *                  items: [
 *                      {text: 'Add', iconCls: 'icon-add', onclick: function(item, title, index, target){}},
 *                      {text: 'Save', iconCls: 'icon-save'},
 *                      '-',
 *                      {text: 'Close', iconCls: 'icon-close'}
 *                  ]
 *              }
 *          }
 *
 *      1.5 菜单项onclick事件接收item, title, index, target参数
 *          item: 当前点击菜单项
 *          title: 当前触发contextmenu标签页的标题
 *          index: 当前触发contextmenu标签页的索引号
 *          target: 当前tabs的引用，非jQuery对象。
 *
 *
 * 2、增加自定义属性解析方法followCustomHandle，只有调用此方法之后customAttr中定义的扩展属性才会被解析执行。
 *      $('#tt').tabs({
 *          customAttr:{
 *              contextMenu:{
 *                  isShow: true
 *              }
 *          }
 *      }).tabs('followCustomHandle');
 *
 *
 *
 * 3、重写add方法，支持使用iframe加载url。
 *      3.1 通过useiframe属性控制是否使用iframe
 *          $('#tt').tabs('add',{
 *              title: 'New Tab',
 *              href: 'http://www.baidu.com',
 *              useiframe: true
 *          });
 *
 *
 *      3.2 改写content参数，使其支持url 。
 *          $('#tt').tabs('add',{
 *              title: 'New Tab',
 *              useiframe: true,
 *              content: 'url:http://www.baidu.com'
 *          });
 *
 *      3.3 通过css属性控制tab panel 样式
 *          $('#tt').tabs('add', {
 *              title: 'New Tab',
 *              href: 'http://www.baidu.com',
 *              css: {padding: '2px'}
 *          });
 *
 *      3.4 属性说明：
 *          1、保持原有方法属性
 *          2、新增如下属性：
 *              useiframe: 是否使用iframe加载页面
 *              css:        控制tab.panel样式
 *              showMask:   是否显示遮罩。当useiframe=true时生效。
 *              loadMsg:    遮罩提示信息。当useiframe=true时生效。
 *
 *          3、扩展属性content，支持url前缀，自动执行页面加载。
 *
 *
 * 4、新增方法 addEventListener, 用于初始化之后动态注册事件，支持一个事件可以注册多个处理方法。
 *      4.1 事件对象属性说明
 *          name:       事件名称
 *          override:   是否覆盖事件默认处理行为，值:true|false，默认:false
 *          handler:    定义事件处理行为
 *
 *
 *      4.2 单个事件处理方法注册
 *          $('#tt').tabs('addEventListener', {
 *              name: 'onLoad',
 *              handler: function(panel){}
 *          });
 *
 *      4.3 多个事件处理方法注册
 *          $('#tt').tabs('addEventListener', [{
 *              name: 'onLoad',
 *              handler: function(panel){}
 *          },{
 *              name: 'onSelect',
 *              handler: function(title, index){}
 *          }]);
 *
 *      4.4 覆盖事件默认处理行为
 *          $('#tt').tabs('addEventListener', {
 *              name: 'onSelect',
 *              override: true,
 *              handler: function(title, index){}
 *          });
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

    /**
     * 解决在menu.onClick事件和item.onclick同时触发调用。
     * @param target
     */
    function initContextMenu(target){
        var opts = $.extend(true, {}, $.fn.tabs.defaults, $.data(target, 'tabs').options);
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

        $(target).tabs('addEventListener', {
            name: 'onContextMenu',
            handler: function(e, title, index){
                e.preventDefault();
                modifyItemText(target, contextmenu, index);
                contextmenu.menu('addEventListener', {
                    name: 'onClick',
                    override: true,
                    handler: function(item){
                        var name = item.id || item.text;
                        if(onClickHandlerCache[name]){
                            onClickHandlerCache[name].call(this, item, title, index, target);
                        }
                    }
                }).menu('show',{
                    left: e.pageX,
                    top: e.pageY
                });
            }
        });
    }

    function modifyItemText(target, contextmenu, index){
        var menuid = getContextMenuId(target);
        var itemEl = $('#'+menuid+'_fixed');
        if($.inArray(index, $.fn.tabs.defaults.customAttr.fixedtabs) == -1 && !$(target).tabs('getTab', index).panel('options').closable){
            contextmenu.menu('setText', {target: itemEl, text: $.fn.tabs.defaults.contextMenu.itemname.unfixtab});
        }else{
            contextmenu.menu('setText', {target: itemEl, text: $.fn.tabs.defaults.contextMenu.itemname.fixtab});
            if($.inArray(index, $.fn.tabs.defaults.customAttr.fixedtabs)>-1){
                contextmenu.menu('disableItem', itemEl);
            }else{
                contextmenu.menu('enableItem', itemEl);
            }
        }

        itemEl = $('#'+menuid+'_close');
        if(!$(target).tabs('getTab', index).panel('options').closable){
            contextmenu.menu('disableItem', itemEl);
        }else{
            contextmenu.menu('enableItem', itemEl);
        }

    }

    function getDefaultContextMenuItems(target){
        var menuid = getContextMenuId(target);
        return [
            {
                id: menuid+'_reload',
                text: $.fn.tabs.defaults.contextMenu.itemname.reload,
                onclick: $.fn.tabs.defaults.contextMenu.defaultEventsHandler.reload
            },
            {
                id: menuid+'_fixed',
                text: $.fn.tabs.defaults.contextMenu.itemname.fixtab,
                onclick: function(item, title, index, tabs){
                    if(item.text == $.fn.tabs.defaults.contextMenu.itemname.fixtab)
                        $.fn.tabs.defaults.contextMenu.defaultEventsHandler.fixtab(item, title, index, tabs);
                    else
                        $.fn.tabs.defaults.contextMenu.defaultEventsHandler.unfixtab(item, title, index, tabs)
                }
            },
            '-',
            {
                id: menuid+'_close',
                text: $.fn.tabs.defaults.contextMenu.itemname.close,
                onclick: $.fn.tabs.defaults.contextMenu.defaultEventsHandler.closetab
            },
            {
                id: menuid+'_close_others',
                text: $.fn.tabs.defaults.contextMenu.itemname.closeothers,
                onclick: $.fn.tabs.defaults.contextMenu.defaultEventsHandler.closeOthersTab
            },
            {
                id: menuid+'_close_rightside',
                text: $.fn.tabs.defaults.contextMenu.itemname.closerightside,
                onclick: $.fn.tabs.defaults.contextMenu.defaultEventsHandler.closeRightSideTabs
            },
            {
                id: menuid+'_close_all',
                text: $.fn.tabs.defaults.contextMenu.itemname.closeall,
                onclick: $.fn.tabs.defaults.contextMenu.defaultEventsHandler.closeAll
            }
        ];
    }

    function getHeader(target, index){
        var headers = [];
        index++;
        $(target).children('div.tabs-header').find('ul li:nth-child('+index+')').each(function(){
            headers.push(this);
        });
        return headers.length>0?headers[0]:null;
    }

    function resortTabs(target, minIndex, maxIndex, reverse){
        if(typeof maxIndex == 'number' && typeof minIndex == 'number'){
            var tabs = $.data(target, 'tabs').tabs;
            if(maxIndex<0 || maxIndex>tabs.length) return;
            if(minIndex<0 || minIndex>tabs.length) return;


            if(reverse){
                var srcTab = tabs[maxIndex];
                for(var i=maxIndex; i>minIndex; i--){
                    tabs.splice(i, 1, tabs[i-1]);
                }
                tabs[minIndex] = srcTab;

                var destHeader = getHeader(target, minIndex);
                if(destHeader){
                    var srcheader = getHeader(target, maxIndex);
                    $(destHeader).before(srcheader);
                }
            }else{
                var srcTab = tabs[minIndex];
                for(var j=minIndex; j<=maxIndex; j++){
                    tabs.splice(j, 1, tabs[j+1]);
                }
                tabs[maxIndex]= srcTab;

                var destHeader = getHeader(target, maxIndex);
                if(destHeader){
                    var srcHeader = getHeader(target, minIndex);
                    $(destHeader).after(srcHeader);
                }
            }
        }
    }

    function getFixedTabs(target){
        var tabs = $(target).tabs('tabs');
        var fixedtabs = [];
        for(var i=0; i<tabs.length; i++){
            var tab = tabs[i];
            if(tab.panel('options').closable == undefined ||!tab.panel('options').closable){
                fixedtabs.push(tab);
            }
        }

        return fixedtabs;
    }

    function appendIframeToTab(target, tabTitle, url, showMask, loadMsg){
        var iframe = $('<iframe>')
            .attr('height', '100%')
            .attr('width', '100%')
            .attr('marginheight', '0')
            .attr('marginwidth', '0')
            .attr('frameborder', '0');

        setTimeout(function(){
            iframe.attr('src', url);
        }, 1);

        var tab = $(target).tabs('getTab', tabTitle);
        tab.panel('body').css({'overflow':'hidden'}).empty().append(iframe);



        //add mask
        if(showMask){
            var loadMsg = loadMsg || $.fn.datagrid.defaults.loadMsg;
            var body = tab.panel('body');
            body.css('position', 'relative');
            var mask = $("<div class=\"datagrid-mask\" style=\"display:block;\"></div>").appendTo(body);
            var msg = $("<div class=\"datagrid-mask-msg\" style=\"display:block; left: 50%;\"></div>").html(loadMsg).appendTo(body);
            setTimeout(function(){
                msg.css("marginLeft", -msg.outerWidth() / 2);
            }, 5);
        }

        //remove mask
        iframe.bind('load', function(){
            if(iframe[0].contentWindow){
                tab.panel('body').children("div.datagrid-mask-msg").remove();
                tab.panel('body').children("div.datagrid-mask").remove();
            }
        });
    }

    $.fn.tabs.defaults.contextMenu={}
    $.fn.tabs.defaults.contextMenu.itemname={};
    $.fn.tabs.defaults.contextMenu.itemname.reload = '重新加载';
    $.fn.tabs.defaults.contextMenu.itemname.fixtab = '固定标签页';
    $.fn.tabs.defaults.contextMenu.itemname.unfixtab = '取消固定标签';
    $.fn.tabs.defaults.contextMenu.itemname.close = '关闭标签页';
    $.fn.tabs.defaults.contextMenu.itemname.closeothers = '关闭其他标签页';
    $.fn.tabs.defaults.contextMenu.itemname.closerightside = '关闭右侧标签页';
    $.fn.tabs.defaults.contextMenu.itemname.closeall = '关闭所有标签页';

    $.fn.tabs.defaults.contextMenu.defaultEventsHandler ={
        reload: function(item, title, index, target){
            var panel = $(target).tabs('getTab', index);
            var useiframe = panel.panel('options').useiframe;
            if(useiframe){
                $('iframe', panel.panel('body')).each(function(){
                    this.contentWindow.location.reload();
                });
            }else{
                panel.panel('refresh');
            }
        },
        fixtab: function(item, title, index, target){
            var tab = $(target).tabs('getTab', index);
            $(target).tabs('update', {tab: tab, options:{closable: false}});


            var minIndex = $.fn.tabs.defaults.customAttr.fixedtabs.length;
            resortTabs(target, minIndex, index, true);
        },
        unfixtab: function(item, title, index, target){
            var maxIndex = getFixedTabs(target).length-1;
            var tab = $(target).tabs('getTab', index);
            $(target).tabs('update', {tab: tab, options:{closable: true}});

            resortTabs(target, index, maxIndex);

        },
        closetab: function(item, title, index, target){
            var panelOpts = $(target).tabs('getTab', index).panel('options');
            if(panelOpts.closable){
                $(target).tabs('close', index);
            }
        },
        closeOthersTab: function(item, titl, index, target){
            var tabs = $(target).tabs('tabs');
            var panels = $.grep(tabs, function(tab, i){
                return tab.panel('options').closable && i!=index;
            });

            $.each(panels, function(){
                $(target).tabs('close', this.panel('options').title);
            })
        },
        closeRightSideTabs: function(item, title, index, target){
            var tabs = $(target).tabs('tabs');
            var panels = $.grep(tabs, function(tab, i){
                return i>index && tab.panel('options').closable;
            });

            $.each(panels, function(){
                $(target).tabs('close', this.panel('options').title);
            });
        },
        closeAll: function(item, title, index, target){
            var tabs = $(target).tabs('tabs');
            var panels = $.grep(tabs, function(tab, i){
                return tab.panel('options').closable
            });
            $.each(panels, function(){
                $(target).tabs('close', this.panel('options').title);
            });
        }
    }

    function addEventListener(target, eventName, handler, override){
        var options = $(target).tabs('options');
        var defaultActionEvent = options[eventName];
        switch (eventName){
            case 'onLoad':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(panel){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onContextMenu':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(e, title, index){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            default :
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(title, index){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
        }
    }

    $.fn.tabs.defaults.customAttr={
        fixedtabs:[0],
        contextMenu: {
            isShow: false,
            isMerge: true,
            items:[]
        }
    };


    var defaultMethods = $.extend({}, $.fn.tabs.methods);

    $.extend($.fn.tabs.methods, {
        followCustomHandle: function(jq){
            return jq.each(function(){});
        },
        /**
         *
         * @param jq
         * @param options
         *        1、除原有属性外，再扩展如下属性：
         *          useiframe:  是否使用iframe加载远程页面。值：true|false
         *          showMask:   是否显示遮罩。 值true|false
         *          loadMsg:    加载提示信息。
         *          css:        设置panel样式。 其值Object，例如：{padding: '2px'}
         *        注意：showMask 和 loadMsg 属性当 useiframe=true 时生效。
         *
         *        2、增强content属性，支持url前缀，自动识别加载页面。
         * @returns {*}
         */
        add: function(jq, options){
            return jq.each(function(){
                var url = null;
                if(options.href || /^url:/.test(options.content)){
                    url = options.href || options.content.substr(4, options.content.length);
                    delete options.content;
                    delete options.href;
                }


                if(url){
                    if(options.useiframe){
                        defaultMethods.add(jq, options);
                        appendIframeToTab(this, options.title, url, options.showMask, options.loadMsg);
                    }else{
                        defaultMethods.add(jq, $.extend(options, {href: url}));
                    }
                }else{
                    defaultMethods.add(jq, options);
                }

                if(options.css){
                    $(this).tabs('getTab', options.title).css(options.css);
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

    var plugin = $.fn.tabs;
    $.fn.tabs = function(options, param){
        if (typeof options != 'string'){
            return this.each(function(){
                plugin.call($(this), options, param);

                initContextMenu(this);
            });
        } else {
            return plugin.call(this, options, param);
        }
    };

    $.fn.tabs.methods = plugin.methods;
    $.fn.tabs.defaults = plugin.defaults;
    $.fn.tabs.parseOptions = plugin.parseOptions;
})(jQuery);
