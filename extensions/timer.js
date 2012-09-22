/**
 * timer.js 相关时间处理
 */
(function(){
	/**
	 * 获取GT命名空间
	 */
	var N  = eval('window.' + window.__$_GTNAMESPACE_$__);
	
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
	 *	testTimer.abort();//停止控制器(可以在此指定返回值)
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
		abort : function(returnFlag){
			var me = this;
			window.clearInterval(me.timer);
			return returnFlag;
		}
	};
	/**
	 * 简易监控函数，依赖于N.timer.timerHandler
	 * @param {number} options.interval 监控函数调用的间隔时间
	 * @param {function} options.monitorFunc(index) 监控函数体，会将调用次数作为传入参数，在调用的过程中，若此函数返回true，则代表监控条件成功，监控结束，调用callBack回调；若此函数返回false，则代表监控失败，继续进行监控
	 * @param {function} options.callBack 总回调函数，在监控函数返回true的时候调用
	 */
	N.timer.monitor   = function(options){
		var me        = this;
		me.init(options);
	};
	N.timer.monitor.prototype = {
		init: function(options){
			var me    = this;
			for(var i in options){
				me[i] = options[i];
			}
		},
		fire: function(){
			var me   = this;
			me.timer = new N.timer.timerHandler({
				interval: me.interval,
				noFirst : false,
				callBack: function(index){
/*					if(me.monitorFunc(index)){
						me.timer.abort();
						me.callBack();
					}*/
					me.monitorFunc(index) && me.timer.abort(true) && me.callBack();
				}
			});
			me.timer.fire();
		}
	};
	/**
	 * 简易轮流执行函数
	 * @param {Array} funcs 一个装着函数的数组，每个函数调用的时候，函数体内this指向实例对象本身，并且传回index索引，0开始
	 * @param {Number} interval 间隔时间，秒计，忽略的情况下将采用默认的20毫秒
	 */
	N.timer.takeTurns2Run = function(){
		//私有变量
		var _funcs, _interval, _timer, _counter;
		var Constructor   = function(funcs, interval){
			//先检查值的设置情况，没有的话，设置默认值
			_funcs        = funcs || [];
			_interval     = interval * 1000 || 20;
			//再检查值的类型
			if(toString.call(_funcs) !== '[object Array]')
				throw new Error('N.timer.takeTurns2Run expects an array of Functions!');
			if(toString.call(_interval) !== '[object Number]')
				throw new Error('N.timer.takeTurns2Run expects a Number type interval!');
		};
		Constructor.prototype = function(){
			return {
				fire: function(){
					var me   	  = this;
					var _funcsLen = _funcs.length;
					_counter      = 0;
					_timer = window.setInterval(function(){
						if(_counter === _funcsLen)
							_counter = 0;
						_funcs[_counter ++].call(me, _counter - 1);
					}, _interval);
				},
				stop: function(){
					var me = this;
					if(_timer)
						window.clearInterval(_timer);
				}
			};
		}();
		return Constructor;
	}();
	/**
	 * 只会执行特定次数的函数
	 * @param {String} identifier 代码段的唯一标识符（必须）
	 * @param {Function} func 函数段，最好使用function(index){}形式，回传索引，0开始
	 * @param {Number} times 执行的次数，默认为1次
	 */
	N.timer.runJustNtimes = function(identifier, func, times){
		times             = times || 1;
		if(toString.call(identifier) !== '[object String]')
			throw new Error('N.timer.runJustNtimes expects a String as the first parameter!');
		if(toString.call(func)       !== '[object Function]')
			throw new Error('N.timer.runJustNtimes expects a Function as the second parameter!');
		if(toString.call(times)      !== '[object Number]')
			throw new Error('N.timer.runJustNtimes expects a Number as the third parameter!');
		var me        = arguments.callee;
		me.statements = me.statements || {};
		me.statements[identifier] = me.statements[identifier] || [func, times, 0];
		if(me.statements[identifier][2] === times)
			return;
		//Run
		me.statements[identifier][0](me.statements[identifier][2] ++);
	};
})();