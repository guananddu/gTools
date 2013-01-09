/* 
 * gTools JavaScript Library v1.5.2
 * Copyright 2011, guananddu. All rights reserved.
 *
 * author: guananddu
 * date: 2011/11/08
  */
(function (window, $nameSpace) {
	/* 版本号 */
	var version = '1.5.3';
	/* 声明常用局部变量 */
	var top = window.top,
        document  = window.document,
        undefined = window.undefined,
        navigator = window.navigator,
        location  = window.location;
	
	/* 命名空间处理，默认为$GT$命名空间 */
	var NS = $nameSpace || '$GT$';
	// execCode  = 'var N = window.' + NS + ' = window.' + NS + ' || {version: "' + version + '"};';
	
	/* 作为GW模块之间的通信，获取命名空间 */
	window.__$_GTNAMESPACE_$__ = NS;
	
	/* 
        执行语句：
        var N     = window.$GT$ = window.$GT$ || {version: '1.0.1'};
        不知为何当初要这样写，还是避免使用eval吧。
	*/
	// eval(execCode);
	// 创建局部变量
	var N = window[__$_GTNAMESPACE_$__] = {
        version: version,
        // 创建快捷方法
        OtoString : Object.prototype.toString,
        OhasOwn   : Object.prototype.hasOwnProperty,
        Opush     : Array.prototype.push,
        Oslice    : Array.prototype.slice,
        OindexOf  : Array.prototype.indexOf
    };
    
	/* 命名空间切换函数 */
	N.changeNS = function (ns) {
		if (ns === NS)
			return;
		if (undefined !== ns && null !== ns && '' !== ns && NS !== ns) {
			if (toString.call(ns) === '[object String]' && /^[^A-Za-z$_]|[^\w$]/.test(ns) === false) {
				// execCode = 'delete window.' + NS;
				// eval(execCode);
                // 删除原始空间
                delete window[NS];
				// execCode = 'window.' + ns + ' = N;';
				// eval(execCode);
                // 放入新命名空间
                window[ns] = N;
                // 修改命名空间记录
				window.__$_GTNAMESPACE_$__ = NS = ns;
			} else {
				N.debuger.throwit('ERROR', 
                    'Wrong NameSpace Foramt, Expected: A-Z a-z 0-9 _ $, And don\'t start with number: ' + ns);
			}
		} else {
			return;
		}
	};
	
	/* Debuger Or Regular，是否打开调试模式 */
	N.debugerFlag = true;
	
	/* Server，是否使用PHP服务器 */
	N.isPhpServer = true;
	
	/* 常用信息提示 */
	// var _MESSAGES = {
		// wrongNameSpaceFormat : 'Wrong NameSpace Foramt, Expected: A-Z a-z 0-9 _ $, And don\'t start with number: ',
		// hadLoadedIt : 'You had loaded this: '
	// };
	
	/**
	 * 得到本脚本文件对应的<script>标签元素
	 */
    // 简单地获取当前的script
	var _script = document.getElementsByTagName("script");
	// _script = _script[_script.length - 1];
    // 或者
    _script = (function () {
    	if (document.currentScript) {
    		return document.currentScript;
    	}
    	var els = document.getElementsByTagName("script");
    	for (var i = 0, el; el = els[i++]; ) {
    		if (el.readyState === 'interactive') {
    			return el
    		}
    	}
    	return null;
    })();
    if (_script) {
        var _t = _script.src.replace(/\\/g, "/");
        // 脚本路径
        N.DIR = (_t.lastIndexOf("/") < 0 ? "." : _t.substring(0, _t.lastIndexOf("/")));    
    }
    
	
	/* 外部工具的引用路径配置 */
	// N.EXTERNALTOOLS        = {};
	
	/* 外部库的配置路径，配置默认值，也可以由用户自己设置，真是味如鸡肋 */
	// N.EXTERNALTOOLS.config = {
	// 		baiduBaseJsImporter      : N.DIR + '/tools/Tangram-base-1.5.2/src/jsloader.gt.js',
	// 		baiduBasePhpImporter     : N.DIR + '/tools/Tangram-base-1.5.2/src/import.php',/*php服务器下可以直接请求此文件 */
	// 		components				 : N.DIR + '/components/',
	// 		extensions               : N.DIR + '/extensions/',
	// 		tools					 : N.DIR + '/tools/'
	// };
	
	/**
	 * smasher 操作相关函数
	 */
	N.smasher = {};
	/**
	 * N.smasher.clear 用于清除smasher的缓存文件
	 */
    N.smasher.clear = function () {
        try {
            N.ajax.simpleRequester(N.DIR + '/gTools.php', {
                action : 'clearcache'
            });
        }
        catch (e) {
            throw e;
        }
	};
	
	/**
	 * 这是一个空函数，用于需要排除函数作用域链干扰的情况
	 * 来自baidu.fn.blank
	 */
	N.blank = function () {};
})(this);