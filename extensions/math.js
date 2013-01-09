/**
 * math.js 一些数字处理
 */
(function () {
	/**
	 * 获取GT命名空间
	 */
	var N = window[__$_GTNAMESPACE_$__];
	
	/*数字处理*/
	N.math = N.math || {};
	/**
	 * 将分数转化为对应的百分数
	 * @param {string} fraction 目标分数（字符串格式，例如：'2/3'）
	 * @param {number} decimals(optional) 百分数保留几位小数，为空则不保留
	 *
	 * @returns {string} 转化后的百分数
	 */
	N.math.fractionToPercent = function (fraction, decimals) {
		decimals = decimals || '';
		var temp = eval(fraction);
		var result = (100 * temp).toFixed(decimals);
		if (result == parseInt(result))
			result = parseInt(result);
		return String(result) + '%';
	};
	/**
	 * 将整数小数点后面多余的0去除
	 * @param {number} inputData 目标数字
	 *
	 * @returns {number} 返回去0后的整数
	 */
	N.math.trim0 = function (inputData) {
		if (parseInt(inputData) == inputData) {
			return parseInt(inputData);
		}
		return inputData;
	};
	/**
	 * B, KB, MB, GB四者之间的转换函数（会根据实际大小自动转换为恰当的单位）
	 * （其实准确点应该是B, KiB, MiB, GiB，不过平常人们说习惯了B, KB, MB, GB，这两者的进制不同，前者1024，后者1000）
	 * @param {number} | {string} inputData 目标数字
	 * @param {string} originalUnit 原始单位（就是输入的inputData的单位，默认为B）
	 * @param {number} decimals 保留几位小数（默认为两位小数）
	 * @param {boolean} noUnit 返回值中不带单位（默认为false，带单位）
	 *
	 * @returns {string} 处理后的数字
	 */
	N.math.unitTransformer = function (inputData, originalUnit, decimals, noUnit) {
		if (inputData == undefined || inputData == '')
			return;
		inputData = Number(inputData);
		originalUnit || (originalUnit = 'B');
		decimals || (decimals = 2);
		noUnit || (noUnit = false);
		var Units  = ['B', 'KB', 'MB', 'GB'];
		var Step   = 1024;
		var mePos  = '';
		var meUnit = originalUnit;
		for (var i = 0, len = Units.length; i < len; i++) {
			if (Units[i] == originalUnit) {
				mePos = i;
				break;
			}
		}
		while (inputData >= Step) { //向前进
			inputData /= Step;
			meUnit = Units[++mePos];
		}
		return N.math.trim0(inputData.toFixed(decimals)) + (noUnit ? '' : meUnit);
	};
})();