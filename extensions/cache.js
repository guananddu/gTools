/**
 * cache.js 提供一些简易缓存处理
 * 
 * @import N.json
 */
(function(){
	/**
	 * 获取GT命名空间
	 */
	var N  = eval('window.' + window.__$_GTNAMESPACE_$__);
	
	/**
	 * gTools的简易缓存工具
	 */
	N.cache               = N.cache || {};
	/**
	 * 使用的时候需要使用new运算符，举例如下：
		var i18nCache = new N.cache.cacheProvider;
		if (i18nCache.isSet('topnav')) {
			$('#nav').html(i18nCache.get('topnav'));
		} else {
			ajax('top-nav.tmpl', function(html) {
				i18nCache.set('topnav', html);
				$('#nav').html(i18nCache.get('topnav'));
			});
		}
	 */
	N.cache.cacheProvider = function(){
		//值会被存储到这里
		this._cache       = {};
	};
	/**
	 * 缓存环境的测试，为其添加静态的属性
	 */
	try {
		N.cache.cacheProvider.hasLocalStorage = ('localStorage' in window) && window['localStorage'] !== null;
	} catch (ex) {
		N.cache.cacheProvider.hasLocalStorage = false;
	}
	if (N.cache.cacheProvider.hasLocalStorage) {
		try{
			Storage.prototype.setObject = function(key, value) {
				this.setItem(key, JSON ? JSON.stringify(value) : N.json.jsonToStr(value));
			};
			Storage.prototype.getObject = function(key) {
				return JSON ? JSON.parse(this.getItem(key)) : N.json.strToJson(this.getItem(key));
			};
		}catch(e){};
	}
	N.cache.cacheProvider.prototype = {
		/**
		* {String} k - the key, 键名
		* {Boolean} local - get this from local storage?, 要从本地存储里面取值吗？
		* {Boolean} o - is the value you put in local storage an object?, 你放进去的是一个对象吗？
		*/
		get: function(k, local, o) {
			if (local && N.cache.cacheProvider.hasLocalStorage) {
				var action = o ? 'getObject' : 'getItem';
				return localStorage[action](k) || undefined;
			} else {
				return this._cache[k] || undefined;
			}
		},

		/**
		* {String} k - the key
		* {Object} v - any kind of value you want to store
		* however only objects and strings are allowed in local storage
		* {Boolean} local - put this in local storage
		*/
		set: function(k, v, local) {
			if (local && N.cache.cacheProvider.hasLocalStorage) {
				if (typeof v !== 'string') {
					// make assumption if it's not a string, then we're storing an object
					localStorage.setObject(k, v);
				} else {
					try {
						localStorage.setItem(k, v);
					} catch (ex) {
						if (ex.name == 'QUOTA_EXCEEDED_ERR') {
							// developer needs to figure out what to start invalidating
							throw new Exception(v);
							return;
						}
					}
				}
			} else {
				// put in our local object
				this._cache[k] = v;
			}
			// return our newly cached item
			return v;
		},
		
		/**
		 * {String} k - the key
		 * {Boolean} local - local storage?
		 */
		isSet: function(k, local) {
			if (local && N.cache.cacheProvider.hasLocalStorage) {
				//var action = o ? 'getObject' : 'getItem';
				return localStorage.getItem(k) !== null;
			} else {
				return this._cache[k] !== undefined;
			}
		},

		/**
		* {String} k - the key
		* {Boolean} local - 需要清除localStorage里面的内容吗？
		*/
		clear: function(k, local) {
			if (local && N.cache.cacheProvider.hasLocalStorage) {
				localStorage.removeItem(k);
			}
			// delete in both caches - doesn't hurt.
			delete this._cache[k];
		}
	};
})();