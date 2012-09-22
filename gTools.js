/*
 * gTools JavaScript Library v1.5.2
 * Copyright 2011, guanwei. All rights reserved.
 * 
 * author: guanwei
 * version: 1.5.2
 * date: 2011/11/08
 */
(function(window, $nameSpace){
	/*版本号*/
	var version   = '1.5.2';
	/*声明常用局部变量*/
	var top       = window.top,
		document  = window.document,
	 	undefined = window.undefined,
		navigator = window.navigator,
		location  = window.location;
	/*声明核心方法*/
	var  toString = Object.prototype.toString,
		   hasOwn = Object.prototype.hasOwnProperty,
			 push = Array.prototype.push,
			slice = Array.prototype.slice,
		  indexOf = Array.prototype.indexOf;
	
	/*命名空间处理，默认为$GT$命名空间*/
	var NS		  = $nameSpace || '$GT$',
		execCode  = 'var N = window.' + NS + ' = window.' + NS + ' || {version: "' + version + '"};';
	
	/*作为GW模块之间的通信，获取命名空间*/
	window.__$_GTNAMESPACE_$__ = NS;
	
	/*
		执行语句：
		var N     = window.$GT$ = window.$GT$ || {version: '1.0.1'};
	*/
	eval(execCode);
	
	/*命名空间切换函数*/
	N.changeNameSpace    = function(ns){
		if(ns === NS)
			return;
		if(undefined !== ns && null !== ns && '' !== ns && NS !== ns){
			if(toString.call(ns) === '[object String]' && /^[^A-Za-z$_]|[^\w$]/.test(ns) === false){
				execCode = 'delete window.' + NS;
				eval(execCode);
				execCode = 'window.' + ns + ' = N;';
				eval(execCode);
				window.__$_GTNAMESPACE_$__ = NS  = ns;
			}else{
				N.debuger.throwit('ERROR', _MESSAGES.wrongNameSpaceFormat + ns);
			}
		}else{
			return;
		}
	};
	
	/*Debuger Or Regular，是否打开调试模式*/
	N.debugerFlag            = true;
	
	/*Server，是否使用PHP服务器*/
	N.isPhpServer            = true;
	
	/*常用信息提示*/
	var _MESSAGES            = {
		wrongNameSpaceFormat: 'Wrong NameSpace Foramt, Expected: A-Z a-z 0-9 _ $, And don\'t not start with number: ',
		hadLoadedIt         : 'You had loaded this: '
	};
	
    /**
     * 得到本脚本文件对应的<script>标签元素
     */
    var _script = document.getElementsByTagName("SCRIPT");
    _script     = _script[_script.length - 1];
    var _t      = _script.src.replace(/\\/g, "/");
    N.DIR       = (_t.lastIndexOf("/") < 0 ? "." : _t.substring(0, _t.lastIndexOf("/")));
	
	/*外部工具的引用路径配置*/
	N.EXTERNALTOOLS        = {};
	
	/*外部库的配置路径，配置默认值，也可以由用户自己设置*/
	N.EXTERNALTOOLS.config = {
			baiduBaseJsImporter      : N.DIR + '/tools/Tangram-base-1.5.2/src/jsloader.gt.js',
			baiduBasePhpImporter     : N.DIR + '/tools/Tangram-base-1.5.2/src/import.php',/*php服务器下可以直接请求此文件*/
			components				 : N.DIR + '/components/',
			extensions               : N.DIR + '/extensions/',
			tools					 : N.DIR + '/tools/'
	};

	/**
	 * smasher 操作相关函数
	 */
	N.smasher       = N.smasher || {};
	/**
	 * N.smasher.clear 用于清除smasher的缓存文件
	 */
	N.smasher.clear = function(){
		N.ajax.simpleRequester(N.DIR + '/gTools.php', {
			action : 'clearcache'
		});
	};
	
	/**
	 * 这是一个空函数，用于需要排除函数作用域链干扰的情况
	 * 来自baidu.fn.blank
	 */
	N.blank         = function(){};
})(this);