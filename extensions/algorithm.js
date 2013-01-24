/**
 * Algorithm.js 积累一些和算法相关的优化方法
 */
(function () {
	/**
	 * 获取GT命名空间
	 */
	var N = window[__$_GTNAMESPACE_$__];
	
	N.algo = N.algo || {};
	
	/**
	 * 学习使用Memoization技术来优化计算次数，来自《高性能Javascript一书》
	 * @param {Function} func 需要增加缓存功能的函数
	 * @param {Object} cache 可选的缓存对象
	 *
	 * @return {Function} 返回增加了缓存功能的函数
	 */
	N.algo.memoize = function (func, cache) {
		cache = cache || {};
		return function (arg) {
			if (!cache.hasOwnProperty(arg)) {
				cache[arg] = func(arg);
			}
			return cache[arg];
		};
	};

    /**
     * 创建节流函数（即，一个函数可能在短时间内执行好几遍，为了
     * 节约性能，这个函数可以解决这个问题，例如onscroll事件的触发等等）
     * 
     * @param {Function} method 需要节流的函数 
     * @param {Array} args 传入参数列表
     * @param {Object} context 执行上线文
     * @param {Number} delay 执行delay
     * @return {undefined}
     */
    N.algo.throttle = function(method, args, context, delay) {
        context = context == undefined ? null : context;
        method.tId && clearTimeout(method.tId);
        method.tId = setTimeout(function() {
            method.apply(context, args);
        }, (delay ? delay : 140));
    };

    /**
     * 创建节能函数，一个函数（比如某种情况下的onchange事件，可能会调用两次，为了防止短期内重复调用）
     * 
     * @param {Function} method 需要节能的函数 
     * @param {Array} args 传入参数列表
     * @param {Object} context 执行上线文
     * @param {Number} delay 执行delay
     * @return {undefined}
     */
    N.algo.savingEnergy = function(method, args, context, delay) {
        if(method._runing_)
            return;
        context = context == undefined ? null : context;
        // 开始调用
        method._runing_     = 1;
        method.apply(context, args);
        setTimeout(function() {
            method._runing_ = 0;
        }, (delay ? delay : 140));
    };
})();