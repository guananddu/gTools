/**
 * browser.js
 */
(function () {
	/**
	 * 获取GT命名空间
	 */
	var N = window[__$_GTNAMESPACE_$__];
	
	/*常用正则表达式*/
	var _RE = {};
	/*判断浏览器类型*/
	_RE.browser = {
		//Chrome UA: Mozilla/5.0 (Windows NT 5.2) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/14.0.835.186 Safari/535.1
		chrome : /chrome\/(\d+\.\d+)/i,
		//FireFox UA: Mozilla/5.0 (Windows NT 5.2; rv:7.0) Gecko/20100101 Firefox/7.0
		firefox : /firefox\/(\d+\.\d+)/i,
		//IE UA: Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.2; .NET CLR 1.1.4322; .NET CLR 2.0.50727)
		ie : /msie (\d+\.\d+)/i,
		//Opera UA: Opera/9.80 (Windows NT 5.2; U; zh-cn) Presto/2.9.168 Version/11.51
		opera : /opera(\/| )(\d+(\.\d+)?)(.+?(version\/(\d+(\.\d+)?)))?/i,
		//Safari UA: Mozilla/5.0 (Windows; U; Windows NT 5.2; zh-CN) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1
		safari : /(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i,
		//Maxthon
		maxthon : /(\d+\.\d+)/
	};
	/*检测浏览器特性*/
	_RE.browserFeatures = {
		isGecko  : /gecko/i,
		isGecko_ : /like gecko/i,
		isWebkit : /webkit/i
	};
	
	/*BROWSER浏览器检测*/
	N.browser = N.browser || {};
	/**
	 * 对各种浏览器类型及其简单特性进行鉴别，类型成功后会返回当前浏览器的版本号，失败则为undefined
	 */
	N.browser = (function () {
		var ua = navigator.userAgent;
		return { //特殊情况下可以将 RegExp['$1'] 切换成 RegExp['\x241'], RegExp['$2']->RegExp['\x242'], RegExp['$6']->RegExp['\x246']
			/*浏览器检测*/
			chrome : _RE.browser.chrome.test(ua) ?  + RegExp['$1'] : undefined,
			firefox : _RE.browser.firefox.test(ua) ?  + RegExp['$1'] : undefined,
			ie : _RE.browser.ie.test(ua) ? (document.documentMode ||  + RegExp['$1']) : undefined,
			opera : _RE.browser.opera.test(ua) ?  + (RegExp['$6'] || RegExp['$2']) : undefined,
			safari : _RE.browser.safari.test(ua) && !/chrome/i.test(ua) ?  + (RegExp['$1'] || RegExp['$2']) : undefined,
			/*浏览器简单特性*/
			isGecko : _RE.browserFeatures.isGecko.test(ua) && !_RE.browserFeatures.isGecko_.test(ua),
			isWebkit : _RE.browserFeatures.isWebkit.test(ua),
			/*判断是否是严格标准的渲染模式*/
			isStrict : document.compatMode && document.compatMode == 'CSS1Compat',
			xPath : !!document.evaluate,
			selectorsAPI : !!document.querySelector
		};
	})();
	/*判断是否是傲游浏览器*/
	try {
		N.browser.maxthon = _RE.browser.maxthon.test(window.external.max_version) ?  + RegExp['$1'] : undefined;
	} catch (e) {}
})();