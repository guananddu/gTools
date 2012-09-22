/**
 * string.js
 */
(function(){
	/**
	 * 获取GT命名空间
	 */
	var N  = eval('window.' + window.__$_GTNAMESPACE_$__);
	
	/*字符串处理*/
	N.str            = N.str || {};
	/**
	 * 一个简易的字符串模板处理函数，相关用法参见以下范例，此函数采集于别的类库
	 * @param {string} source 提供的目标模板
	 * @param {object} || {Arguments Array} opts 对应于模板的解析数据
	 *		例如：{one: 'Oh!!!', two: 'God!!!'}, xxx.str.strFormat(tempStrTpl, 'Oh!!!', 'My God!!!')
	 *
	 * @returns {string} 经过赋值处理后的字符串
	 */
	/*
		范例1：
		var tempStrTpl = '<p>${one}<span>${two}</span></p>';
		nowStr         = xxx.str.strFormat(tempStrTpl, {one: 'Oh!!!', two: 'God!!!'});
		console.log(nowStr);
		输出::<p>Oh!!!<span>God!!!</span></p>
		
		范例2：
		var concatStr  = function(str){
			return str + ' ???(God!)';
		}
		var tempStrTpl = '<p>${one}<span>${two}</span></p>';
		nowStr         = xxx.str.strFormat(tempStrTpl, {one: concatStr, two: 'God!!!'});
		console.log(nowStr);
		输出::<p>one ???(God!)<span>God!!!</span></p>
		
		范例3：
		var tempStrTpl = '<p>{0}<span>{1}</span></p>';
		nowStr         = xxx.str.strFormat(tempStrTpl, 'Oh!!!', 'My God!!!');
		console.log(nowStr);
		输出::<p>Oh!!!<span>My God!!!</span></p>
	*/
	N.str.strFormat    = function (source, opts) {
		source = String(source);
		if ('undefined' != typeof opts) {
			if ('[object Object]' == toString.call(opts)) {
				return source.replace(/\$\{(.+?)\}/g,
					function (match, key) {
						var replacer = opts[key];
						if ('function' == typeof replacer) {
							replacer = replacer(key);
						}
						return ('undefined' == typeof replacer ? '' : replacer);
					});
			} else {//比较常用
				var data = Array.prototype.slice.call(arguments, 1),
					len = data.length;
				return source.replace(/\{(\d+)\}/g,
					function (match, index) {
						index = parseInt(index, 10);
						return (index >= len ? match : data[index]);
					});
			}
		}
		return source;
	};
	/**
	 * 字符串超出处理（添加省略号）
	 * @param {string} inStr 目标字符串
	 * @param {number} maxLen 最大字符数
	 * @param {string} ellipsis 超出后的填充字符（默认为省略号'···'）
	 *
	 * @returns {string} 经过处理后的字符串
	 */
	N.str.checkAddEllipsis = function(inStr, maxLen, ellipsis){
		ellipsis           = ellipsis || '···';
		if(inStr.length > maxLen){
			return String(inStr.substring(0, maxLen) + ellipsis);
		}
		return String(inStr);
	};
})();