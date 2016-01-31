/**
 * Created with IntelliJ IDEA.
 * Licensed under the GPL licenses
 * http://www.gnu.org/licenses/gpl.txt
 * @author: 爱看书不识字<zjh527@163.com>
 *
 *
 * 扩展如下：
 * 1、增加方法appendItems，支持批量添加。
 * 2、支持将'-'转化为分割符，类似datagrid.toolbar。
 * 3、新增方法 addEventListener，用于初始化之后动态注册事件，支持一个事件可以注册多个处理方法。
 *      3.1 参数说明：
 *          name:       事件名称
 *          override:   是否覆盖默认事件处理, 值: true|false, 默认:false
 *          handler:    事件处理方法
 *
 *
 *      3.1 单个事件处理方法注册
 *          $('#mm').menu('addEventListener', {
 *              name: 'onClick',
 *              handler: function(item){}
 *          });
 *
 *
 *      3.2 多个事件处理方法注册
 *          $('#mm').menu('addEventListener', [{
 *              name: 'onClick',
 *              handler: function(item){}
 *          },{
 *              name: 'onShow',
 *              handler: function(){}
 *          }]);
 *
 *
 *      3.4 覆盖事件默认处理方法
 *          $('#mm').menu('addEventListener', {
 *              name: 'onClick',
 *              override: true,
 *              handler: function(item){}
 *          });
 *
 *
 */
(function($){
    function appendItems(target, submenu, parentEl){
        if(submenu && $.isArray(submenu)){
            $.each(submenu, function(){
                var item = this;

                var parent = {};
                if(parentEl){
                    $.extend(parent, {parent: parentEl});
                }

                if($.isPlainObject(item)){
                    $(target).menu('appendItem', $.extend(item, parent));

                    if(item.submenu){
                        var p = $(target).menu('findItem', item.text);
                        appendItems(target, item.submenu, p.target);
                    }
                }else if(item == '-'){
                    var el = $(target).menu('appendItem', $.extend({text: item}, parent)).menu('findItem', item).target;
                    $(el).removeClass('menu-item').addClass('menu-sep').removeAttr('style').empty();
                }
            });
        }
    }

    function addEventListener(target, eventName, handler, override){
        var options = $(target).menu('options');
        var defaultActionEvent = options[eventName];
        switch (eventName){
            case 'onShow':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onHide':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onClick':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(item){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            default :
                break;
        }
    }


    $.extend($.fn.menu.methods, {
        followCustomHandle: function(jq){
            return this.each(function(){});
        },
        appendItems: function(jq, param){
            return jq.each(function(){
                appendItems(this, param);
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
