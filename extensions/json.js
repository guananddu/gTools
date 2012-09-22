/**
 * json.js
 */
(function(){
	/**
	 * 获取GT命名空间
	 */
	var N  = eval('window.' + window.__$_GTNAMESPACE_$__);
	
	/*json处理*/
	N.json            = N.json || {};
	/**
	 * 解析json字符串，将json字符串解析为json对象
	 * @param {string} jsonStr json字符串（譬如服务器返回的json字符串）
	 *
	 * @returns {object} 相应的JSON对象
	 */
	N.json.strToJson  = function(jsonStr){
		if(jsonStr    == '')
			return {};
		var temp      = 'var t = ';
		var execStr   = temp + String(jsonStr);
		eval(execStr);
		return t;
	};
	/**
	 * 将json对象解析为查询字符串queryStr
	 * @param {object} jsonObj 目标json对象
	 * @param {string} namespace(optional) 附加的命名空间 
	 *
	 * @returns {string} 可以附加于url之后的查询字符串
	 */
	N.json.jsonToStr  = function(jsonObj, namespace){
		if(jsonObj    == {})
			return '';
		var temp      = '';
		for(var i in jsonObj){
			temp      += ((namespace ? (namespace + '.' + i) : i) + '=' + jsonObj[i] + '&');
		}
		return temp.substring(0, temp.length - 1);
	};
})();