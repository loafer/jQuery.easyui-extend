/**
 * Created with IntelliJ IDEA.
 * @author: 爱看书不识字<zjh527@163.com>
 *
 *
 * 扩展如下：
 * 1、当满足特定条件（multiple=false 且 editable=false）时支持联动处理。
 *
 * 2、联动数据支持本地数据联动和服务端数据联动，默认服务端数据。
 *
 * ================  服务端数据联动  ===================
 *  2.1服务端数据联动
 *      2.1.1 使用被联动combobox组件的url查询数据
 *          a.主combobox控件：
 *              $('#ccb1').combobox({
 *                  valueField: 'id',
 *                  textField: 'text',
 *                  editable: false,
 *                  url: '../combobox/combobox_data1.json',
 *                  customAttr:{
 *                      headervalue: '--请选择--',
 *                      slave:{
 *                          id: 'ccb2'  //与其联动的combobox组件id
 *                      }
 *                  }
 *              }).combobox('followCustomHandle');
 *
 *          b.从（被联动）combobox组件 ：
 *              $('#ccb2').combobox({
 *                  valueField: 'id',
 *                  textField: 'text',
 *                  editable: false,
 *                  url: 'search.php',
 *                  customAttr:{
 *                      headervalue: '--请选择--',
 *                  }
 *              });
 *
 *     2.1.2  主控件中指定从（被联动）控件数据获取来源：
 *          a.主combobox组件:
 *              $('#ccb1').combobox({
 *                  valueField: 'id',
 *                  textField: 'text',
 *                  editable: false,
 *                  url: '../combobox/combobox_data1.json',
 *                  customAttr:{
 *                      headervalue: '--请选择--',
 *                      slave:{
 *                          id: 'ccb2', //与其联动的combobox组件id
 *                          url: 'search.php'
 *                      }
 *                  }
 *              })
 *
 *          b.从（被联动）combobox组件：
 *              $('#ccb2').combobox({
 *                  valueField: 'id',
 *                  textField: 'text',
 *                  editable: false,
 *                  customAttr:{
 *                      headervalue: '--请选择--',
 *                  }
 *              });
 *
 *
 *  2.2 本地数据联动
 *      2.2.1 使用示例
 *          a.主combobox组件:
 *              $('#ccb1').combobox({
 *                  valueField: 'id',
 *                  textField: 'text',
 *                  editable: false,
 *                  url: '../combobox/combobox_data2.json', //指定联动数据来源
 *                  customAttr:{
 *                      headervalue: '--请选择--',
 *                      slave:{
 *                          id: 'ccb2',
 *                          remote: false
 *                      }
 *                  }
 *              });
 *
 *          b.从（被联动）combobox组件：
 *              $('ccb2').combobox({
 *                  valueField: 'id',
 *                  textField: 'text',
 *                  editable: false,
 *                  customAttr:{
 *                      headervalue: '--请选择--'
 *                  }
 *              });
 *
 * 3、服务端数据联动无联动级数限制，本地数据联动级数受本地数据结构限制(数据结构请参照 demo/combobox/combobox_data2.json)。
 *
 * 4、本地数据联动中，联动链上的数据来源于联动链上的第一个combobx。
 *
 * 5、一个主combobox组件只有一个从级(被级联)combobox组件。
 *
 * 6、支持主combobox组件调用clear方法清除被选数据时，从(被级联)combobox组件清空组件data属性。
 *
 * 7、调用followCustomHandle此方法之后，以上自定义功能才会生效。
 *
 */
(function($){
    function slaveHandle(target){
        var optioins = $.extend(true, {}, $.fn.combobox.defaults, $(target).combobox('options'));
        var slaveOptions = optioins.customAttr.slave;
        if(slaveOptions.id == null) return;
        if(/^#/.test(slaveOptions.id)){
            slaveOptions.id = slaveOptions.id;
        }else{
            slaveOptions.id = '#'+slaveOptions.id;
        }


        if(!optioins.multiple && !optioins.editable){
            var onSelectCallback = optioins.onSelect;
            $(target).combobox({
                onSelect: function(record){
                    onSelectCallback.call(target, record);
                    loadSlaveData(target, slaveOptions, record);
                }
            });

            var onChangeCallback = optioins.onChange;
            $(target).combo({
                onChange: function(newValue, oldValue){
                    onChangeCallback.call(target, newValue, oldValue);
                    if(newValue == null || newValue ==''){
                        $(slaveOptions.id).combobox('clear').combobox('loadData',[]);
                        $(target).combo('textbox').trigger('blur');
                    }
                }
            })
        }

    }

    function loadSlaveData(target, slaveOpts, record){
        if(slaveOpts.remote){
            var url = slaveOpts.url || $(slaveOpts.id).combobox('options').url;
            if(url.indexOf("?")>-1){
                url += '&swd='+$(target).combobox('getValue');
            }else{
                url += '?swd='+$(target).combobox('getValue');
            }
            $(slaveOpts.id).combobox('reload', url);
        }else{
            $(slaveOpts.id).combobox('loadData', record.data);
        }
    }

    function fixShowHeaderValue(target){
        var optioins = $(target).combobox('options');
        var opts = $.extend(true, {}, $.fn.combobox.defaults, optioins);
        if(!opts.customAttr.headervalue) return;
        var onLoadSuccessCallback = optioins.onLoadSuccess;
        $(target).combobox({
            onLoadSuccess: function(){
                onLoadSuccessCallback.call(target);
                $(target).combo('textbox').trigger('blur');
            }
        })
    }


    $.fn.combobox.defaults.customAttr={
        slave:{
            id: null,
            remote: true,
            url: null
        }
    };


    $.extend($.fn.combobox.methods,{
        followCustomHandle: function(jq){
            return jq.each(function(){
                $(this).combo('followCustomHandle');
                fixShowHeaderValue(this);
                slaveHandle(this);
            });
        }
    });
})(jQuery);
