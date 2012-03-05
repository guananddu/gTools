/**
 * ajax.js GT的ajax引擎，引用baidu.ajax.request源码
 */
(function(){
	/**
	 * 获取GT命名空间
	 */
	var N  = eval('window.' + window.top.__$_GTNAMESPACE_$__);
	
	N.ajax = N.ajax || {};
	/**
	 * 发送一个ajax请求
	 * @author: allstar, erik, berg
	 * @name baidu.ajax.request => N.ajax.request
	 * @function
	 * @grammar baidu.ajax.request(url[, options]) => N.ajax.request(url[, options])
	 * @param {string} 	url 发送请求的url
	 * @param {Object} 	options 发送请求的选项参数
	 * @config {String} 	[method] 			请求发送的类型。默认为GET
	 * @config {Boolean}  [async] 			是否异步请求。默认为true（异步）
	 * @config {String} 	[data] 				需要发送的数据。如果是GET请求的话，不需要这个属性
	 * @config {Object} 	[headers] 			要设置的http request header
	 * @config {number}   [timeout]       超时时间，单位ms
	 * @config {String} 	[username] 			用户名
	 * @config {String} 	[password] 			密码
	 * @config {Function} [onsuccess] 		请求成功时触发，function(XMLHttpRequest xhr, string responseText)。
	 * @config {Function} [onfailure] 		请求失败时触发，function(XMLHttpRequest xhr)。
	 * @config {Function} [onbeforerequest]	发送请求之前触发，function(XMLHttpRequest xhr)。
	 * @config {Function} [on{STATUS_CODE}] 	当请求为相应状态码时触发的事件，如on302、on404、on500，function(XMLHttpRequest xhr)。3XX的状态码浏览器无法获取，4xx的，可能因为未知问题导致获取失败。
	 * @config {Boolean}  [noCache] 			是否需要缓存，默认为false（缓存），1.1.1起支持。
	 * 
	 * @meta standard
	 *             
	 * @returns {XMLHttpRequest} 发送请求的XMLHttpRequest对象
	 */
	
	N.ajax.request	    = function (url, opt_options) {
		var options     = opt_options || {},
			data        = options.data || "",
			async       = !(options.async === false),
			username    = options.username || "",
			password    = options.password || "",
			method      = (options.method || "GET").toUpperCase(),
			headers     = options.headers || {},
			// 基本的逻辑来自lili同学提供的patch
			timeout     = options.timeout || 0,
			eventHandlers = {},
			tick, key, xhr;

		/**
		 * readyState发生变更时调用
		 * 
		 * @ignore
		 */
		function stateChangeHandler() {
			if (xhr.readyState == 4) {
				try {
					var stat = xhr.status;
				} catch (ex) {
					// 在请求时，如果网络中断，Firefox会无法取得status
					fire('failure');
					return;
				}
				
				fire(stat);
				
				// http://www.never-online.net/blog/article.asp?id=261
				// case 12002: // Server timeout      
				// case 12029: // dropped connections
				// case 12030: // dropped connections
				// case 12031: // dropped connections
				// case 12152: // closed by server
				// case 13030: // status and statusText are unavailable
				
				// IE error sometimes returns 1223 when it 
				// should be 204, so treat it as success
				if ((stat >= 200 && stat < 300)
					|| stat == 304
					|| stat == 1223) {
					fire('success');
				} else {
					fire('failure');
				}
				
				/*
				 * NOTE: Testing discovered that for some bizarre reason, on Mozilla, the
				 * JavaScript <code>XmlHttpRequest.onreadystatechange</code> handler
				 * function maybe still be called after it is deleted. The theory is that the
				 * callback is cached somewhere. Setting it to null or an empty function does
				 * seem to work properly, though.
				 * 
				 * On IE, there are two problems: Setting onreadystatechange to null (as
				 * opposed to an empty function) sometimes throws an exception. With
				 * particular (rare) versions of jscript.dll, setting onreadystatechange from
				 * within onreadystatechange causes a crash. Setting it from within a timeout
				 * fixes this bug (see issue 1610).
				 * 
				 * End result: *always* set onreadystatechange to an empty function (never to
				 * null). Never set onreadystatechange from within onreadystatechange (always
				 * in a setTimeout()).
				 */
				window.setTimeout(
					function() {
						// 避免内存泄露.
						// 由new Function改成不含此作用域链的 N.blank 函数,
						// 以避免作用域链带来的隐性循环引用导致的IE下内存泄露. By rocy 2011-01-05 .
						xhr.onreadystatechange = N.blank;
						if (async) {
							xhr = null;
						}
					}, 0);
			}
		}
		
		/**
		 * 获取XMLHttpRequest对象
		 * 
		 * @ignore
		 * @return {XMLHttpRequest} XMLHttpRequest对象
		 */
		function getXHR() {
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
		}
		
		/**
		 * 触发事件
		 * 
		 * @ignore
		 * @param {String} type 事件类型
		 */
		function fire(type) {
			type = 'on' + type;
			var handler = eventHandlers[type],
				globelHandler = N.ajax[type];
			
			// 不对事件类型进行验证
			if (handler) {
				if (tick) {
				  clearTimeout(tick);
				}

				if (type != 'onsuccess') {
					handler(xhr);
				} else {
					//处理获取xhr.responseText导致出错的情况,比如请求图片地址.
					try {
						xhr.responseText;
					} catch(error) {
						return handler(xhr);
					}
					handler(xhr, xhr.responseText);
				}
			} else if (globelHandler) {
				//onsuccess不支持全局事件
				if (type == 'onsuccess') {
					return;
				}
				globelHandler(xhr);
			}
		}
		
		
		for (key in options) {
			// 将options参数中的事件参数复制到eventHandlers对象中
			// 这里复制所有options的成员，eventHandlers有冗余
			// 但是不会产生任何影响，并且代码紧凑
			eventHandlers[key] = options[key];
		}
		
		headers['X-Requested-With'] = 'XMLHttpRequest';
		
		
		try {
			xhr = getXHR();
			
			if (method == 'GET') {
				if (data) {
					url += (url.indexOf('?') >= 0 ? '&' : '?') + data;
					data = null;
				}
				if(options['noCache'])
					url += (url.indexOf('?') >= 0 ? '&' : '?') + 'b' + (+ new Date) + '=1';
			}
			
			if (username) {
				xhr.open(method, url, async, username, password);
			} else {
				xhr.open(method, url, async);
			}
			
			if (async) {
				xhr.onreadystatechange = stateChangeHandler;
			}
			
			// 在open之后再进行http请求头设定
			// FIXME 是否需要添加; charset=UTF-8呢
			if (method == 'POST') {
				xhr.setRequestHeader("Content-Type",
					(headers['Content-Type'] || "application/x-www-form-urlencoded"));
			}
			
			for (key in headers) {
				if (headers.hasOwnProperty(key)) {
					xhr.setRequestHeader(key, headers[key]);
				}
			}
			
			fire('beforerequest');

			if (timeout) {
			  tick = setTimeout(function(){
				xhr.onreadystatechange = N.blank;
				xhr.abort();
				fire("timeout");
			  }, timeout);
			}
			xhr.send(data);
			
			if (!async) {
				stateChangeHandler();
			}
		} catch (ex) {
			fire('failure');
		}
		
		return xhr;
	};
	//设置快捷方式
	N.request = N.ajax.request;
	
	/**
	 * 在ajax的基础上增加失败，和超时处理。失败/超时 -> 等待time -> 再次调用，可以设置重复的最大请求次数
	 * @param url 参看N.ajax.request函数的参数介绍
	 * 增加：
	 * @param {Number} opt_options[interval] 此次请求失败/超时结束到下次开始之间的间隔时间（毫秒计）
	 * @param {Number} opt_options[times] 失败后重复请求的次数，为空则持续进行请求
	 */
	N.ajax.advancedRequester = function(url, opt_options){
		if(typeof url      !== 'string')
			throw new Error('N.ajax.advancedRequester expects a String as the first parameter!');
		
		N.ajax.request(url, opt_options);
	};

	/**
	 * 简易Ajax控制器，Ajax引擎暂时使用的是Tangram Ajax控制器（已经独立2012.03.03）
	 * @param {number} options.delayTime 请求延迟时间（最长请求时间，毫秒记）
	 * @param {number} options.retryTimes 单次请求失败后重复请求最大次数
	 * @param {string} options.ajaxRequestUrl 请求的目标url 
	 * @param {string} options.method(optional) 请求方法（默认为GET，也可以为POST）
	 * @param {string} options.data(optional) POST的数据（在POST方法下有效，GET方法可以在url中附加数据），格式：a=aaa&b=bbb&c=ccc
	 * @param {function} options.beforeRequest 每次请求的前调函数（会把当前请求的xhr对象作为第一个参数传入）
	 * @param {function} options.callBack 回调函数（会把当前请求的xhr对象作为第一个参数传入，第二个参数为xhr.responseText）
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
		if(!options.ajaxRequestUrl || typeof options.ajaxRequestUrl !== 'string')
			throw new Error('N.ajax.ajaxHandler : ajaxRequestUrl 必须为请求字符串！');
		options.delayTime     = options.delayTime  || 5 * 1000;
		options.retryTimes    = (options.retryTimes + 1) || (10 + 1);
		options.method        = options.method || 'GET';
		options.data          = options.data || '';
		options.callBack      = options.callBack || function(){};
		options.beforeRequest = options.beforeRequest || function(){};
		if('function' !== typeof options.callBack || 'function' !== typeof options.beforeRequest)
			throw new Error('N.ajax.ajaxHandler : 前调函数或者回调函数必须为函数类型！');
		this.init(options);/*init*/
	};
	N.ajax.ajaxHandler.prototype = {
		init : function(options){
			var me = this;
			for(var i in options){
				me[i] = options[i];
			}
			/*加载ajax引擎，使用tangram函数库*/
			//N.loader.loadBaseTangram('baidu.ajax.request');
			me.ajaxEngine = N.ajax.request;
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
					me.xhrs[index] = me.ajaxEngine(me.ajaxRequestUrl, {
						method          : me.method,
						data            : me.data,
						onbeforerequest : function(xhr){
							try{
								if(index == 0){
									me.updateReqPar();
									me.beforeRequest(xhr);	
								}
								if(index != 0 && index > 0){
									me.xhrs[index - 1].abort();/*Abort The Previous One*/
									if(index == me.retryTimes - 1){
										xhr.abort();/*Abort The Last One*/
										N.debuger.throwit('WARN', _MESSAGES.noResponse + me.ajaxRequestUrl);
										return;
									}
									me.updateReqPar();
									me.beforeRequest(xhr);
								}
							}catch(e){};
						},
						onsuccess       : function(xhr, msg){
							me.resetReqPar();
							me.ajaxTimer.abort();
							me.callBack(xhr, msg);
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
	
	/**
	 * 简易式轮询式请求
	 * @param {string} options.requestUrl 请求的url
	 * @param {function} options.ensureFunc(xhr, reText) 监控函数，在返回false的状态下会再次发起请求，直至返回true，就会停止请求，轮询结束（当前请求对象xhr和当前返回的reText(xhr.responseText)作为传入参数）
	 * @param {function} options.beforeRequest(xhr) 整体轮询请求开始之前的前调函数(会将当前xhr请求对象作为传入参数)
	 * @param {function} options.stepBeforeRequest(xhr, counter) 单步前调函数(会将当前xhr请求对象作为传入参数，第二个参数为此次轮询请求计数，从1开始)
	 * @param {function} options.stepCallBackFunc(xhr, reText) 单步回调函数（当前请求对象xhr和当前返回的reText(xhr.responseText)作为传入参数）
	 * @param {function} options.afterRequest(xhr, reText) 整体轮询结束后的回调函数（当前请求对象xhr和当前返回的reText(xhr.responseText)作为传入参数）
	 * @param {boolean} options.advancedMode 是否开启高级模式（高级模式具有了单次请求的错误及其延迟，及其重复次数处理，默认不开启）
	 * 
	 * 在开启高级模式下配置advanceOptions参数
	 * @param {number} advanceOptions.delayTime 单次请求等待的延迟时间（最长请求时间，毫秒）
	 * @param {number} advanceOptions.retryTimes 单次请求失败后重复请求最大次数
	 */
	/*静态计数器*/
	N.ajax.counter              = {};
	N.ajax.takeTurnsToRequester = function(options, advanceOptions){
		if(!options.requestUrl || typeof options.requestUrl !== 'string')
			throw new Error('N.ajax.takeTurnsToRequester : requestUrl 必须为请求字符串！');
		options.ensureFunc        || (options.ensureFunc = function(){});
		options.beforeRequest     || (options.beforeRequest = function(){});
		options.stepBeforeRequest || (options.stepBeforeRequest = function(){});
		options.stepCallBackFunc  || (options.stepCallBackFunc = function(){});
		options.afterRequest      || (options.afterRequest = function(){});
		options.advancedMode      || (options.advancedMode = false);
		
		/*Load Ajax Engine*/
		this.ajaxEngine = N.ajax.request;
		this.requestUrl = options.requestUrl;
		this.ensureFunc = options.ensureFunc;
		this.beforeRequest     = options.beforeRequest;
		this.stepBeforeRequest = options.stepBeforeRequest;
		this.stepCallBackFunc  = options.stepCallBackFunc;
		this.afterRequest = options.afterRequest;
		this.advancedMode = options.advancedMode;
		this.ops          = options;
		
		/*高级模式*/
		if(this.advancedMode){
			advanceOptions || (advanceOptions = {});
			advanceOptions.delayTime  || (advanceOptions.delayTime = 3 * 1000);
			advanceOptions.retryTimes || (advanceOptions.retryTimes = 4);
			
			this.delayTime  || (this.delayTime = advanceOptions.delayTime);
			this.retryTimes || (this.retryTimes = advanceOptions.retryTimes);
			this.adops      || (this.adops = advanceOptions);
		}
		if(N.ajax.counter[this.requestUrl] === undefined)
			N.ajax.counter[this.requestUrl] = 0;
	};
	N.ajax.takeTurnsToRequester.prototype = {
		run: function(){
			var me = this;
			N.ajax.counter[me.requestUrl] ++;
			if(me.advancedMode){
				/*采用高级模式*/
				new N.ajax.ajaxHandler({
					delayTime      : me.delayTime,
					retryTimes     : me.retryTimes,
					ajaxRequestUrl : me.requestUrl,
					beforeRequest  : function(xhr){
						/*整体前调函数*/
						if(N.ajax.counter[me.requestUrl] == 1){
							me.beforeRequest(xhr);
						}
						/*单步前调函数*/
						me.stepBeforeRequest(xhr, N.ajax.counter[me.requestUrl]);
					},
					callBack       : function(xhr, reText){
						if(!me.ensureFunc(xhr, reText)){
							/*继续轮询*/
							me.stepCallBackFunc(xhr, reText);
							/*初始化及其开始下次请求*/
							new N.ajax.takeTurnsToRequester(me.ops, me.adops).run();
						}else if(me.ensureFunc(xhr, reText)){
							/*条件满足，停止轮询*/
							/*最后一次单步回调*/
							me.stepCallBackFunc(xhr, reText);
							/*轮询结束回调函数*/
							me.afterRequest(xhr, reText);
						}
					}
				}).startRequest();
			}else{
				/*采用一般模式*/
				me.ajaxEngine(me.requestUrl, {
					onbeforerequest : function(xhr){
						/*整体前调函数*/
						if(N.ajax.counter[me.requestUrl] == 1){
							me.beforeRequest(xhr);
						}
						/*单步前调函数*/
						me.stepBeforeRequest(xhr, N.ajax.counter[me.requestUrl]);
					},
					onsuccess : function(xhr, reText){
						if(!me.ensureFunc(xhr, reText)){
							/*继续轮询*/
							me.stepCallBackFunc(xhr, reText);
							/*初始化及其开始下次请求*/
							new N.ajax.takeTurnsToRequester(me.ops).run();
						}else if(me.ensureFunc(xhr, reText)){
							/*条件满足，停止轮询*/
							/*最后一次单步回调*/
							me.stepCallBackFunc(xhr, reText);
							/*轮询结束回调函数*/
							me.afterRequest(xhr, reText);
						}
					}
				});	
			}
		}
	};
	
	/**
	 * 简易信标式请求
	 * @param {string} baseurl 目标url
	 * @param {obj} paras 信标请求所使用的参数
	 * 例如：
	 * {a: 'a', b: 'b'}
	 */
	N.ajax.simpleRequester = function(baseurl, paras){
		var _t = [];
		for(var i in paras){
			_t.push(
				i + '=' + paras[i]
			);
		}
		//开始请求
		new Image().src = baseurl + '?' + _t.join('&');
	};
})();