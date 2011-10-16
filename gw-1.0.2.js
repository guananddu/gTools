/*
 * gw JavaScript Library v1.0.2
 * Copyright 2011, guanwei. All rights reserved.
 * 
 * author: guanwei
 * version: 1.0.2
 * date: 2011/10/15
 */
(function(window, $nameSpace){
	/*版本号*/
	var version   = '1.0.2';
	/*声明常用局部变量*/
	var top       = top,
		window    = window,
		document  = window.document,
	 	undefined = window.undefined,
		navigator = window.navigator,
		location  = window.location;
	/*声明核心方法*/
	var  toString = Object.prototype.toString,
		   hasOwn = Object.prototype.hasOwnProperty,
			 trim = String.prototype.trim,
			 push = Array.prototype.push,
			slice = Array.prototype.slice,
		  indexOf = Array.prototype.indexOf;
	
	/*命名空间处理，默认为$GW$命名空间*/
	var NS		  = $nameSpace || '$GW$',
		execCode  = 'var N = window.' + NS + ' = window.' + NS + ' || {version: "' + version + '"};';
	/*
		执行语句：
		var N     = window.$GW$ = window.$GW$ || {version: '1.0.1'};
	*/
	eval(execCode);
	
	/*命名空间切换函数*/
	N.changeNameSpace    = function(ns){
		if(ns === NS)
			return;
		if(undefined !== ns && null !== ns && '' !== ns && NS !== ns){
			if(toString.call(ns) === '[object String]' && /^[^A-Za-z$_]|[^\w$]/.test(ns) === false){
				/*切换*/
				execCode = 'window.' + NS + ' = undefined;';
				eval(execCode);
				execCode = 'window.' + ns + ' = N;';
				eval(execCode);
				NS       = ns;
			}else{
				N.debuger.throwit('ERROR', N.MESSAGES.wrongNameSpaceFormat + ns);
			}
		}else{
			return;
		}
	};
	
	/*Debuger Or Regular*/
	N.debugerFlag        = true;
	
	/*Server*/
	N.isPhpServer        = false;
	
	/*常用信息提示*/
	N.MESSAGES           = N.MESSAGES || {
		importExternal      : 'Now Start To Import External Framework Tools: ',
		wrongNameSpaceFormat: 'Wrong NameSpace Foramt, Expected: A-Z a-z 0-9 _ $, And don\'t not start with number: ',
		loaderLoadedFailed  : 'Loader Loaded Failed!'
	};
	
	/*常用正则表达式*/
	N.RE                 = N.RE || {};
	/*判断浏览器类型*/
	N.RE.browser         = {
		//Chrome UA: Mozilla/5.0 (Windows NT 5.2) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/14.0.835.186 Safari/535.1
		chrome : /chrome\/(\d+\.\d+)/i,
		//FireFox UA: Mozilla/5.0 (Windows NT 5.2; rv:7.0) Gecko/20100101 Firefox/7.0
		firefox: /firefox\/(\d+\.\d+)/i,
		//IE UA: Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.2; .NET CLR 1.1.4322; .NET CLR 2.0.50727)
		ie     : /msie (\d+\.\d+)/i,
		//Opera UA: Opera/9.80 (Windows NT 5.2; U; zh-cn) Presto/2.9.168 Version/11.51
		opera  : /opera(\/| )(\d+(\.\d+)?)(.+?(version\/(\d+(\.\d+)?)))?/i,
		//Safari UA: Mozilla/5.0 (Windows; U; Windows NT 5.2; zh-CN) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1
		safari : /(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i,
		//Maxthon
		maxthon: /(\d+\.\d+)/
	};
	/*检测浏览器特性*/
	N.RE.browserFeatures = {
		isGecko : /gecko/i,
		isGecko_: /like gecko/i,
		isWebkit: /webkit/i
	};
	
	/*BROWSER浏览器检测*/
	N.browser        = N.browser || {};
	/**
	 * 对各种浏览器类型及其简单特性进行鉴别，类型成功后会返回当前浏览器的版本号，失败则为undefined
	 */
	N.browser        = (function(){
		var ua   = navigator.userAgent;
		return {//特殊情况下可以将 RegExp['$1'] 切换成 RegExp['\x241'], RegExp['$2']->RegExp['\x242'], RegExp['$6']->RegExp['\x246']
			/*浏览器检测*/
			chrome      : N.RE.browser.chrome.test(ua) ? + RegExp['$1'] : undefined,
			firefox     : N.RE.browser.firefox.test(ua) ? + RegExp['$1'] : undefined,
			ie          : N.RE.browser.ie.test(ua) ? (document.documentMode || + RegExp['$1']) : undefined,
			opera       : N.RE.browser.opera.test(ua) ? + (RegExp['$6'] || RegExp['$2']) : undefined,
			safari      : N.RE.browser.safari.test(ua) && !/chrome/i.test(ua) ? + (RegExp['$1'] || RegExp['$2']) : undefined,
			/*maxthon   : N.RE.browser.maxthon.test(window.external.max_version) ? + RegExp['$1'] : undefined,*/
			/*浏览器简单特性*/
			isGecko     : N.RE.browserFeatures.isGecko.test(ua) && !N.RE.browserFeatures.isGecko_.test(ua),
			isWebkit    : N.RE.browserFeatures.isWebkit.test(ua),
			/*判断是否是严格标准的渲染模式*/
			isStrict    : document.compatMode && document.compatMode == 'CSS1Compat',
			xPath       : !!document.evaluate,
			selectorsAPI: !!document.querySelector
		};
	})();
	/*判断是否是傲游浏览器*/
	try{
		N.browser.maxthon = N.RE.browser.maxthon.test(window.external.max_version) ? + RegExp['$1'] : undefined;
	}catch(e){}
	
	
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
	
	
	/*外部工具*/
	N.EXTERNALTOOLS        = N.EXTERNALTOOLS || {};
	
	/*外部库的配置路径，配置默认值，也可以由用户自己设置*/
	N.EXTERNALTOOLS.config = N.EXTERNALTOOLS.config || {};
	N.EXTERNALTOOLS.config = {
			lazyLoader               : N.EXTERNALTOOLS.config.lazyload || 'tools/lazyload-2.0.3/lazyload-min.js',
			LABjsLoader              : N.EXTERNALTOOLS.config.LABjsLoader || (
					N.debugerFlag == true ? 'tools/LABjs-2.0.3/LAB-debug.min.js' : 'tools/LABjs-2.0.3/LAB.min.js'
			),
			baidu                    : N.EXTERNALTOOLS.config.baidu || 'tools/tangram-1.3.9/tangram-1.3.9.js',
			baiduBaseJsImporter      : N.EXTERNALTOOLS.config.baiduBaseJsImporter || 'tools/tangram-1.3.9/fragment/Tangram-base/src/import_.js',
			baiduBasePhpImporter     : N.EXTERNALTOOLS.config.baiduBasePhpImporter || 'tools/tangram-1.3.9/fragment/Tangram-base/src/import.php',/*php服务器下可以直接请求此文件*/
			baiduComponentJsImporter : N.EXTERNALTOOLS.config.baiduComponentJsImporter || 'tools/tangram-1.3.9/fragment/Tangram-component/src/import_.js',
			baiduComponentPhpImporter: N.EXTERNALTOOLS.config.baiduComponentPhpImporter || 'tools/tangram-1.3.9/fragment/Tangram-component/src/import.php'
	};
	
	/**
	 * 整个gw基于lazyLoader和LABjsLoader来加载各种其他的类库和自身的扩展组件
	 * loader 作为模块加载内置工具
	 */
	N.loader                = N.loader || {};
	/**
	 * 加载并运行JS文件
	 * @param {string} || {array} scriptSrcArr 需要加载的js文件路径字符串（单个文件）或者数组（多个文件）
	 * @param {boolean} noCache 是否允许缓存文件（true: 不允许缓存；false: 可以缓存）
	 *
	 * @grammar var scriptSrcArr = ['example1.js' , 'example2.js']; 
	 *          xxx.loader.simpleLoader(scriptSrcArr, true);
	 */
	N.loader.simpleLoader   = function(scriptSrcArr, noCache){
		if(toString.call(scriptSrcArr) == '[object String]')
			scriptSrcArr    = [scriptSrcArr];
		for(var i = 0, len  = scriptSrcArr.length; i < len; i ++){
			var tempScript  = document.createElement('script');
			tempScript.type = 'text/javascript';
			tempScript.src  = noCache ? (scriptSrcArr[i] + '?_t_=' + (new Date()).getTime().toString(36)) : scriptSrcArr[i];
			document.getElementsByTagName('head')[0].appendChild(tempScript);
			tempScript      = null;
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
	 * 加载并运行JS文件(XHR)
	 * @param {string} || {array} scriptSrcArr 需要加载的js文件路径字符串（单个文件）或者数组（多个文件）
	 * @param {boolean} async xhr请求是否异步（true:异步，false:同步）
	 * @param {boolean} hideEval 是否将xhr获得的js脚本放入head标签中，true:隐藏脚本加载，不将脚本放入head标签；false:将js脚本放入head中（默认）
	 * @param {boolena} noCache 是否允许缓存文件（true: 不允许缓存；false: 可以缓存）
	 * @explain 隐藏式加载，在获取到js字符串的时候，会使用eval来执行，故省去了DOM的添加，但是隐藏式加载需要注意作用域的问题!!!
	 * 
	 */
	N.loader.simpleXhrLoader = function(scriptSrcArr, async, hideEval, noCache){
		if(toString.call(scriptSrcArr) == '[object String]')
			scriptSrcArr     = [scriptSrcArr];
		async                = async == undefined ? true : async;
		hideEval             = hideEval == undefined ? false : hideEval;
		noCache              = noCache == undefined ? true : noCache;
		var getXHR           = function(){
			if (window.ActiveXObject){
				try {
					return new ActiveXObject("Msxml2.XMLHTTP");
				} catch(e){
					try {
						return new ActiveXObject("Microsoft.XMLHTTP");
					} catch(e){}
				}
			}
			if (window.XMLHttpRequest) {
				return new XMLHttpRequest();
			}
		};
		var appendScript    = function(responseScriptStr){
			if(responseScriptStr == '' || responseScriptStr == null || responseScriptStr == undefined)
				return;
			if(hideEval){//隐藏式加载，调用此方法有局限性，浏览器表现差异
				eval.call(window, responseScriptStr);
				return;
			}
			var tempScript  = document.createElement('script');
			tempScript.type = 'text/javascript';
			tempScript.text = responseScriptStr;
			document.getElementsByTagName('head')[0].appendChild(tempScript);
			tempScript      = null;
		};
		xhrs                = [];
		for(var i = 0, len  = scriptSrcArr.length; i < len; i ++){
			xhrs[i]         = getXHR();
			var tempt       = scriptSrcArr[i].indexOf('?') > -1 ? '&_t_=' : '?_t_=';
			xhrs[i].open('GET', noCache ? (scriptSrcArr[i] + tempt + (new Date()).getTime().toString(36)) : scriptSrcArr[i], async);
			if(async){//异步
/* 				xhrs[i].onreadystatechange = function(){
					if(xhrs[i].readyState == 4){
						if(xhrs[i].status >= 200 && xhrs[i].status < 300 || xhrs[i].status == 304){
							appendScript(xhrs[i].responseText);
						}
					}
				}; 注意以上逻辑错误*/
				/*需要启用闭包形式，如下*/
				xhrs[i].onreadystatechange = function(index){
					return function(){
						if(xhrs[index].readyState == 4){
							if(xhrs[index].status >= 200 && xhrs[index].status < 300 || xhrs[index].status == 304){
								appendScript(xhrs[index].responseText);
							}
						}
					}
				}(i);
				xhrs[i].send(null);
			}else{//同步
				xhrs[i].send(null);
				appendScript(xhrs[i].responseText);
			}
		}
	};
	
	/*开始整合lazyLoader和LABjsLoader，阻塞式整合，隐含式加载*/
	N.debuger.throwit('INFO', N.MESSAGES.importExternal + 'LazyLoad to N.loader.lazyLoader, and $LAB to N.loader.LABjsLoader. -- Line 302');
	N.loader.simpleXhrLoader([N.EXTERNALTOOLS.config.lazyLoader, N.EXTERNALTOOLS.config.LABjsLoader], false, true);
	try{
		N.loader.lazyLoader  = LazyLoad; LazyLoad = null;
		N.loader.LABjsLoader = $LAB;     $LAB     = null;
	}catch(e){
		N.debuger.throwit('ERROR', N.MESSAGES.loaderLoadedFailed + ' -- Line 304, 305');
	}
	
	/*开始整合Baidu Tangram框架类库，阻塞式整合，附加式加载，全加载*/
	// N.debuger.throwit('INFO', N.MESSAGES.importExternal + 'Tangram, baidu To N.EXTERNALTOOLS.baidu. -- Line 307');
	// N.loader.simpleXhrLoader(N.EXTERNALTOOLS.config.baidu, false, false);
	// try{
		// N.EXTERNALTOOLS.baidu = baidu;
		// /*引用Tangram工具库中的ajax工具类*/
		// N.EXTERNALTOOLS.ajax  = baidu.ajax;
	// }catch(e){
		// N.debuger.throwit('WARN', e);
	// }
	/**
	 * Tangram Base 加载函数
	 * @param {String} namespace 模块格式 aa.bb.cc
	 * @param {boolean} noCahce 是否允许缓存文件（true: 不允许缓存；false: 可以缓存）
	 */
	N.loader.loadBaseTangram     = function(namespace, noCache){
		if(N.isPhpServer){//PHP服务器
			return N.loader.simpleXhrLoader(N.EXTERNALTOOLS.config.baiduBasePhpImporter + '?f=' + namespace, false, false, noCache);
		}else{
			N.loader.lazyLoader.js(N.EXTERNALTOOLS.config.baiduBaseJsImporter, function(){
				window.Import(namespace);
			});
		}
	}
	/**
	 * Tangram Component 加载函数
	 * @param {boolean} noCahce 是否允许缓存文件（true: 不允许缓存；false: 可以缓存）
	 */
	N.loader.loadComponentTangram = function(namespace, noCache){
		if(N.isPhpServer){//PHP服务器
			return N.loader.simpleXhrLoader(N.EXTERNALTOOLS.config.baiduComponentPhpImporter + '?f=' + namespace, false, false, noCache);
		}else{
			N.loader.lazyLoader.js(N.EXTERNALTOOLS.config.baiduComponentJsImporter, function(){
				window.Import(namespace);
			});
		}
	}
	
	/*DOM基础方法*/
	N.dom            = N.dom || {};
	N.dom.g          = function(id){
		return document.getElementById(id);
	};
	N.dom.gbt        = function(tagName){
		return document.getElementsByTagName(tagName);
	};
	/**
	 * 将格式正确的DOM元素字符串转化为相应的DOM对象
	 * @param {string} domStr 目标字符串
	 * 
	 * @returns {HTMLElement} 目标字符串（ID）所对应的DOM元素
	 */
	/*此方法有局限性，只适用于domStr是单个元素的字符串的情况*/
	N.dom.getDom     = function(domStr){
		var tempDiv       = document.createElement('div');
		tempDiv.innerHTML = domStr;
		return tempDiv.childNodes[0];
	};
	/**
	 * 依据相应的data数据来创建select元素
	 * @param {array} data select中的各种选项的数据来源
	 * 		参考数据形式：
	 *		[
	 *			{id:342, text:"判卷列表升级联调测试1", selected:true},
	 *			{id:343, text:"判卷列表升级联调测试2", selected:false},
	 *			{id:344, text:"判卷列表升级联调测试3", selected:false}
	 *		];
	 * @param {string} selectId 创建成功后的select元素的ID值
	 * @param {string} || {HTMLElement} parent(optional) select元素的父级元素的ID或者元素本身
	 *
	 * @returns {HTMLSelectElement} (optional) 返回select元素（取决于parent参数）
   	 */
	N.dom.createSelect     = function(data, selectId, parent){
		selectId           = selectId || 'defaultId';
		if(parent){
			parent         = N.dom.checkIsDom(parent);
		}
		var selectTpl      = '<select id="' + selectId + '" name="' + selectId + '">{0}</select>';
		var optionTrueTpl  = '<option value="{0}" selected="selected">{1}</option>';
		var optionFalseTpl = '<option value="{0}">{1}</option>';
		var outPut         = '';
		var outPutOptions  = '';
		for(var i = 0, len = data.length; i < len; i ++){
			outPutOptions  += N.str.strFormat(data[i].selected == true ? optionTrueTpl : optionFalseTpl, data[i].id, data[i].text);
		}
		if(parent){
			parent.innerHTML   = N.str.strFormat(selectTpl, outPutOptions);
			parent             = null;
		}else{
			return 	N.dom.getDom(N.str.strFormat(selectTpl, outPutOptions));
		}
	};
	/**
	 * 检查是否是DOM元素，若为ID字符串则转化成相应ID的DOM元素
	 * @param {string} || {HTMLElement} idOrDom ID字符串或HTMLElement
	 *
	 * @returns {HTMLElement} 相应DOM元素
	 */
	N.dom.checkIsDom       = function(idOrDom){
		if(toString.call(idOrDom) == '[object String]')
			return N.dom.g(idOrDom);
		return idOrDom;
	};
	
	/*DOM Table 相关方法*/
	N.dom.table            = N.dom.table || {};
	/**
	 * 将tObj（table对象）的除去第一行的所有行删去（只留第一行）
	 * @param {string} || {HTMLTableElement} tObj table的ID值或者本身（作为DOM对象）
	 *
	 * @returns {HTMLTableElement} 经过处理后的table对象
	 */
	N.dom.table.leftTheFirstRow                = function(tObj){
		tObj                                   = N.dom.checkIsDom(tObj);
		while(tObj.rows.length > 1){
			tObj.deleteRow(tObj.rows.length - 1);
		}
		return tObj;
	};
	/**
	 * 为表格添加新行（即追加tr）
	 * @param {string} || {HTMLTableElement} tObj 目标table的ID或者本身（作为DOM对象）
	 * @param {array} newRowArrs 数据来源
	 * 		参考数据格式：
	 * 		[
	 *			[.., .., .., ..],
	 *			[.., .., .., ..],
	 *			[.., .., .., ..]
	 *		]
	 * 		数组中的每一项一级元素作为一个将要添加的tr，每一项二级元素作为当前tr中的td
	 * @param {string} trClassName(optional) 为每一个tr添加的样式（class）
	 * @param {string} tdClassName(optional) 为每一个td添加的样式（calss）
	 * 
	 * @returns {HTMLTableElement} 经过处理后的table对象
	 */
	N.dom.table.insertRow                      = function(tObj, newRowArrs, trClassName, tdClassName){
		tObj                                   = N.dom.checkIsDom(tObj);
		for(var i = 0, lenI = newRowArrs.length; i < lenI; i ++){
			var newTr       = document.createElement('tr');
			for(var j = 0, lenJ = newRowArrs[i].length; j < lenJ; j ++){
				var newTd       = document.createElement('td');
				newTd.innerHTML = newRowArrs[i][j];
				if(tdClassName)
					newTd.className = tdClassName;
				newTr.appendChild(newTd);
			}
			if(trClassName)
				newTr.className     = trClassName;
			if(!tObj.getElementsByTagName('tbody'))
				tObj.appendChild(document.createElement('tbody'));
			tObj.getElementsByTagName('tbody')[0].appendChild(newTr);
		}
		return tObj;
	};
	
	
	/*Style样式相关工具*/
	N.style                   = N.style || {};
	/**
	 * 获取计算后的样式信息
	 * @param {string | HTMLElement} o 目标元素的ID或者本身（作为DOM元素）
	 * 
	 * @returns {CSSStyleDeclaration(标准) | currentStyle(IE)} 返回style信息Obj，可以通过样式的脚本名称（骆驼命名法）来访问相关属性
	 */
	N.style.getFinalStyleInfo = function(o){
		o                     = N.dom.checkIsDom(o);
		if(!window.getComputedStyle){
			window.getComputedStyle = function($target){
				return $target.currentStyle;
			};
		}
		return window.getComputedStyle(o, null);
	};
	/**
	 * 兼容各种浏览器的Fixed定位的解决方案知识点说明，注意expression中的this
	 * 一般情况下，还是在css中控制定位比较好，大道至简
	 */
	
	/*
		<style type="text/css">
			body{
				background-image: url(about:blank);
				background-attachment: fixed;
			}
			.head, .foot{
				position: fixed !important;
			    position: absolute;
			}
			.foot{
				bottom: 0 !important;
			}
		</style>
		<!--IE6-->
		<!--[if IE 6]>
			<style type="text/css">
				.head{top: expression(eval((document.compatMode && document.compatMode=="CSS1Compat")?document.documentElement.scrollTop:document.body.scrollTop));}
				.foot{top: expression(eval((document.compatMode && document.compatMode=="CSS1Compat")?documentElement.scrollTop+documentElement.clientHeight-this.clientHeight:document.body.scrollTop+document.body.clientHeight-this.clientHeight)); }
			</style>
		<![endif]-->
	*/
	
	/**
	 * IE6中的固定元素的抖动问题处理函数
	 */
	N.style.repairShakeIe6    = function(){
		var bodyStyle         = N.style.getFinalStyleInfo(document.body);
		if(bodyStyle.backgroundImage == 'none' || bodyStyle.backgroundImage == '' || bodyStyle.backgroundImage == undefined)
			document.body.style.backgroundImage = 'url(about:blank)';
		if(bodyStyle.backgroundAttachment == 'scroll' || bodyStyle.backgroundAttachment == 'none' || bodyStyle.backgroundAttachment == '' || bodyStyle.backgroundAttachment == undefined)
			document.body.style.backgroundAttachment = 'fixed';
	};
	/**
	 * 将指定元素设置成悬挂的顶端元素（Fixed）
	 * @param {string | HTMLElement} id 目标元素的ID或者本身（作为DOM元素）
	 * @param {Object} posObj 目标元素的预期位置：{top:100, left:100}，单位像素
	 *
	 * @explain 以下面的函数成对，兼容ie6,7,8,ff,chrome,safari,opera，但是ie6下会有跳动的现象，还有一个不明显resize窗口错位bug
	 */
	N.style.setAsHeader   = function(obj, posObj){
		obj               = N.dom.checkIsDom(obj);
		posObj            = posObj || {
			top : 0,
			left: 0
		};
		if(N.browser.ie  <= 6){
			/*设置IE6下的防抖动处理（失效ing）*/
 			N.style.repairShakeIe6();
			obj.style.position  = 'absolute';
			obj.style.top       = posObj.top + 'px';
			obj.style.left      = posObj.left + 'px';
			/*添加事件*/
 			N.event.addEvent(window, 'scroll', function(e){
				obj.style.top   = N.browser.isStrict ? (document.documentElement.scrollTop + posObj.top + 'px') : (document.body.scrollTop + posObj.top + 'px');
				obj.style.left  = N.browser.isStrict ? (document.documentElement.scrollLeft + posObj.left + 'px') : (document.body.scrollLeft + posObj.left + 'px');
			});
		}else{
			/*非IE6*/
			obj.style.position = 'fixed';
			obj.style.top	   = posObj.top + 'px';
			obj.style.left	   = posObj.left + 'px';
		}
	};
	/**
	 * 将指定元素设置成固定的底端元素（Fixed）
	 * @param {string | HTMLElement} id 目标元素的ID或者本身（作为DOM元素）
	 * @param {Object} posObj 目标元素的预期位置：{bottom:100, left:100}，单位像素
	 */
	N.style.setAsFooter   = function(obj, posObj){
		obj               = N.dom.checkIsDom(obj);
		posObj            = posObj || {
			bottom : 0,
			left   : 0
		};
		var fixedPos        = function(){
			obj.style.top   = N.browser.isStrict ? (document.documentElement.scrollTop + document.documentElement.clientHeight - obj.clientHeight - posObj.bottom + 'px') : (document.body.scrollTop + document.body.clientHeight - obj.clientHeight - posObj.bottom + 'px');
			obj.style.left  = N.browser.isStrict ? (document.documentElement.scrollLeft + posObj.left + 'px') : (document.body.scrollLeft + posObj.left + 'px');
		};
		if(N.browser.ie  <= 6){
			/*设置IE6下的防抖动处理（失效ing）*/
 			N.style.repairShakeIe6();
			obj.style.position  = 'absolute';
			obj.style.bottom    = posObj.bottom + 'px';
			obj.style.left      = posObj.left + 'px';
			/*添加事件*/
 			N.event.addEvent(window, 'scroll', function(e){
				fixedPos();
			});
			N.event.addEvent(window, 'resize', function(e){
				fixedPos();
			});
		}else{
			/*非IE6*/
			obj.style.position = 'fixed';
			obj.style.bottom   = posObj.bottom + 'px';
			obj.style.left	   = posObj.left + 'px';
		}
	};
	
	
	/*EVENT事件处理*/
	N.event          = N.event || {};
	/**
	 * 挂载事件监听函数
	 * @param {string} || {HTMLElement} o 目标元素的ID或者本身（作为DOM元素）
	 * @param {string} e 需要挂载的事件名称(click, blur, focus...)
	 * @param {function} f 事件处理函数
	 */
	N.event.addEvent = function(o, e, f){
		o            = N.dom.checkIsDom(o);
		o.addEventListener ? o.addEventListener(e, f, false) : o.attachEvent('on' + e, function(){f.call(o);});
	};
	
	
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
	
	
	/*正则处理*/
	N.regexp               = N.regexp || {};
	/**
	 * 判断字符串是否是纯中文
	 * @param {string} str 输入字符串
	 * 
	 * @returns {boolean} 纯中文则返回true，否则返回false
	 * @information:
	 *	目前在unicode标准中，汉字的charCode范围是[0x4E00, 0x9FA5]
	 *	function test() {
	 *		var s = document.all.name.value ;
	 *		for(var i = 0; i < s.length; i++)
	 *			if(s.charCodeAt(i) < 0x4E00 || s.charCodeAt(i) > 0x9FA5) {
	 *				window.alert("输入非中文，请重新输入") ; 
	 *				break ;
	 *			}
	 *	}
	 *	中文：
	 *	/^[\u4E00-\u9FA5]+$/
	 *	数字：
	 *	/^d+$/（非负整数）
	 *	字母：
	 *	/^[a-zA-Z]{1,30}$/（1到30个以字母串）
	 */
	N.regexp.isPureChinese   = function(str){
		return /^[\u4E00-\u9FA5]+$/.test(str);
	};
	
	
	/*输入验证相关*/
	N.check                  = N.check || {};
	/**
	 * 输入框最多可以输入几个字符
	 * @param {string} || {HTMLElement} inputEle 目标元素ID或本身（作为DOM元素）
	 * @param {number} maxLen 输入框中最长字符个数
	 * @param {string} msg 超出字数限制后的提示信息
	 * @param {number} delay 提示信息显示的时间长短（单位：毫秒） 
	 * @param {boolean} isPureChinese 判断是否是检查纯中文
	 */
	N.check.inputLengthCheck = function(inputEle, maxLen, msg, delay, isPureChinese){
		delay                = delay || 1.5 * 1000;
		inputEle             = N.dom.checkIsDom(inputEle);
		var handler          = function(){
			var inputValue       = inputEle.value.substring(0, maxLen);
			inputEle.style.color = 'red';
			inputEle.value       = msg;
			setTimeout(function(){
				inputEle.style.color = 'black';
				inputEle.value   = inputValue;
			}, delay);
		};
		N.event.addEvent(inputEle, 'keyup', function(e){
			var inputValue   = inputEle.value;
			if(isPureChinese){//检查纯汉字
				if(N.regexp.isPureChinese(inputValue) && inputValue.length > maxLen){
					handler();
				}
			}else{//一般字符
				if(inputValue.length > maxLen){
					handler();
				}
			}
		});
	};
	
	
	/*数字处理*/
	N.math                   = N.math || {};
	/**
	 * 将分数转化为对应的百分数
	 * @param {string} fraction 目标分数（字符串格式，例如：'2/3'）
	 * @param {number} decimals(optional) 百分数保留几位小数，为空则不保留
	 *
	 * @returns {string} 转化后的百分数
	 */
	N.math.fractionToPercent = function(fraction, decimals){
		decimals             = decimals || '';
		var temp             = eval(fraction);
		var result           = (100 * temp).toFixed(decimals);
		if(result == parseInt(result))
			result = parseInt(result);
		return String(result) + '%';
	};
	
	
	/*工具库*/
	N.tool                  = N.tool || {};
	/**
	 * 为特定元素添加Hint（框内暗示）
	 * @param {string} || {HTMLElement} o 目标元素ID或者本身（作为DOM元素）
	 * @param {string} hint 暗示字符串
	 */
	N.tool.addHint          = function(o, hint){
		o                   = N.dom.checkIsDom(o);
		o.style.color       = 'gray';
		o.value             = typeof hint == 'string' ? hint : '';
		N.event.addEvent(o, 'focus', function(e){
			if(this.value == hint){
				this.style.color = '';
				this.value       = '';
			}
		});
		N.event.addEvent(o, 'blur', function(e){
			if(this.value == ''){
				this.style.color = 'gray';
				this.value       = hint;
			}
		});
	};
	/**
	 * 创建简单的分页列表
	 * @param {string} || {HTMLElement} placeHolder 占位符元素ID或者本身（作为DOM元素） 
	 * @param {number} totalPages 总页数
	 * @param {number} curPage 当前页
	 * @param {function} callBack 回调函数，会把点击的当前页作为参数传入
	 */
	N.tool.createPaging     = function(placeHolder, totalPages, curPage, callBack){
		var neighbour       = 2;
		placeHolder         = N.dom.checkIsDom(placeHolder);
		/*暂时涉及到样式的东东直接写入内联样式*/
		var aNotCurTplStyle = 'style="display:inline-block; margin:0 5px; text-decoration:none;"';
		var aIsCurTplStyle  = 'style="color:black; display:inline-block; margin:0 5px; font-size:120%; text-decoration:underline"';
		var aNotCurTpl      = '<a href="###" page="{0}" ' + aNotCurTplStyle + '>{0}</a>';
		var aIsCurTpl       = '<a href="###" page="{0}" ' + aIsCurTplStyle + '><strong>{0}</strong></a>';
		var ellipsis        = '···';
		var outPuts         = '';
		if(totalPages <= 10){
			for(var i = 1; i < totalPages + 1; i ++){
				var thisTpl     = (i == curPage ? aIsCurTpl : aNotCurTpl);
				outPuts        += N.str.strFormat(thisTpl, i);
			}	
		}else if(totalPages > 10){
			for(var i = 1; i < totalPages + 1; i ++){
				var thisTpl     = (i == curPage ? aIsCurTpl : aNotCurTpl);
				if(Math.abs(i - curPage) <= neighbour || i == 1 || i == totalPages){
					outPuts    += N.str.strFormat(thisTpl, i);
				}else{
					outPuts    += ellipsis;
				}
			}
			outPuts             = outPuts.replace(/[·]+/g, ellipsis);
		}
		placeHolder.innerHTML   = outPuts;
		var as                  = placeHolder.getElementsByTagName('a');
		var asLen               = as.length;
		while(asLen --){
			N.event.addEvent(as[asLen], 'click', function(e){
				callBack(this.getAttribute('page'));
			});
		}
		placeHolder             = null;
		as                      = null;
	};
	
	
	/*时间控制相关*/
	N.timer       = N.timer || {};
	/**
	 * 简易时间事件控制器
	 * @param {number} options.interval 间隔时间（毫秒记）
	 * @param {number} options.times(optional) 重复执行次数，为空则持续执行
	 * @param {boolean} options.noFirst 是否启用fire的瞬间调用（true: 不启用；false：启用） 
	 * @param {function} options.callBack 回调函数（会将调用的index作为参数传入）
	 *
	 * @grammar 
	 * 	var testTimer = new xxx.timer.timerHandler({
	 *		interval : 500,
	 *		times    : 10,
	 *		noFirst  : true,
	 *		callBack : function(index){
	 *			//index : 回调函数调用的索引
	 *		}
	 *	});
	 *	testTimer.fire();//激活控制器
	 *	testTimer.abort();//停止控制器
	 */
	N.timer.timerHandler = function(options){
		/*callBack, interval, noFirst, times*/
		var me = this;
		me.init(options);
		me.counter = 0;
	};
	N.timer.timerHandler.prototype = {
		init : function(options){
			var me = this;
			for(var i in options){
				me[i] = options[i];
			}
		},
		fire : function(){
			var me = this;
			if(!me.noFirst){
				/*First Fire*/
				me.callBack(me.counter); me.counter ++;
			}
			me.timer = window.setInterval(function(){
				if(me.times != undefined){
					if(me.counter == me.times){
						window.clearInterval(me.timer);
						return;
					}
				}
				me.callBack(me.counter); me.counter ++;
			}, me.interval);
		},
		abort : function(){
			var me = this;
			window.clearInterval(me.timer);
		}
	};
	
	
	/*Ajax*/
	N.ajax            = N.ajax || {};
	/**
	 * 简易Ajax控制器，Ajax引擎暂时使用的是Tangram Ajax控制器
	 * @param {number} options.delayTime 请求延迟时间（最长请求时间，毫秒记）
	 * @param {number} options.retryTimes 单次请求失败后重复请求最大次数
	 * @param {string} options.ajaxRequestUrl 请求的目标url 
	 * @param {string} options.method(optional) 请求方法（默认为GET，也可以为POST）
	 * @param {string} options.data(optional) POST的数据（在POST方法下有效，GET方法可以在url中附加数据），格式：a=aaa&b=bbb&c=ccc
	 * @param {function} options.callBack 回调函数（会把当前请求的xhr对象作为参数传入）
	 *
	 * @grammar
     *	var testAjax = new xxx.ajax.ajaxHandler({
     *		delayTime      : 2 * 1000,
     *		retryTimes     : 10,
     *		ajaxRequestUrl : '/request.php',
     *		callBack       : function(xhr){
     *			//xhr: 返回当前请求的xhr对象
     *		}
     *	});
     *	testAjax.startRequest();//开始请求
	 */
	N.ajax.ajaxHandler = function(options){
		/*pras check*/
		if(options.ajaxRequestUrl == '' || options.ajaxRequestUrl == undefined)
			return;
		options.delayTime  = options.delayTime  || 5 * 1000;
		options.retryTimes = (options.retryTimes + 1) || (10 + 1);
		if('function' !== typeof options.callBack)
			return;
		this.init(options);/*init*/
	};
	N.ajax.ajaxHandler.prototype = {
		init : function(options){
			var me = this;
			for(var i in options){
				me[i] = options[i];
			}
			me.resetReqPar();
		},
		resetReqPar  : function(){
			var me            = this;
			me.startFlag      = false;
		},
		updateReqPar : function(){
			var me           = this;
			if(!me.startFlag)
				me.startFlag = true;
		},
		startRequest : function(){
			var me = this;
			me.xhrs   = [];
			me.ajaxTimer = new N.timer.timerHandler({
				interval : me.delayTime,
				times    : me.retryTimes,
				callBack : function(index){
					me.xhrs[index] = N.EXTERNALTOOLS.ajax.request(me.ajaxRequestUrl, {
						method          : me.method,
						data            : me.data,
						onbeforerequest : function(xhr){
							try{
								if(index != 0 && index > 0)
									me.xhrs[index - 1].abort();/*Abort The Previous One*/
								if(index == me.retryTimes - 1)
									xhr.abort();/*Abort The Last One*/
								}catch(e){};
							me.updateReqPar();
						},
						onsuccess       : function(xhr, msg){
							me.resetReqPar();
							me.ajaxTimer.abort();
							me.callBack(xhr);
						},
						onfailure       : function(xhr){
							//do nothing;Auto Start The Next One
						}
					});
				}
			});
			me.ajaxTimer.fire();
		}
	};
})(window);