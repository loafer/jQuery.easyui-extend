/**
 * Created with IntelliJ IDEA.
 * @author: 爱看书不识字<zjh527@163.com>
 */
(function($){
    /**
     *
     * @requires jQuery,EasyUI
     *
     * 防止panel/window/dialog组件超出浏览器边界
     * @param left
     * @param top
     */
    var easyuiPanelOnMove = function(left, top) {
        var l = left;
        var t = top;
        if (l < 1) {
            l = 1;
        }
        if (t < 1) {
            t = 1;
        }
        var width = parseInt($(this).parent().css('width')) + 14;
        var height = parseInt($(this).parent().css('height')) + 14;
        var right = l + width;
        var buttom = t + height;
        var browserWidth = $(window).width();
        var browserHeight = $(window).height();
        if (right > browserWidth) {
            l = browserWidth - width;
        }
        if (buttom > browserHeight) {
            t = browserHeight - height;
        }
        $(this).parent().css({/* 修正面板位置 */
            left : l,
            top : t
        });
    };
    $.fn.dialog.defaults.onMove = easyuiPanelOnMove;
    $.fn.window.defaults.onMove = easyuiPanelOnMove;
    $.fn.panel.defaults.onMove = easyuiPanelOnMove;


    /**
     * 销毁所有panel下的iframe
     */
    $.fn.panel.defaults = jQuery.extend({},
        $.fn.panel.defaults,
        {
            onBeforeDestroy: function(){
                var frame=$('iframe', this);
                if(frame.length>0){
                    frame[0].contentWindow.document.write('');
                    frame[0].contentWindow.close();
                    frame.remove();
//                    if($.browser.msie){
//                        CollectGarbage();
//                    }
                    if(navigator.userAgent.indexOf('MSIE')>0){
                        CollectGarbage();
                    }
                }
            }
        });
})(jQuery);
