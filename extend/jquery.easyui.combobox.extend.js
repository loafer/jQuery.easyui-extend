/**
 * Created with IntelliJ IDEA.
 * Licensed under the GPL licenses
 * http://www.gnu.org/licenses/gpl.txt
 * @author: 爱看书不识字<zjh527@163.com>
 *
 *
 * depend on:
 *  jquery.easyui.validatebox.extend.js
 *  jquery.easyui.combo.extend.js
 *
 *
 * 扩展如下：
 * 1、当满足特定条件（multiple=false 且 editable=false）时支持联动处理。
 *
 * 2、联动数据支持本地数据联动和服务端数据联动，默认服务端数据。
 *
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
 * 8、新增方法 addEventListener ,用于初始化之后动态注册事件，支持一个事件可以注册多个处理方法。
 *      8.1 事件对象属性说明
 *          name:       事件名称
 *          override:   是否覆盖事件默认处理行为，值: true|false，默认:false
 *          handler:    定义事件处理行为
 *
 *
 *      8.2 单个事件处理方法注册
 *          $('#cc').combobox('addEventListener', {
 *              name: 'onSelect',
 *              handler: function(record){}
 *          });
 *
 *      8.3 多个事件处理方法注册
 *          $('#cc').combobox('addEventListener', [{
 *              name: 'onChange',
 *              handler: function(newValue, oldValue){}
 *          },{
 *              name: 'onSelect',
 *              handler: function(record){}
 *          }]);
 *
 *      8.4 覆盖事件默认处理行为
 *          $('#cc').combobox('addEventListener', {
 *              name: 'onSelect',
 *              override: true,
 *              handler: function(record){}
 *          });
 *
 *
 * 9、增加 getSelected 方法， 返回选中item的data值
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

            $(target).combobox('addEventListener', [{
                name: 'onSelect',
                handler: function(record){
                    loadSlaveData(target, slaveOptions, record, optioins.valueField);
                }
            },{
                name: 'onChange',
                handler: function(newValue, oldValue){
                    if(newValue == null || newValue ==''){
                        $(slaveOptions.id).combobox('clear').combobox('loadData',[]);
                        $(target).combobox('textbox').trigger('blur');
                    }
                }
            }]);
        }

    }

    function loadSlaveData(target, slaveOpts, record, valueField){
        if(slaveOpts.remote){
            var url = slaveOpts.url || $(slaveOpts.id).combobox('options').url;
            if(url.indexOf("?")>-1){
                url += '&swd=' + record[valueField];
            }else{
                url += '?swd=' + record[valueField];
            }
            $(slaveOpts.id).combobox('clear').combobox('reload', url);
        }else{
            $(slaveOpts.id).combobox('clear').combobox('loadData', record.data);
        }
    }

    function fixShowHeaderValue(target){
        var optioins = $(target).combobox('options');
        var opts = $.extend(true, {}, $.fn.combobox.defaults, optioins);
        if(!opts.customAttr.headervalue) return;


        $(target).combobox('setText', opts.customAttr.headervalue)
            .combobox('addEventListener', {
            name: 'onLoadSuccess',
            handler: function(){
                $(target).combobox('textbox').trigger('blur');
            }
        });
    }

    function addEventListener(target, eventName, handler, override){
        var options = $(target).combobox('options');
        var defaultActionEvent = options[eventName];
        switch (eventName){
            case 'onBeforeLoad':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(param){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onLoadSuccess':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onLoadError':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onSelect':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(record){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onUnselect':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(record){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            default :
                $(target).combo('addEventListener', {
                    name: eventName,
                    override: override,
                    handler: handler
                });
                break;
        }
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
            return jq.each(function(){});
        },
        addEventListener: function(jq, param){
            return jq.each(function(){
                var eventList = $.isArray(param) ? param : [param];
                var target = this;
                $.each(eventList, function(i, event){
                    addEventListener(target, event.name, event.handler|| function(){}, event.override);
                });
            });
        },
        getSelected: function(jq){
            var options = jq.combobox('options');
            var key = options.valueField;
            var value = jq.combobox('getValue');
            var data = jq.combobox('getData');

            for(var i=0; i<data.length; i++){
                var item = data[i];
                if(item[key] == value){
                    return item;
                }
            }

            return null;
        }
    });

    var plugin = $.fn.combobox;
    $.fn.combobox = function(options, param){
        if (typeof options != 'string'){
            return this.each(function(){
                plugin.call($(this), options, param);
                fixShowHeaderValue(this);
                slaveHandle(this);
            });
        } else {
            return plugin.call(this, options, param);
        }
    };

    $.fn.combobox.methods = plugin.methods;
    $.fn.combobox.defaults = plugin.defaults;
    $.fn.combobox.parseOptions = plugin.parseOptions;
    $.fn.combobox.parseData = plugin.parseData;
})(jQuery);
