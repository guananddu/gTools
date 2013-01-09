/**
 * check.js 验证处理小函数
 */
(function () {
	/**
	 * 获取GT命名空间
	 */
	var N = window[__$_GTNAMESPACE_$__];
	
	/*输入验证相关*/
	N.check = N.check || {};
	/**
	 * 输入框最多可以输入几个字符
	 * @param {string} || {HTMLElement} inputEle 目标元素ID或本身（作为DOM元素）
	 * @param {number} maxLen 输入框中最长字符个数
	 * @param {string} msg 超出字数限制后的提示信息
	 * @param {number} delay 提示信息显示的时间长短（单位：毫秒）
	 * @param {boolean} isPureChinese 判断是否是检查纯中文
	 */
	N.check.inputLengthCheck = function (inputEle, maxLen, msg, delay, isPureChinese) {
		delay = delay || 1.5 * 1000;
		inputEle = N.dom.checkIsDom(inputEle);
		var handler = function () {
			var inputValue = inputEle.value.substring(0, maxLen);
			inputEle.style.color = 'red';
			inputEle.value = msg;
			setTimeout(function () {
				inputEle.style.color = 'black';
				inputEle.value = inputValue;
			}, delay);
		};
		N.event.addEvent(inputEle, 'keyup', function (e) {
			var inputValue = inputEle.value;
			if (isPureChinese) { //检查纯汉字
				if (N.regexp.isPureChinese(inputValue) && inputValue.length > maxLen) {
					handler();
				}
			} else { //一般字符
				if (inputValue.length > maxLen) {
					handler();
				}
			}
		});
	};
	/**
	 * 验证输入的是否是百分数
	 * @param {string} 要验证的字符串
	 * @return {Boolean} 返回布尔值
	 */
	N.check.isPercentage = function (percentage) {
		return /^[\d\.]+%$/.test(percentage);
	}
	/**
	 * 判断字符串是否是纯中文
	 * @param {string} str 输入字符串
	 *
	 * @returns {boolean} 纯中文则返回true，否则返回false
	 * @information:
	 *	目前在unicode标准中，汉字的charCode范围是[0x4E00, 0x9FA5]
	 *	function test() {
	 *		var s = document.all.name.value ;
	 *		for(var i = 0; i < s.length; i++)
	 *			if(s.charCodeAt(i) < 0x4E00 || s.charCodeAt(i) > 0x9FA5) {
	 *				window.alert("输入非中文，请重新输入") ;
	 *				break ;
	 *			}
	 *	}
	 *	中文：
	 *	/^[\u4E00-\u9FA5]+$/
	 *	数字：
	 *	/^d+$/（非负整数）
	 *	字母：
	 *	/^[a-zA-Z]{1,30}$/（1到30个以字母串）
	 */
	N.check.isPureChinese = function (str) {
		return /^[\u4E00-\u9FA5]+$/.test(str);
	};
})();