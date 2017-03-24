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
/**
 * Created with IntelliJ IDEA.
 * Licensed under the GPL licenses
 * http://www.gnu.org/licenses/gpl.txt
 * @author: 爱看书不识字<zjh527@163.com>
 *
 * depend on:
 *  jquery.easyui.validatebox.extend.js
 *
 *
 * 扩展如下：
 * 1、自定义组件默认提示信息。
 *      1.1 提示信息显示控制：
 *          $('#cc').combo({
 *              customAttr:{
 *                  headervalue: '--请选择--'
 *              }
 *          })
 *
 *
 * 2、修改clear方法，使其调用时可出发onChange事件。
 *
 * 3、修改getValue方法，将原有返回值中的undefined改成null，方便后台程序处理。
 *
 * 4、编辑模式下支持自动完成功能。 默认当输入第3个字符时触发,后台可通过查询"wd"参数取得前台提交的值。
 *      4.1 控制设置
 *          $('#cc').combo({
 *              customAttr:{
 *                  autocomplete:{
 *                      enabled: true,  //开启此功能
 *                      minLength: 3,   //设置触发字符长度
 *                      url: 'search.action' //数据来源
 *                  }
 *              }
 *          })
 *
 *      4.2 数据格式：
 *          [{
 *              "id": 1,
 *              "text": "Java"
 *          },{
 *              "id": 2,
 *              "text": "Ruby"
 *          }]
 *          其中id 、 text 分别对应combo的value和text属性
 *
 * 5、以上扩展属性和方法都可以被继承自combo的组件所获得。
 *
 * 6、新增 addEventListener 方法，用于初始化之后动态注册事件，支持一个事件可以注册多个处理方法。
 *      6.1 事件对象属性说明
 *          name:       事件名称
 *          override:   是否覆盖事件默认处理行为,值：true|false ,默认:false
 *          handler:    事件处理行为
 *
 *      6.2 单个事件处理方法注册
 *          $('#cc').combo('addEventListener', {
 *              name: 'onChange',
 *              handler: function(newValue, oldValue){}
 *          });
 *
 *
 *      6.3 多个事件处理方法注册
 *          $('#cc').combo('addEventListener', [{
 *              name: 'onShowPanel',
 *              handler: function(){}
 *          },{
 *              name: 'onHidePanel',
 *              handler: function(){}
 *          }]);
 *
 *
 *      6.4 覆盖事件默认处理行为
 *          $('#cc').combo('addEventListener', {
 *              name: 'onChange',
 *              override: true,
 *              handler: function(newValue, oldValue){}
 *          });
 *
 *
 */
(function($){

    function showHeaderValue(target){
        var optioins = $.data(target, 'combo').options;
        var opts = $.extend(true, {}, $.fn.combo.defaults, optioins);
        if(!opts.customAttr.headervalue) return;

        if(optioins.required){
            var validType = ['unequal["'+opts.customAttr.headervalue+'"]'];
            if(optioins.validType){
                if(typeof optioins.validType == 'string'){
                    validType.push(optioins.validType);
                    optioins.validType = validType;
                }

                if($.isArray(optioins.validType)){
                    $.merge(optioins.validType, validType)
                }
            }else{
                $.extend(optioins, {validType: validType});
            }
        }

        $(target).combo('addEventListener',{
            name: 'onChange',
            handler: function(newValue, oldValue){
                if(newValue == null || newValue == '') $(target).combo('setText', opts.customAttr.headervalue);
            }
        }).combo('textbox')
            .val(opts.customAttr.headervalue)
            .attr('prompt', opts.customAttr.headervalue)
            .focus(function(){
                if($(this).val() == opts.customAttr.headervalue) $(this).val('');
            })
            .blur(function(){
                if($.trim($(this).val())=='') $(this).val(opts.customAttr.headervalue);
                $(target).combo('validate');
            });
    }

    /**
     * 重写clear方法，目的是为了触发onChange事件，原生clear不触发onChange事件
     * @param target
     */
    function clear(target){
        var value = $(target).combo('getValue');
        if(!value) return;

        var options = $.data(target, "combo").options;
        $(target).combo('setText', '');
        if(options.multiple){
            $(target).combo('setValues', []);
        }else{
            $(target).combo('setValue', '');
        }
    }

    function getValue(target){
        var values = $(target).combo('getValues');
        return values.length>0?(values[0]!=''?values[0]:null):null;
    }

    function autocompleteHandle(target){
        var optioins = $.extend(true, {}, $.fn.combo.defaults, $.data(target, 'combo').options);
        var autocompleteOpts = optioins.customAttr.autocomplete;
        if(!autocompleteOpts.enabled) return;

        $(target).combo('textbox').keyup(function(e){
            if($(this).val().length != 0 && ($(this).val().length % autocompleteOpts.minLength==0) && autocompleteOpts.url){
                $.ajax({
                    type: 'POST',
                    url: autocompleteOpts.url,
                    data: {wd: $(this).val()},
                    dataType: 'json',
                    success: function(data){
                        var panel = $(target).combo('panel').empty();
                        for(var i=0; i<data.length; i++){
                            $('<div>').addClass('combobox-item')
                                .attr('value', data[i].id)
                                .text(data[i].text)
                                .click(function(e){
                                    var v = $(this).attr('value');
                                    var s = $(this).text();
                                    $(target).combo('setValue', v).combo('setText', s).combo('hidePanel');
                                })
                                .hover(function(){
                                    $(this).addClass('combobox-item-hover');
                                }, function(){
                                    $(this).removeClass('combobox-item-hover');
                                })
                                .appendTo(panel);
                        }

                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown){
                        $.messager.alert('Error', errorThrown, 'error');
                    }
                });
            }
        });

    }

    function addEventListener(target, eventName, handler, override){
        var options = $(target).combo('options');
        var defaultActionEvent = options[eventName];
        switch (eventName){
            case 'onShowPanel':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onHidePanel':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onChange':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(newValue, oldValue){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            default :
                break;
        }
    }

    $.fn.combo.defaults.customAttr={
        headervalue: null,
        autocomplete: {
            enabled: false,
            minLength: 3,
            url: undefined
        }
    };

    $.extend($.fn.combo.methods, {
        followCustomHandle: function(jq){
            return jq.each(function(){});
        }
        ,clear: function(jq){
            return jq.each(function(){
                clear(this);
            });
        }
        ,getValue: function(jq){
            return getValue(jq[0]);
        },
        addEventListener: function(jq, param){
            return jq.each(function(){
                var eventList = $.isArray(param) ? param : [param];
                var target = this;
                $.each(eventList, function(i, event){
                    addEventListener(target, event.name, event.handler|| function(){}, event.override);
                });
            });
        }
    });

    var plugin = $.fn.combo;
    $.fn.combo = function(options, param){
        if (typeof options != 'string'){
            return this.each(function(){
                plugin.call($(this), options, param);
                showHeaderValue(this);
                autocompleteHandle(this);
            });
        } else {
            return plugin.call(this, options, param);
        }
    };

    $.fn.combo.methods = plugin.methods;
    $.fn.combo.defaults = plugin.defaults;
    $.fn.combo.parseOptions = plugin.parseOptions;
})(jQuery);
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
/**
 * Created with IntelliJ IDEA.
 * Licensed under the GPL licenses
 * http://www.gnu.org/licenses/gpl.txt
 * @author: 爱看书不识字<zjh527@163.com>
 *
 *
 * depend on:
 *  jquery.easyui.menu.extend.js
 *
 *  扩展如下：
 *  1、在column上支持右键菜单
 *  2、column右键菜单项支持自定义
 *  3、column默认右键菜单项包含：显示/隐藏列、全部显示、还原和所有列
 *  4、支持column默认右键菜单项和自定义菜单项合并控制
 *  5、row支持右键菜单
 *  6、row默认右键菜单项增加、编辑、删除、刷新、导出
 *  7、支持row右键菜单自定义
 *  8、支持row默认右键菜单项与自定义项合并
 *  9、支持分页栏属性设置
 *  10、级联操作
 *  11、支持级联操作触发条件设置
 *  12、支持类似Ext.rowediting编辑风格
 *  13、支持row显示tooltip
 *  14、支持row tooltip自定义显示风格
 *  15、增加如下editor:my97、datetimebox、numberspinner、timespinner、combogrid
 *  16、增加方法getHeaderContextMenu
 *  17、增加方法getRowContextMenu
 *  18、增加方法getEditingRow，返回当前正在编辑的row
 *  19、增加方法setPagination，设置分页栏样式
 *  20、headerContextMenu菜单项的onclick接收三个参数，依次是item, field, target。
 *      item:当前点击菜单项。
 *      field: datagrid中触发右键菜单的Column的field属性
 *      target: 当前datagrid的引用,非jQuery对象。
 *
 *      eg:
 *      $('#dg').datagrid({
 *          ....,
 *          customAttr:{
 *              headerContextMenu:{
 *                  isShow: true,
 *                  items:[{
 *                      text: 'add',
 *                      iconCls: 'icon-add',
 *                      onclick: function(item, field, target){
 *                          ......
 *                      }
 *                  }]
 *              }
 *          }
 *      })
 *
 * 21、rowContextMenu菜单项的onclick接收4个参数，依次是item, rowIndex, rowData, target 。
 *      item: 当前点击菜单项
 *      rowIndex: 触发右键菜单row的索引号
 *      rowData: 触发右键菜单row的数据项
 *      target: 当前datagrid的引用，非jQuery对象。
 *
 *      eg:
 *          $('#dg').datagrid({
 *              ......,
 *              customAttr: {
 *                  rowContextMenu: {
 *                      isShow: true,
 *                      items: [{
 *                          text: 'item1',
 *                          iconCls: 'icon-exit',
 *                          onclick: function(item, rowIndex, rowData, target){
 *                              ......
 *                          }
 *                      }]
 *                  }
 *              }
 *          });
 *
 * 22、增加deleteRows方法批量删除行。参数row，数组类型。可以是一个rowIndex数组或是一个row数组
 *
 * 23、扩展rowContextMenu onClick事件，接收参数item, rowIndex, rowData, target。 当事件返回true时，覆盖原默认行为
 *      item:       当前点击的菜单项
 *      rowIndex:   触发rowContextMenu的row索引
 *      rowData:    触发rowContextMenu的row数据
 *      target:     当前datagrid的引用，非jQuery对象
 *
 *      eg:
 *          $('#dg').datagrid('getRowContextMenu').menu({
 *              onClick: function(item, rowIndex, rowData, target){
 *                  if(item.text == 'delete'){
 *                      return true //覆盖菜单delete的默认行为,即点击delete菜单项后，无动作。
 *                  }
 *              }
 *          });
 *
 * 24、修复当列字段过长时，加载的数据个数为0时，列字段显示不全问题。
 *
 *
 * 25、新增方法 addEventListener，用于初始化之后动态注册事件，支持一个事件可以注册多个处理方法。
 *      25.1 事件对象属性说明
 *          name:       事件名称
 *          override:   是否覆盖原事件处理方法，值: true|false, 默认:false
 *          handler:    事件处理
 *
 *      25.2 单个事件处理方法注册
 *          $('#dg').datagrid('addEventListener', {
 *              name: 'onClickRow',
 *              handler: function(rowIndex, rowData){}
 *          });
 *
 *      25.3 多个事件处理方法注册
 *          $('#dg').datagrid('addEventListener', [{
 *              name: 'onLoadSuccess',
 *              handler: function(data){}
 *          },{
 *              name: 'onClickRow',
 *              handler: function(rowIndex, rowData){}
 *          }]);
 *
 *      25.4 覆盖默认事件处理方法
 *          $('#dg').datagrid('addEventListener', {
 *              name: 'onClickRow',
 *              override: true,
 *              handler: function(rowIndex, rowData){}
 *          });
 *
 *
 * 26、增加 getAllExpandRowIndex 方法，返回值：数组，用于在detailView视图下获取当前页下所有展开行索引。
 *
 * 27、增加 getExpandRowIndex 方法，返回是number,用于在detailView视图下获取当前页下第一个展开行索引。没有展开行，则返回-1.
 *
 * 28、增加 fixDetailRowWidth 方法，用于detailView视图下处理rowDetail中内容宽度，
 *      此方法主要用于在拖拽列宽度时改变rowDetail中内容宽度
 *
 *      28.1 参数说明，此方法接收一个简单对象
 *          index: row索引号，可以是一个整数或整数数组
 *          handler: 处理函数,此函数接收两个参数index:行索引 , width: header2宽度
 *
 *          eg-1.
 *              $('#dg').datagrid('fixDetailRowWidth',{
 *                  index: 1,
 *                  handler: function(index, width){
 *                      $('#sub_dg').datagrid('resize', width);
 *                  }
 *              });
 *
 *
 *         eg-2. 前提，当前展开1、2、3、4行，现修改展开这几行中嵌套datagrid的宽度
 *              $('#dg').datagrid('fixDetailRowWidth', {
 *                  index: [1,2,3,4],
 *                  handler: function(index, width){
 *                      $('#sub_dg').datagrid('resize', width);
 *                  }
 *              });
 *
 *
 * 29、 增加自定义事件 onConfirmEdit 用于 Ext.rowediting 编辑风格。
 *          a) 在点击确认按钮触发
 *          b) 当此事件返回值为false时终止 endEdit 方法执行
 *          c) 接收一个rowIndex 参数
 *
 *          $('dg').datagrid({
 *              .....
 *              customAttr: {
 *                  rowediting: true,
 *                  onConfirmEdit: function(rowIndex){
 *                      return confirm('提交修改？');
 *                  }
 *              }
 *          });
 *
 */
(function($){
    function buildContextMenu(target, menuitems, type){
        var menuid = getContextMenuId(target, type);
        var contextmenu = $('#'+menuid);
        if(contextmenu.length==0){
            contextmenu = $('<div>', {id: menuid}).menu().menu('appendItems', menuitems);
        }
        return contextmenu;
    }

    function getContextMenuId(target, surfix){
        return $(target).attr('id')+'_'+surfix;
    }

    function getMenuItemOnClickHandler(menuitems){
        var onclickHandler={};

        $.each(menuitems, function(){
            var item = this;
            if(item.onclick){
                var index = item.id || item.text;
                onclickHandler[index] = item.onclick;
                delete item.onclick;
            }

            if(item.submenu && $.isArray(item.submenu) && item.submenu.length>0){
                $.extend(onclickHandler, getMenuItemOnClickHandler(item.submenu));
            }
        });

        return onclickHandler;
    }

    function getDefaultHeaderContextMenuItems(target){
        var menuid = getContextMenuId(target, 'headerContextMenu');
        var defaultMenuItems = [{
            text: '显示/隐藏列',
            iconCls: 'icon-columns',
            submenu:[{
                id: menuid+'_showAll',
                text: '全部显示',
                iconCls: 'icon-columns',
                onclick: function(item, field, datagrid){
                    $.fn.datagrid.headerContextMenu.defaultEvents.doShowAll(datagrid);
                }
            },{
                id: menuid+'_restore',
                text: '还原',
                iconCls: 'icon-columns',
                onclick: function(item, field, datagrid){
                    $.fn.datagrid.headerContextMenu.defaultEvents.doRestore(datagrid);
                }
            },
            '-']
        }];
//        ,'-',{
//            id: menuid + '_freezeColumn',
//            text: '冻结此列',
//            iconCls: 'icon-lock',
//            disabled: true,
//            onclick: function(item, field, datagrid){
//                $.fn.datagrid.headerContextMenu.defaultEvents.freezeColumn(datagrid, field, item, true);
//            }
//        },{
//            id: menuid + '_unfreezeColumn',
//            text: '取消冻结',
//            iconCls: 'icon-unlock',
//            disabled: true,
//            onclick: function(item, field, datagrid){
//                $.fn.datagrid.headerContextMenu.defaultEvents.unfreezeColumn(datagrid, field, item);
//            }
//        }


        var getFieldFromMenuItemId = function(id){
            return id.substr(id.lastIndexOf('_')+1, id.length);
        }

        var columnFieldsItem = [];
        var frozenCloumnFields = $(target).datagrid('getColumnFields', true);
        var columnFields = $(target).datagrid('getColumnFields');
//        columnSubMenuHandle(frozenCloumnFields, true);
        columnSubMenuHandle(columnFields, false);

        function columnSubMenuHandle(columnFields, disabled){
            $.each(columnFields, function(i, field){
                if(!field || field == 'ck') return true;
                var columnOption = $(target).datagrid('getColumnOption', field);
                columnOption._hidden=columnOption.hidden;

                columnFieldsItem.push({
                    id: menuid+'_'+field,
                    text: columnOption.title,
                    disabled: disabled,
                    iconCls: columnOption.hidden?'icon-unchecked':'icon-checked',
                    onclick: function(item, fd, dg){
                        var field = getFieldFromMenuItemId(item.id);
                        var hidden = $(dg).datagrid('getColumnOption', field).hidden;
                        if(!hidden){
                            $.fn.datagrid.headerContextMenu.defaultEvents.doHideColumn(dg, field, item);
                        }else{
                            $.fn.datagrid.headerContextMenu.defaultEvents.doShowColumn(dg, field, item);
                        }
                    }
                });
            });
        }

        $.merge(defaultMenuItems[0].submenu, columnFieldsItem);

        return defaultMenuItems;
    }

    function initHeaderContextMenu(target){
        var options = $.extend(true, {}, $.fn.datagrid.defaults, $(target).datagrid('options'));
        var headerContentMenuOptions = options.customAttr.headerContextMenu;
        if(!headerContentMenuOptions.isShow) return;

        if(options.columns[0][0].checkbox){
            options.columns[0][0].field = 'ck';
        }

        var menuitems = getDefaultHeaderContextMenuItems(target);
        if(headerContentMenuOptions.isMerge){
            $.merge(menuitems, headerContentMenuOptions.items);
        }

        if(!headerContentMenuOptions.isMerge &&
                $.isArray(headerContentMenuOptions.items) &&
                    headerContentMenuOptions.items.length > 0){
            menuitems = headerContentMenuOptions.items;
        }


        var onClickHandlerCache = getMenuItemOnClickHandler(menuitems);
        var headerContextMenu = buildContextMenu(target, menuitems, 'headerContextMenu');

        $(target).datagrid('addEventListener',{
            name: 'onHeaderContextMenu',
            handler: function(e, field){
                e.preventDefault();
                headerContextMenu.menu('addEventListener', [{
                    name: 'onClick',
                    override: true,
                    handler: function(item){
                        var name = item.id || item.text;
                        if(onClickHandlerCache[name]){
                            onClickHandlerCache[name].call(this, item, field, target);
                        }
                    }
                },{
                    name: 'onShow',
                    override: true,
                    handler: function(){
//                        switchFreezeAndUnfreezeMenuItem(field, target);
                        headerContentMenuOptions.onShow && headerContentMenuOptions.onShow.call(this, field, target);
                    }
                },{
                    name: 'onHide',
                    override: true,
                    handler: function(){
                        headerContentMenuOptions.onHide && headerContentMenuOptions.onHide.call(this);
                    }
                }]).menu('show',{
                    left: e.pageX,
                    top: e.pageY
                });
            }
        });
    }

    function getDefaultRowContextMenuItems(target){
        var menuid = getContextMenuId(target, 'rowContextMenu');
        var defaultMenuItems=[{
            id: menuid + '_delete',
            text: '删除',
            iconCls: 'icon-remove',
            onclick: function(item, rowIndex, rowData, t){
                $.fn.datagrid.rowContextMenu.defaultEvents.doDelete(item, rowIndex, rowData, t);
            }
        },'-',{
            id: menuid + '_reload',
            text: '刷新',
            iconCls: 'icon-reload',
            onclick: function(item, rowIndex, rowData, t){
                $.fn.datagrid.rowContextMenu.defaultEvents.doReload(item, rowIndex, rowData, t);
            }
        },{
            id: menuid + '_reload_this_page',
            text: '刷新当前页',
            onclick: function(item, rowIndex, rowData, t){
                $.fn.datagrid.rowContextMenu.defaultEvents.doReloadThisPage(item, rowIndex, rowData, t);
            }
        }]

        return defaultMenuItems;
    }

    function initRowContextMenu(target){
        var options = $.extend(true, {}, $.fn.datagrid.defaults, $(target).datagrid('options'));
        var rowContentMenuOptions = options.customAttr.rowContextMenu;
        if(!rowContentMenuOptions.isShow) return;

        var menuitems = getDefaultRowContextMenuItems(target);
        if(rowContentMenuOptions.isMerge){
            $.merge(menuitems, rowContentMenuOptions.items);
        }

        if(!rowContentMenuOptions.isMerge &&
            $.isArray(rowContentMenuOptions.items) &&
                rowContentMenuOptions.items.length>0){
            menuitems = rowContentMenuOptions.items;
        }

        var onClickHandlerCache = getMenuItemOnClickHandler(menuitems);
        var rowContextMenu = buildContextMenu(target, menuitems, 'rowContextMenu');

        $(target).datagrid('addEventListener',{
            name: 'onRowContextMenu',
            handler: function(e, rowIndex, rowData){
                e.preventDefault();
                $(target).datagrid('selectRow', rowIndex);

                rowContextMenu.menu('addEventListener', {
                    name: 'onClick',
                    override: true,
                    handler: function(item){
                        var name = item.id || item.text;
                        if(onClickHandlerCache[name]){
                            onClickHandlerCache[name].call(this, item, rowIndex, rowData, target);
                        }
                    }
                }).menu('show', {
                    left: e.pageX,
                    top: e.pageY
                });
            }
        });
    }

    function setMasterSlave(target){
        var options = $.extend(true, {}, $.fn.datagrid.defaults, $(target).datagrid('options'));
        if(!$.isArray(options.customAttr.slaveList)) return;
        if(options.customAttr.slaveList.length == 0) return;

        var slaveOptions = {
            slaveList: options.customAttr.slaveList,
            activeSlave: options.customAttr.activeSlave
        };
        var jq = $(target);

        //{id: 'slave1', params: {name: 'slave1'}}
        var commands = [];
        for(var i in slaveOptions.slaveList){
            var cmd = {
                id: slaveOptions.slaveList[i].id,
                params:{}
            };

            var relatedfield = {}, relatedfieldName;
            if(!slaveOptions.slaveList[i].relatedfield){
                relatedfieldName = jq.datagrid('options').idField;
                relatedfield[relatedfieldName]='undefined';
            }else{
                relatedfieldName = slaveOptions.slaveList[i].relatedfield;
                relatedfield[slaveOptions.slaveList[i].relatedfield] = 'undefined';
            }

            $.extend(cmd.params, relatedfield, slaveOptions.slaveList[i].queryParams);
            commands.push(cmd);
        }

        if(!slaveOptions.activeSlave || $.trim(slaveOptions.activeSlave).length ==0){
            slaveOptions.activeSlave = 'onDblClickRow';
        }

        jq.datagrid('addEventListener', {
            name: slaveOptions.activeSlave,
            handler: function(rowIndex, rowData){
                for(var j in commands){
                    commands[j].params[relatedfieldName] = rowData[relatedfieldName];
                    $('#' + commands[j].id).datagrid('load', commands[j].params);
                }
            }
        });
    }

    function registRowEditingHandler(target){
        var options = $.extend(true, {}, $.fn.datagrid.defaults, $(target).datagrid('options'));
        if(!options.customAttr.rowediting) return;

        var getEditorButtonsPanelId = function(target){
            return $(target).attr('id')+'_editor_buttons_panel';
        }

        var deltaX = 120;
        var buildEditorButtonsPanel = function(target){
            var panelId = getEditorButtonsPanelId(target);
            if($('#'+panelId).length > 0) return;

            var panel = $(target).datagrid('getPanel');
            var state = $.data(target, 'datagrid');
            var datagrid_body = state.dc.body2;
            datagrid_body.css('position', 'relative');

            var edtBtnPanel = $('<div>', {id: panelId})
                .addClass('dialog-button')
                .appendTo(datagrid_body)
                .css({
                    'position': 'absolute',
                    'display': 'block',
                    'border-bottom': '1px solid #ddd',
                    'border-left': '1px solid #ddd',
                    'border-right': '1px solid #ddd',
                    'left': parseInt(panel.width()/2)-deltaX,
                    'z-index': 2013,
                    'display': 'none',
                    'padding': '4px 5px'
                });

            $('<a href="javascript:void(0)">确定</a>')
                .css('margin-left','0px')
                .linkbutton({iconCls: 'icon-ok'})
                .click(function(){
                    var editIndex = $(target).datagrid('getRowIndex', $(target).datagrid('getEditingRow'));
                    if(!options.customAttr.onConfirmEdit.call(target, editIndex)) return;
                    $(target).datagrid('endEdit', editIndex);
                })
                .appendTo(edtBtnPanel);
            $('<a href="javascript:void(0)">取消</a>')
                .css('margin-left', '6px')
                .linkbutton({iconCls: 'icon-cancel'})
                .click(function(){
                    var editIndex = $(target).datagrid('getRowIndex', $(target).datagrid('getEditingRow'));
                    $(target).datagrid('cancelEdit', editIndex);
                })
                .appendTo(edtBtnPanel);

        }

        var showEditorButtonsPanel = function(target, index){
            var opts = $.data(target, "datagrid").options;
            var tr = opts.finder.getTr(target, index, "body", 2);
            var position = tr.position();

            var edtBtnPanelId = '#'+getEditorButtonsPanelId(target);
            var state = $.data(target, 'datagrid');
            var datagrid_body = state.dc.body2;

            var fixPosition = function(){
                var trHeight = tr.height(), trWidth = tr.width();
                var top = position.top + datagrid_body.scrollTop(), left = position.left;
                var delta = 11;

                if(trWidth > datagrid_body.width()){
                    left = datagrid_body.width()/2 - deltaX;
                }else{
                    left = trWidth/2 - deltaX;
                }

                if(position.top + (trHeight * 2 + delta) > datagrid_body.height()){
                    top = top - (trHeight  + delta)
                }else{
                    top = top + trHeight;
                }

                return {top: top, left: left};
            }

            $(edtBtnPanelId).css(fixPosition()).show();
        }

        var hideEditorButtonsPanel = function(target){
            var edtBtnPanelId = '#'+getEditorButtonsPanelId(target);
            $(edtBtnPanelId).hide();
        }


        $(target).datagrid('addEventListener', [{
            name: 'onLoadSuccess',
            handler: function(data){
                buildEditorButtonsPanel(this);
            }
        },{
            name: 'onBeforeEdit',
            handler: function(index, data){
                buildEditorButtonsPanel(target);
                showEditorButtonsPanel(target, index);
            }
        },{
            name: 'onAfterEdit',
            handler: function(index, data, changes){
                hideEditorButtonsPanel(target);
            }
        },{
            name: 'onCancelEdit',
            handler: function(index, data){
                hideEditorButtonsPanel(target);
            }
        }]);
    }

    function buildTooltip(target){
        var options = $.extend(true, {}, $.fn.datagrid.defaults, $(target).datagrid('options'));
        if(!options.customAttr.tooltip.enable) return;

        var showTooltip = function(target, opts){
            var initOptions = {
                position: options.customAttr.tooltip.position,
                trackMouse: true,
                onHide: function(){
                    $(target).tooltip('destroy');
                },
                onShow: function(){
                    if($.isPlainObject(opts) && opts.css){
                        $(this).tooltip('tip').css(opts.css);
                    }
                }
            };

            $.extend(initOptions, $.isPlainObject(opts) ? opts : {content: opts});

            $(target).tooltip(initOptions).tooltip('show');
        }

        var bindRow = function(row, formatter){
            var rowIndex = parseInt(row.attr('datagrid-row-index'));
            var rowData = $(target).datagrid('getRows')[rowIndex];
            var getDefaultContent = function(rowData){
                var result = [];
                //排除没有设置field的column
                var fields = $.grep($.merge($(target).datagrid('getColumnFields',true), $(target).datagrid('getColumnFields')), function(n, i){
                    return $.trim(n).length>0;
                });
                $.each(fields, function(){
                    var field = this;
                    var title = $(target).datagrid('getColumnOption', field).title;
                    result.push(title + ': '+rowData[field]);
                });

                return result.join('<br>');
            }
            var content = formatter ? formatter(rowData, rowIndex) : getDefaultContent(rowData);
            row.mouseover(function(){
                showTooltip(this, content);
            });
        }

        var bindCell = function(cell, formatter){
            cell.mouseover(function(){
                var rowIndex = $(this).parent().attr('datagrid-row-index');
                var rowData = $(target).datagrid('getRows')[rowIndex];
                var field = $(this).attr('field');
                var value = rowData[field];
                var content = formatter ? formatter(value, field) : value;
                showTooltip(this, content);
            });
        }

        var initTooltip = function(){
            if(options.customAttr.tooltip.target == 'row'){
                options.finder.getTr(target, '', 'allbody').each(function(){
                    var row = $(this);
                    if(row.hasClass('datagrid-row')){
                        bindRow(row, options.customAttr.tooltip.formatter);
                    }
                });
            }else{
                if(options.customAttr.tooltip.fields && $.isArray(options.customAttr.tooltip.fields)){
                    var panel = $(target).datagrid('getPanel');
                    var state = $.data(target, 'datagrid');
                    var datagrid_body = state.dc.body2;
                    $.each(options.customAttr.tooltip.fields, function(){
                        var field = this;
                        bindCell($('td[field='+field+']', datagrid_body), options.customAttr.tooltip.formatter);
                    });
                }

            }
        }


        $(target).datagrid('addEventListener', {
            name: 'onLoadSuccess',
            handler: function(data){
                initTooltip();
            }
        });

    }

    function initPagination(target){
        var options = $.extend(true, {}, $.fn.datagrid.defaults, $(target).datagrid('options'));
        if(!options.pagination) return;

        $(target).datagrid('addEventListener', {
            name: 'onLoadSuccess',
            handler: function(data){
                $(target).datagrid('setPagination', options.customAttr.pagination);
            }
        });
    }

    function fixNoDataBug(target){
        var options = $(target).datagrid('options');

        var fixBug = function(data){
            var panel = $(target).datagrid('getPanel');
            if(data.rows.length == 0){
                var header = $('div.datagrid-view2>div.datagrid-header>div.datagrid-header-inner>table', panel)[0];
                var body = $('>div.datagrid-view>div.datagrid-view2>div.datagrid-body', panel);
                $('<div class="datagrid-empty">').html('&nbsp;').width($(header).width()).appendTo(body);
            }else{
                $('div.datagrid-view2>div.datagrid-body>div.datagrid-empty', panel).remove();
            }

        }

        $(target).datagrid('addEventListener', [{
            name: 'onLoadSuccess',
            handler: function(data){
                fixBug(data);
            }
        },{
            name: 'onLoadError',
            handler: function(){
                fixBug({rows: []});
            }
        }])
    }

    /**
     * 只对当前数据页有效，重新加载数据后失效（类似freezeRow）
     * 只冻结columns属性中定义的列
     */
    function _freezeColumn1(target, field){
        var options = $(target).datagrid('options');
        var frozenColumnFields = $(target).datagrid('getColumnFields', true);
        var firstColumn = options.columns[0][0];
        if(frozenColumnFields.length == 0 && firstColumn.checkbox){
            moveColumn(target, 'ck', 2, 1);
        }


        setMenuFieldItemState(target, field, true);
        moveColumn(target, field, 2, 1);
    }

    /**
     * 对所有数据页有效，重新加载数据后仍然有效
     */
    function _freezeColumn2(target, field){
        var options = $(target).datagrid('options');
        if(!options.frozenColumns[0]){
            options.frozenColumns=[[]];
        }

        var fieldOption = $(target).datagrid('getColumnOption', field);
        options.frozenColumns[0].push(fieldOption);
        removeColumn(fieldOption);
        $(target).datagrid(options);
        var fielditem = $(target).datagrid('getHeaderContextMenu').menu('findItem', fieldOption.title);
        $(target).datagrid('getHeaderContextMenu').menu('disableItem', fielditem.target);

        function removeColumn(fieldOption){
            for(var i=0; i<options.columns.length; i++){
                for(var j=0; j<options.columns[i].length; j++){
                    if(options.columns[i][j].field == fieldOption.field){
                        options.columns[i].splice(j, 1);
                        return;
                    }
                }
            }
        }
    }

    /**
     * 列移动
     */
    function moveColumn(target, field, from, to){
        var options = $(target).datagrid('options');
        var dc = $.data(target, "datagrid").dc;
        var headerTd = null;

        var headerTd = (from==1 ? dc.header1 : dc.header2).find('>table>tbody>tr.datagrid-header-row>td[field=' + field + ']');
        if(from > to){
            //datagrid-view2 -> datagrid-view1
            (to == 1 ? dc.header1 : dc.header2).find('>table>tbody>tr.datagrid-header-row').append(headerTd);
        }else{
            //datagrid-view1 -> datagrid-view2
            (to == 1 ? dc.header1 : dc.header2).find('>table>tbody>tr.datagrid-header-row').children('td[field]').each(function(){
                if(isBefore(field, $(this).attr('field'))){
                    $(this).before(headerTd);
                    return false;
                }
            });
        }


        var bodyTd = (from == 1 ? dc.body1 : dc.body2).find('>table>tbody>tr>td[field=' + field + ']');
        if(from > to){
            //datagrid-view2 -> datagrid-view1
            $.each(bodyTd, function(i, td){
                options.finder.getTr(target, i, 'body', to).append(td);
            });
        }else{
            //datagrid-view1 -> datagrid-view2
            $.each(bodyTd, function(i, td){
                options.finder.getTr(target, i, 'body', to).children('td[field]').each(function(){
                    if(isBefore(field, $(this).attr('field'))){
                        $(this).before(td);
                        return false;
                    }
                });
            });
        }

        $(target).datagrid('fixColumnSize');


        function isBefore(f1, f2){
            return getFieldIndex(f1) < getFieldIndex(f2);
        }

        function getFieldIndex(field){
            return $.inArray(field, $(target).datagrid('getColumnFields'));
        }
    }

    function setMenuFieldItemState(target, field, disabled){
        var index = getFieldIndex(field);
        var fieldOption = $(target).datagrid('getColumnOption', field);
        $.extend(fieldOption, {index: index});

        var headerContextMenu = $(target).datagrid('getHeaderContextMenu');
        var item = headerContextMenu.menu('findItem', fieldOption.title);
        if(!item) return;

        if(disabled){
            headerContextMenu.menu('disableItem', item.target);
        }else{
            headerContextMenu.menu('enableItem', item.target);
        }

        function getFieldIndex(field){
            return $.inArray(field, $(target).datagrid('getColumnFields'));
        }
    }

    /**
     * 根据'显示/隐藏'子菜单中字段项是否可用来控制，当前列右键菜单中的"冻结此列"和"取消冻结"是否可用
     */
    function switchFreezeAndUnfreezeMenuItem(field, target){
        var headerContextMenu = $(target).datagrid('getHeaderContextMenu');
        var fieldOption = $(target).datagrid('getColumnOption', field);
        var fieldItem = headerContextMenu.menu('findItem', fieldOption.title);

        if(fieldItem){
            if(!fieldItem.disabled){
                enableItem('冻结此列');
                disableItem('取消冻结');
            }else{
                enableItem('取消冻结');
                disableItem('冻结此列');
            }
        }else{
            disableItem('冻结此列');
            disableItem('取消冻结');
        }


        function disableItem(title){
            var item = headerContextMenu.menu('findItem', title);
            if(item){
                headerContextMenu.menu('disableItem', item.target);
            }
        }

        function enableItem(title){
            var item = headerContextMenu.menu('findItem', title);
            if(item){
                headerContextMenu.menu('enableItem', item.target);
            }
        }
    }

    function freezeColumn(target, field, isTemporary){
        if(isTemporary){
            _freezeColumn1(target, field);
        }else{
            _freezeColumn2(target, field);
        }
    }

    function unfreezeColumn(target, field){
        setMenuFieldItemState(target, field, false);
        moveColumn(target, field, 1, 2);
    }


    function addEventListener(target, eventName, handler, override){
        var options = $(target).datagrid('options');
        var defaultActionEvent = options[eventName];
        switch (eventName){
            case 'onLoadSuccess':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(data){
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
            case 'onClickRow':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex, rowData){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onDblClickRow':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex, rowData){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onClickCell':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex, field, value){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onDblClickCell':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex, field, value){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onSortColumn':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(sort, order){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onResizeColumn':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(field, width){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onSelect':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex, rowData){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onUnselect':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex, rowData){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onSelectAll':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rows){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onUnselectAll':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rows){
                        defaultActionEvent.apply(this, arguments);
                        handlerapply(this, arguments);
                    }
                }
                break;
            case 'onCheck':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex,rowData){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onUncheck':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex,rowData){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onCheckAll':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rows){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onUncheckAll':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rows){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onBeforeEdit':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex, rowData){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onAfterEdit':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex, rowData, changes){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onBeginEdit':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex, rowData, changes){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onEndEdit':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex, rowData, changes){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onCancelEdit':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(rowIndex, rowData){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onHeaderContextMenu':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(e, field){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onRowContextMenu':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(e, rowIndex, rowData){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onExpandRow':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(index, row){
                        defaultActionEvent && defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onCollapseRow':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(index, row){
                        defaultActionEvent && defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            default :
                break;
        }
    }

    function getAllExpandRowIndex(target){
        var options = $(target).datagrid('options');
        var index = [];
        options.finder.getTr(target, '', 'allbody', 1).each(function(){
            if($('span.datagrid-row-collapse', this).length>0){
                index.push($(this).attr('datagrid-row-index'));
            }
        });
        return index;
    }


    $.fn.datagrid.headerContextMenu = {
        defaultEvents: {
            /**
             *  对frozenColumns属性中的列不做隐藏控制
             */
            doHideColumn: function(target, field, item){
                $(target).datagrid('hideColumn', field);
                var menu = $(target).datagrid('getHeaderContextMenu');
                menu.menu('setIcon',{target: item.target, iconCls: 'icon-unchecked'});
            },
            doShowColumn: function(target, field, item){
                $(target).datagrid('showColumn', field);
                var menu = $(target).datagrid('getHeaderContextMenu');
                menu.menu('setIcon',{target: item.target, iconCls: 'icon-checked'});
            },
            doShowAll: function(target){
                var fields = $(target).datagrid('getColumnFields');
                var menu = $(target).datagrid('getHeaderContextMenu');
                for(i in fields){
                    $(target).datagrid('showColumn', fields[i]);
                    var columnOption = $(target).datagrid('getColumnOption', fields[i]);
                    var item = menu.menu('findItem', columnOption.title);
                    if(item){
                        menu.menu('setIcon',{target: item.target, iconCls: 'icon-checked'});
                    }
                }
            },
            doRestore: function(target){
                var fields = $(target).datagrid('getColumnFields');
                var menu = $(target).datagrid('getHeaderContextMenu');
                for(i in fields){
                    var columnOption = $(target).datagrid('getColumnOption', fields[i]);
                    var item = menu.menu('findItem', columnOption.title);
                    if(!columnOption._hidden){
                        $(target).datagrid('showColumn', fields[i]);
                        item && menu.menu('setIcon',{target: item.target, iconCls: 'icon-checked'});
                    }else{
                        $(target).datagrid('hideColumn', fields[i]);
                        item && menu.menu('setIcon',{target: item.target, iconCls: 'icon-unchecked'});
                    }
                }
            }

        }
    };

    $.fn.datagrid.rowContextMenu = {
        defaultEvents : {
            doAdd: function(item, rowIndex, rowData, target){
//            console.log('===>doAdd');
            },
            doEdit: function(item, rowIndex, rowData, target){
//            console.log('===>doEdit');
            },
            doDelete: function(item, rowIndex, rowData, target){
                $.messager.confirm('疑问','您确定要删除已选中的行？', function(r){
                    if(r){
                        $(target).datagrid('deleteRows', $(target).datagrid('getSelections'));
                    }
                })
            },
            doReload: function(item, rowIndex, rowData, target){
                $(target).datagrid('load');
            },
            doReloadThisPage: function(item, rowIndex, rowData, target){
                $(target).datagrid('reload');
            },
            doExportThisPage: function(item, rowIndex, rowData, target){
//            console.log('===>doExportThisPage');
            },
            doExprotAll: function(item, rowIndex, rowData, target){
//            console.log('===>doExprotAll');
            }
        }
    };

    $.extend($.fn.datagrid.defaults.editors, {
        my97:{
            init: function(container, options){
                var input = $('<input type="text" class="Wdate">').appendTo(container);
                options = options || {};
                options = $.extend({}, options, {readOnly: true});
                return input.focus(function(){
                    WdatePicker();
                });
            },
            getValue: function(target){
                return $(target).val();
            },
            setValue: function(target, value){
                $(target).val(value);
            },
            resize: function(target, width){
                var input = $(target);
                if($.boxModel == true){
                    input.width(width - (input.outerWidth() - input.width()));
                }else{
                    input.width(width);
                }
            }
        },
        datetimebox: {
            init: function(container, options){
                var input = $('<input type="text" class="easyui-datetimebox">').appendTo(container);
                options = options || {};
                options = $.extend({}, options, {formatter: function(date){return $.dateFormat(new Date(date), 'yyyy-MM-dd hh:mm')}})
                return input.datetimebox(options);
            },
            getValue: function(target){
                return $(target).datetimebox('getValue');
            },
            setValue: function(target, value){
                $(target).datetimebox('setValue', value);
            },
            resize: function(target, width){
                $(target).datetimebox('resize', width);
            }
        },
        numberspinner: {
            init: function(container, options){
                var input = $('<input type="text">').appendTo(container);
                options = options || {};
                options = $.extend({}, options, {min:0, editable: false});
                return input.numberspinner(options);
            },
            getValue: function(target){
                return $(target).numberspinner('getValue');
            },
            setValue: function(target, value){
                $(target).numberspinner('setValue', value);
            },
            resize: function(target, width){
                $(target).numberspinner('resize', width);
            }
        },
        timespinner: {
            init: function(container, options){
                var input = $('<input type="text">').appendTo(container);
                options = options || {};
                return input.timespinner(options);
            },
            getValue: function(target){
                return $(target).timespinner('getValue');
            },
            setValue: function(target, value){
                $(target).timespinner('setValue', value);
            },
            resize: function(target, width){
                $(target).timespinner('resize', width);
            }
        },
        combogrid: {
            init: function(container, options){
                var input = $('<input type="text">').appendTo(container);
                options = options || {};
                options = $.extend({}, {panelWidth: 400, editable: false}, options);
                return input.combogrid(options);
            },
            getValue: function(target){
                return $(target).combogrid('getValue');
            },
            setValue: function(target, value){
                $(target).combogrid('setValue', value);
            },
            resize: function(target, width){
                $(target).combogrid('resize', width);
            }
        }
    });

    $.fn.datagrid.defaults.customAttr={
        /**
         * column右键菜单设置
         *  isShow：是否显示
         *  isMerge: 自定义菜单项与默认菜单项是否合并
         *  items: 自定义菜单项
         */
        headerContextMenu:{
            isShow: false,
            isMerge: true,
            items:[],
            onShow: function(field, target){},
            onHide: function(){}
        },
        rowContextMenu:{
            isShow: false,
            isMerge: true,
            items:[]
        },
        pagination:{
            showPageList: false,
            showRefresh: true,
            beforePageText: undefined,
            afterPageText: undefined,
            displayMsg: undefined
        },
        /**
         *  slave: 一个数组，数组中的每个元素应该包含如下内容的一个object
         *  id: 一个字符串值，用来表示关联datagrid组件的id
         *  relatedfield: 一个字符串值，用来表示datagrid之间用来关联的字段名，即外键字段名成而非外键值
         *  queryParams: 一个object，查询参数
         *
         *  Code example:
         *  $('#dg').datagrid({
         *      customAttr:{
         *          slave: [
         *              {
         *                  id: 'slave1',
         *                  relatedfield: 'id',
         *                  queryParams: {subject: 'datagrid', name: 'easyui'}
         *              }
         *          ]
         *      }
         *  })
         */
        slaveList: undefined,
        activeSlave: 'onDblClickRow',
        rowediting: false,
        /**
         * target: row|cell ,tooltip 的触发对象，默认row
         */
        tooltip:{
            enable: false,
            target: 'row',
            position: 'bottom',
            fields: undefined,
            formatter: undefined
        },
        onConfirmEdit: function(rowIndex){return true;}
    };

    $.extend($.fn.datagrid.methods, {
        followCustomHandle: function(jq){
            return jq.each(function(){});
        },
        getHeaderContextMenu: function(jq){
            return $('#'+getContextMenuId(jq[0], 'headerContextMenu'));
        },
        getRowContextMenu: function(jq){
            return $('#'+getContextMenuId(jq[0], 'rowContextMenu'));
        },
        getEditingRow: function(jq){
            var editingRows = jq.datagrid('getEditingRows');
            return editingRows.length ? editingRows[0] : null;
        },
        getEditingRows: function(jq){
            var datagrid = $.data(jq[0], "datagrid");
            var opts = datagrid.options;
            var data = datagrid.data;
            var editingRow = [];
            opts.finder.getTr(jq[0], "", "allbody").each(function(){
                if($(this).hasClass('datagrid-row-editing')){
                    var index = parseInt($(this).attr('datagrid-row-index'));
                    editingRow.push(data.rows[index]);
                }
            });

            return editingRow;
        },
        setPagination: function(jq, opts){
            return jq.each(function(){
                $(this).datagrid('getPager').pagination(opts);
            });
        },
        deleteRows: function(jq, rows){
            return jq.each(function(){
                var delRows = undefined;
                if(!$.isArray(rows)){
                    delRows = [rows];
                }else{
                    delRows = rows;
                }

                var target = this;
                $.each(delRows, function(i, row){
                    setTimeout(function(){
                        var index = $(target).datagrid('getRowIndex', row);
                        $(target).datagrid('deleteRow', index);
                    }, 5);
                });
            });
        },
        freezeColumn: function(jq, field){
            return jq.each(function(){
                freezeColumn(this, field, true);
            });
        },
        unfreezColumn: function(jq, field){
            return jq.each(function(){
                unfreezeColumn(this, field);
            });
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
        /**
         * 用于detail View视图下，修改detailRow的宽度
         * @param jq
         * @param options 接收两个参数
         *          index: row索引
         *          handler: function(index, width) 可以在此方法中操作需要修改宽度的组件
         *
         * @returns {*}
         */
        fixDetailRowWidth: function(jq, options){
            return jq.each(function(){
                var state = $.data(this, 'datagrid');
                var table = state.dc.header2.children();
                options.handler && options.handler.call(this, options.index, table.width());
            });
        },
        /**
         * 用于DetailView视图，获取所有展开行的索引
         * @param jq
         * @returns {*}
         */
        getAllExpandRowIndex: function(jq){
            return getAllExpandRowIndex(jq[0]);
        },
        /**
         * 用于DetailView视图，获取第一个展开行索引
         * @param jq
         * @returns {*}
         */
        getExpandRowIndex: function(jq){
            var indexArr = jq.datagrid('getAllExpandRowIndex');
            return indexArr.length > 0 ? indexArr[0] : -1;
        }
    });

    var plugin = $.fn.datagrid;
    $.fn.datagrid = function(options, param){
        if (typeof options != 'string'){
            return this.each(function(){
                plugin.call($(this), options, param);

                fixNoDataBug(this);
                initHeaderContextMenu(this);
                initRowContextMenu(this);
                initPagination(this);
                setMasterSlave(this);
                registRowEditingHandler(this);
                buildTooltip(this);
            });
        } else {
            return plugin.call(this, options, param);
        }
    };

    $.fn.datagrid.methods = plugin.methods;
    $.fn.datagrid.defaults = plugin.defaults;
    $.fn.datagrid.parseOptions = plugin.parseOptions;
    $.fn.datagrid.parseData = plugin.parseData;
    $.fn.datagrid.rowContextMenu = plugin.rowContextMenu;
    $.fn.datagrid.headerContextMenu = plugin.headerContextMenu;
})(jQuery);
/**
 * Created with IntelliJ IDEA.
 * @author: 爱看书不识字<zjh527@163.com>
 */
(function($){
    $.extend({
        dateFormat: function(date, pattern){
            if (date == null) {
                return null;
            }

            if (pattern == null) {
                var formatter = "yyyy-MM-dd";
            }else{
                var formatter = pattern;
            }

            var year = date.getFullYear().toString();
            var month = (date.getMonth() + 1).toString();
            var day = date.getDate().toString();
            var hours = date.getHours().toString();
            var minutes = date.getMinutes().toString();
            var seconds = date.getSeconds().toString();
            var yearMarker = formatter.replace(/[^y]/g, '');
            var monthMarker = formatter.replace(/[^M]/g, '');
            var dayMarker = formatter.replace(/[^d]/g, '');
            var hoursMarker = formatter.replace(/[^h]/g, '');
            var minutesMarker = formatter.replace(/[^m]/g, '');
            var secondsMarker = formatter.replace(/[^s]/g, '');
            if (yearMarker.length == 2) {
                year = year.substring(2, 4);
            }

            if (monthMarker.length > 1 && month.length == 1) {
                month = "0" + month;
            }

            if (dayMarker.length > 1 && day.length == 1) {
                day = "0" + day;
            }

            if (hoursMarker.length > 1 && hours.length == 1) {
                hours = "0" + hours;
            }

            if (minutesMarker.length > 1 && minutes.length == 1) {
                minutes = "0" + minutes;
            }

            if (secondsMarker.length > 1 && seconds.length == 1) {
                seconds = "0" + seconds;
            }

            if (yearMarker.length > 0) {
                formatter = formatter.replace(yearMarker, year);
            }
            if (monthMarker.length > 0) {
                formatter = formatter.replace(monthMarker, month);
            }

            if (dayMarker.length > 0) {
                formatter = formatter.replace(dayMarker, day);
            }

            if (hoursMarker.length > 0) {
                formatter = formatter.replace(hoursMarker, hours);
            }

            if (minutesMarker.length > 0) {
                formatter = formatter.replace(minutesMarker, minutes);
            }

            if (secondsMarker.length > 0) {
                formatter = formatter.replace(secondsMarker, seconds);
            }

            return formatter;
        },
        parseDate: function(dateString, pattern){
            var today = new Date();
            if (dateString == null) {
                return today;
            }

            if (pattern == null) {
                var formatter = "yyyy-MM-dd";
            }else{
                var formatter = pattern;
            }

            var yearMarker = formatter.replace(/[^y]/g, '');
            var monthMarker = formatter.replace(/[^M]/g, '');
            var dayMarker = formatter.replace(/[^d]/g, '');
            var hoursMarker = formatter.replace(/[^h]/g, '');
            var minutesMarker = formatter.replace(/[^m]/g, '');
            var secondsMarker = formatter.replace(/[^s]/g, '');
            var yearPosition = formatter.indexOf(yearMarker);
            var yearLength = yearMarker.length;
            var year = parseInt(dateString.substring(yearPosition, yearPosition
                + yearLength));
            if (isNaN(year)) {
                year = today.getYear();
            } else {
                if (yearLength == 2) {
                    if (year < 50) {
                        year += 2000;
                    } else {
                        year += 1900;
                    }
                }
            }

            var monthPosition = formatter.indexOf(monthMarker);
            var month = parseInt(dateString.substring(monthPosition, monthPosition
                + monthMarker.length));
            if (isNaN(month)) {
                month = today.getMonth();
            } else {
                month -= 1
            }

            var dayPosition = formatter.indexOf(dayMarker);
            var day = parseInt(dateString.substring(dayPosition, dayPosition
                + dayMarker.length));
            if (isNaN(day)) {
                day = today.getDate();
            }

            var hoursPosition = formatter.indexOf(hoursMarker);
            var hours = parseInt(dateString.substring(hoursPosition, hoursPosition
                + hoursMarker.length));
            if (isNaN(hours)) {
                hours = 0;
            }

            var minutesPosition = formatter.indexOf(minutesMarker);
            var minutes = parseInt(dateString.substring(minutesPosition,
                minutesPosition + minutesMarker.length));
            if (isNaN(minutes)) {
                minutes = 0;
            }

            var secondsPosition = formatter.indexOf(secondsMarker);
            var seconds = parseInt(dateString.substring(secondsPosition,
                secondsPosition + secondsMarker.length));
            if (isNaN(seconds)) {
                seconds = 0;
            }

            return new Date(year, month, day, hours, minutes, seconds);
        }
    });
})(jQuery);
/**
 * Created with IntelliJ IDEA.
 * Created with IntelliJ IDEA.
 * Licensed under the GPL licenses
 * http://www.gnu.org/licenses/gpl.txt
 * @author: 爱看书不识字<zjh527@163.com>
 *
 * 扩展说明：
 *  1、maskt 显示遮罩
 *      1.1 参数说明
 *          target:     要加载遮罩的目标对象
 *          loadMsg:    遮罩显示信息
 *
 *
 *  2、unmask 关闭遮罩
 *      2.1 参数说明
 *          target:     要加载遮罩的目标对象
 *
 */
(function($){
    function addCss(id, content){
        if($('#' + id).length > 0) return;
        return $('<style>' + content + '</style>').attr('id', id).attr('type', 'text/css').appendTo('head');
    }

    $.extend({
        mask: function(opts){
            opts = opts || {};
            var options = $.extend({}, {target: 'body', loadMsg: $.fn.datagrid.defaults.loadMsg}, opts);
            this.unmask(options);

            if(options.target != 'body' && $(options.target).css('position') == 'static'){
                $(options.target).addClass('mask-relative');
            }

            var mask = $("<div class=\"datagrid-mask\" style=\"display:block;\"></div>").appendTo(options.target);
            var msg = $("<div class=\"datagrid-mask-msg\" style=\"display:block; left: 50%;\"></div>").html(options.loadMsg).appendTo(options.target);
            setTimeout(function(){
                msg.css("marginLeft", -msg.outerWidth() / 2);
            }, 5);

            var css = '.mask-relative {position: relative !important;}';
            addCss('mask_css', css);
        },
        unmask: function(options){
            var target = options.target || 'body';
            $(">div.datagrid-mask-msg", target).remove();
            $(">div.datagrid-mask", target).remove();
            $(options.target).removeClass('mask-relative');
        }
    });
})(jQuery);
/**
 * Created with IntelliJ IDEA.
 * Licensed under the GPL licenses
 * http://www.gnu.org/licenses/gpl.txt
 * @author: 爱看书不识字<zjh527@163.com>
 *
 *
 * 扩展如下：
 * 1、增加方法appendItems，支持批量添加。
 * 2、支持将'-'转化为分割符，类似datagrid.toolbar。
 * 3、新增方法 addEventListener，用于初始化之后动态注册事件，支持一个事件可以注册多个处理方法。
 *      3.1 参数说明：
 *          name:       事件名称
 *          override:   是否覆盖默认事件处理, 值: true|false, 默认:false
 *          handler:    事件处理方法
 *
 *
 *      3.1 单个事件处理方法注册
 *          $('#mm').menu('addEventListener', {
 *              name: 'onClick',
 *              handler: function(item){}
 *          });
 *
 *
 *      3.2 多个事件处理方法注册
 *          $('#mm').menu('addEventListener', [{
 *              name: 'onClick',
 *              handler: function(item){}
 *          },{
 *              name: 'onShow',
 *              handler: function(){}
 *          }]);
 *
 *
 *      3.4 覆盖事件默认处理方法
 *          $('#mm').menu('addEventListener', {
 *              name: 'onClick',
 *              override: true,
 *              handler: function(item){}
 *          });
 *
 *
 */
(function($){
    function appendItems(target, submenu, parentEl){
        if(submenu && $.isArray(submenu)){
            $.each(submenu, function(){
                var item = this;

                var parent = {};
                if(parentEl){
                    $.extend(parent, {parent: parentEl});
                }

                if($.isPlainObject(item)){
                    $(target).menu('appendItem', $.extend(item, parent));

                    if(item.submenu){
                        var p = $(target).menu('findItem', item.text);
                        appendItems(target, item.submenu, p.target);
                    }
                }else if(item == '-'){
                    var el = $(target).menu('appendItem', $.extend({text: item}, parent)).menu('findItem', item).target;
                    $(el).removeClass('menu-item').addClass('menu-sep').removeAttr('style').empty();
                }
            });
        }
    }

    function addEventListener(target, eventName, handler, override){
        var options = $(target).menu('options');
        var defaultActionEvent = options[eventName];
        switch (eventName){
            case 'onShow':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onHide':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onClick':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(item){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            default :
                break;
        }
    }


    $.extend($.fn.menu.methods, {
        followCustomHandle: function(jq){
            return this.each(function(){});
        },
        appendItems: function(jq, param){
            return jq.each(function(){
                appendItems(this, param);
            });
        },
        addEventListener: function(jq, param){
            return jq.each(function(){
                var eventList = $.isArray(param) ? param : [param];
                var target = this;
                $.each(eventList, function(i, event){
                    addEventListener(target, event.name, event.handler|| function(){}, event.override);
                });
            });
        }
    });
})(jQuery);
/**
 * Created with IntelliJ IDEA.
 * Licensed under the GPL licenses
 * http://www.gnu.org/licenses/gpl.txt
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
 *  2、新增方法 addEventListener, 用于初始化之后动态注册事件，支持一个事件可以注册多个处理方法。
 *      2.1 事件对象属性说明
 *          name:       事件名称
 *          override:   是否覆盖事件默认处理行为，值:true|false，默认: false
 *          handler:    定义事件处理行为
 *
 *      2.2 单个事件处理方法注册
 *          $('#p').panel('addEventListener', {
 *              name: 'onLoad',
 *              handler: function(){}
 *          });
 *
 *      2.3 多个事件处理方法注册
 *          $('#p').panel('addEventListener', [{
 *              name: 'onLoad',
 *              handler: function(){}
 *          },{
 *              name: 'onClose',
 *              handler: function(){}
 *          }]);
 *
 *      2.4 覆盖事件默认处理行为
 *          $('#p').panel('addEventListener', {
 *              name: 'onClose',
 *              override: true,
 *              handler: function(){}
 *          });
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
            if($.isArray(toolbar.data) && toolbar.data.length >0){
                var tb = $('<div></div>').insertBefore(body);
                tb.toolbar(toolbar);
            }
        }
    }

    function addEventListener(target, eventName, handler, override){
        var options = $(target).panel('options');
        var defaultActionEvent = options[eventName];
        switch (eventName){
            case 'onResize':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(width, height){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onMove':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(left, top){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            default :
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
        }
    }

    $.fn.panel.defaults.customAttr = {
        toolbar: {
            buttonPosition: 'left',
            data: []
        }
    };

    $.extend($.fn.panel.methods, {
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
        }
    });

    var plugin = $.fn.panel;
    $.fn.panel = function(options, param){
        if (typeof options != 'string'){
            return this.each(function(){
                plugin.call($(this), options, param);

                initToolbar(this);
            });
        } else {
            return plugin.call(this, options, param);
        }
    };

    $.fn.panel.methods = plugin.methods;
    $.fn.panel.defaults = plugin.defaults;
    $.fn.panel.parseOptions = plugin.parseOptions;
})(jQuery);
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


//    /**
//     * 销毁所有panel下的iframe
//     */
//    $.fn.panel.defaults = $.extend({},
//        $.fn.panel.defaults,
//        {
//            onBeforeDestroy: function(){
//                var frame=$('iframe', this);
//                if(frame.length>0){
//                    frame[0].contentWindow.document.write('');
//                    frame[0].contentWindow.close();
//                    frame.remove();
////                    if($.browser.msie){
////                        CollectGarbage();
////                    }
//                    if(navigator.userAgent.indexOf('MSIE')>0){
//                        CollectGarbage();
//                    }
//                }
//            }
//        });

    /**
     *  销毁panel和window下的iframe并释放内存
     */
    var destroyFrameAndFreeTheMemory = function(){
        var frame=$('iframe', this);
        if(frame.length>0){
            frame[0].contentWindow.close();
            frame.remove();
            if(navigator.userAgent.indexOf('MSIE')>0){
                CollectGarbage();
            }
        }
    }

    $.fn.panel.defaults.onBeforeDestroy = destroyFrameAndFreeTheMemory;
    $.fn.window.defaults.onBeforeDestroy = destroyFrameAndFreeTheMemory ;
    $.fn.dialog.defaults.onBeforeDestroy = destroyFrameAndFreeTheMemory ;

})(jQuery);
/**
 * Created with IntelliJ IDEA.
 * Licensed under the GPL licenses
 * http://www.gnu.org/licenses/gpl.txt
 * @author: 爱看书不识字<zjh527@163.com>
 *
 * depend on:
 *  jquery.easyui.menu.extend.js
 *
 * 扩展如下：
 * 1、通过自定义属性控制标签页显示右键菜单，可自定义右键菜单项，自定义右键菜单项支持'-'定义菜单分割符，自定义菜单项是否与默认菜单合并。
 *      1.1 右键菜单默认菜单项：
 *          重新加载
 *          固定标签页
 *          取消固定标签
 *          关闭标签页
 *          关闭其他标签页
 *          关闭右侧标签页
 *          关闭所有标签页
 *
 *
 *      1.2 右键菜单显示控制：
 *          customAttr:{
 *              contextMenu:{
 *                  isShow: true
 *              }
 *          }
 *
 *
 *      1.3 右键菜单自定义菜单项和使用'-'定义菜单项分割符：
 *          customAttr:{
 *              contextMenu:{
 *                  isShow: true,
 *                  items: [
 *                      {text: 'Add', iconCls: 'icon-add', onclick: function(item, title, index, target){}},
 *                      {text: 'Save', iconCls: 'icon-save'},
 *                      '-',
 *                      {text: 'Close', iconCls: 'icon-close'}
 *                  ]
 *              }
 *          }
 *
 *          菜单项onclick方法，参数说明：
 *              item： 菜单项
 *              title: 触发右键菜单的标签页的标题
 *              index: 处罚右键菜单的标签页的索引号
 *              target: 指向当前tabs组件
 *
 *      1.4 自定义菜单项与默认菜单项合并：
 *          customAttr:{
 *              contextMenu:{
 *                  isShow: true,
 *                  isMerge: true,
 *                  items: [
 *                      {text: 'Add', iconCls: 'icon-add', onclick: function(item, title, index, target){}},
 *                      {text: 'Save', iconCls: 'icon-save'},
 *                      '-',
 *                      {text: 'Close', iconCls: 'icon-close'}
 *                  ]
 *              }
 *          }
 *
 *      1.5 菜单项onclick事件接收item, title, index, target参数
 *          item: 当前点击菜单项
 *          title: 当前触发contextmenu标签页的标题
 *          index: 当前触发contextmenu标签页的索引号
 *          target: 当前tabs的引用，非jQuery对象。
 *
 *
 * 2、增加自定义属性解析方法followCustomHandle，只有调用此方法之后customAttr中定义的扩展属性才会被解析执行。
 *      $('#tt').tabs({
 *          customAttr:{
 *              contextMenu:{
 *                  isShow: true
 *              }
 *          }
 *      }).tabs('followCustomHandle');
 *
 *
 *
 * 3、重写add方法，支持使用iframe加载url。
 *      3.1 通过useiframe属性控制是否使用iframe
 *          $('#tt').tabs('add',{
 *              title: 'New Tab',
 *              href: 'http://www.baidu.com',
 *              useiframe: true
 *          });
 *
 *
 *      3.2 改写content参数，使其支持url 。
 *          $('#tt').tabs('add',{
 *              title: 'New Tab',
 *              useiframe: true,
 *              content: 'url:http://www.baidu.com'
 *          });
 *
 *      3.3 通过css属性控制tab panel 样式
 *          $('#tt').tabs('add', {
 *              title: 'New Tab',
 *              href: 'http://www.baidu.com',
 *              css: {padding: '2px'}
 *          });
 *
 *      3.4 属性说明：
 *          1、保持原有方法属性
 *          2、新增如下属性：
 *              useiframe: 是否使用iframe加载页面
 *              css:        控制tab.panel样式
 *              showMask:   是否显示遮罩。当useiframe=true时生效。
 *              loadMsg:    遮罩提示信息。当useiframe=true时生效。
 *
 *          3、扩展属性content，支持url前缀，自动执行页面加载。
 *
 *
 * 4、新增方法 addEventListener, 用于初始化之后动态注册事件，支持一个事件可以注册多个处理方法。
 *      4.1 事件对象属性说明
 *          name:       事件名称
 *          override:   是否覆盖事件默认处理行为，值:true|false，默认:false
 *          handler:    定义事件处理行为
 *
 *
 *      4.2 单个事件处理方法注册
 *          $('#tt').tabs('addEventListener', {
 *              name: 'onLoad',
 *              handler: function(panel){}
 *          });
 *
 *      4.3 多个事件处理方法注册
 *          $('#tt').tabs('addEventListener', [{
 *              name: 'onLoad',
 *              handler: function(panel){}
 *          },{
 *              name: 'onSelect',
 *              handler: function(title, index){}
 *          }]);
 *
 *      4.4 覆盖事件默认处理行为
 *          $('#tt').tabs('addEventListener', {
 *              name: 'onSelect',
 *              override: true,
 *              handler: function(title, index){}
 *          });
 *
 */
(function($){
    function getContextMenuId(target){
        return $(target).attr('id')+'_contextmenu';
    }

    function buildContextMenu(target, menuitems){
        var menuid = getContextMenuId(target);
        var contextmenu = $('#'+menuid);
        if(contextmenu.length==0){
            contextmenu = $('<div>', {id: menuid}).menu();
            contextmenu.menu('appendItems', menuitems);
        }
        return contextmenu;
    }

    function getMenuItemOnClickHandler(menuitems){
        var onclickHandler={};

        $.each(menuitems, function(){
            var item = this;
            if(item.onclick){
                var index = item.id || item.text;
                onclickHandler[index] = item.onclick;
                delete item.onclick;
            }

            if(item.submenu && $.isArray(item.submenu) && item.submenu.length>0){
                $.extend(onclickHandler, getMenuItemOnClickHandler(item.submenu));
            }
        });

        return onclickHandler;
    }

    /**
     * 解决在menu.onClick事件和item.onclick同时触发调用。
     * @param target
     */
    function initContextMenu(target){
        var opts = $.extend(true, {}, $.fn.tabs.defaults, $.data(target, 'tabs').options);
        var menuOpts = opts.customAttr.contextMenu;
        if(!menuOpts.isShow) return;

        var menuitems = getDefaultContextMenuItems(target);
        if(menuOpts.isMerge && $.isArray(menuOpts.items) && menuOpts.items.length>0){
            menuitems = $.merge(menuitems, menuOpts.items);
        }

        if(!menuOpts.isMerge && $.isArray(menuOpts.items) && menuOpts.items.length>0){
            menuitems = menuOpts.items;
        }

        var onClickHandlerCache = getMenuItemOnClickHandler(menuitems);
        var contextmenu = buildContextMenu(target, menuitems);

        $(target).tabs('addEventListener', {
            name: 'onContextMenu',
            handler: function(e, title, index){
                e.preventDefault();
                modifyItemText(target, contextmenu, index);
                contextmenu.menu('addEventListener', {
                    name: 'onClick',
                    override: true,
                    handler: function(item){
                        var name = item.id || item.text;
                        if(onClickHandlerCache[name]){
                            onClickHandlerCache[name].call(this, item, title, index, target);
                        }
                    }
                }).menu('show',{
                    left: e.pageX,
                    top: e.pageY
                });
            }
        });
    }

    function modifyItemText(target, contextmenu, index){
        var menuid = getContextMenuId(target);
        var itemEl = $('#'+menuid+'_fixed');
        if($.inArray(index, $.fn.tabs.defaults.customAttr.fixedtabs) == -1 && !$(target).tabs('getTab', index).panel('options').closable){
            contextmenu.menu('setText', {target: itemEl, text: $.fn.tabs.defaults.contextMenu.itemname.unfixtab});
        }else{
            contextmenu.menu('setText', {target: itemEl, text: $.fn.tabs.defaults.contextMenu.itemname.fixtab});
            if($.inArray(index, $.fn.tabs.defaults.customAttr.fixedtabs)>-1){
                contextmenu.menu('disableItem', itemEl);
            }else{
                contextmenu.menu('enableItem', itemEl);
            }
        }

        itemEl = $('#'+menuid+'_close');
        if(!$(target).tabs('getTab', index).panel('options').closable){
            contextmenu.menu('disableItem', itemEl);
        }else{
            contextmenu.menu('enableItem', itemEl);
        }

    }

    function getDefaultContextMenuItems(target){
        var menuid = getContextMenuId(target);
        return [
            {
                id: menuid+'_reload',
                text: $.fn.tabs.defaults.contextMenu.itemname.reload,
                onclick: $.fn.tabs.defaults.contextMenu.defaultEventsHandler.reload
            },
            {
                id: menuid+'_fixed',
                text: $.fn.tabs.defaults.contextMenu.itemname.fixtab,
                onclick: function(item, title, index, tabs){
                    if(item.text == $.fn.tabs.defaults.contextMenu.itemname.fixtab)
                        $.fn.tabs.defaults.contextMenu.defaultEventsHandler.fixtab(item, title, index, tabs);
                    else
                        $.fn.tabs.defaults.contextMenu.defaultEventsHandler.unfixtab(item, title, index, tabs)
                }
            },
            '-',
            {
                id: menuid+'_close',
                text: $.fn.tabs.defaults.contextMenu.itemname.close,
                onclick: $.fn.tabs.defaults.contextMenu.defaultEventsHandler.closetab
            },
            {
                id: menuid+'_close_others',
                text: $.fn.tabs.defaults.contextMenu.itemname.closeothers,
                onclick: $.fn.tabs.defaults.contextMenu.defaultEventsHandler.closeOthersTab
            },
            {
                id: menuid+'_close_rightside',
                text: $.fn.tabs.defaults.contextMenu.itemname.closerightside,
                onclick: $.fn.tabs.defaults.contextMenu.defaultEventsHandler.closeRightSideTabs
            },
            {
                id: menuid+'_close_all',
                text: $.fn.tabs.defaults.contextMenu.itemname.closeall,
                onclick: $.fn.tabs.defaults.contextMenu.defaultEventsHandler.closeAll
            }
        ];
    }

    function getHeader(target, index){
        var headers = [];
        index++;
        $(target).children('div.tabs-header').find('ul li:nth-child('+index+')').each(function(){
            headers.push(this);
        });
        return headers.length>0?headers[0]:null;
    }

    function resortTabs(target, minIndex, maxIndex, reverse){
        if(typeof maxIndex == 'number' && typeof minIndex == 'number'){
            var tabs = $.data(target, 'tabs').tabs;
            if(maxIndex<0 || maxIndex>tabs.length) return;
            if(minIndex<0 || minIndex>tabs.length) return;


            if(reverse){
                var srcTab = tabs[maxIndex];
                for(var i=maxIndex; i>minIndex; i--){
                    tabs.splice(i, 1, tabs[i-1]);
                }
                tabs[minIndex] = srcTab;

                var destHeader = getHeader(target, minIndex);
                if(destHeader){
                    var srcheader = getHeader(target, maxIndex);
                    $(destHeader).before(srcheader);
                }
            }else{
                var srcTab = tabs[minIndex];
                for(var j=minIndex; j<=maxIndex; j++){
                    tabs.splice(j, 1, tabs[j+1]);
                }
                tabs[maxIndex]= srcTab;

                var destHeader = getHeader(target, maxIndex);
                if(destHeader){
                    var srcHeader = getHeader(target, minIndex);
                    $(destHeader).after(srcHeader);
                }
            }
        }
    }

    function getFixedTabs(target){
        var tabs = $(target).tabs('tabs');
        var fixedtabs = [];
        for(var i=0; i<tabs.length; i++){
            var tab = tabs[i];
            if(tab.panel('options').closable == undefined ||!tab.panel('options').closable){
                fixedtabs.push(tab);
            }
        }

        return fixedtabs;
    }

    function appendIframeToTab(target, tabTitle, url, showMask, loadMsg){
        var iframe = $('<iframe>')
            .attr('height', '100%')
            .attr('width', '100%')
            .attr('marginheight', '0')
            .attr('marginwidth', '0')
            .attr('frameborder', '0');

        setTimeout(function(){
            iframe.attr('src', url);
        }, 1);

        var tab = $(target).tabs('getTab', tabTitle);
        tab.panel('body').css({'overflow':'hidden'}).empty().append(iframe);



        //add mask
        if(showMask){
            var loadMsg = loadMsg || $.fn.datagrid.defaults.loadMsg;
            var body = tab.panel('body');
            body.css('position', 'relative');
            var mask = $("<div class=\"datagrid-mask\" style=\"display:block;\"></div>").appendTo(body);
            var msg = $("<div class=\"datagrid-mask-msg\" style=\"display:block; left: 50%;\"></div>").html(loadMsg).appendTo(body);
            setTimeout(function(){
                msg.css("marginLeft", -msg.outerWidth() / 2);
            }, 5);
        }

        //remove mask
        iframe.bind('load', function(){
            if(iframe[0].contentWindow){
                tab.panel('body').children("div.datagrid-mask-msg").remove();
                tab.panel('body').children("div.datagrid-mask").remove();
            }
        });
    }

    $.fn.tabs.defaults.contextMenu={}
    $.fn.tabs.defaults.contextMenu.itemname={};
    $.fn.tabs.defaults.contextMenu.itemname.reload = '重新加载';
    $.fn.tabs.defaults.contextMenu.itemname.fixtab = '固定标签页';
    $.fn.tabs.defaults.contextMenu.itemname.unfixtab = '取消固定标签';
    $.fn.tabs.defaults.contextMenu.itemname.close = '关闭标签页';
    $.fn.tabs.defaults.contextMenu.itemname.closeothers = '关闭其他标签页';
    $.fn.tabs.defaults.contextMenu.itemname.closerightside = '关闭右侧标签页';
    $.fn.tabs.defaults.contextMenu.itemname.closeall = '关闭所有标签页';

    $.fn.tabs.defaults.contextMenu.defaultEventsHandler ={
        reload: function(item, title, index, target){
            var panel = $(target).tabs('getTab', index);
            var useiframe = panel.panel('options').useiframe;
            if(useiframe){
                $('iframe', panel.panel('body')).each(function(){
                    this.contentWindow.location.reload();
                });
            }else{
                panel.panel('refresh');
            }
        },
        fixtab: function(item, title, index, target){
            var tab = $(target).tabs('getTab', index);
            $(target).tabs('update', {tab: tab, options:{closable: false}});


            var minIndex = $.fn.tabs.defaults.customAttr.fixedtabs.length;
            resortTabs(target, minIndex, index, true);
        },
        unfixtab: function(item, title, index, target){
            var maxIndex = getFixedTabs(target).length-1;
            var tab = $(target).tabs('getTab', index);
            $(target).tabs('update', {tab: tab, options:{closable: true}});

            resortTabs(target, index, maxIndex);

        },
        closetab: function(item, title, index, target){
            var panelOpts = $(target).tabs('getTab', index).panel('options');
            if(panelOpts.closable){
                $(target).tabs('close', index);
            }
        },
        closeOthersTab: function(item, titl, index, target){
            var tabs = $(target).tabs('tabs');
            var panels = $.grep(tabs, function(tab, i){
                return tab.panel('options').closable && i!=index;
            });

            $.each(panels, function(){
                $(target).tabs('close', this.panel('options').title);
            })
        },
        closeRightSideTabs: function(item, title, index, target){
            var tabs = $(target).tabs('tabs');
            var panels = $.grep(tabs, function(tab, i){
                return i>index && tab.panel('options').closable;
            });

            $.each(panels, function(){
                $(target).tabs('close', this.panel('options').title);
            });
        },
        closeAll: function(item, title, index, target){
            var tabs = $(target).tabs('tabs');
            var panels = $.grep(tabs, function(tab, i){
                return tab.panel('options').closable
            });
            $.each(panels, function(){
                $(target).tabs('close', this.panel('options').title);
            });
        }
    }

    function addEventListener(target, eventName, handler, override){
        var options = $(target).tabs('options');
        var defaultActionEvent = options[eventName];
        switch (eventName){
            case 'onLoad':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(panel){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onContextMenu':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(e, title, index){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            default :
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(title, index){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
        }
    }

    $.fn.tabs.defaults.customAttr={
        fixedtabs:[0],
        contextMenu: {
            isShow: false,
            isMerge: true,
            items:[]
        }
    };


    var defaultMethods = $.extend({}, $.fn.tabs.methods);

    $.extend($.fn.tabs.methods, {
        followCustomHandle: function(jq){
            return jq.each(function(){});
        },
        /**
         *
         * @param jq
         * @param options
         *        1、除原有属性外，再扩展如下属性：
         *          useiframe:  是否使用iframe加载远程页面。值：true|false
         *          showMask:   是否显示遮罩。 值true|false
         *          loadMsg:    加载提示信息。
         *          css:        设置panel样式。 其值Object，例如：{padding: '2px'}
         *        注意：showMask 和 loadMsg 属性当 useiframe=true 时生效。
         *
         *        2、增强content属性，支持url前缀，自动识别加载页面。
         * @returns {*}
         */
        add: function(jq, options){
            return jq.each(function(){
                var url = null;
                if(options.href || /^url:/.test(options.content)){
                    url = options.href || options.content.substr(4, options.content.length);
                    delete options.content;
                    delete options.href;
                }


                if(url){
                    if(options.useiframe){
                        defaultMethods.add(jq, options);
                        appendIframeToTab(this, options.title, url, options.showMask, options.loadMsg);
                    }else{
                        defaultMethods.add(jq, $.extend(options, {href: url}));
                    }
                }else{
                    defaultMethods.add(jq, options);
                }

                if(options.css){
                    $(this).tabs('getTab', options.title).css(options.css);
                }
            });
        },
        addEventListener: function(jq, param){
            return jq.each(function(){
                var eventList = $.isArray(param) ? param : [param];
                var target = this;
                $.each(eventList, function(i, event){
                    addEventListener(target, event.name, event.handler|| function(){}, event.override);
                });
            });
        }
    });

    var plugin = $.fn.tabs;
    $.fn.tabs = function(options, param){
        if (typeof options != 'string'){
            return this.each(function(){
                plugin.call($(this), options, param);

                initContextMenu(this);
            });
        } else {
            return plugin.call(this, options, param);
        }
    };

    $.fn.tabs.methods = plugin.methods;
    $.fn.tabs.defaults = plugin.defaults;
    $.fn.tabs.parseOptions = plugin.parseOptions;
})(jQuery);
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
        var tb = $(target)
//            .addClass('datagrid-toolbar')
//            .addClass("panel-header")
            .addClass("dialog-toolbar panel-body")
            .css({'height': '28px', 'line-height':'24px', overflow: 'hidden'});

        if($.trim(tb.html()).length > 0){
            return;
        }

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
                url: options.url,
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
/**
 * Created with IntelliJ IDEA.
 * Licensed under the GPL licenses
 * http://www.gnu.org/licenses/gpl.txt
 * @author: 爱看书不识字<zjh527@163.com>
 *
 * depend on:
 *  jquery.easyui.menu.extend.js
 *
 * 扩展说明：
 *  1、支持“简单数据格式”和“类标准数据格式”数据加载
 *      1.1 属性说明：
 *          idField:            值字段
 *          textField:          节点文本字段
 *          iconField:          节点图标字段
 *          parentField:        父节点字段，无此属性设置，则不会执行简单JSON数据格式加载
 *          childrenField:      子节点字段，用于类标准格式加载，而非简单格式加载
 *          attributesField:    属性节点字段，用于类标准格式加载，而非简单格式加载
 *          attributes:         属性字段名数组
 *          dataModel:          加载数据结构，值为simpleData则按简单数据格式解析，
 *                              不设置此属性则按标准格式或类标准格式加载
 *
 *
 *
 *      1.1 简单数据格式(simpleData)
 *          [
 *              {id: 1, text: 'My Documents', iconCls: 'icon-document', state: 'closed},
 *              {id: 11, text: 'Photos', total: 20, pid: 1},
 *              {id: 12, text: 'Wife', total: 5, pid: 1},
 *              {id: 12, text: 'Company', total: 40, pid: 1},
 *              {id: 2, text: 'Program Files'},
 *              {id: 21, text: 'Intel', pid: 2},
 *              {id: 22, text: 'Java', pid: 2}
 *          ]
 *
 *          1.1.1 如果某条数据中idField和parentField属性指向的字段对应值相等，或者不包含
 *                parentField属性指定的字段时，则这条数据被视为根（子数根）节点。
 *
 *          1.1.2 示例：
 *              $('#tt').tree({
 *                  url: '../tree/tree_data1.json',
 *                  customAttr: {
 *                      dataModel: 'simpleData',
 *                      textField: 'region',
 *                      iconField: 'icon',
 *                      parentField: '_parentId',
 *                      attributes: ['f1', 'f2', 'f3']
 *                  }
 *              }).tree('followCustomHandle');
 *
 *      1.2 类标准数据格式
 *          [
 *              {id: 1, name: 'My Documents', iconCls: 'icon-document', files: [
 *                  {id: 11, name: 'Photos', total: 20},
 *                  {id: 12, name: 'Wife', total: 5},
 *                  {id: 13, name: 'Company', total: 50}
 *              ]},
 *              {id: 2, name: 'Program Files', files: [
 *                  {id: 21, name: 'Intel'},
 *                  {id: 22, name: 'Java'}
 *              ]}
 *          ]
 *
 *          1.2.1 示例
 *              $().tree({
 *                  url: '../../tree/tree_data3.json',
 *                  customAttr:{
 *                      textField: 'name',
 *                      childrenField: 'files',
 *                      attributes: ['total']
 *                  }
 *              }).tree('followCustomHandle');
 *
 *
 *
 *  2、支持右键菜单
 *      2.1 显示菜单
 *          $('#tt').tree({
 *              url: '../tree/tree_data2.json',
 *              customAttr: {
 *                  contextMenu: {
 *                      isShow: true
 *                  }
 *              }
 *          }).tree('followCustomHandle');
 *
 *
 *      2.2  自定义菜单项
 *          $('#tt').tree({
 *              url: '../tree/tree_data2.json',
 *              customAttr:{
 *                  contextMenu:{
 *                      isShow: true,
 *                      isMerge: true,
 *                      items:['-',{
 *                          text: 'others',
 *                          submenu: [{
 *                              text: 'item1'
 *                          },{
 *                              text: 'item2'
 *                          }]
 *                      }]
 *                  }
 *              }
 *          }).tree('followCustomHandle');
 *
 *
 *      2.3  自定义菜单项替换默认菜单项
 *          $('#tt').tree({
 *              url: '../tree/tree_data2.json',
 *              customAttr: {
 *                  contextMenu: {
 *                      isShow: true,
 *                      isMerge: false,
 *                      items: [{
 *                          text: 'others'
 *                      }]
 *                  }
 *              }
 *          }).tree('followCustomHandle');
 *
 *
 *      2.4  菜单项onclick事件参数说明：
 *          item: 当前点击的item
 *          node: 触发右键菜单的节点
 *          target: 一个指向当前tree的，非jquery对象引用
 *
 *          $('#tt').tree({
 *              url: '../tree/tree_data2.json',
 *              customAttr: {
 *                  contextMenu: {
 *                      isShow: true,
 *                      items: [{
 *                          text: 'others',
 *                          onclick: function(item, node, target){......}
 *                      }]
 *                  }
 *              }
 *          }).tree('followCustomHandle');
 *
 *
 *      2.5 默认支持节点位置上移、下移操作
 *
 *
 *  3、节点收缩、展开控制
 *      3.1、点击节点展开、收缩控制。
 *          控制属性： expandOnNodeClick  ，默认值：false
 *
 *          $('#tt').tree({
 *              lines: true,
 *              url: '../tree/tree_data2.json',
 *              customAttr:{
 *                  expandOnNodeClick: true
 *              }
 *          }).tree('followCustomHandle');
 *
 *      3.2、双击节点展开、收缩控制。
 *          控制属性：expandOnDblClick，默认值：false
 *
 *          $('#tt').tree({
 *              lines: true,
 *              url: '../tree/tree_data2.json',
 *              customAttr: {
 *                  expandOnNodeClick: false,
 *                  expandOnDblClick: true
 *              }
 *          }).tree('followCustomHandle');
 *
 *      3.3、当expandOnNodeClick、 expandOnDblClick同时为true时，expandOnNodeClick起作用。
 *
 *
 *  4、增加getLevel方法，返回节点层级
 *
 *
 *  5、增加onAfterMove事件，节点位置上移、下移操作之后被触发。
 *      此事件接收两个参数：
 *          target:     被互换位置的节点对象
 *          source:     当前被操作要改变位置的节点对象
 *
 *      eg.
 *          $('#tt').tree({
 *              url: '../tree/tree_data2.json',
 *              customAttr: {
 *                  contextMenu: {
 *                      isShow: true
 *                  },
 *                  onAfterMove: function(target, source){
 *                      var msg = '位置互换节点为：[ ' + target.text + ' ]和[ ' + source.text + ' ]';
 *                      $.messager.alert('信息', msg, 'info');
 *                  }
 *              }
 *          }).tree('followCustomHandle');
 *
 *
 *  6、增强expandTo方法，参数target支持两种类型：
 *      1) Dom对象（原始用法，看easyui API说明）
 *      2) 数字， 层级数（增强功能），表示从根开始，展开到第几层
 *
 *
 *  7、新增方法 addEventListener，用于初始化之后动态注册事件，支持一个事件可以注册多个处理方法。
 *      7.1 事件对象属性说明
 *          name:       事件名称
 *          override:   是否覆盖事件默认处理行为，值:true|false，默认:false
 *          handler:    定义事件处理行为
 *
 *      7.1 单个事件处理方法注册
 *          $('#tt').tree('addEventListener', {
 *              name: 'onClick',
 *              handler: function(node){}
 *          });
 *
 *      7.2 多个事件处理方法注册
 *          $('#tt').tree('addEventListener', [{
 *              name: 'onClick',
 *              handler: function(node){}
 *          },{
 *              name: 'onLoadSuccess',
 *              handler: function(node, data){}
 *          }])
 *
 *      7.3 覆盖事件默认处理行为
 *          $('#tt').tree('addEventListener', {
 *              name: 'onClick',
 *              override: true,
 *              handler: function(node){}
 *          });
 *
 *  8、增加unselect方法
 *      $('#tt').tree('unselect',node);
 *
 */
(function($){
    function getContextMenuId(target){
        return $(target).attr('id')+'_contextmenu';
    }

    function buildContextMenu(target, menuitems){
        var menuid = getContextMenuId(target);
        var contextmenu = $('#'+menuid);
        if(contextmenu.length==0){
            contextmenu = $('<div>', {id: menuid}).menu();
            contextmenu.menu('appendItems', menuitems);
        }
        return contextmenu;
    }

    function getMenuItemOnClickHandler(menuitems){
        var onclickHandler={};

        $.each(menuitems, function(){
            var item = this;
            if(item.onclick){
                var index = item.id || item.text;
                onclickHandler[index] = item.onclick;
                delete item.onclick;
            }

            if(item.submenu && $.isArray(item.submenu) && item.submenu.length>0){
                $.extend(onclickHandler, getMenuItemOnClickHandler(item.submenu));
            }
        });

        return onclickHandler;
    }

    function getDefaultContextMenuItems(target){
        var menuid = getContextMenuId(target);
        return [
            {id: menuid+'_moveup', text: '位置上移', iconCls: 'icon-moveup', onclick: plugin.contextmenu.defaultEvents.moveup},
            {id: menuid+'_movedown', text: '位置下移', iconCls: 'icon-movedown', onclick: plugin.contextmenu.defaultEvents.movedown}
        ];
    }

    function initContextMenu(target){
        var opts = $.extend(true, {}, $.fn.tree.defaults, $(target).tree('options'));
        var menuOpts = opts.customAttr.contextMenu;
        if(!menuOpts.isShow) return;

        var menuitems = getDefaultContextMenuItems(target);
        if(menuOpts.isMerge && $.isArray(menuOpts.items) && menuOpts.items.length>0){
            menuitems = $.merge(menuitems, menuOpts.items);
        }

        if(!menuOpts.isMerge && $.isArray(menuOpts.items) && menuOpts.items.length>0){
            menuitems = menuOpts.items;
        }

        var onClickHandlerCache = getMenuItemOnClickHandler(menuitems);
        var contextmenu = buildContextMenu(target, menuitems);

        $(target).tree('addEventListener', {
            name: 'onContextMenu',
            handler: function(e, node){
                e.preventDefault();

                $(target).tree('select', node.target);
                contextmenu.menu('addEventListener', {
                    name: 'onClick',
                    override: true,
                    handler: function(item){
                        var name = item.id || item.text;
                        if(onClickHandlerCache[name]){
                            onClickHandlerCache[name].call(this, item, node, target);
                        }
                    }
                }).menu('show',{
                    left: e.pageX,
                    top: e.pageY
                });
            }
        });
    }

    function getPrevNode(target, node){
        var nodeTag = node.id || node.text;
        var parent = $(target).tree('getParent', node.target);
        var children = getChildren(target, parent.target, false);
        var prevNodeIndex = -1;
        for(var i= 0, len = children.length; i<len; i++){
            var childrenTag = children[i].id || children[i].text;
            if(nodeTag == childrenTag){
                prevNodeIndex = i-1;
                break;
            }
        }

        if(prevNodeIndex>-1){
            return children[prevNodeIndex];
        }
        return null;
    }

    function getNextNode(target, node){
        var nodeTag = node.id || node.text;
        var parent = $(target).tree('getParent', node.target);
        var children = getChildren(target, parent.target, false);
        var nextNodeIndex = -1;
        for(var i= 0, len = children.length; i<len; i++){
            var childrenTag = children[i].id || children[i].text;
            if(nodeTag == childrenTag){
                nextNodeIndex = i+1;
                break;
            }
        }

        if(nextNodeIndex >-1 && nextNodeIndex < children.length){
            return children[nextNodeIndex];
        }
        return null;
    }

    function getChildren(target, nodeTarget, isAll){
        if(isAll){
            return $(target).tree('getChildren', nodeTarget);
        }else{
            var children = [];
            $(nodeTarget).next().find('>li>div.tree-node').each(function(){
                children.push($(target).tree('getNode', this));
            });

            return children;
        }
    }


    function expandHandler(target){
        var options = $.extend(true, {}, $.fn.tree.defaults, $(target).tree('options'));
        if(!options.customAttr.expandOnNodeClick && !options.customAttr.expandOnDblClick) return;


        if(options.customAttr.expandOnNodeClick){
            $(target).tree('addEventListener', {
                name: 'onClick',
                handler: function(node){
                    $(target).tree('toggle', node.target);
                }
            });

            return;
        }

        if(options.customAttr.expandOnDblClick){
            $(target).tree('addEventListener', {
                name: 'onDblClick',
                handler: function(node){
                    $(target).tree('toggle', node.target);
                }
            });
        }

    }

    function getLevel(target, node){
//        var p = $(node.target).parentsUntil('ul.tree', 'ul');
//        return p.length + 1;

        var n = 1;
        var parentNode = $(target).tree('getParent', node.target);
        if(!parentNode){
            return 1;
        }
        return n + getLevel(target, parentNode);
    }

    function expandTo(target, level, node){
        var nodes = node ? [node] : $(target).tree('getRoots');
        for(var i= 0; i<nodes.length; i++){
            var children = getChildren(target, nodes[i].target, false);
            for(var j=0; j<children.length; j++){
                $(target).tree('expandTo', children[j].target);
            }

            level--;
            if(level > 0){
                for(var j=0; j<children.length; j++){
                    expandTo(target, level, children[j]);
                }
            }
        }
    }

    function onlyNodeExpandHandler(target){
        var options = $.extend(true, {}, $.fn.tree.defaults, $(target).tree('options'));
        if(!options.customAttr.onlyNodeExpand) return;

        $(target).tree('addEventListener', {
            name: 'onBeforeExpand',
            handler: function(node){
                var parent = $(target).tree('getParent', node.target);
                if(parent){
                    var children = getChildren(target, parent.target, false);
                    for(var i=0; i<children.length; i++){
                        if(children[i].state == 'open'){
                            $(target).tree('collapseAll', children[i].target);
                        }
                    }
                }else{
                    $(target).tree('collapseAll');
                }
            }
        });
    }

    function addEventListener(target, eventName, handler, override){
        var options = $(target).tree('options');
        var defaultActionEvent = options[eventName];
        switch (eventName){
            case 'onBeforeLoad':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(node, param){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onLoadSuccess':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(node, data){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onLoadError':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(arguments){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onBeforeCheck':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(node, checked){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onCheck':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(node, checked){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onContextMenu':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(e, node){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onDragEnter':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(target, source){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onDragOver':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(target, source){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onDragLeave':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(target, source){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onBeforeDrop':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(target,source,point){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onDrop':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(target,source,point){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            default :
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(node){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
        }
    }

    function appendAttibutes(node, attributes){
        if(!node['attributes']){
            node['attributes'] = {};
        }

        for(var i=0; i<attributes.length; i++){
            node['attributes'][attributes[i]] = node[attributes[i]];
        }
    }

    function isTransfrom(options){
        var flag = options.idField ||
            options.textField ||
            options.iconField ||
            options.childrenField ||
            options.attributesField ||
            options.attributes || false;

        return flag ? true : false;
    }

    function simpleDataTransform(options, data){
        if(!isTransfrom(options)) return data;

        var idField = options.idField || 'id',
            textField = options.textField || 'text',
            iconField = options.iconField || 'iconCls',
            parentField = options.parentField || 'pid',
            attributes = options.attributes || [];

        var treeData = [], tmpMap = [];

        for(var i= 0, len = data.length; i<len; i++){
            tmpMap[data[i][idField]] = data[i];
        }

        for(var i= 0, len = data.length; i<len; i++){
            if(tmpMap[data[i][parentField]] && data[i][idField] != data[i][parentField]){
                if(!tmpMap[data[i][parentField]]['children']){
                    tmpMap[data[i][parentField]]['children'] = [];
                }

                data[i]['id'] = data[i][idField];
                data[i]['text'] = data[i][textField];
                data[i][iconField] && (data[i]['iconCls'] = data[i][iconField]);
                appendAttibutes(data[i], attributes);
                tmpMap[data[i][parentField]]['children'].push(data[i]);
            }else{
                data[i]['id'] = data[i][idField];
                data[i]['text'] = data[i][textField];
                data[i][iconField] && (data[i]['iconCls'] = data[i][iconField]);
                appendAttibutes(data[i], attributes);
                treeData.push(data[i]);
            }
        }

        return treeData;
    }

    function standardTransform(options, data){
        if(!isTransfrom(options)) return data;

        var idField = options.idField || 'id',
            textField = options.textField || 'text',
            iconField = options.iconField || 'iconCls',
            childrenField = options.childrenField || 'children',
            attributesField = options.attributesField || 'attributes',
            attributes = options.attributes || [];

        var transform = function(node){
            if(!node['id'] && node[idField]) node['id'] = node[idField];
            if(!node['text'] && node[textField]) node['text'] = node[textField];
            if(!node['iconCls'] && node[iconField]) node['iconCls'] = node[iconField];
            if(!node['children'] && node[childrenField]) node['children'] = node[childrenField];
            if(!node['attributes'] && node[attributesField]) node['attributes'] = node[attributesField];

            if(attributes && $.isArray(attributes)){
                appendAttibutes(node, attributes);
            }

            if(node['children']){
                for(var i=0; i<node['children'].length; i++){
                    transform(node['children'][i]);
                }
            }
        }

        for(var i=0; i<data.length; i++){
            transform(data[i]);
        }

        return data;
    }

    function unselect(target, node){
        $(node.target).removeClass('tree-node-selected');
    }


    $.fn.tree.contextmenu={
        defaultEvents:{
            moveup: function(item, node, target){
                var options = $.extend(true, {}, $.fn.tree.defaults, $(target).tree('options'));
                var prevnode = getPrevNode(target, node);
                if(prevnode){
                    var nodeData = $(target).tree('pop', node.target);
                    $(target).tree('insert',{
                        before: prevnode.target,
                        data: nodeData
                    });
                    options.customAttr.onAfterMove.call(this, prevnode, node);
                }
            },
            movedown: function(item, node, target){
                var options = $.extend(true, {}, $.fn.tree.defaults, $(target).tree('options'));
                var nextnode = getNextNode(target, node);
                if(nextnode){
                    var nodeData = $(target).tree('pop', node.target);
                    $(target).tree('insert', {
                        after: nextnode.target,
                        data: nodeData
                    });
                    options.customAttr.onAfterMove.call(this, nextnode, node);
                }
            }
        }
    };

    $.fn.tree.defaults.customAttr = {
        idField: null,
        textField: null,
        parentField: null,
        iconField: null,
        childrenField: null,
        attributesField: null,
        attributes: null,
        dataModel: null,
        /**
         * 单击节点展开收缩
         */
        expandOnNodeClick: false,
        /**
         * 双击节点展开收缩
         */
        expandOnDblClick: false,
        onlyNodeExpand: false,
        contextMenu: {
            isShow: false,
            isMerge: true,
            items:[]
        },
        /**
         * 节点位置上、下移动后触发事件
         * @param target    被互换位置的节点对象
         * @param source    当前被操作要改变位置的节点对象
         */
        onAfterMove: function(target, source){}
    };

    $.fn.tree.defaults.loadFilter = function(data, parent){
        var cusOptions = $(this).tree('options').customAttr;
        if(cusOptions){
            if(cusOptions.dataModel == 'simpleData'){
                return simpleDataTransform(cusOptions, data);
            }else{
                return standardTransform(cusOptions, data);
            }
        }
        return data;
    }

    $.fn.combotree.defaults.loadFilter = $.fn.tree.defaults.loadFilter;

    var defaultMethods = $.extend({}, $.fn.tree.methods);
    $.extend($.fn.tree.methods, {
        followCustomHandle: function(jq){
            return jq.each(function(){});
        },
        /**
         * 获得节点层级
         */
        getLevel: function(jq, node){
            return getLevel(jq[0], node);
        },
        expandTo: function(jq, target){
            return jq.each(function(){
                if($.type(target) == 'number'){
                    var level = target;
                    expandTo(this, level);
                }else{
                    defaultMethods.expandTo(jq, target);
                }
            });
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
        unselect:function(jq,node){
            return jq.each(function(){
                unselect(this,node);
            });
        }
    });

    var plugin = $.fn.tree;
    $.fn.tree = function(options, param){
        if (typeof options != 'string'){
            return this.each(function(){
                plugin.call($(this), options, param);
                initContextMenu(this);
                expandHandler(this);
                onlyNodeExpandHandler(this);
            });
        } else {
            return plugin.call(this, options, param);
        }
    };

    $.fn.tree.methods = plugin.methods;
    $.fn.tree.defaults = plugin.defaults;
    $.fn.tree.parseOptions = plugin.parseOptions;
    $.fn.tree.contextMenu = plugin.contextMenu;
    if(plugin.parseData) {//兼容1.4.5
        $.fn.tree.parseData = plugin.parseData;
    }
})(jQuery);
/**
 * Created with IntelliJ IDEA.
 * Licensed under the GPL licenses
 * http://www.gnu.org/licenses/gpl.txt
 * @author: 爱看书不识字<zjh527@163.com>
 *
 * depend on:
 *  jquery.easyui.menu.extend.js
 *
 *
 * 扩展说明：
 *      1、增强简单JSON格式数据加载。
 *          1.1 属性说明：
 *              iconField:      节点图标字段
 *              parentField:    父节点字段，无此属性设置，则增强功能不会生效。
 *
 *
 *          1.2 当符合以下条件时，节点被视为树的根节点
 *              a) idField和parentField属性指向的字段对应值相等。
 *              b) 数据中不含有parentField属性指定的字段。
 *              c) parentField属性指定的字段值为0
 *
 *          1.3 加载时iconField默认查找icon
 *
 *          1.4 示例
 *              $('#tt').treegrid({
 *                  url: '../treegrid/treegrid_data2.json',
 *                  idField: 'id',
 *                  treeField: 'name',
 *                  columns: [[
 *                      {field: 'name', title: 'Name', width: 220},
 *                      {field: 'size', title: 'Size', width: 100},
 *                      {field: 'date', title: 'Date', width: 150}
 *                  ]],
 *                  customAttr: {
 *                      parentField: 'pid',
 *                      iconField: 'icon'
 *                  }
 *              }).treegrid('followCustomHandle');
 *
 *
 *
 *      2、右键菜单
 *          2.1 菜单显示控制属性：
 *              isShow:     是否显示右键菜单,默认值: false
 *              items:      自定义菜单项内容，支持'-'定义菜单项分割符
 *              isMerge:    是否将items中自定义菜单项与默认右键菜单项合并，默认值:true
 *
 *              eg.
 *                  $('#tt').treegrid({
 *                      url: '../treegrid/treegrid_data1.json',
 *                      idField: 'id',
 *                      treeField: 'name',
 *                      columns: [[
 *                          {field: 'name', title: 'Name', width: 220},
 *                          {field: 'size', title: 'Size', width: 100},
 *                          {field: 'date', title: 'Date', width: 150}
 *                      ]],
 *                      customAttr: {
 *                          contextMenu: {
 *                              isShow: true
 *                          }
 *                      }
 *                  }).treegrid('followCustomHandle');
 *
 *
 *          2.2 自定义菜单项
 *              $('#tt').treegrid({
 *                  url: '../treegrid/treegrid_data1.json',
 *                  idField: 'id',
 *                  treeField: 'name',
 *                  columns: [[
 *                      {field: 'name', title: 'Name', width: 220},
 *                      {field: 'size', title: 'Size', width: 100},
 *                      {field: 'date', title: 'Date', width: 150}
 *                  ]],
 *                  customAttr: {
 *                      contextMenu: {
 *                          isShow: true,
 *                          items: {
 *                              text: 'others',
 *                              submenu: [{
 *                                  text: 'item1',
 *                                  iconCls: 'icon-add',
 *                                  onclick: function(item, row, target){}
 *                              },{
 *                                  text: 'item2'
 *                              }]
 *                          }
 *                      }
 *                  }
 *              }).treegrid('followCustomHandle');
 *
 *
 *         2.3 菜单项onclick事件参数说明:
 *              item:       当前点击的菜单项
 *              row:        触发右键菜单的treegrid行数据
 *              target:     一个指向treegrid的引用，非jquery对象
 *
 *              示例，请参考2.2
 *
 *
 *         2.4 默认支持行删除、刷新操作。
 *
 *
 *      3、节点收缩、展开控制
 *          3.1 点击节点展开、收缩控制
 *              控制属性：expandOnNodeClick  默认值：false
 *
 *              $('#tt').treegrid({
 *                  url: '../treegrid/treegrid_data1.json',
 *                  idField: 'id',
 *                  treeField: 'name',
 *                  columns: [[
 *                      {field: 'name', title: 'Name', width: 220},
 *                      {field: 'size', title: 'Size', width: 100},
 *                      {field: 'date', title: 'Date', width: 150}
 *                  ]],
 *                  customAttr: {
 *                      expandOnNodeClick: true
 *                  }
 *              }).treegrid('followCustomHandle');
 *
 *
 *         3.2 双击节点展开、收缩控制
 *              控制属性：expandOnDblClick，  默认值：false
 *
 *              $('#tt').treegrid({
 *                  url: '../treegrid/treegrid_data1.json',
 *                  idField: 'id',
 *                  treeField: 'name',
 *                  columns: [[
 *                      {field: 'name', title: 'Name', width: 220},
 *                      {field: 'size', title: 'Size', width: 100},
 *                      {field: 'date', title: 'Date', width: 150}
 *                  ]],
 *                  customAttr: {
 *                      expandOnDblClick: true
 *                  }
 *              }).treegrid('followCustomHandle');
 *
 *
 *         3.3 当expandOnNodeClick、 expandOnDblClick同时为true时，expandOnNodeClick起作用。
 *
 *
 *      4、支持Ext.grid的rowEditing风格 ,默认关闭。 控制属性rowediting，默认值false
 *          eg.
 *              $('#tt').treegrid({
 *                  url: '../treegrid/treegrid_data1.json',
 *                  idField: 'id',
 *                  treeField: 'name',
 *                  columns: [[
 *                      {field: 'name', title: 'Name', width: 220, editor: 'text'},
 *                      {field: 'size', title: 'Size', width: 100, editor: 'text'},
 *                      {field: 'date', title: 'Date', width: 150, editor: 'my97'}
 *                  ]],
 *                  customAttr: {
 *                      rowediting: true
 *                  }
 *              }).treegrid('followCustomHandle');
 *
 *
 *      5、增加getEditingRow方法，返回当前正在编辑的行数据（row data）
 *
 *
 *      6、执行followCustomHandle，扩展属性才能生效。
 *
 *
 *      7、支持tooltip显示
 *          7.1 控制属性
 *              tooltip: {
 *                  enable：         tooltip显示开关，true|false
 *                  target：         tooltip触发对象，
 *                                   值：row或cell。row整行触发，cell只在指定的field对应的cell中触发。
 *                                   默认值：row
 *                  position：       tooltip显示位置
 *                  fields：         定义触发显示tooltip的列
 *                  formatter：      定义tooltip内容显示风格，方法接收参数受target属性影响。
 *                                   a) 当target:'row'时：
 *                                          formatter: function(nodeid, node){}
 *
 *                                   b) 当target:'cell'时：
 *                                          formatter: function(value, field, nodeid, node){}
 *
 *                                   c) 方法返回值String或Object
 *                                      i) 当返回String时, 其值直接作为tooltip内容显示
 *                                     ii) 当返回Object时, Object包含如下属性:
 *                                          content: tooltip显示内容
 *                                          css: tooltip显示样式，此属性值为一个Object
 *              }
 *
 *
 *          7.2 row触发设置
 *              $('#tt').treegrid({
 *                  url: '../treegrid/treegrid_data1.json',
 *                  idField: 'id',
 *                  treeField: 'name',
 *                  columns:[[
 *                      {field: 'name', title: 'Name', width: 220},
 *                      {field: 'size', title: 'Size', width: 100},
 *                      {field: 'date', title: 'Date', width: 150}
 *                  ]],
 *                  customAttr: {
 *                      tooltip: {
 *                          enable: true
 *                      }
 *                  }
 *              }).treegrid('followCustomHandle');
 *
 *
 *          7.3 row触发设置，自定义显示风格
 *              $('#tt').treegrid({
 *                  url: '../treegrid/treegrid_data1.json',
 *                  idField: 'id',
 *                  treeField: 'name',
 *                  columns: [[
 *                      {field: 'name', title: 'Name', width: 220},
 *                      {field: 'size', title: 'Size', width: 100},
 *                      {field: 'date', title: 'Date', width: 150}
 *                  ]],
 *                  customAttr: {
 *                      tooltip: {
 *                          enable: true,
 *                          formatter: function(nodeid, node){
 *                              return {
 *                                  content: $.param(node),
 *                                  css: {
 *                                      backgroundColor: '#FFFF88',
 *                                      borderColor: '#df8505'
 *                                  }
 *                              }
 *                          }
 *                      }
 *                  }
 *              }).treegrid('followCustomHandle');
 *
 *
 *          7.4 cell触发设置
 *              $('#tt').treegrid({
 *                  url: '../treegrid/treegrid_data1.json',
 *                  idField: 'id',
 *                  treeField: 'name',
 *                  columns: [[
 *                      {field: 'name', title: 'Name', width: 220},
 *                      {field: 'size', title: 'Size', width: 100},
 *                      {field: 'date', title: 'Date', width: 150}
 *                  ]],
 *                  customAttr: {
 *                      tooltip: {
 *                          enable: true,
 *                          target: 'cell'
 *                      }
 *                  }
 *              }).treegrid('followCustomHandle');
 *
 *
 *          7.5  cell触发设置，自定义显示风格
 *              $('#tt').treegrid({
 *                  url: '../treegrid/treegrid_data1.json',
 *                  idField: 'id',
 *                  treeField: 'name',
 *                  columns: [[
 *                      {field: 'name', title: 'Name', width: 220},
 *                      {field: 'size', title: 'Size', width: 100},
 *                      {field: 'date', title: 'Date', width: 150}
 *                  ]],
 *                  customAttr: {
 *                      tooltip: {
 *                          enable: true,
 *                          target: 'cell',
 *                          fields: ['name', 'date'],
 *                          formatter: function(value, field, nodeid, node){
 *                              return {
 *                                  content: value,
 *                                  css: {
 *                                      backgroundColor: '#FFFF88',
 *                                      borderColor: '#df8505'
 *                                  }
 *                              }
 *                          }
 *                      }
 *                  }
 *              }).treegrid('followCustomHandle');
 *
 *
 *      8、支持列头显示ContextMenu
 *          8.1 控制属性
 *              headerContextMenu: {
 *                  isShow:     右键菜单显示控制开关，值:true|false，默认:false
 *                  isMerge:    自定义菜单项与默认菜单项合并控制开关，值:true|false，默认:true
 *                  items:      自定义菜单项内容，类型:数组,支持'-'定义菜单项分割符
 *              }
 *
 *
 *          8.2 默认菜单项支持列的显示和隐藏（被控制的列必须是在columns属性中定义的），
 *              treeField属性指定的列不支持此操作。
 *
 *
 *          8.3 显示默认菜单项
 *              $('#tt').treegrid({
 *                  url: '../treegrid/treegrid_data1.json',
 *                  idField: 'id',
 *                  treeField: 'name',
 *                  columns: [[
 *                      {field: 'name', title: 'Name', width: 220},
 *                      {field: 'size', title: 'Size', width: 100},
 *                      {field: 'date', title: 'Date', width: 150}
 *                  ]],
 *                  customAttr: {
 *                      headerContextMenu: {
 *                          isShow: true
 *                      }
 *                  }
 *              }).treegrid('followCustomHandle');
 *
 *         8.4 自定义右键菜单项
 *              $('#tt').treegrid({
 *                  url: '../treegrid/treegrid_data1.json',
 *                  idField: 'id',
 *                  treeField: 'name',
 *                  columns: [[
 *                      {field: 'name', title: 'Name', width: 220},
 *                      {field: 'size', title: 'Size', width: 100},
 *                      {field: 'date', title: 'Date', width: 150}
 *                  ]],
 *                  customAttr: {
 *                      headerContextMenu: {
 *                          isShow: true,
 *                          items: [{
 *                              text: 'item1',
 *                              onclick: function(item, field, target){}
 *                          }]
 *                      }
 *                  }
 *              }).treegrid('followCustomHandle');
 *
 *        8.5 菜单项onclick事件参数说明
 *              item:       当前点击的菜单项
 *              field:      触发右键菜单的列字段
 *              target:     一个指向当前treegrid的引用，非jquery对象
 *
 *
 *
 *  9、新增方法 addEventListener ,用于初始化之后动态注册事件，支持一个事件可以注册多个处理方法。
 *      9.1 事件对象属性说明
 *          name:       事件名称
 *          override:   是否覆盖默认事件处理行为
 *          handler:    定义事件处理行为
 *
 *      9.2 单事件处理方法注册
 *          $('#tt').treegrid('addEventListener', {
 *              name: 'onClickRow',
 *              handler: function(row){}
 *          });
 *
 *      9.3 多事件处理方法注册
 *          $('#tt').treegrid('addEventListener', [{
 *              name: 'onClickRow',
 *              handler: function(row){}
 *          },{
 *              name: 'onExpand',
 *              handler: function(row){}
 *          }]);
 *
 *      9.4 覆盖事件默认行为
 *          $('#tt').treegrid('addEventListener', {
 *              name: 'onClickRow',
 *              override: true,
 *              handler: function(row){}
 *          });
 *
 *
 *  10、增加自定义事件 onConfirmEdit， 用于 Ext.rowediting 编辑风格。
 *      a) 在点击确认按钮触发
 *      b) 当此事件返回值为false时终止 endEdit 方法执行
 *      c) 接收一个 node 参数，(当前编辑行数据)
 *
 *      $('dg').treegrid({
 *          ....,
 *          customAttr: {
 *              rowediting: true,
 *              onConfirmEdit: function(row){
 *                  //此处添加你的逻辑，例如确定前的检查
 *              }
 *          }
 *      })
 *
 *
 */
(function($){
    function getContextMenuId(target, surfix){
        return $(target).attr('id')+'_'+surfix;
    }

    function buildContextMenu(target, menuitems, type){
        var menuid = getContextMenuId(target, type);
        var contextmenu = $('#'+menuid);
        if(contextmenu.length==0){
            contextmenu = $('<div>', {id: menuid}).menu();
            contextmenu.menu('appendItems', menuitems);
        }
        return contextmenu;
    }

    function getMenuItemOnClickHandler(menuitems){
        var onclickHandler={};

        $.each(menuitems, function(){
            var item = this;
            if(item.onclick){
                var index = item.id || item.text;
                onclickHandler[index] = item.onclick;
                delete item.onclick;
            }

            if(item.submenu && $.isArray(item.submenu) && item.submenu.length>0){
                $.extend(onclickHandler, getMenuItemOnClickHandler(item.submenu));
            }
        });

        return onclickHandler;
    }


    function getDefaultContextMenuItems(target){
        var menuid = getContextMenuId(target, 'rowContextMenu');
        return [
            {
                id: menuid+'_delete',
                text: '删除',
                iconCls: 'icon-remove',
                onclick: plugin.headerContextMenu.defaultEvents.doRemove
            },
            '-',
            {
                id: menuid+'_reload',
                text: '刷新',
                iconCls: 'icon-reload',
                onclick: plugin.headerContextMenu.defaultEvents.doReload
            }
        ];
    }

    function initContextMenu(target){
        var options = $.extend(true, {}, $.fn.treegrid.defaults, $(target).treegrid('options'));
        var menuOpts = options.customAttr.contextMenu;
        if(!menuOpts.isShow) return;

        var menuitems = getDefaultContextMenuItems(target);
        if(menuOpts.isMerge && $.isArray(menuOpts.items) && menuOpts.items.length>0){
            $.merge(menuitems, menuOpts.items);
        }

        if(!menuOpts.isMerge && $.isArray(menuOpts.items) && menuOpts.items.length>0){
            menuitems = menuOpts.items;
        }

        var onClickHandlerCache = getMenuItemOnClickHandler(menuitems);
        var contextmenu = buildContextMenu(target, menuitems, 'rowContextMenu');

        $(target).treegrid('addEventListener', {
            name: 'onContextMenu',
            handler: function(e, row){
                e.preventDefault();
                $(target).treegrid('select', row[options.idField]);

                var menuOptions = contextmenu.menu('options');
                menuOptions.onClickCallback = menuOptions.onClickCallback || menuOptions.onClick;

                contextmenu.menu('addEventListener', {
                    name: 'onClick',
                    override: true,
                    handler: function(item){
                        var name = item.id || item.text;
                        if(onClickHandlerCache[name]){
                            onClickHandlerCache[name].call(this, item, row, target);
                        }
                    }
                }).menu('show', {
                    left: e.pageX,
                    top: e.pageY
                });
            }
        });
    }

    function getDefaultHeaderContextMenuItems(target){
        var menuid = getContextMenuId(target, 'headerContextMenu');
        var defaultMenuItems = [{
            text: '显示/隐藏列',
            iconCls: 'icon-columns',
            submenu:[{
                id: menuid+'_showAll',
                text: '全部显示',
                iconCls: 'icon-columns',
                onclick: function(item, field, datagrid){
                    $.fn.datagrid.headerContextMenu.defaultEvents.doShowAll(datagrid);
                }
            },{
                id: menuid+'_restore',
                text: '还原',
                iconCls: 'icon-columns',
                onclick: function(item, field, datagrid){
                    $.fn.datagrid.headerContextMenu.defaultEvents.doRestore(datagrid);
                }
            },
            '-']
        }];


        var getFieldFromMenuItemId = function(id){
            return id.substr(id.lastIndexOf('_')+1, id.length);
        }

        var columnFieldsItem = [];
        var columnFields = $(target).treegrid('getColumnFields');
        var treeField = $(target).treegrid('options').treeField;
        $.each(columnFields, function(i, field){
            if(!field) return true;

            var disabled = field == treeField ? true : false;
            var columnOption = $(target).treegrid('getColumnOption', field);
            columnOption._hidden=columnOption.hidden;

            columnFieldsItem.push({
                id: menuid+'_'+field,
                text: columnOption.title,
                iconCls: columnOption.hidden?'icon-unchecked':'icon-checked',
                disabled: disabled,
                onclick: function(item, fd, dg){
                    var field = getFieldFromMenuItemId(item.id);
                    var hidden = $(dg).treegrid('getColumnOption', field).hidden;
                    if(!hidden){
                        $.fn.datagrid.headerContextMenu.defaultEvents.doHideColumn(dg, field, item);
                    }else{
                        $.fn.datagrid.headerContextMenu.defaultEvents.doShowColumn(dg, field, item);
                    }
                }
            });
        });

        $.merge(defaultMenuItems[0].submenu, columnFieldsItem);

        return defaultMenuItems;
    }

    function initHeaderContextMenu(target){
        var options = $.extend(true, {}, $.fn.treegrid.defaults, $(target).treegrid('options'));
        var headerContentMenuOptions = options.customAttr.headerContextMenu;
        if(!headerContentMenuOptions.isShow) return;

        var menuitems = getDefaultHeaderContextMenuItems(target);
        if(headerContentMenuOptions.isMerge){
            $.merge(menuitems, headerContentMenuOptions.items);
        }

        if(!headerContentMenuOptions.isMerge &&
                $.isArray(headerContentMenuOptions.items) &&
                    headerContentMenuOptions.items.length > 0){
            menuitems = headerContentMenuOptions.items;
        }


        var onClickHandlerCache = getMenuItemOnClickHandler(menuitems);
        var headerContextMenu = buildContextMenu(target, menuitems, 'headerContextMenu');

        $(target).treegrid('addEventListener', {
            name: 'onHeaderContextMenu',
            handler: function(e, field){
                e.preventDefault();
                headerContextMenu.menu('addEventListener', {
                    name: 'onClick',
                    override: true,
                    handler: function(item){
                        var name = item.id || item.text;
                        if(onClickHandlerCache[name]){
                            onClickHandlerCache[name].call(this, item, field, target);
                        }
                    }
                }).menu('show', {
                    left: e.pageX,
                    top: e.pageY
                });
            }
        });
    }

    function expandHandle(target){
        var options = $.extend(true, {}, $.fn.treegrid.defaults, $(target).treegrid('options'));
        if(!options.customAttr.expandOnNodeClick && !options.customAttr.expandOnDblClick) return;


        var treeField = options.treeField;
        var idField = options.idField;
        if(options.customAttr.expandOnNodeClick){
            $(target).treegrid('addEventListener', {
                name: 'onClickCell',
                handler: function(field, row){
                    if(treeField == field){
                        $(target).treegrid('toggle', row[idField]);
                    }
                }
            });

            return;
        }

        if(options.customAttr.expandOnDblClick){
            $(target).treegrid('addEventListener', {
                name: 'onDblClickCell',
                handler: function(field, row){
                    if(treeField == field){
                        $(target).treegrid('toggle', row[idField]);
                    }
                }
            });
        }
    }

    function registRowEditingHandler(target){
        var options = $.extend(true, {}, $.fn.treegrid.defaults, $(target).treegrid('options'));
        if(!options.customAttr.rowediting) return;

        var getEditorButtonsPanelId = function(target){
            return $(target).attr('id')+'_editor_buttons_panel';
        }

        var deltaX = 120;
        var buildEditorButtonsPanel = function(target){
            var panelId = getEditorButtonsPanelId(target);
            if($('#'+panelId).length > 0) return;

            var panel = $(target).treegrid('getPanel');
            var datagrid_body = $('>div.datagrid-view>div.datagrid-view2>div.datagrid-body', panel);
            datagrid_body.css('position', 'relative');

            var edtBtnPanel = $('<div>', {id: panelId})
                .addClass('dialog-button')
                .appendTo(datagrid_body)
                .css({
                    'position': 'absolute',
                    'display': 'block',
                    'border-bottom': '1px solid #ddd',
                    'border-left': '1px solid #ddd',
                    'border-right': '1px solid #ddd',
                    'left': parseInt(panel.width()/2)-deltaX,
                    'z-index': 2013,
                    'display': 'none',
                    'padding': '4px 5px'
                });


            $('<a href="javascript:void(0)">确定</a>')
                .css('margin-left','0px')
                .linkbutton({iconCls: 'icon-ok'})
                .click(function(){
                    var idField = options.idField;
                    var editingRow = $(target).treegrid('getEditingRow');
                    if(!options.customAttr.onConfirmEdit.call(target, editingRow)) return;
                    $(target).treegrid('endEdit', editingRow[idField]);
                })
                .appendTo(edtBtnPanel);

            $('<a href="javascript:void(0)">取消</a>')
                .css('margin-left', '6px')
                .linkbutton({iconCls: 'icon-cancel'})
                .click(function(){
                    var idField = options.idField;
                    var editingRow = $(target).treegrid('getEditingRow');
                    $(target).treegrid('cancelEdit', editingRow[idField]);
                })
                .appendTo(edtBtnPanel);
        }

        var showEditorButtonsPanel = function(target, row){
            var idField = options.idField;
            var tr = options.finder.getTr(target, row[idField], "body", 2);
            var position = tr.position();

            var edtBtnPanelId = '#'+getEditorButtonsPanelId(target);
            var panel = $(target).treegrid('getPanel');
            var datagrid_body = $('>div.datagrid-view>div.datagrid-view2>div.datagrid-body', panel);

            var fixPosition = function(){
                var trHeight = tr.height(), trWidth = tr.width();
                var top = position.top + datagrid_body.scrollTop(), left = position.left;
                var delta = 11;

                if(trWidth > datagrid_body.width()){
                    left = datagrid_body.width()/2 - deltaX;
                }else{
                    left = trWidth/2 - deltaX;
                }

                if(position.top + (trHeight * 2 + delta) > datagrid_body.height()){
                    top = top - (trHeight + delta)
                }else{
                    top = top + trHeight;
                }

                return {top: top, left: left};
            }


            $(edtBtnPanelId).css(fixPosition()).show();
        }

        var hideEditorButtonsPanel = function(target){
            var edtBtnPanelId = '#'+getEditorButtonsPanelId(target);
            $(edtBtnPanelId).hide();
        }

        $(target).treegrid('addEventListener', [{
            name: 'onLoadSuccess',
            handler: function(row, data){
                buildEditorButtonsPanel(this);
            }
        },{
            name: 'onBeforeEdit',
            handler: function(row){
                showEditorButtonsPanel(target, row);
            }
        },{
            name: 'onAfterEdit',
            handler: function(row, changes){
                hideEditorButtonsPanel(target);
            }
        },{
            name: 'onCancelEdit',
            handler: function(row){
                hideEditorButtonsPanel(target);
            }
        }]);

    }


    function buildTooltip(target){
        var options = $.extend(true, {}, $.fn.treegrid.defaults, $(target).treegrid('options'));
        if(!options.customAttr.tooltip.enable) return;

        var showTooltip = function(target, opts){
            var initOptions = {
                position: options.customAttr.tooltip.position,
                trackMouse: true,
                onHide: function(){
                    $(target).tooltip('destroy');
                },
                onShow: function(){
                    if($.isPlainObject(opts) && opts.css){
                        $(this).tooltip('tip').css(opts.css);
                    }
                }
            };

            $.extend(initOptions, $.isPlainObject(opts) ? opts : {content: opts});

            $(target).tooltip(initOptions).tooltip('show');
        }


        var bindRow = function(tr, formatter){
            var nodeid = $(tr).attr('node-id');
            var node = $(target).treegrid('find', nodeid);
            var getDefaultContent = function(node){
                var result = [];
                //排除没有设置field的column
                var fields = $.grep(
                    $.merge($(target).treegrid('getColumnFields',true),
                    $(target).treegrid('getColumnFields')),
                    function(n, i){
                        return $.trim(n).length>0;
                });

                $.each(fields, function(){
                    var field = this;
                    var title = $(target).treegrid('getColumnOption', field).title;
                    result.push(title + ': ' + node[field]);
                });

                return result.join('<br>');
            }
            var content = formatter ? formatter(nodeid, node) : getDefaultContent(node);
            $(tr).mouseover(function(){
                showTooltip(this, content);
            });
        }

        var bindCell = function(cell, formatter){
            cell.mouseover(function(){
                var nodeid = $(this).parent().attr('node-id');
                var node = $(target).treegrid('find', nodeid);
                var field = $(this).attr('field');
                var value = node[field];
                var content = formatter ? formatter(value, field, nodeid, node) : value;
                showTooltip(this, content);
            });
        }


        var initTooltip = function(){
            if(options.customAttr.tooltip.target == 'row'){
                options.finder.getTr(target, '', 'allbody').each(function(){
                    if($(this).hasClass('datagrid-row')){
                        bindRow(this, options.customAttr.tooltip.formatter);
                    }
                });
            }else{
                if(options.customAttr.tooltip.fields &&
                    $.isArray(options.customAttr.tooltip.fields)){
                    var panel = $(target).treegrid('getPanel');
                    var datagrid_body = $('>div.datagrid-view>div.datagrid-view2>div.datagrid-body', panel);
                    $.each(options.customAttr.tooltip.fields, function(){
                        var field = this;
                        bindCell($('td[field='+field+']', datagrid_body), options.customAttr.tooltip.formatter);
                    });
                }
            }
        }

        $(target).treegrid('addEventListener', {
            name: 'onLoadSuccess',
            handler: function(row, data){
                initTooltip();
            }
        });
    }

    function addEventListener(target, eventName, handler, override){
        var options = $(target).treegrid('options');
        var defaultActionEvent = options[eventName];
        switch (eventName){
            case 'onClickRow':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(row){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onDblClickRow':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(row){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onClickCell':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(field, row){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onDblClickCell':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(field, row){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onBeforeLoad':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(row, param){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onLoadSuccess':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(row, data){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onLoadError':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(arguments){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onBeforeExpand':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(row){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onExpand':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(row){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onBeforeCollapse':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(row){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onCollapse':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(row){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onContextMenu':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(e, row){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onBeforeEdit':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(row){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onAfterEdit':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(row, changes){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            case 'onCancelEdit':
                if(override){
                    options[eventName] = handler;
                }else{
                    options[eventName] = function(row){
                        defaultActionEvent.apply(this, arguments);
                        handler.apply(this, arguments);
                    }
                }
                break;
            default :
                $(target).datagrid('addEventListener', {
                    name: eventName,
                    override: override,
                    handler: handler
                });
                break;
        }
    }

    $.fn.treegrid.headerContextMenu = {};
    $.fn.treegrid.headerContextMenu.defaultEvents={
        doRemove: function(item, row, target){
            $.messager.confirm('疑问','您确定要删除已选中的行？', function(r){
                if(r){
                    var idField = $(target).treegrid('options').idField;
                    var id = row[idField];
                    $(target).treegrid('remove', id);
                }
            });
        },
        doReload: function(item, row, target){
            $(target).treegrid('reload');
        }
    }

    $.fn.treegrid.defaults.customAttr={
        iconField: null,
        parentField: null,
        expandOnNodeClick: false,
        expandOnDblClick: false,
        headerContextMenu: {
            isShow: false,
            isMerge: true,
            items: []
        },
        contextMenu: {
            isShow: false,
            isMerge: true,
            items: []
        },
        rowediting: false,
        /**
         * target: row|cell ,tooltip 的触发对象，默认row
         */
        tooltip:{
            enable: false,
            target: 'row',
            position: 'bottom',
            fields: undefined,
            formatter: undefined
        },
        onConfirmEdit: function(node){return true}
    }

    $.fn.treegrid.defaults.loadFilter = function(data, parentId){
        var options = $(this).treegrid('options');
        var cusOtpions = options.customAttr;
        if(cusOtpions && cusOtpions.parentField){
            var idField = options.idField,
                parentField = cusOtpions.parentField,
                iconField = cusOtpions.iconField || 'icon';

            for(var i=0, len=data.rows.length; i<len; i++){
                if(data.rows[i][parentField] && data.rows[i][parentField] != '0' && data.rows[i][idField] != data.rows[i][parentField]){
                    data.rows[i]['_parentId'] = data.rows[i][parentField];
                }else{
                    delete data.rows[i][parentField];
                }

                data.rows[i]['iconCls'] = data.rows[i][iconField];
            }
        }

        return data;
    }

    $.extend($.fn.treegrid.methods, {
        followCustomHandle: function(jq){
            return jq.each(function(){});
        },
        getEditingRow: function(jq){
            var editingRows = jq.treegrid('getEditingRows');
            return editingRows.length ? editingRows[0] : null;
        },
        getEditingRows: function(jq){
            var options = jq.treegrid('options');
            var editingRow = [];
            options.finder.getTr(jq[0], "", "allbody").each(function(){
                if($(this).hasClass('datagrid-row-editing')){
                    var nodeid = $(this).attr('node-id');
                    editingRow.push(jq.treegrid('find', nodeid));
                }
            });

            return editingRow;
        },
        addEventListener: function(jq, param){
            return jq.each(function(){
                var eventList = $.isArray(param) ? param : [param];
                var target = this;
                $.each(eventList, function(i, event){
                    addEventListener(target, event.name, event.handler|| function(){}, event.override);
                });
            });
        }
    });

    var plugin = $.fn.treegrid;
    $.fn.treegrid = function(options, param){
        if (typeof options != 'string'){
            return this.each(function(){
                plugin.call($(this), options, param);

                initHeaderContextMenu(this);
                initContextMenu(this);
                expandHandle(this);
                registRowEditingHandler(this);
                buildTooltip(this);
            });
        } else {
            return plugin.call(this, options, param);
        }
    };
    $.fn.treegrid.methods = plugin.methods;
    $.fn.treegrid.defaults = plugin.defaults;
    $.fn.treegrid.parseOptions = plugin.parseOptions;
})(jQuery);
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
/**
 * Created with IntelliJ IDEA.
 * Licensed under the GPL licenses
 * http://www.gnu.org/licenses/gpl.txt
 * @author: 爱看书不识字<zjh527@163.com>
 *
 *
 *
 * 扩展说明：
 *      1、这个扩展可以在含有iframe的页面中创建跨越iframe定位在最顶层的window。
 *
 *      2、此扩展通过参数locate来指定窗体依附在哪个dom对象上。
 *          top:                表示定位在最顶层
 *          document:           当含有iframe时，窗体定位在iframe的document中
 *          某个dom元素的id:     窗体被定位在指定的dom元素中。
 *
 *          注意: 当content和href中使用相对路径时，此参数的不同设置会影响页面加载，请通过调整content和href中的相对路径来解决。
 *
 *      3、此方法不接受inline=true的设置。
 *
 *      4、其他参数请参考easyui.window。
 *
 *      5、onLoad方法接收两个参数win、body。
 *          win:    一个Object对象，包含以下两个方法:
 *                      getData: 参数name。用来获取data中设置的属性
 *                      close: 无参数，关闭当前窗体
 *
 *          body:   一个指向弹出窗body的引用，分以下两种：
 *                  a) 当useiframe=false时，是一个指向window.top或window.self的引用。
 *                     要在onLoad中对easyui.window中的内容进行设置时，请使用类似如下形式操作:
 *                          body.$('#username').val('Tom')；
 *
 *                  b) 当useiframe=true时，是一个指向iframe.contentWindow的引用。
 *                     要在onLoad中对easyui.window中的内容进行设置时，操作前先判断body是否存在，如下形式操作:
 *                          if(body) body.doInit();
 *
 *
 *          注意：当useiframe=true时，不同浏览器对此方法的执行行为不同。
 *
 *
 *      6、toolbar和buttons中定义的每个元素的handler方法都接收一个参数win。参数win说明参见5
 *
 *
 *      7、窗体大小，默认计算规则：父页面大小*0.6 ，如用户指定大小，则不使用默认规则。
 *
 *      8、方法返回对当前窗体的引用。
 *
 *      9、 当useiframe=true 添加遮罩控制。
 *          9.1 属性说明：
 *              showMask:   控制是否显示遮罩。其值：true|false
 *              loadMsg:    加载提示信息
 */
(function($){

    function getTop(w, options){
        var _doc;
        try{
            _doc = w['top'].document;
            _doc.getElementsByTagName;
        }catch(e){
            return w;
        }

        if(options.locate=='document' || _doc.getElementsByTagName('frameset').length >0){
            return w;
        }

        if(options.locate=='document.parent' || _doc.getElementsByTagName('frameset').length >0){
            return w.parent;
        }

        return w['top'];
    }

    function setWindowSize(w, options){
        var _top = getTop(w, options);
        var wHeight = $(_top).height(), wWidth = $(_top).width();
        if(!/^#/.test(options.locate)){
            if(options.height == 'auto'){
                options.height = wHeight * 0.6
            }

            if(options.width == 'auto'){
                options.width = wWidth * 0.6
            }
        }else{
            var locate = /^#/.test(options.locate)? options.locate:'#'+options.locate;
            if(options.height == 'auto'){
                options.height = $(locate).height() * 0.6
            }

            if(options.width == 'auto'){
                options.width = $(locate).width() * 0.6
            }
        }
    }

    $.extend({
        /**
         *
         * @param options
         * @return 返回当前窗体的引用
         *
         * 1、新增属性：
         *      useiframe: true|false，指定是否使用iframe加载页面。
         *      locate:  top|document|id 默认:top
         *      data:  方法回调参数
         *
         * 2、增强属性：
         *      content: 支持使用前缀url指定要加载的页面。
         */
        showWindow: function(options){
            options = options || {};
            var target;
            var winOpts = $.extend({},{
                iconCls:'icon-form',
                useiframe: false,
                locate: 'top',
                data: undefined,
                width: '60%',
                height: '60%',
                cache: false,
                minimizable: true,
                maximizable: true,
                collapsible: true,
                resizable: true,
                loadMsg: $.fn.datagrid.defaults.loadMsg,
                showMask: false,
                onClose: function(){target.dialog('destroy');}
            }, options);


            var iframe = null;

            if(/^url:/.test(winOpts.content)){
                var url = winOpts.content.substr(4, winOpts.content.length);
                if(winOpts.useiframe){
                    iframe = $('<iframe>')
                        .attr('height', '100%')
                        .attr('width', '100%')
                        .attr('marginheight', 0)
                        .attr('marginwidth', 0)
                        .attr('frameborder', 0);

                    setTimeout(function(){
                        iframe.attr('src', url);
                    }, 10);

                }else{
                    winOpts.href = url;
                }

                delete winOpts.content;
            }

            var selfRefrence={
                getData: function(name){
                    return winOpts.data ? winOpts.data[name]:null;
                },
                close: function(){
                    target.panel('close');
                }
            };

            var _top = getTop(window, winOpts);
            var warpHandler = function(handler){
                if(typeof handler == 'function'){
                    return function(){
                        handler(selfRefrence);
                    };
                }

                if(typeof handler == 'string' && winOpts.useiframe){
                    return function(){
                        iframe[0].contentWindow[handler](selfRefrence);
                    }
                }

                if(typeof handler == 'string'){
                    return function(){
                        eval(_top[handler])(selfRefrence);
                    }
                }
            }

            //setWindowSize(window, winOpts);

            //包装toolbar中各对象的handler
            if(winOpts.toolbar && $.isArray(winOpts.toolbar)){
                $.each(winOpts.toolbar, function(i, button){
                    button.handler = warpHandler(button.handler);
                });
            }

            //包装buttons中各对象的handler
            if(winOpts.buttons && $.isArray(winOpts.buttons)){
                $.each(winOpts.buttons, function(i, button){
                    button.handler = warpHandler(button.handler);
                });
            }


            var onLoadCallback = winOpts.onLoad;
            winOpts.onLoad = function(){
                onLoadCallback && onLoadCallback.call(this, selfRefrence, _top);
            }

            if(!/^#/.test(winOpts.locate)){
                if(winOpts.useiframe && iframe){
                    if(winOpts.showMask){
                        winOpts.onBeforeOpen = function(){
                            var panel = $(this).panel('panel');
                            var header = $(this).panel('header');
                            var body = $(this).panel('body');
                            body.css('position', 'relative');
                            var mask = $("<div class=\"datagrid-mask\" style=\"display:block;\"></div>").appendTo(body);
                            var msg = $("<div class=\"datagrid-mask-msg\" style=\"display:block; left: 50%;\"></div>").html(winOpts.loadMsg).appendTo(body);
                            setTimeout(function(){
                                msg.css("marginLeft", -msg.outerWidth() / 2);
                            }, 5);
                        }
                    }

                    iframe.bind('load', function(){
                        if(iframe[0].contentWindow){
                            onLoadCallback && onLoadCallback.call(this, selfRefrence, iframe[0].contentWindow);
                            if(winOpts.showMask){
                                target.panel('body').children("div.datagrid-mask-msg").remove();
                                target.panel('body').children("div.datagrid-mask").remove();
                            }
                        }
                    });

                    target = _top.$('<div>').css({'overflow':'hidden'}).append(iframe).dialog(winOpts);
                }else{
                    target = _top.$('<div>').dialog(winOpts);
                }
            }else{
                var locate = /^#/.test(winOpts.locate)? winOpts.locate:'#'+winOpts.locate;
                target = $('<div>').appendTo(locate).dialog($.extend({}, winOpts, {inline: true}));
            }

            return target;
        },
        showModalDialog: function(options){
            options = options || {};
            var opts = $.extend({}, options, {
                modal: true,
                minimizable: false,
                maximizable: false,
                resizable: false,
                collapsible: false
            });

            return $.showWindow(opts);
        }
    })
})(jQuery);
