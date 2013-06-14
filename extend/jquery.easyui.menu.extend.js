/**
 * Created with IntelliJ IDEA.
 * @author: 爱看书不识字<zjh527@163.com>
 *
 *
 * 扩展如下：
 * 1、增加方法appendItems，支持批量添加。
 * 2、支持将'-'转化为分割符，类似datagrid.toolbar。
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


    $.extend($.fn.menu.methods, {
        followCustomHandle: function(jq){

        },
        appendItems: function(jq, param){
            return jq.each(function(){
                appendItems(this, param);
            });
        }
    });
})(jQuery);