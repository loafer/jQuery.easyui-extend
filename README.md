jQuery.easyui-extend
====================
一个基于jquery.easyui-1.3.2+的扩展。将一些常用的、需要重复编码的功能，内置到扩展中，并通过扩展属性实现轻松配置，以减少使用者的代码编写量。
目前已实现扩展的部分组件如下：<br>
<ul>
  <li>panel</li>
  <li>tabs</li>
  <li>menu</li>
  <li>combo</li>
  <li>combobox</li>
  <li>window</li>
  <li>dialog</li>
  <li>datagrid</li>
  <li>tree</li>
  <li>treegrid</li>
  <li>toolbar</li>
</ul>

快速了解各组件扩展信息，请直接访问在线<a href="http://loafer.sturgeon.mopaas.com" target="_blank">Demo</a><br>
具体了解每个组件的扩展内容及使用方法，请查看extend下相应文件的开头说明。<br>
~~要使扩展属性生效，必须执行方法followCustomHandle。~~<br>


<h3>使用</h3>
首先，在引入jquery.easyui所需要的资源之后，引入如下文件：
###
    <link rel="stylesheet" type="text/css" href="../../extend/themes/easyui.extend.css">
    <link rel="stylesheet" type="text/css" href="../../extend/themes/icon.css">
    <script type="text/javascript" src="jquery.easyui.extension.min.js"></script>


然后



###  
    $('#cc').combo({
       required: true,
       editable: false,
       customAttr:{
          headervalue: '--请选择--'
       }
    });    



如要查看demo演示，请将所有文件放到jQuery.easyui解压后的根目录中。    


<h3>更新日志</h3>
关于每次更新内容，请查看change.log文件。



<h3>licenses</h3>
GPL licenses



<h3>其他</h3>


演示地址：http://loafer.sturgeon.mopaas.com/<br>
Blog：http://blog.csdn.net/zjh527


<h3>说明</h3>
<i>
    <ul>
         <li>
            jquery.easyui-1.3.3默认使用的是jquery-2.0，这个版本已经不再支持IE6、7、8，如使用这几个IE版本的，请自己将jquery替换到jquery v1的最新版本。演示地址已替换更新为jquery-1.10.1，使用IE 6、7、8的已经能正常访问。
         </li>
         <li>
            请通过查看 change.log 文件查看每次更新内容。
         </li>
    </ul>
</i>




