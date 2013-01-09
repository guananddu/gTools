/**
 * oo.js 为GT添加面向对象开发的功能函数（及其类）
 */
(function () {
	/**
	 * 获取GT命名空间
	 */
	var N = window[__$_GTNAMESPACE_$__];
	
	/*oo 面向对象开发的相关函数（及其类）*/
	N.oo = N.oo || {};
	
	/**
	 * N.oo.Interface 作为一个声明接口的类（采集自Javascript设计模式一书）
	 * @param {string} name 声明的接口的名称
	 * @param {array} methods 这个接口所拥有的方法（每一个方法均以字符串形式表示）
	 * 例如：var Composite = new N.oo.Interface('Composite', ['add', 'remove', 'getChild']);
	 */
	N.oo.Interface = function (name, methods) {
		if (arguments.length != 2) {
			throw new Error("N.oo.Interface constructor called with " + arguments.length
				 + "arguments, but expected exactly 2.");
		}
		
		this.name = name;
		this.methods = [];
		for (var i = 0, len = methods.length; i < len; i++) {
			if (typeof methods[i] !== 'string') {
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
	N.oo.Interface.ensureImplements = function (object) {
		if (arguments.length < 2) {
			throw new Error("Function N.oo.Interface.ensureImplements called with " +
				arguments.length + "arguments, but expected at least 2.");
		}
		
		for (var i = 1, len = arguments.length; i < len; i++) {
			var _interface = arguments[i];
			if (_interface.constructor !== N.oo.Interface) {
				throw new Error("Function N.oo.Interface.ensureImplements expects arguments "
					 + "two and above to be instances of Interface.");
			}
			
			for (var j = 0, methodsLen = _interface.methods.length; j < methodsLen; j++) {
				var method = _interface.methods[j];
				if (!object[method] || typeof object[method] !== 'function') {
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
	N.oo.Interface.ensureClass = function (object) {
		if (arguments.length < 2) {
			throw new Error("Function N.oo.Interface.ensureClass called with " +
				arguments.length + "arguments, but expected at least 2.");
		}
		
		for (var i = 1, len = arguments.length; i < len; i++) {
			var _interface = arguments[i];
			if (_interface.constructor !== N.oo.Interface) {
				throw new Error("Function N.oo.Interface.ensureClass expects arguments "
					 + "two and above to be instances of Interface.");
			}
			
			for (var j = 0, methodsLen = _interface.methods.length; j < methodsLen; j++) {
				var method = _interface.methods[j];
				if (!object.prototype[method] || typeof object.prototype[method] !== 'function') {
					throw new Error("Function N.oo.Interface.ensureClass: Class "
						 + "does not implement the " + _interface.name
						 + " Interface. Method \"" + method + "\" was not found.");
				}
			}
		}
	};
	
	/**
	 * defineClass() -- a utility function for defining JavaScript classes.
	 *
	 * This function expects a single object as its only argument.  It defines
	 * a new JavaScript class based on the data in that object and returns the
	 * constructor function of the new class.  This function handles the repetitive
	 * tasks of defining classes: setting up the prototype object for correct
	 * inheritance, copying methods from other types, and so on.
	 *
	 * The object passed as an argument should have some or all of the
	 * following properties:
	 *
	 *      name: the name of the class being defined.
	 *            If specified, this value will be stored in the classname
	 *            property of the prototype object.
	 *
	 *    extend: The constructor of the class to be extended.  If omitted,
	 *            the Object() constructor will be used.  This value will
	 *            be stored in the superclass property of the prototype object.
	 *
	 * construct: The constructor function for the class. If omitted, a new
	 *            empty function will be used.  This value becomes the return
	 *            value of the function, and is also stored in the constructor
	 *            property of the prototype object.
	 *
	 *   methods: An object that specifies the instance methods (and other shared
	 *            properties) for the class.  The properties of this object are
	 *            copied into the prototype object of the class.  If omitted,
	 *            an empty object is used instead.  Properties named
	 *            "classname", "superclass", and "constructor" are reserved
	 *            and should not be used in this object.
	 *
	 *   statics: An object that specifies the static methods (and other static
	 *            properties) for the class.  The properties of this object become
	 *            properties of the constructor function.  If omitted, an empty
	 *            object is used instead.
	 *
	 *   borrows: A constructor function or array of constructor functions.
	 *            The instance methods of each of the specified classes are copied
	 *            into the prototype object of this new class so that the
	 *            new class borrows the methods of each specified class.
	 *            Constructors are processed in the order they are specified,
	 *            so the methods of a class listed at the end of the array may
	 *            overwrite the methods of those specified earlier. Note that
	 *            borrowed methods are stored in the prototype object before
	 *            the properties of the methods object above.  Therefore,
	 *            methods specified in the methods object can overwrite borrowed
	 *            methods. If this property is not specified, no methods are
	 *            borrowed.
	 *
	 *  provides: A constructor function or array of constructor functions.
	 *            After the prototype object is fully initialized, this function
	 *            verifies that the prototype includes methods whose names and
	 *            number of arguments match the instance methods defined by each
	 *            of these classes.  No methods are copied; this is simply an
	 *            assertion that this class "provides" the functionality of the
	 *            specified classes.  If the assertion fails, this method will
	 *            throw an exception.  If no exception is thrown, any
	 *            instance of the new class can also be considered (using "duck
	 *            typing") to be an instance of these other types.  If this
	 *            property is not specified, no such verification is performed.
	 *
	 *  此方法来自Javascript权威指南一书，仅供学习
	 **/
	N.oo.defineClass = function (data) {
		// Extract the fields we'll use from the argument object.
		// Set up default values.
		var classname   = data.name;
		var superclass  = data.extend || Object;
		var constructor = data.construct || function () {};
		var methods = data.methods || {};
		var statics = data.statics || {};
		var borrows;
		var provides;
		
		// Borrows may be a single constructor or an array of them.
		if (!data.borrows)
			borrows = [];
		else if (data.borrows instanceof Array)
			borrows = data.borrows;
		else
			borrows = [data.borrows];
		
		// Ditto for the provides property.
		if (!data.provides)
			provides = [];
		else if (data.provides instanceof Array)
			provides = data.provides;
		else
			provides = [data.provides];
		
		// Create the object that will become the prototype for our class.
		var proto = new superclass();
		
		// Delete any noninherited properties of this new prototype object.
		for (var p in proto)
			if (proto.hasOwnProperty(p))
				delete proto[p];
		
		// Borrow methods from "mixin" classes by copying to our prototype.
		for (var i = 0; i < borrows.length; i++) {
			var c = data.borrows[i];
			borrows[i] = c;
			// Copy method properties from prototype of c to our prototype
			for (var p in c.prototype) {
				if (typeof c.prototype[p] != "function")
					continue;
				proto[p] = c.prototype[p];
			}
		}
		
		// Copy instance methods to the prototype object
		// This may overwrite methods of the mixin classes
		for (var p in methods)
			proto[p] = methods[p];
		
		// Set up the reserved "constructor", "superclass", and "classname"
		// properties of the prototype.
		proto.constructor = constructor;
		proto.superclass = superclass;
		// classname is set only if a name was actually specified.
		if (classname)
			proto.classname = classname;
		
		// Verify that our prototype provides all of the methods it is supposed to.
		for (var i = 0; i < provides.length; i++) { // for each class
			var c = provides[i];
			for (var p in c.prototype) { // for each property
				if (typeof c.prototype[p] != "function")
					continue; // methods only
				if (p == "constructor" || p == "superclass")
					continue;
				// Check that we have a method with the same name and that
				// it has the same number of declared arguments.  If so, move on
				if (p in proto &&
					typeof proto[p] == "function" &&
					proto[p].length == c.prototype[p].length)
					continue;
				// Otherwise, throw an exception
				throw new Error("Class " + classname + " does not provide method " +
					c.classname + "." + p);
			}
		}
		
		// Associate the prototype object with the constructor function
		constructor.prototype = proto;
		
		// Copy static properties to the constructor
		for (var p in statics)
			constructor[p] = data.statics[p];
		
		// Finally, return the constructor function
		return constructor;
	}
})();