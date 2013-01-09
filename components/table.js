/**
 * table.js GT的table组件小库
 */
(function () {
	/**
	 * 获取GT命名空间
	 */
	var N = window[__$_GTNAMESPACE_$__];
	
	/**
	 * 声明组件命名空间
	 */
	N.coms = N.coms || {};
	
	/**
	 * 简易Table生成类(simpleTable)
	 * @author gw
	 * @name N.coms.sTable
	 * @grammar new N.coms.sTable(id[, options])
	 * @param {string | HTMLElement} targetId 占位符元素（或ID），即容器元素（或ID）
	 * @param {Object} options 生成表格所需配置
	 *
	 * @config {String} options[containerId] 表格容器ID值，默认为("_gtSimpleTable")
	 * @config {String} options[containerClass] 表格容器CLASS值，默认为("_gtSimpleTableClass")
	 * @config {String} options[headerId] header的ID值，默认为("_gtSimpleTableHeader")
	 * @config {String} options[headerClass] header的CLASS值，默认为("_gtSimpleTableHeaderClass")
	 * @config {String} options[footerId] footer的ID值，默认为("_gtSimpleTableFooter")
	 * @config {String} options[footerClass] footer的CLASS值，默认为("_gtSimpleTableFooterClass")
	 * @config {String} options[bodyId] body的ID值，默认为("_gtSimpleTableBody")
	 * @config {String} options[bodyClass] body的CLASS值，默认为("_gtSimpleTableBodyClass")
	 *
	 * @config {Array} options[header] header区域的填充数组，每一个元素可以是字符串或者函数，回传td, tr, index
	 * @config {Array} options[footer] footer区域的填充数组，每一个元素可以是字符串或者函数，回传td, tr, index
	 * footer可有可无！
	 * @config {Object} options[rawData] 表格传入的原始数据(JSON)
	 * @config {Function} options[dataAdapter] 数据适配器，用户手动编写，把传入的数据转换成特定的格式：
	 * 		返回的参考数据格式：
	 * 		[
	 *			[.., .., .., ..],
	 *			[.., .., .., ..],
	 *			[.., .., .., ..]
	 *		]
	 * 		数组中的每一项一级元素作为一个将要添加的tr，每一项二级元素作为当前tr中的td
	 * @config {Array} options[bodyFuncs] Function List 生成的数据列，每一列需要调用的回调函数列表，为空的话不调用
	 * 			函数回传：thisCell, td, tr, i, j
	 * @config {Function} options[cellFunc] 在生成每一个数据cell时，需要调用的回调函数（可以不设置），回传thisCell, td, tr, i, j
	 * @config {Function} options[beforeRender] 渲染之前的前调函数，比如说能修改原始数据和数据适配器
	 * @config {Function} options[afterRender] 渲染完成后的回调函数回传DOM元素的引用
	 * @config {Number} options[maxRowsLength] 最大显示的数据条数，超出会显示滚动条
	 * @config {Object} options[itemColors] 显示的条纹颜色(可以配置两个颜色)
	 *							itemColors: {itemColor: '#FAFAFA', hoverColor: '#EDEDED'}，像这样设置，同时这是默认值
	 *
	 */
	
	/**
	 * 简易表格接口声明，需要实现的对外方法
	 */
	var sTableInterface = new N.oo.Interface('sTableInterface', [
				'setRawData',
				'setDataAdapter',
				'setBodyFuncs',
				'_getTemplates',
				'_setHeader',
				'_setBody',
				'_setFooter',
				'empty',
				'_eventHandler',
				'render'
			]);
	
	N.coms.sTable = function (targetId, options) {
		this.targetId = targetId;
		this.parentDom = N.dom.checkIsDom(this.targetId);
		this.options = options || {};
		//设置内容器的id和class
		this.options.containerId = this.options.containerId || '_gtSimpleTable';
		this.options.containerClass = this.options.containerClass || '_gtSimpleTableClass';
		//设置header的id和class
		this.options.headerId = this.options.headerId || '_gtSimpleTableHeader';
		this.options.headerClass = this.options.headerClass || '_gtSimpleTableHeaderClass';
		//设置footer的id和class
		this.options.footerId = this.options.footerId || '_gtSimpleTableFooter';
		this.options.footerClass = this.options.footerClass || '_gtSimpleTableFooterClass';
		//设置body的id和class
		this.options.bodyId = this.options.bodyId || '_gtSimpleTableBody';
		this.options.bodyClass = this.options.bodyClass || '_gtSimpleTableBodyClass';
		
		this.options.header = this.options.header || [];
		if (this.options.header.length == 0) {
			throw new Error('请设置表格的表头区域！');
			return;
		};
		/*this.options.footer         = this.options.footer || [];*/
		/*为什么让footer必须具备呢？*/
		/*		if(this.options.footer.length == 0){
		throw new Error('请设置表格的表尾区域！');
		return;
		}*/
		this._cellsLength = this.options.header.length;
		
		this.options.rawData = this.options.rawData || {};
		this._data = [];
		this.options.dataAdapter = this.options.dataAdapter || function () {
			return [];
		};
		
		this.options.bodyFuncs = this.options.bodyFuncs || [];
		this.options.beforeRender = this.options.beforeRender || function () {};
		this.options.afterRender = this.options.afterRender || function () {};
		
		this.options.maxRowsLength = this.options.maxRowsLength || 20;
		this.options.itemColors = this.options.itemColors || {};
		this.options.itemColors.itemColor = this.options.itemColors.itemColor || '#FAFAFA';
		this.options.itemColors.hoverColor = this.options.itemColors.hoverColor || '#EDEDED';
	};
	N.coms.sTable.prototype = {
		/**
		 * 设置原始数据源
		 */
		setRawData : function (rawData) {
			this.options.rawData = rawData;
		},
		/**
		 * 设置原始数据源的处理器
		 */
		setDataAdapter : function (dataAdapter) {
			this.options.dataAdapter = dataAdapter;
		},
		/**
		 * 设置表格处理函数（列表）
		 */
		setBodyFuncs : function (bodyFuncs) {
			this.options.bodyFuncs = bodyFuncs;
		},
		_getTemplates : function () {
			var me = this;
			return {
				innerContainer : '<div id="' + me.options.containerId + '" class="' + me.options.containerClass + '"></div>',
				headerContainer : '<div id="' + me.options.headerId + '" class="' + me.options.headerClass + '"></div>',
				footerContainer : '<div id="' + me.options.footerId + '" class="' + me.options.footerClass + '"></div>',
				bodyContainer : '<div id="' + me.options.bodyId + '" class="' + me.options.bodyClass + '" style="height:auto;"></div>',
				
				table : '<table cellspacing="0"><tbody></tbody></table>'
			};
		},
		_setHeader : function () {
			var me = this;
			if (Object.prototype.toString.call(me.options.header) != '[object Array]') {
				throw new Error('表头区域数据不合法！');
				return;
			}
			var headerTableDom = N.dom.getDom(me._getTemplates().table);
			var tr = headerTableDom.insertRow(headerTableDom.rows.length);
			for (var i = 0; i < me._cellsLength; i++) {
				var thisCell = me.options.header[i];
				var td = tr.insertCell(i);
				if (typeof thisCell === 'string') {
					td.innerHTML = thisCell;
				} else if (typeof thisCell === 'function') {
					td.innerHTML = thisCell(td, tr, i);
				}
			}
			return headerTableDom;
		},
		_setFooter : function () {
			var me = this;
			if (Object.prototype.toString.call(me.options.footer) != '[object Array]') {
				throw new Error('表尾区域数据不合法！');
				return;
			}
			var footerTableDom = N.dom.getDom(me._getTemplates().table);
			var tr = footerTableDom.insertRow(footerTableDom.rows.length);
			for (var i = 0; i < me._cellsLength; i++) {
				var thisCell = me.options.footer[i];
				var td = tr.insertCell(i);
				if (typeof thisCell == 'string') {
					td.innerHTML = thisCell;
				} else if (typeof thisCell == 'function') {
					td.innerHTML = thisCell(td, tr, i);
				}
			}
			return footerTableDom;
		},
		_setBody : function () {
			var me = this;
			me._data = me.options.dataAdapter(me.options.rawData);
			/**
			 * 		[
			 *			[.., .., .., ..],
			 *			[.., .., .., ..],
			 *			[.., .., .., ..]
			 *		]
			 */
			var bodyTableDom = N.dom.getDom(me._getTemplates().table);
			for (var i = 0, lenI = me._data.length; i < lenI; i++) {
				var tr = bodyTableDom.insertRow(bodyTableDom.rows.length);
				var thisRow = me._data[i];
				for (var j = 0, lenJ = thisRow.length; j < lenJ; j++) {
					var thisCell = thisRow[j];
					var td = tr.insertCell(j);
					if (me.options.bodyFuncs == undefined || me.options.bodyFuncs[j] == undefined) {
						if (me.options.cellFunc) {
							var _p = me.options.cellFunc(thisCell, td, tr, i, j);
							td.innerHTML = (_p == undefined) ? thisCell : _p;
						} else {
							td.innerHTML = thisCell;
						}
					} else if (typeof me.options.bodyFuncs[j] == 'function') {
						var _t = me.options.bodyFuncs[j](thisCell, td, tr, i, j);
						var _m = (_t == undefined) ? thisCell : _t;
						if (me.options.cellFunc) {
							var _n = me.options.cellFunc(_m, td, tr, i, j);
							td.innerHTML = (_n == undefined) ? _m : _n;
						} else {
							td.innerHTML = _m;
						}
					}
				}
			}
			return bodyTableDom;
		},
		/**
		 * 清空表格
		 */
		empty : function () {
			var me = this;
			me.parentDom.innerHTML = '';
		},
		/**
		 * 表格的事件处理器
		 */
		_eventHandler : function () {
			var me = this;
			return {
				itemMouseOver : function (e) {
					e = e || window.event;
					var target = e.target || e.srcElement;
					if (target.tagName !== 'TD')
						return;
					var tr = target.parentNode;
					tr.style.backgroundColor = me.options.itemColors.hoverColor;
					tr.style.fontWeight = 'bold';
				},
				itemMouseOut : function (e) {
					e = e || window.event;
					var target = e.target || e.srcElement;
					if (target.tagName !== 'TD')
						return;
					var tr = target.parentNode;
					var _tr = tr;
					var _counter = 0;
					while (_tr = _tr.previousSibling) {
						_counter++;
					}
					tr.style.backgroundColor = (_counter % 2 == 1) ? me.options.itemColors.itemColor : '#FFF';
					tr.style.fontWeight = 'normal';
				}
			};
		},
		/**
		 * 渲染函数
		 */
		render : function () {
			var me = this;
			//前调函数
			me.options.beforeRender();
			
			var innerContainerDom = N.dom.getDom(me._getTemplates().innerContainer);
			var headerContainerDom = N.dom.getDom(me._getTemplates().headerContainer);
			var bodyContainerDom = N.dom.getDom(me._getTemplates().bodyContainer);
			var footerContainerDom = N.dom.getDom(me._getTemplates().footerContainer);
			
			headerContainerDom.appendChild(me._setHeader());
			bodyContainerDom.appendChild(me._setBody());
			if (me.options.footer)
				footerContainerDom.appendChild(me._setFooter());
			
			innerContainerDom.appendChild(headerContainerDom);
			innerContainerDom.appendChild(bodyContainerDom);
			if (me.options.footer)
				innerContainerDom.appendChild(footerContainerDom);
			
			me.parentDom.appendChild(innerContainerDom);
			
			/*为表格设置条纹和鼠标悬浮样式*/
			//设置条纹
			var trs = bodyContainerDom.getElementsByTagName('tr');
			for (var i = 0, len = trs.length; i < len; i++) {
				if (i % 2 == 1)
					trs[i].style.backgroundColor = me.options.itemColors.itemColor;
			}
			//设置鼠标移入事件，疑惑的地方是：使用事件代理，不能有效地处理tr的onmouseover事件，只能用td来代替
			N.event.addEvent(bodyContainerDom, 'mouseover', me._eventHandler().itemMouseOver);
			N.event.addEvent(bodyContainerDom, 'mouseout', me._eventHandler().itemMouseOut);
			
			/*调节在有滚动条时的样式*/
			if (me._data.length > me.options.maxRowsLength) {
				var _a = window.parseInt(N.style.getFinalStyleInfo(bodyContainerDom).height);
				if (isNaN(_a) || typeof _a != 'number') {
					//IE
					_a = bodyContainerDom.offsetHeight;
				}
				bodyContainerDom.style.maxHeight = Number((_a * me.options.maxRowsLength / me._data.length).toFixed(1)) + 1 + 'px';
			}
			
			//回调函数
			me.options.afterRender(innerContainerDom);
		}
	};
	
	/**
	 * 验证表格组件“类”实现情况
	 */
	N.oo.Interface.ensureClass(N.coms.sTable, sTableInterface);
})();