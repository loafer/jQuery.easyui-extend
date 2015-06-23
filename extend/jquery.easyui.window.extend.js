/**
 * Created with IntelliJ IDEA.
 * Licensed under the GPL licenses
 * http://www.gnu.org/licenses/gpl.txt
 * @author: 爱看书不识字<zjh527@163.com>
 *
 *
 *
 * 扩展说明：
 *      1、这个扩展可以在含有iframe的页面中创建跨越iframe定位在最顶层的window。
 *
 *      2、此扩展通过参数locate来指定窗体依附在哪个dom对象上。
 *          top:                表示定位在最顶层
 *          document:           当含有iframe时，窗体定位在iframe的document中
 *          某个dom元素的id:     窗体被定位在指定的dom元素中。
 *
 *          注意: 当content和href中使用相对路径时，此参数的不同设置会影响页面加载，请通过调整content和href中的相对路径来解决。
 *
 *      3、此方法不接受inline=true的设置。
 *
 *      4、其他参数请参考easyui.window。
 *
 *      5、onLoad方法接收两个参数win、body。
 *          win:    一个Object对象，包含以下两个方法:
 *                      getData: 参数name。用来获取data中设置的属性
 *                      close: 无参数，关闭当前窗体
 *
 *          body:   一个指向弹出窗body的引用，分以下两种：
 *                  a) 当useiframe=false时，是一个指向window.top或window.self的引用。
 *                     要在onLoad中对easyui.window中的内容进行设置时，请使用类似如下形式操作:
 *                          body.$('#username').val('Tom')；
 *
 *                  b) 当useiframe=true时，是一个指向iframe.contentWindow的引用。
 *                     要在onLoad中对easyui.window中的内容进行设置时，操作前先判断body是否存在，如下形式操作:
 *                          if(body) body.doInit();
 *
 *
 *          注意：当useiframe=true时，不同浏览器对此方法的执行行为不同。
 *
 *
 *      6、toolbar和buttons中定义的每个元素的handler方法都接收一个参数win。参数win说明参见5
 *
 *
 *      7、窗体大小，默认计算规则：父页面大小*0.6 ，如用户指定大小，则不使用默认规则。
 *
 *      8、方法返回对当前窗体的引用。
 *
 *      9、 当useiframe=true 添加遮罩控制。
 *          9.1 属性说明：
 *              showMask:   控制是否显示遮罩。其值：true|false
 *              loadMsg:    加载提示信息
 */
(function($){

    function getTop(w, options){
        var _doc;
        try{
            _doc = w['top'].document;
            _doc.getElementsByTagName;
        }catch(e){
            return w;
        }

        if(options.locate=='document' || _doc.getElementsByTagName('frameset').length >0){
            return w;
        }

        if(options.locate=='document.parent' || _doc.getElementsByTagName('frameset').length >0){
            return w.parent;
        }

        return w['top'];
    }

    function setWindowSize(w, options){
        var _top = getTop(w, options);
        var wHeight = $(_top).height(), wWidth = $(_top).width();
        if(!/^#/.test(options.locate)){
            if(options.height == 'auto'){
                options.height = wHeight * 0.6
            }

            if(options.width == 'auto'){
                options.width = wWidth * 0.6
            }
        }else{
            var locate = /^#/.test(options.locate)? options.locate:'#'+options.locate;
            if(options.height == 'auto'){
                options.height = $(locate).height() * 0.6
            }

            if(options.width == 'auto'){
                options.width = $(locate).width() * 0.6
            }
        }
    }

    $.extend({
        /**
         *
         * @param options
         * @return 返回当前窗体的引用
         *
         * 1、新增属性：
         *      useiframe: true|false，指定是否使用iframe加载页面。
         *      locate:  top|document|id 默认:top
         *      data:  方法回调参数
         *
         * 2、增强属性：
         *      content: 支持使用前缀url指定要加载的页面。
         */
        showWindow: function(options){
            options = options || {};
            var target;
            var winOpts = $.extend({},{
                iconCls:'icon-form',
                useiframe: false,
                locate: 'top',
                data: undefined,
                width: '60%',
                height: '60%',
                cache: false,
                minimizable: true,
                maximizable: true,
                collapsible: true,
                resizable: true,
                loadMsg: $.fn.datagrid.defaults.loadMsg,
                showMask: false,
                onClose: function(){target.dialog('destroy');}
            }, options);


            var iframe = null;

            if(/^url:/.test(winOpts.content)){
                var url = winOpts.content.substr(4, winOpts.content.length);
                if(winOpts.useiframe){
                    iframe = $('<iframe>')
                        .attr('height', '100%')
                        .attr('width', '100%')
                        .attr('marginheight', 0)
                        .attr('marginwidth', 0)
                        .attr('frameborder', 0);

                    setTimeout(function(){
                        iframe.attr('src', url);
                    }, 10);

                }else{
                    winOpts.href = url;
                }

                delete winOpts.content;
            }

            var selfRefrence={
                getData: function(name){
                    return winOpts.data ? winOpts.data[name]:null;
                },
                close: function(){
                    target.panel('close');
                }
            };

            var _top = getTop(window, winOpts);
            var warpHandler = function(handler){
                if(typeof handler == 'function'){
                    return function(){
                        handler(selfRefrence);
                    };
                }

                if(typeof handler == 'string' && winOpts.useiframe){
                    return function(){
                        iframe[0].contentWindow[handler](selfRefrence);
                    }
                }

                if(typeof handler == 'string'){
                    return function(){
                        eval(_top[handler])(selfRefrence);
                    }
                }
            }

            //setWindowSize(window, winOpts);

            //包装toolbar中各对象的handler
            if(winOpts.toolbar && $.isArray(winOpts.toolbar)){
                $.each(winOpts.toolbar, function(i, button){
                    button.handler = warpHandler(button.handler);
                });
            }

            //包装buttons中各对象的handler
            if(winOpts.buttons && $.isArray(winOpts.buttons)){
                $.each(winOpts.buttons, function(i, button){
                    button.handler = warpHandler(button.handler);
                });
            }


            var onLoadCallback = winOpts.onLoad;
            winOpts.onLoad = function(){
                onLoadCallback && onLoadCallback.call(this, selfRefrence, _top);
            }

            if(!/^#/.test(winOpts.locate)){
                if(winOpts.useiframe && iframe){
                    if(winOpts.showMask){
                        winOpts.onBeforeOpen = function(){
                            var panel = $(this).panel('panel');
                            var header = $(this).panel('header');
                            var body = $(this).panel('body');
                            body.css('position', 'relative');
                            var mask = $("<div class=\"datagrid-mask\" style=\"display:block;\"></div>").appendTo(body);
                            var msg = $("<div class=\"datagrid-mask-msg\" style=\"display:block; left: 50%;\"></div>").html(winOpts.loadMsg).appendTo(body);
                            setTimeout(function(){
                                msg.css("marginLeft", -msg.outerWidth() / 2);
                            }, 5);
                        }
                    }

                    iframe.bind('load', function(){
                        if(iframe[0].contentWindow){
                            onLoadCallback && onLoadCallback.call(this, selfRefrence, iframe[0].contentWindow);
                            if(winOpts.showMask){
                                target.panel('body').children("div.datagrid-mask-msg").remove();
                                target.panel('body').children("div.datagrid-mask").remove();
                            }
                        }
                    });

                    target = _top.$('<div>').css({'overflow':'hidden'}).append(iframe).dialog(winOpts);
                }else{
                    target = _top.$('<div>').dialog(winOpts);
                }
            }else{
                var locate = /^#/.test(winOpts.locate)? winOpts.locate:'#'+winOpts.locate;
                target = $('<div>').appendTo(locate).dialog($.extend({}, winOpts, {inline: true}));
            }

            return target;
        },
        showModalDialog: function(options){
            options = options || {};
            var opts = $.extend({}, options, {
                modal: true,
                minimizable: false,
                maximizable: false,
                resizable: false,
                collapsible: false
            });

            return $.showWindow(opts);
        }
    })
})(jQuery);
