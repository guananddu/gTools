/**
 * loader.js
 */
(function () {
	/**
	 * 获取GT命名空间
	 */
	var N = window[__$_GTNAMESPACE_$__];
	
	/*作为缓冲来防止重复加载*/
	var _baiduBuffer = {};
	var _gtBuffer = {};
	
	/**
	 * 整个gw基于lazyLoader和LABjsLoader来加载各种其他的类库和自身的扩展组件
	 * loader 作为模块加载内置工具
	 */
	N.loader = N.loader || {};
	/**
	 * 加载并运行JS文件
	 * @param {string} || {array} scriptSrcArr 需要加载的js文件路径字符串（单个文件）或者数组（多个文件）
	 * @param {boolean} noCache 是否允许缓存文件（true: 不允许缓存；false: 可以缓存）
	 *
	 * @grammar var scriptSrcArr = ['example1.js' , 'example2.js'];
	 *          xxx.loader.simpleLoader(scriptSrcArr, true);
	 */
	N.loader.simpleLoader = function (scriptSrcArr, noCache) {
		if (toString.call(scriptSrcArr) == '[object String]')
			scriptSrcArr = [scriptSrcArr];
		for (var i = 0, len = scriptSrcArr.length; i < len; i++) {
			var tempScript  = document.createElement('script');
			tempScript.type = 'text/javascript';
			tempScript.src  = noCache ? (scriptSrcArr[i] + '?_gwt_=' + (new Date()).getTime().toString(36)) : scriptSrcArr[i];
			document.getElementsByTagName('head')[0].appendChild(tempScript);
			tempScript = null;
		}
		/*Do not run!!
		var tpl   = '<script type="text/javascript" src="{0}"></script>';
		for(var i = 0, len = scriptSrcArr.length; i < len; i ++){
		var src = noCache ? (scriptSrcArr[i] + '?t=' + (new Date()).getTime()) : scriptSrcArr[i];
		document.getElementsByTagName('head')[0].appendChild(N.dom.getDom(N.str.strFormat(tpl, src)));
		}
		 */
	};
	/**
	 * 加载并运行JS文件(XHR)（可以保证执行顺序）
	 * @param {string} || {array} scriptSrcArr 需要加载的js文件路径字符串（单个文件）或者数组（多个文件）
	 * @param {boolean} async xhr请求是否异步（true:异步，false:同步）
	 * @param {boolean} hideEval 是否 不将xhr获得的js脚本放入head标签中，true:隐藏脚本加载，不将脚本放入head标签；false:将js脚本放入head中（默认）
	 * @param {boolena} noCache 是否允许缓存文件（true: 不允许缓存；false: 可以缓存）
	 * @explain 隐藏式加载，在获取到js字符串的时候，会使用eval来执行，故省去了DOM的添加，但是隐藏式加载需要注意作用域的问题!!!
	 *
	 */
	N.loader.simpleXhrLoader = function (scriptSrcArr, async, hideEval, noCache) {
		if (toString.call(scriptSrcArr) == '[object String]')
			scriptSrcArr = [scriptSrcArr];
		async = async == undefined ? true : async;
		hideEval = hideEval == undefined ? false : hideEval;
		noCache = noCache == undefined ? true : noCache;
		var getXHR = function () {
			if (window.ActiveXObject) {
				try {
					return new ActiveXObject("Msxml2.XMLHTTP");
				} catch (e) {
					try {
						return new ActiveXObject("Microsoft.XMLHTTP");
					} catch (e) {}
				}
			}
			if (window.XMLHttpRequest) {
				return new XMLHttpRequest();
			}
		};
		var appendScript = function (responseScriptStr) {
			if (responseScriptStr == '' || responseScriptStr == null || responseScriptStr == undefined)
				return;
			if (hideEval) { //隐藏式加载，调用此方法有局限性，浏览器表现差异
				eval.call(window, responseScriptStr);
				return;
			}
			var tempScript = document.createElement('script');
			tempScript.type = 'text/javascript';
			tempScript.text = responseScriptStr;
			document.getElementsByTagName('head')[0].appendChild(tempScript);
			tempScript = null;
		};
		xhrs = [];
		for (var i = 0, len = scriptSrcArr.length; i < len; i++) {
			xhrs[i] = getXHR();
			var tempt = scriptSrcArr[i].indexOf('?') > -1 ? '&_gwt_=' : '?_gwt_=';
			xhrs[i].open('GET', noCache ? (scriptSrcArr[i] + tempt + (new Date()).getTime().toString(36)) : scriptSrcArr[i], async);
			if (async) { //异步
				/* 				xhrs[i].onreadystatechange = function(){
				if(xhrs[i].readyState == 4){
				if(xhrs[i].status >= 200 && xhrs[i].status < 300 || xhrs[i].status == 304){
				appendScript(xhrs[i].responseText);
				}
				}
				}; 注意以上逻辑错误*/
				/*需要启用闭包形式，如下*/
				xhrs[i].onreadystatechange = function (index) {
					return function () {
						if (xhrs[index].readyState == 4) {
							if (xhrs[index].status >= 200 && xhrs[index].status < 300 || xhrs[index].status == 304) {
								appendScript(xhrs[index].responseText);
							}
						}
					}
				}
				(i);
				xhrs[i].send(null);
			} else { //同步
				xhrs[i].send(null);
				appendScript(xhrs[i].responseText);
			}
		}
	};
	
	/**
	 * Tangram 加载函数，已经把Base和Component部分合并
	 * @param {String} namespace 模块格式 aa.bb.cc
	 * @param {boolean} noCahce 是否允许缓存文件（true: 不允许缓存；false: 可以缓存）
	 */
	N.loader.loadTangram = function (namespace, noCache) {
		if (_baiduBuffer[namespace]) {
			N.debuger.throwit('INFO', _MESSAGES.hadLoadedIt + namespace);
			return;
		}
		if (N.isPhpServer) { //PHP服务器
			_baiduBuffer[namespace] = 1;
			return N.loader.simpleXhrLoader(N.EXTERNALTOOLS.config.baiduBasePhpImporter + '?f=' + namespace, false, false, noCache);
		} else {
			N.loader.simpleXhrLoader(N.EXTERNALTOOLS.config.baiduBaseJsImporter, false, false, noCache);
			window.Import(namespace);
			_baiduBuffer[namespace] = 1;
		}
	};
	
	/**
	 * GT加载自身扩展模块的函数（可以保证执行顺序）
	 * @param {string} | {array} extensions 扩展模块名（string.js的话，extensions = 'string'）
	 */
	N.loader.loadExtensions = function (extensions) {
		/*单个文件*/
		if (toString.call(extensions) == '[object String]')
			extensions = [extensions];
		for (var i = 0, len = extensions.length; i < len; i++) {
			if (_gtBuffer[extensions[i]]) {
				N.debuger.throwit('INFO', _MESSAGES.hadLoadedIt + extensions[i] + ' extension.');
				continue;
			}
			var extension = extensions[i] + '.js';
			N.loader.simpleXhrLoader((N.EXTERNALTOOLS.config.extensions + extension), false, true, true);
			_gtBuffer[extensions[i]] = 1;
		}
	};
	
	/**
	 * GT加载自身扩展模块的函数（可以保证执行顺序）
	 * @param {string} | {array} components 扩展模块名（helper.js的话，components = 'helper'）
	 */
	N.loader.loadComponents = function (components) {
		/*单个文件*/
		if (toString.call(components) == '[object String]')
			components = [components];
		for (var i = 0, len = components.length; i < len; i++) {
			if (_gtBuffer[components[i]]) {
				N.debuger.throwit('INFO', _MESSAGES.hadLoadedIt + components[i] + ' component.');
				continue;
			}
			var component = components[i] + '.js';
			N.loader.simpleXhrLoader((N.EXTERNALTOOLS.config.components + component), false, true, true);
			_gtBuffer[components[i]] = 1;
		}
	};
})();