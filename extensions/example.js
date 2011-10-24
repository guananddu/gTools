/**
 * Example.js 作为模块编写的例子文件
 */
(function(){
	var getGwObj      = function(){
		var top       = window.top;
		var nameSpace = top.__$_GWNAMESPACE_$__;
		return eval('window.' + nameSpace);
	}
	
	var N  = getGwObj();
	
	/*Start Extensions:*/
	N.extensionsTest = 'Test!!!!I am a test!!!';
})();