/**
 * hash相关函数
 */
(function () {
    /**
     * 获取GT命名空间
     */
    var N  = window[__$_GTNAMESPACE_$__];

    N.hash = N.hash || {};
    
    /**
     * 简易hash监控器及其修改器
     * 
     * @param {window} targetWindow 需要监控的目标窗口引用
     * @return {Object} 返回一系列操作方法
     */
    N.hash.hashMonitor = function(targetWindow) {
        var getHash = function() {
                return targetWindow.location.hash;
            };
        var setHash = function(hash) {
                targetWindow.location.hash = hash;
            };
        // 监控池
        var monitors = {};
        return {
            // 附加（之前没有此key）
            append: function(key, value) {
                var hash = getHash();
                hash += ((!hash || !~hash.indexOf('#')) ? '#' : '&') + key + '=' + value;
                setHash(hash);
                return this;
            },
            // 设置某值（之前已经存在）
            set: function(key, value) {
                var hash = getHash();
                var start = hash.indexOf(key);
                if(start == -1) return;
                var keyLen = key.length;
                start = start + keyLen + 1;
                var front = hash.substring(0, start);
                var end = hash.indexOf('&', start);
                var after = end == -1 ? '' : hash.substring(end);
                setHash(front + value + after);
                return this;
            },
            // 得到某个键值
            get: function(key, callback) {
                var hash = getHash();
                var start = hash.indexOf(key);
                if(start == -1) return callback('');
                var keyLen = key.length;
                start = start + keyLen + 1;
                var end = hash.indexOf('&', start);
                callback(
                end == -1 ? hash.substring(start) : hash.substring(start, end));
                return this;
            },
            // 判断某个hash键值是否存在
            has: function(key) {
                var hash = getHash();
                return ~hash.indexOf(key + '=');
            },
            // 注册监控器
            registerMonitor: function(key, func) {
                monitors[key] = monitors[key] || [];
                monitors[key].push(func);
                return this;
            },
            // 触发
            trigger: function(key) {
                var len;
                if((len = monitors[key].length) > 0) {
                    var data = arguments[1];
                    for(var i = 0; i < len; i++) {
                        monitors[key][i](data);
                    }
                }
                return this;
            },
            // 监控某一个变量的变化
            monitor: function(key) {
                var me = this;
                // 得到旧值
                var oldV;
                me.get(key, function(v) {
                    oldV = !v ? '' : v;
                });
                var timer = window.setInterval(function() {
                    var newV;
                    me.get(key, function(v) {
                        newV = !v ? '' : v;
                    });
                    if(oldV != newV) {
                        window.clearInterval(timer);
                        me.trigger(key, {
                            oldV: oldV,
                            newV: newV
                        });
                    }
                }, 30);
                return me;
            }
        };
    }(window);
})();