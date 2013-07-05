jQuery.easyui-extend
====================
基于jQuery.easyui 1.3+ 对部分组件扩展了额外属性和方法。目前已扩展的部分组件如下：<br>
<ul>
  <li>tabs</li>
  <li>menu</li>
  <li>combo</li>
  <li>combobox</li>
  <li>datagrid</li>
  <li>window</li>
  <li>tree</li>
  <li>treegrid</li>
</ul>

快速了解各组件扩展信息，请查看demo_ext/left_menu_data.json<br>
具体了解每个组件的扩展内容，请查看extend下相应文件的开头说明。<br>
要使扩展属性生效，必须执行方法followCustomHandle。<br>


<h3>使用</h3>
首先，在引入jquery.easyui所需要的资源之后，引入如下文件：
###
    <link rel="stylesheet" type="text/css" href="../../extend/themes/icon.css">
    <script type="text/javascript" src="jquery.easyui.extend.min.js"></script>


然后



###  
    $('#cc').combo({
       required: true,
       editable: false,
       customAttr:{
          headervalue: '--请选择--'
       }
    }).combo('followCustomHandle');    



如要查看demo演示，请将所有文件放到jQuery.easyui解压后的根目录中。    




<h3>其他</h3>


演示地址：http://loafer.sturgeon.mopaas.com/<br>
Blog：http://blog.csdn.net/zjh527


<h3>说明</h3>
<i>
    <ul>
         <li>
            jquery.easyui-1.3.3默认使用的是jquery-2.0，这个版本已经不再支持IE6、7、8，如使用这几个IE版本的，请自己将jquery替换到jquery v1的最新版本。演示地址已替换更新为jquery-1.10.1，使用IE 6、7、8的已经能正常访问。
         </li>
    </ul>
</i>



