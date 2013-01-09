/**
 * dom.js
 */
(function () {
	/**
	 * 获取GT命名空间
	 */
	var N = window[__$_GTNAMESPACE_$__];
	
	/*声明核心方法*/
	var toString = Object.prototype.toString;
	
	/*DOM基础方法*/
	N.dom   = N.dom || {};
	N.dom.g = function (id) {
		return document.getElementById(id);
	};
	N.dom.gbt = function (tagName) {
		return document.getElementsByTagName(tagName);
	};
	
	/**
	 * 将格式正确的DOM元素字符串转化为相应的DOM对象
	 * @param {string} domStr 目标字符串
	 *
	 * @returns {HTMLElement} 目标字符串（ID）所对应的DOM元素
	 */
	/*此方法有局限性，只适用于domStr是单个元素的字符串的情况*/
	N.dom.getDom = function (domStr) {
		var tempDiv = document.createElement('div');
		tempDiv.innerHTML = domStr;
		return tempDiv.childNodes[0];
	};
	/**
	 * 依据相应的data数据来创建select元素
	 * @param {array} data select中的各种选项的数据来源
	 * 		参考数据形式：
	 *		[
	 *			{id:342, text:"判卷列表升级联调测试1", selected:true},
	 *			{id:343, text:"判卷列表升级联调测试2", selected:false},
	 *			{id:344, text:"判卷列表升级联调测试3", selected:false}
	 *		];
	 * @param {string} selectId 创建成功后的select元素的ID值
	 * @param {string} || {HTMLElement} parent(optional) select元素的父级元素的ID或者元素本身
	 *
	 * @returns {HTMLSelectElement} (optional) 返回select元素（取决于parent参数）
	 */
	N.dom.createSelect = function (data, selectId, parent) {
		selectId = selectId || 'defaultId';
		if (parent) {
			parent = N.dom.checkIsDom(parent);
		}
		var selectTpl      = '<select id="' + selectId + '" name="' + selectId + '">{0}</select>';
		var optionTrueTpl  = '<option value="{0}" selected="selected">{1}</option>';
		var optionFalseTpl = '<option value="{0}">{1}</option>';
		var outPut         = '';
		var outPutOptions  = '';
		for (var i = 0, len = data.length; i < len; i++) {
			outPutOptions += N.str.strFormat(data[i].selected == true ? optionTrueTpl : optionFalseTpl, data[i].id, data[i].text);
		}
		if (parent) {
			parent.innerHTML = N.str.strFormat(selectTpl, outPutOptions);
			parent = null;
		} else {
			return N.dom.getDom(N.str.strFormat(selectTpl, outPutOptions));
		}
	};
	/**
	 * 检查是否是DOM元素，若为ID字符串则转化成相应ID的DOM元素
	 * @param {string} || {HTMLElement} idOrDom ID字符串或HTMLElement
	 *
	 * @returns {HTMLElement} 相应DOM元素
	 */
	N.dom.checkIsDom = function (idOrDom) {
		if (toString.call(idOrDom) == '[object String]')
			return N.dom.g(idOrDom);
		return idOrDom;
	};
	
	/*DOM Table 相关方法*/
	N.dom.table = N.dom.table || {};
	/**
	 * 将tObj（table对象）的除去第一行的所有行删去（只留第一行）
	 * @param {string} || {HTMLTableElement} tObj table的ID值或者本身（作为DOM对象）
	 *
	 * @returns {HTMLTableElement} 经过处理后的table对象
	 */
	N.dom.table.leftTheFirstRow = function (tObj) {
		tObj = N.dom.checkIsDom(tObj);
		while (tObj.rows.length > 1) {
			tObj.deleteRow(tObj.rows.length - 1);
		}
		return tObj;
	};
	/**
	 * 为表格添加新行（即追加tr）
	 * @param {string} || {HTMLTableElement} tObj 目标table的ID或者本身（作为DOM对象）
	 * @param {array} newRowArrs 数据来源
	 * 		参考数据格式：
	 * 		[
	 *			[.., .., .., ..],
	 *			[.., .., .., ..],
	 *			[.., .., .., ..]
	 *		]
	 * 		数组中的每一项一级元素作为一个将要添加的tr，每一项二级元素作为当前tr中的td
	 * @param {string} trClassName(optional) 为每一个tr添加的样式（class）
	 * @param {string} tdClassName(optional) 为每一个td添加的样式（calss）
	 *
	 * @returns {HTMLTableElement} 经过处理后的table对象
	 */
	N.dom.table.insertRow = function (tObj, newRowArrs, trClassName, tdClassName) {
		tObj = N.dom.checkIsDom(tObj);
		for (var i = 0, lenI = newRowArrs.length; i < lenI; i++) {
			var newTr = document.createElement('tr');
			for (var j = 0, lenJ = newRowArrs[i].length; j < lenJ; j++) {
				var newTd = document.createElement('td');
				newTd.innerHTML = newRowArrs[i][j];
				if (tdClassName)
					newTd.className = tdClassName;
				newTr.appendChild(newTd);
			}
			if (trClassName)
				newTr.className = trClassName;
			if (!tObj.getElementsByTagName('tbody'))
				tObj.appendChild(document.createElement('tbody'));
			tObj.getElementsByTagName('tbody')[0].appendChild(newTr);
		}
		return tObj;
	};
    
	/*onmouseover和onmouseout的多次触发解决方案*/
	N.dom.domContains = function (parentNode, childNode) {
		if (parentNode.contains) {
			return parentNode != childNode && parentNode.contains(childNode);
		} else {
			return !!(parentNode.compareDocumentPosition(childNode) & 16);
		}
	};
	
	N.dom.domCheckHover = function (e, target) {
		e = N.event.eventFixer(e).event;
		if (e.type == "mouseover") {
			// mouseover
			return !N.dom.domContains(target, e.relatedTarget || e.fromElement)
			 && !((e.relatedTarget || e.fromElement) === target);
		} else {
			// mouseout
			return !N.dom.domContains(target, e.relatedTarget || e.toElement)
			 && !((e.relatedTarget || e.toElement) === target);
		}
	};
})();