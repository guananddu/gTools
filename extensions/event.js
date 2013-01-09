/**
 * event.js
 */
(function () {
	/**
	 * 获取GT命名空间
	 */
	var N = window[__$_GTNAMESPACE_$__];
	
	/*EVENT事件处理*/
	N.event = N.event || {};
	/**
	 * 挂载事件监听函数
	 * @param {string} || {HTMLElement} o 目标元素的ID或者本身（作为DOM元素）
	 * @param {string} e 需要挂载的事件名称(click, blur, focus...)
	 * @param {function} f 事件处理函数
	 */
	N.event.addEvent = function (o, e, f) {
		o = N.dom.checkIsDom(o);
		o.addEventListener ? o.addEventListener(e, f, false) : o.attachEvent('on' + e, function () {
			f.call(o);
		});
	};
    
	/*event辅助*/
	N.event.eventFixer = function(e){
		e = e || window.event;
		return {
			event: e,//原始事件对象
			target: e.target || e.srcElement,//目标对象
			targetTagName: (e.target || e.srcElement).tagName.toLowerCase(),
			stopPropagation: (e.stopPropagation 
                ? function () {
                    e.stopPropagation();
                } 
                : function () {
                    e.cancelBubble = true;
                }),//阻止事件冒泡
			preventDefault: (e.preventDefault 
                ? function () {
                    e.preventDefault();
                    return false;
                } 
                : function () {
                    e.returnValue = false;
                    return false;
                })//阻止默认事件
		};
	};
})();