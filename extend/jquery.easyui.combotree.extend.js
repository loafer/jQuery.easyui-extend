/**
 * Created with IntelliJ IDEA.
 * @author: 爱看书不识字<zjh527@163.com>
 *
 * 扩展如下:
 *  1、支持简单数据加载，加载方式参考tree的设置
 */
(function($){
    $.extend($.fn.combotree.methods, {
        followCustomHandle: function(jq){
            return jq.each(function(){
//                $(this).combotree('tree').tree('followCustomHandle');
//                $(this).combo('followCustomHandle');
            });
        }
    });
})(jQuery);
