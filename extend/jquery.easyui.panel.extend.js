/**
 * Created with IntelliJ IDEA.
 * @author: 爱看书不识字<zjh527@163.com>
 *
 * depend on:
 *  jquery.easyui.toolbar.extend.js
 *
 *
 * 扩展如下：
 *  1、增加toolbar
 *      1.1 控制属性
 *          toolbar: {
 *              buttonPosition:     toolbar按钮放置位置，值: left|right ，默认left
 *              data:               构建toolbar按钮数据, 数据格式参考 easyui-window或easyui-datagrid toolbar数据结构
 *          }
 *
 *          其中 toolbar属性可以是个字符串，当是字符串时表示被当作toolbar显示的Dom元素的id, 字符串格式： #id
 *
 *
 *      1.2 显示toolbar
 *          $('#p').panel({
 *              width: 500,
 *              height: 150,
 *              title: 'Panel',
 *              customAttr: {
 *                  toolbar: {
 *                      data: [{
 *                          text: 'Add',
 *                          iconCls: 'icon-add',
 *                          handler: function(){}
 *                      },'-',{
 *                          text: 'Reload',
 *                          iconCls: 'icon-reload',
 *                          handler: function(){}
 *                      }]
 *                  }
 *              }
 *          }).panel('followCustomHandle');
 *
 *
 *
 *      1.3 显示复杂toolbar
 *          $('#p').panel({
 *              width: 500,
 *              height: 150,
 *              title: 'Panel',
 *              customAttr: {
 *                  toolbar: '#tb'
 *              }
 *          });
 *
 *          <div id='tb'>
 *              <a href='#' class='easyui-linkbutton' data-options=''>Delete</a>
 *          </div>
 *
 *
 *
 */
(function($){
    function initToolbar(target){
        var options = $.extend(true, {}, $.fn.panel.defaults, $(target).panel('options'));
        var toolbar = options.customAttr.toolbar;
        if(!toolbar) return;

        var body = $(target).panel('body');
        if(typeof toolbar == 'string'){
            $(toolbar).addClass('dialog-toolbar panel-body').insertBefore(body);
            $(toolbar).show();
        }else{
            var tb = $('<div></div>').insertBefore(body);
            tb.toolbar(toolbar);
        }
    }

    $.fn.panel.defaults.customAttr = {
        toolbar: {
            buttonPosition: 'left',
            data: undefined
        }
    };

    $.extend($.fn.panel.methods, {
        followCustomHandle: function(jq){
            return jq.each(function(){
                initToolbar(this);
            });
        }
    });
})(jQuery);

