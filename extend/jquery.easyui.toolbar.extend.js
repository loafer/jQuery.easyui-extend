/**
 * Created with IntelliJ IDEA.
 * @author: 爱看书不识字<zjh527@163.com>
 *
 *
 *
 * 扩展说明：
 *  1、Toolbar
 *      1.1 控制属性
 *          data:   类型：数组， 数据格式请参考easyui-datagrid和easyui-dialog的toolbar
 *          buttonPosition: toolbar中按钮位置，其值：left|right
 *
 *      1.2 显示
 *          $('#').toolbar({
 *              data: [{
 *                  text: 'save',
 *                  iconCls: 'icon-save',
 *                  handler: function(){}
 *              },'-',{
 *                  text: 'delete',
 *                  iconCls: 'icon-delete',
 *                  handler: function(){}
 *              }]
 *          });
 *
 *
 */
(function($){
    function init(target){
        var options = $(target).toolbar('options');
        var tb = $(target).addClass('dialog-toolbar panel-body');

        if(options.data || options.url){
            tb.append('<table cellspacing=\"0\" cellpadding=\"0\"><tr></tr></table>');
            if(options.buttonPosition == 'right'){
                tb.find('table').css('float', 'right');
            }

            if($.isArray(options.data)){
                add(target, options.data);
            }

//            if($.trim(options.url) != ''){
//                options.loader.call(this, function(data){
//                    add(target, data);
//                }, function(){});
//            }
        }
    }

    function add(target, items){
        var tr = $(target).find('tr');
        for(var i=0; i<items.length; i++){
            var item = items[i];
            if(item == '-'){
                $('<td><div class=\"dialog-tool-separator\"></div></td>').appendTo(tr);
            }else{
                var td = $('<td></td>').appendTo(tr);
                var button = $("<a href=\"javascript:void(0)\"></a>").appendTo(td);
                button[0].onclick = eval(item.handler || function(){});
                button.linkbutton($.extend({}, item, {plain: true}));
            }
        }
    }

    $.fn.toolbar = function(options, param){
        if(typeof options == 'string'){
            return $.fn.toolbar.methods[options](this, param);
        }

        options = options || {};
        return this.each(function(){
            var state = $.data(this, 'toolbar');
            if(state){
                $.extend(state.options, options);
            }else{
                $.data(this, 'toolbar', {
                    options: $.extend({}, $.fn.toolbar.defaults, $.parser.parseOptions(this), options)
                });
                init(this);
            }
        });
    }

    $.fn.toolbar.methods = {
        options: function(jq){
            return $.data(jq[0], 'toolbar').options;
        },
        add: function(jq, items){
            return jq.each(function(){
                add(this, items);
            });
        }
    }

    $.fn.toolbar.defaults = {
        data: null,
        url: undefined,
        buttonPosition: 'left'
//        loader: function(success, error){
//            var options = $(this).toolbar('options');
//            $.ajax({
//                type: 'POST',
//                cache: false,
//                url: options.url,
//                dataType: 'json',
//                success: function(data){
//                    success(data);
//                },
//                error: function(){error.apply(this, arguments);}
//            });
//        }
    }
})(jQuery);
