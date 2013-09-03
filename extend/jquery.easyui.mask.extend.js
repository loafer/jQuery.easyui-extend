/**
 * Created with IntelliJ IDEA.
 * Created with IntelliJ IDEA.
 * Licensed under the GPL licenses
 * http://www.gnu.org/licenses/gpl.txt
 * @author: 爱看书不识字<zjh527@163.com>
 *
 * 扩展说明：
 *  1、maskt 显示遮罩
 *      1.1 参数说明
 *          target:     要加载遮罩的目标对象
 *          loadMsg:    遮罩显示信息
 *
 *
 *  2、unmask 关闭遮罩
 *      2.1 参数说明
 *          target:     要加载遮罩的目标对象
 *
 */
(function($){
    function addCss(id, content){
        if($('#' + id).length > 0) return;
        return $('<style>' + content + '</style>').attr('id', id).attr('type', 'text/css').appendTo('head');
    }

    $.extend({
        mask: function(opts){
            opts = opts || {};
            var options = $.extend({}, {target: 'body', loadMsg: $.fn.datagrid.defaults.loadMsg}, opts);
            this.unmask(options);

            if(options.target != 'body' && $(options.target).css('position') == 'static'){
                $(options.target).addClass('mask-relative');
            }

            var mask = $("<div class=\"datagrid-mask\" style=\"display:block;\"></div>").appendTo(options.target);
            var msg = $("<div class=\"datagrid-mask-msg\" style=\"display:block; left: 50%;\"></div>").html(options.loadMsg).appendTo(options.target);
            setTimeout(function(){
                msg.css("marginLeft", -msg.outerWidth() / 2);
            }, 5);

            var css = '.mask-relative {position: relative !important;}';
            addCss('mask_css', css);
        },
        unmask: function(options){
            var target = options.target || 'body';
            $(">div.datagrid-mask-msg", target).remove();
            $(">div.datagrid-mask", target).remove();
            $(options.target).removeClass('mask-relative');
        }
    });
})(jQuery);
