/**
 * event.js
 */
(function(){
	/**
	 * 获取GT命名空间
	 */
	var N  = eval('window.' + window.__$_GTNAMESPACE_$__);
	
	/*EVENT事件处理*/
	N.event          = N.event || {};
	/**
	 * 挂载事件监听函数
	 * @param {string} || {HTMLElement} o 目标元素的ID或者本身（作为DOM元素）
	 * @param {string} e 需要挂载的事件名称(click, blur, focus...)
	 * @param {function} f 事件处理函数
	 */
	N.event.addEvent = function(o, e, f){
		o            = N.dom.checkIsDom(o);
		o.addEventListener ? o.addEventListener(e, f, false) : o.attachEvent('on' + e, function(){f.call(o);});
	};
})();