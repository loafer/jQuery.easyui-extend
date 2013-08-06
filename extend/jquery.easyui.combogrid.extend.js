/**
 * Created with IntelliJ IDEA.
 * @author: 爱看书不识字<zjh527@163.com>
 *
 * 扩展如下:
 *  1、增加方法 getSelected ，直接返回选中item的data值。
 */
(function($){

    $.extend($.fn.combogrid.methods,{
        getSelected: function(jq){
            return jq.combogrid('grid').datagrid('getSelected');
        }
    });
})(jQuery);
