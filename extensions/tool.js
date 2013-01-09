/**
 * tool.js 小工具
 *
 * @import N.dom
 */
(function () {
	/**
	 * 获取GT命名空间
	 */
	var N = window[__$_GTNAMESPACE_$__];
	
	/*工具库*/
	N.tool = N.tool || {};
	/**
	 * 为特定元素添加Hint（框内暗示）
	 * @param {string} || {HTMLElement} o 目标元素ID或者本身（作为DOM元素）
	 * @param {string} hint 暗示字符串
	 */
	N.tool.addHint = function (o, hint) {
		o = N.dom.checkIsDom(o);
		o.style.color = 'gray';
		o.value = typeof hint == 'string' ? hint : '';
		N.event.addEvent(o, 'focus', function (e) {
			if (this.value == hint) {
				this.style.color = '';
				this.value = '';
			}
		});
		N.event.addEvent(o, 'blur', function (e) {
			if (this.value == '') {
				this.style.color = 'gray';
				this.value = hint;
			}
		});
	};
	
	/**
	 * 创建简单的分页列表
	 * @param {string} || {HTMLElement} placeHolder 占位符元素ID或者本身（作为DOM元素）
	 * @param {number} totalPages 总页数
	 * @param {number} curPage 当前页
	 * @param {function} callBack 回调函数，会把点击的当前页作为参数传入
	 */
	N.tool.createPaging = function (placeHolder, totalPages, curPage, callBack) {
		var neighbour = 2;
		placeHolder = N.dom.checkIsDom(placeHolder);
		/*暂时涉及到样式的东东直接写入内联样式*/
		var aNotCurTplStyle = 'style="display:inline-block; margin:0 5px; text-decoration:none;"';
		var aIsCurTplStyle  = 'style="color:black; display:inline-block; margin:0 5px; font-size:120%; text-decoration:underline"';
		var aNotCurTpl      = '<a href="###" page="{0}" ' + aNotCurTplStyle + '>{0}</a>';
		var aIsCurTpl       = '<a href="###" page="{0}" ' + aIsCurTplStyle + '><strong>{0}</strong></a>';
		var ellipsis        = '···';
		var outPuts         = '';
		if (totalPages <= 10) {
			for (var i = 1; i < totalPages + 1; i++) {
				var thisTpl = (i == curPage ? aIsCurTpl : aNotCurTpl);
				outPuts += N.str.strFormat(thisTpl, i);
			}
		} else if (totalPages > 10) {
			for (var i = 1; i < totalPages + 1; i++) {
				var thisTpl = (i == curPage ? aIsCurTpl : aNotCurTpl);
				if (Math.abs(i - curPage) <= neighbour || i == 1 || i == totalPages) {
					outPuts += N.str.strFormat(thisTpl, i);
				} else {
					outPuts += ellipsis;
				}
			}
			outPuts = outPuts.replace(/[·]+/g, ellipsis);
		}
		placeHolder.innerHTML = outPuts;
		var as = placeHolder.getElementsByTagName('a');
		var asLen = as.length;
		while (asLen--) {
			N.event.addEvent(as[asLen], 'click', function (e) {
				callBack(this.getAttribute('page'));
			});
		}
		placeHolder = null;
		as = null;
	};
	
	/**
	 * 一个等待下载的新弹页面。
	 * 现在最流行的其实是Ajax方式的请求下载，静默式下载。
	 *
	 * @param {Object} opt 参数配置
	 * @param {String} opt.hint 新开页指示文字
	 * @param {String} opt.url 下载链接
	 */
	N.tool.downLoad = function (opt) {
		var hinter  = (opt.hint || '正在生成下载文件') + '...',
		downLoadWin = window.open(opt.url),
		newSpan     = downLoadWin.document.createElement('span');
		newSpan.style.cssText = 'color:red;font-size:bold;';
		try {
			downLoadWin.document.body.appendChild(newSpan);
		} catch (e) {};
		var n = 0;
		var len = hinter.length;
		var timer = downLoadWin.setInterval(function () {
				if (n == 4)
					n = 0;
				newSpan.innerHTML = hinter.substring(0, len - (n++));
			}, 500);
	};
})();