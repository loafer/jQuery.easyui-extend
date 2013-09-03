/**
 * Created with IntelliJ IDEA.
 * Licensed under the GPL licenses
 * http://www.gnu.org/licenses/gpl.txt
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
        var tb = $(target).addClass('datagrid-toolbar').css({
            'border-top-width': 1
        });

        tb.append('<table cellspacing=\"0\" cellpadding=\"0\"><tr></tr></table>');
        if(options.buttonPosition == 'right'){
            tb.find('table').css('float', 'right');
        }

        if(options.data){
            addItems(target, options.data);
        }else{
            options.loader.call(target, function(data){
                options.data = data;
                addItems(target, options.data);
            }, function(){
               options.onLoadError.apply(target, arguments);
            });
        }
    }

    function add(target, item){
        var tr = $(target).find('tr');
        if(typeof item == 'string' && $.trim(item) == '-'){
            $('<td><div class=\"dialog-tool-separator\"></div></td>').appendTo(tr);
        }else{
            if($.trim(item.text) == '-'){
                $('<td><div class=\"dialog-tool-separator\"></div></td>').appendTo(tr);
            }else{
                var td = $('<td></td>').appendTo(tr);
                var button = $("<a href=\"javascript:void(0)\"></a>").appendTo(td);
                button[0].onclick = eval(item.handler || function () {});
                button.linkbutton($.extend({}, item, {plain: true}));
            }
        }
    }

    function addItems(target, items){
        if(!$.isArray(items)) return;
        for(var i=0; i<items.length; i++){
            add(target, items[i]);
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
                addItems(this, items);
            });
        }
    }

    $.fn.toolbar.defaults = {
        data: null,
        url: undefined,
        buttonPosition: 'left',
        loader: function(success, error){
            var options = $(this).toolbar('options');
            $.ajax({
                type: 'POST',
                url: 'toolbar_data.json',
                dataType: 'json',
                success: function(data){
                    success(data);
                },
                error: function(){
                    error.apply(this, arguments);
                }
            });
        },
        onLoadError: function(){}
    }
})(jQuery);
