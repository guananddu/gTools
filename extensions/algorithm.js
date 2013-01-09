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
})();