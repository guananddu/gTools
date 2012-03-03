/**
 * oo.js 为GT添加面向对象开发的功能函数（及其类）
 */
(function(){
	/**
	 * 获取GT命名空间
	 */
	var N  = eval('window.' + window.top.__$_GTNAMESPACE_$__);
	
	/*oo 面向对象开发的相关函数（及其类）*/
	N.oo   = N.oo || {};
	
	/**
	 * N.oo.Interface 作为一个声明接口的类（采集自Javascript设计模式一书）
	 * @param {string} name 声明的接口的名称
	 * @param {array} methods 这个接口所拥有的方法（每一个方法均以字符串形式表示）
	 * 例如：var Composite = new N.oo.Interface('Composite', ['add', 'remove', 'getChild']);
	 */
	N.oo.Interface = function(name, methods){
		if(arguments.length != 2) {
			throw new Error("N.oo.Interface constructor called with " + arguments.length
			  + "arguments, but expected exactly 2.");
		}
		
		this.name = name;
		this.methods = [];
		for(var i = 0, len = methods.length; i < len; i++) {
			if(typeof methods[i] !== 'string') {
				throw new Error("N.oo.Interface constructor expects method names to be " 
				  + "passed in as a string.");
			}
			this.methods.push(methods[i]);        
		}
	};
	
	/**
	 * N.oo.Interface.ensureImplements 作为一个静态的方法，用来检验一个实例是否真正地实现了某个（或者某几个）接口
	 * @param {object} object 这里的形参说明比较模糊，但是基本上，第一个参数作为要检验的实例对象，后面的参数则作为要检验的接口（1个或者多个）
	 * 具体使用方法：
	 * 声明接口：
	 * var Composite = new N.oo.Interface('Composite', ['add', 'remove', 'getChild']);
	 * var FormItem  = new N.oo.Interface('FormItem', ['save']);
	 * 声明实现接口的对象：
	 * var CompositeForm = function(id, method, action) { // implements Composite, FormItem
	 * 		...
	 * };
	 * 检查接口的实现：
	 * function addForm(formInstance) {
	 * 		N.oo.Interface.ensureImplements(formInstance, Composite, FormItem);
	 *		// This function will throw an error if a required method is not implemented,
	 *		// halting execution of the function.
	 *		// All code beneath this line will be executed only if the checks pass.
	 *		...
	 * }
	 * 注意，这个函数是检验一个实例是否实现必要的方法
	 */
	N.oo.Interface.ensureImplements = function(object){
		if(arguments.length < 2) {
			throw new Error("Function N.oo.Interface.ensureImplements called with " + 
			  arguments.length  + "arguments, but expected at least 2.");
		}

		for(var i = 1, len = arguments.length; i < len; i++) {
			var _interface = arguments[i];
			if(_interface.constructor !== N.oo.Interface) {
				throw new Error("Function N.oo.Interface.ensureImplements expects arguments "   
				  + "two and above to be instances of Interface.");
			}
			
			for(var j = 0, methodsLen = _interface.methods.length; j < methodsLen; j++) {
				var method = _interface.methods[j];
				if(!object[method] || typeof object[method] !== 'function') {
					throw new Error("Function N.oo.Interface.ensureImplements: object " 
					  + "does not implement the " + _interface.name 
					  + " Interface. Method \"" + method + "\" was not found.");
				}
			}
		}
	};
	
	/**
	 * N.oo.Interface.ensureClass 作为一个静态的方法，用来检验一个所谓的“类”是否真正地实现了某个（或者某几个）接口
	 * @param {object} object 这里的形参说明比较模糊，但是基本上，第一个参数作为要检验的“类”，后面的参数则作为要检验的接口（1个或者多个）
	 * 具体使用方法：
	 * 声明接口：
	 * var Composite = new N.oo.Interface('Composite', ['add', 'remove', 'getChild']);
	 * var FormItem  = new N.oo.Interface('FormItem', ['save']);
	 * 声明实现接口的对象：“类”
	 * var CompositeForm = function(id, method, action) { // implements Composite, FormItem
	 * 		...
	 * };
	 * 检查接口的实现：
	 * N.oo.Interface.ensureClass(CompositeForm, Composite, FormItem);
	 *
	 * 注意，这个函数是检验一个“类”是否实现必要的方法
	 */
	N.oo.Interface.ensureClass = function(object){
		if(arguments.length < 2) {
			throw new Error("Function N.oo.Interface.ensureClass called with " + 
			  arguments.length  + "arguments, but expected at least 2.");
		}

		for(var i = 1, len = arguments.length; i < len; i++) {
			var _interface = arguments[i];
			if(_interface.constructor !== N.oo.Interface) {
				throw new Error("Function N.oo.Interface.ensureClass expects arguments "   
				  + "two and above to be instances of Interface.");
			}
			
			for(var j = 0, methodsLen = _interface.methods.length; j < methodsLen; j++) {
				var method = _interface.methods[j];
				if(!object.prototype[method] || typeof object.prototype[method] !== 'function') {
					throw new Error("Function N.oo.Interface.ensureClass: Class " 
					  + "does not implement the " + _interface.name 
					  + " Interface. Method \"" + method + "\" was not found.");
				}
			}
		}
	};
})();