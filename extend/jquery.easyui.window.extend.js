/**
 * Created with IntelliJ IDEA.
 * @author: 爱看书不识字<zjh527@163.com>
 *
 *
 *
 * 扩展说明：
 *      1、这个扩展可以在含有iframe的页面中创建跨越iframe定位在最顶层的window。
 *      2、此扩展通过参数locate来指定窗体依附在哪个dom对象上。
 *          top: 表示定位在最顶层
 *          document: 当含有iframe时，窗体定位在iframe的document中
 *          某个dom元素的id: 窗体被定位在指定的dom元素中。
 *      3、此方法不接受inline=true的设置。
 *      4、其他参数请参考easyui.window。
 */
(function($){

    function getTop(w, options){
        var _doc;
        try{
            _doc = w['top'].document;
            _doc.getElementsByTagName;
        }catch(e){
//            _doc = w.document;
            return w;
        }

        if(options.locate=='document' || _doc.getElementsByTagName('frameset').length >0){
//            _doc = w.document;
            return w;
        }

        return w['top'];
    }

    $.extend({
        /**
         *
         * @param options
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
            console.log('====> showWindow.')
            options = options || {};
            var target;
            var winOpts = $.extend({},{
                iconCls:'icon-form',
                useiframe: false,
                locate: 'top',
                data: undefined,
                width: 500,
                height: 400,
                minimizable: true,
                maximizable: true,
                collapsible: true,
                resizable: true,
                onClose: function(){target.panel('destroy');}
            }, options);


            var callbackArguments={
                getData: function(name){
                    return winOpts.data ? winOpts.data[name]:null;
                },
                close: function(){
                    target.panel('close');
                }
            };
            if(/^url:/.test(winOpts.content)){
                var url = winOpts.content.substr(4, winOpts.content.length);
                if(winOpts.useiframe){
                    var iframe = $('<iframe>')
                        .attr('height', '98%')
                        .attr('width', '100%')
                        .attr('marginheight', 0)
                        .attr('marginwidth', 0)
                        .attr('frameborder', 0);

                    setTimeout(function(){
                        iframe.attr('src', url);
                    }, 10);

                }else{
                    winOpts.href = url;
                    var onLoadCallback = winOpts.onLoad;
                    winOpts.onLoad = function(){
                        onLoadCallback && onLoadCallback();
                    }
                }

                delete winOpts.content;
            }


            var warpHandler = function(handler){
                if(typeof handler == 'function'){
                    return function(){
                        handler(callbackArguments);
                    };
                }

                if(typeof handler == 'string' && winOpts.useiframe){
                    return function(){
                        iframe[0].contentWindow[handler](callbackArguments);
                    }
                }
            }

            //处理toolbar数组对象
            if(winOpts.toolbar && $.isArray(winOpts.toolbar)){
                $.each(winOpts.toolbar, function(i, button){
                    button.handler = warpHandler(button.handler);
                });
            }

            //处理buttons数组对象
            if(winOpts.buttons && $.isArray(winOpts.buttons)){
                $.each(winOpts.buttons, function(i, button){
                    button.handler = warpHandler(button.handler);
                });
            }

            if(winOpts.locate == 'top' || winOpts.locate == 'document'){
                var _top = getTop(window, winOpts);
                if(winOpts.useiframe && iframe){
                    var _this = this;
                    iframe.bind('load', function(){
                        _this.body = iframe[0].contentWindow;
                        winOpts.onLoad && winOpts.onLoad.call(_this, callbackArguments);
                    });

                    target = _top.$('<div>').append(iframe).dialog(winOpts);
                }else{
                    target = _top.$('<div>').dialog(winOpts);
                }
            }else{
               var locate = /^#/.test(winOpts.locate)? winOpts.locate:'#'+winOpts.locate;
                target = $('<div>').appendTo(locate).dialog($.extend({}, winOpts, {inline: true}));
            }


        },
        showModalDialog: function(options){
            console.log('===>showModalDialog');
            options = options || {};
            var opts = $.extend({}, options, {modal: true, minimizable: false, maximizable: false, resizable: false, collapsible: false});
            $.showWindow(opts);
        }
    })
})(jQuery);
