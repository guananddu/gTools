/**
 * debuger.js
 */
(function(){
	/**
	 * 获取GT命名空间
	 */
	var N  = eval('window.' + window.__$_GTNAMESPACE_$__);
	
	/*Debuger Tools*/
	N.debuger         = N.debuger || {};
	/**
	 * 变量输出调试工具
	 * @param {...} 需要dump的参数可以是单个和多个
	 * 
	 * @returns {fake array} arguments
	 */
	N.debuger.varDump = function(){
		if(!N.debugerFlag)
			return;
		var outPut, meArgu  = arguments;
		if(arguments.length == 1){
			outPut          = 'Type:' + toString.call(meArgu[0]) + '  ==>  Value:' + meArgu[0];
			N.browser.ie    <= 6 ? alert(outPut) : (function(){
				console.info(outPut);
				console.log(meArgu[0]);
			})();
		}else{
			for(var i = 0, len = meArgu.length; i < len; i ++){
				outPut         = String(i + 1) + '. Type:' + toString.call(meArgu[i]) + '  ==>  Value:' + meArgu[i];
				N.browser.ie   <= 6 ? alert(outPut) : (function(){
					console.info(outPut);
					console.log(meArgu[i]);
				})();
			}
		}
		return meArgu;
	};
	/**
	 * 抛出信息
	 * @param {string} type 信息类型（取值：LOG, INFO, WARN, ERROR）
	 * @param {string} msg 信息内容
	 *
	 * @returns {fake array} arguments
 	 */
	N.debuger.throwit = function(type, msg){
		if(!N.debugerFlag)
			return;
		if(N.browser.ie <= 6)
			return;
		switch (type) {
			case 'LOG':
				console.log(msg);
				break;
			case 'INFO':
				console.info(msg);
				break;
			case 'WARN':
				console.warn(msg);
				break;
			case 'ERROR':
				console.error(msg);
				break;
			default:
				console.log(msg);
		}
		return arguments;
	};
})();