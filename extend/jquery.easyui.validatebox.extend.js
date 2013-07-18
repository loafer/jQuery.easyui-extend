/**
 * Created with IntelliJ IDEA.
 * Licensed under the GPL licenses
 * http://www.gnu.org/licenses/gpl.txt
 * @author: 爱看书不识字<zjh527@163.com>
 *
 *
 */
(function($){

    $.extend($.fn.validatebox.defaults.rules, {
        unequal: {
            validator: function(value, param){
                return value != param;
            },
            message: $.fn.validatebox.defaults.missingMessage
        }
        ,minLength: {
            validator: function(value, param){
                return value.length >= param[0];
            }
        }
        ,equals: {
            validator: function(value, param){
                if(/^#/.test(param)){
                    return value == $(param).val();
                }else{
                    return value == param;
                }
            }
        }
    });


    if($.fn.validatebox){
        $.fn.validatebox.defaults.rules.minLength.message = '请至少输入{0}个字符。';
        $.fn.validatebox.defaults.rules.equals.message = '字段不匹配';
    }
})(jQuery);
