/**
 * style.js
 */
(function () {
	/**
	 * 获取GT命名空间
	 */
	var N = window[__$_GTNAMESPACE_$__];
	
	/*Style样式相关工具*/
	N.style = N.style || {};
	/**
	 * 获取计算后的样式信息
	 * @param {string | HTMLElement} o 目标元素的ID或者本身（作为DOM元素）
	 *
	 * @returns {CSSStyleDeclaration(标准) | currentStyle(IE)} 返回style信息Obj，可以通过样式的脚本名称（骆驼命名法）来访问相关属性
	 */
	N.style.getFinalStyleInfo = function (o) {
		o = N.dom.checkIsDom(o);
		if (!window.getComputedStyle) {
			window.getComputedStyle = function ($target) {
				return $target.currentStyle;
			};
		}
		return window.getComputedStyle(o, null);
	};
	/**
	 * 兼容各种浏览器的Fixed定位的解决方案知识点说明，注意expression中的this
	 * 一般情况下，还是在css中控制定位比较好，大道至简
	 */
	
	/*
	<style type="text/css">
	body{
	background-image: url(about:blank);
	background-attachment: fixed;
	}
	.head, .foot{
	position: fixed !important;
	position: absolute;
	}
	.foot{
	bottom: 0 !important;
	}
	</style>
	<!--IE6-->
	<!--[if IE 6]>
	<style type="text/css">
	.head{top: expression(eval((document.compatMode && document.compatMode=="CSS1Compat")?document.documentElement.scrollTop:document.body.scrollTop));}
	.foot{top: expression(eval((document.compatMode && document.compatMode=="CSS1Compat")?documentElement.scrollTop+documentElement.clientHeight-this.clientHeight:document.body.scrollTop+document.body.clientHeight-this.clientHeight)); }
	</style>
	<![endif]-->
	 */
	
	/**
	 * IE6中的固定元素的抖动问题处理函数
	 */
	N.style.repairShakeIe6 = function () {
		var bodyStyle = N.style.getFinalStyleInfo(document.body);
		if (bodyStyle.backgroundImage == 'none' || bodyStyle.backgroundImage == '' || bodyStyle.backgroundImage == undefined)
			document.body.style.backgroundImage = 'url(about:blank)';
		if (bodyStyle.backgroundAttachment == 'scroll' || bodyStyle.backgroundAttachment == 'none' || bodyStyle.backgroundAttachment == '' || bodyStyle.backgroundAttachment == undefined)
			document.body.style.backgroundAttachment = 'fixed';
	};
	/**
	 * 将指定元素设置成悬挂的顶端元素（Fixed）
	 * @param {string | HTMLElement} id 目标元素的ID或者本身（作为DOM元素）
	 * @param {Object} posObj 目标元素的预期位置：{top:100, left:100}，单位像素（或百分数）
	 *
	 * @explain 以下面的函数成对，兼容ie6,7,8,ff,chrome,safari,opera，但是ie6下会有跳动的现象，还有一个不明显resize窗口错位bug
	 */
	N.style.setAsHeader = function (obj, posObj) {
		obj = N.dom.checkIsDom(obj);
		posObj = posObj || {
			top : 0,
			left : 0
		};
		if (N.browser.ie <= 6) {
			//IE6下不支持百分数的设置，最好在css中写死
			if (N.check.isPercentage(posObj.top) || N.check.isPercentage(posObj.left))
				return;
			/*设置IE6下的防抖动处理（失效ing）*/
			N.style.repairShakeIe6();
			obj.style.position = 'absolute';
			if (posObj.top || posObj.top === 0)
				obj.style.top = posObj.top + 'px';
			if (posObj.left || posObj.left === 0)
				obj.style.left = posObj.left + 'px';
			/*添加事件*/
			N.event.addEvent(window, 'scroll', function (e) {
				if (posObj.top || posObj.top === 0)
					obj.style.top = N.browser.isStrict ? (document.documentElement.scrollTop + posObj.top + 'px') : (document.body.scrollTop + posObj.top + 'px');
				if (posObj.left || posObj.left === 0)
					obj.style.left = N.browser.isStrict ? (document.documentElement.scrollLeft + posObj.left + 'px') : (document.body.scrollLeft + posObj.left + 'px');
			});
		} else {
			/*非IE6*/
			obj.style.position = 'fixed';
			if (posObj.top || posObj.top === 0)
				obj.style.top = N.check.isPercentage(posObj.top) ? posObj.top : (posObj.top + 'px');
			if (posObj.left || posObj.left === 0)
				obj.style.left = N.check.isPercentage(posObj.left) ? posObj.left : (posObj.left + 'px');
		}
	};
	/**
	 * 将指定元素设置成固定的底端元素（Fixed）
	 * @param {string | HTMLElement} id 目标元素的ID或者本身（作为DOM元素）
	 * @param {Object} posObj 目标元素的预期位置：{bottom:100, left:100}，单位像素（或百分数）
	 */
	N.style.setAsFooter = function (obj, posObj) {
		obj = N.dom.checkIsDom(obj);
		posObj = posObj || {
			bottom : 0,
			left : 0
		};
		var fixedPos = function () {
			if (posObj.bottom || posObj.bottom === 0)
				obj.style.top = N.browser.isStrict ? (document.documentElement.scrollTop + document.documentElement.clientHeight - obj.clientHeight - posObj.bottom + 'px') : (document.body.scrollTop + document.body.clientHeight - obj.clientHeight - posObj.bottom + 'px');
			if (posObj.left || posObj.left === 0)
				obj.style.left = N.browser.isStrict ? (document.documentElement.scrollLeft + posObj.left + 'px') : (document.body.scrollLeft + posObj.left + 'px');
		};
		if (N.browser.ie <= 6) {
			//IE6下不支持百分数的设置，最好在css中写死
			if (N.check.isPercentage(posObj.bottom) || N.check.isPercentage(posObj.left))
				return;
			/*设置IE6下的防抖动处理（失效ing）*/
			N.style.repairShakeIe6();
			obj.style.position = 'absolute';
			if (posObj.bottom || posObj.bottom === 0)
				obj.style.bottom = posObj.bottom + 'px';
			if (posObj.left || posObj.left === 0)
				obj.style.left = posObj.left + 'px';
			/*添加事件*/
			N.event.addEvent(window, 'scroll', function (e) {
				fixedPos();
			});
			N.event.addEvent(window, 'resize', function (e) {
				fixedPos();
			});
		} else {
			/*非IE6*/
			obj.style.position = 'fixed';
			if (posObj.bottom || posObj.bottom === 0)
				obj.style.bottom = N.check.isPercentage(posObj.bottom) ? posObj.bottom : (posObj.bottom + 'px');
			if (posObj.left || posObj.left === 0)
				obj.style.left = N.check.isPercentage(posObj.left) ? posObj.left : (posObj.left + 'px');
		}
	};
	/**
	 * 将特定的占位符中的元素设置为File Input元素
	 * @param {string} | {HTMLElement} 目标元素的ID或者本身（作为DOM元素）
	 * @param {Object} aStyleOption 可以给a元素添加的额外样式（会覆盖原有样式）
	 * @param {Object} fileStyleOption 可以给inputFile元素添加的额外样式（会覆盖原有样式）
	 */
	N.style.setAsFileInput = function (o, aStyleOption, fileStyleOption) {
		o = N.dom.checkIsDom(o);
		var aStyle = 'background: url(about:blank) no-repeat scroll transparent;';
		aStyle += 'border: 1px solid gray;';
		aStyle += 'color: #333333;';
		aStyle += 'display: inline-block;';
		aStyle += 'font-size: 14px;';
		aStyle += 'height: 22px;';
		aStyle += 'line-height: 22px;';
		aStyle += 'margin: 0 5px;';
		aStyle += 'text-align: center;';
		aStyle += 'text-decoration: none;';
		aStyle += 'width: 55px;';
		if (aStyleOption) {
			for (var i in aStyleOption) {
				aStyle += (i + ': ' + aStyleOption[i] + ';');
			}
		}
		var aHref = N.browser.ie == 6 ? '###' : 'javascript:void(0);';
		o.innerHTML = '<a href="' + aHref + '" style="' + aStyle + '">浏览...</a>';
		var inputTopStyle = N.browser.ie == 8 ? '6px' : (N.browser.ie == 7 ? '2px' : '1px');
		inputTopStyle = N.browser.ie == 9 ? '7px' : inputTopStyle;
		var inputStyles = 'cursor: pointer;';
		inputStyles += 'display: inline-block;';
		inputStyles += 'opacity: 0;';
		inputStyles += 'filter: alpha(opacity:0);';
		inputStyles += 'position: relative;';
		inputStyles += 'left: -61px;';
		inputStyles += 'width: 55px;';
		inputStyles += 'height: 22px;';
		inputStyles += 'top:' + inputTopStyle + ';';
		if (fileStyleOption) {
			for (var j in fileStyleOption) {
				inputStyles += (j + ': ' + fileStyleOption[j] + ';');
			}
		}
		o.innerHTML += '<input type="file" id="GT-Upload" name="GT-Upload" style="' + inputStyles + '"/>';
	};
})();