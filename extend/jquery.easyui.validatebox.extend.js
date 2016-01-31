/**
 * Created with IntelliJ IDEA.
 * Licensed under the GPL licenses
 * http://www.gnu.org/licenses/gpl.txt
 * @author: 爱看书不识字<zjh527@163.com>
 *
 *
 */
(function($){
    function bindEvent(target){
        var box = $(target);
        var state = $.data(target, "validatebox");

        box.unbind(".validatebox");
        if(state.options.novalidate){
            return;
        }

        box.bind("focus.validatebox", function(){
            state.validating = true;
            state.value = undefined;
            (function(){
                if(state.validating){
                    if(state.value != box.val()){
                        state.value = box.val();
                        if(state.timer){
                            clearTimeout(state.timer);
                        }
                        state.timer = setTimeout(function(){
                            $(target).validatebox("validate");
                        },state.options.delay);
                    }else{
                        repositionTip(target);
                    }
                    setTimeout(arguments.callee, 200);
                }
            })();
        }).bind("blur.validatebox",function(){
            if(state.timer){
                clearTimeout(state.timer);
                state.timer = undefined;
            }
            state.validating = false;
            hideTip(target);
        }).bind("mouseenter.validatebox",function(){
            if(box.hasClass("validatebox-invalid")){
                showTip(target);
            }
        }).bind("mouseleave.validatebox",function(){
            if(!state.validating){
                hideTip(target);
            }
        });
    }

    function showTip(target){
        var state = $.data(target,"validatebox");
        var options = state.options;
        $(target).tooltip($.extend({}, options.tipOptions, {
            content: state.message,
            position: options.tipPosition,
            deltaX: options.deltaX
        })).tooltip("show");
        state.tip=true;
    }

    function repositionTip(target){
        var state = $.data(target,"validatebox");
        if(state && state.tip){
            $(target).tooltip("reposition");
        }
    }

    function hideTip(target){
        var state = $.data(target,"validatebox");
        state.tip = false;
        $(target).tooltip("hide");
    }

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
        ,english:{
            validator : function(value) {
                return /^[A-Za-z]+$/i.test(value);
            }
        }
        ,code: {
            validator : function(value) {
                return /^[A-Za-z0-9_\-]+$/i.test(value);
            }
        }
    });


    if($.fn.validatebox){
        $.fn.validatebox.defaults.rules.minLength.message = '请至少输入{0}个字符。';
        $.fn.validatebox.defaults.rules.equals.message = '字段不匹配';
        $.fn.validatebox.defaults.rules.english.message = '请输入英文字母（大小写不限）';
        $.fn.validatebox.defaults.rules.code.message = '请输入英文字母（大小写不限）、数字、_或-';
    }


//    $.fn.validatebox.defaults.rules.minLength.message = '请至少输入{0}个字符。';
//    $.fn.validatebox.defaults.rules.equals.message = '字段不匹配';
//    $.fn.validatebox.defaults.rules.english.message = '请输入英文字母（大小写不限）';
//    $.fn.validatebox.defaults.rules.code.message = '请输入英文字母（大小写不限）、数字、_或-';
})(jQuery);
