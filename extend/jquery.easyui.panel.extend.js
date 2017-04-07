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

  $.extend($.fn.panel.defaults,{
    loader: function (param, success, error) {
      var options = $(this).panel("options");
      if (!options.href) {
        return false;
      }

      if(!options.customAttr.useiframe){
        $.ajax({
          type: options.method, url: options.href, cache: false, data: param, dataType: "html", success: function (data) {
            success(data);
          }, error: function () {
            error.apply(this, arguments);
          }
        });
      }else{
        var iframe = $('<iframe>')
          .attr('height', '100%')
          .attr('width', '100%')
          .attr('marginheight', 0)
          .attr('marginwidth', 0)
          .attr('frameborder', 0);

        var href = options.href;
        var queryString = $.param(param);
        if(href.indexOf('?')>0){
          href += '&'+ queryString;
        }else{
          href += '?' + queryString;
        }

        var body = $(this).panel('body').css({'overflow':'hidden'});

        setTimeout(function(){
          body.empty().append(iframe);
          iframe.attr('src', encodeURI(href));
        }, 10);
      }
    },
    customAttr:{
      toolbar: {
        buttonPosition: 'left',
        data: []
      },
      useiframe:false
    }
  });

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
