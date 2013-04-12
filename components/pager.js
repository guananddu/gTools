/**
 * pager组件及其使用（此分页组件兼容性更好）
 */
 
// 分页器构造函数
function PagerConstructor(placeHolder, totalPages, curPage, callBack) {
	// 邻居间隔有几个
	var neighbour = 2;
	// 占位符处理
	typeof(placeHolder) == 'string' && (placeHolder = baidu.g(placeHolder));
	// 默认样式，可以自己设置
	var pagerContainerStyle = 'pager-container';
	var aNotCurTplStyle     = 'pager-not-current';
	var aIsCurTplStyle      = 'pager-is-current';
	// 上一页、下一页的样式
	var prevStyle    = 'pager-prev';
	var prevStyleDis = 'pager-prev-disabled';
	var nextStyle    = 'pager-next';
	var nextStyleDis = 'pager-next-disabled';
	var lgthen       = 'pager-lgthen';
	var lgthenDis    = 'pager-lgthen-dis';
	// 两个模板
	var aNotCurTpl = '<span hidefocus="hidefocus" page="#{0}" class="' + aNotCurTplStyle + '">#{0}</span>';
	var aIsCurTpl  = '<span hidefocus="hidefocus" page="#{0}" class="' + aIsCurTplStyle + '">#{0}</span>';
	// 省略字符
	var ellipsis = '···';
	// 内部函数
	// 是不是第一页
	function _isFirst() {
		return curPage == 1;
	};
	// 是不是最后一页
	function _isLast() {
		return curPage == totalPages;
	};
	// render
	function _render() {
		var outPuts   = '';
		if(totalPages <= 10) {
			for(var i = 1; i < totalPages + 1; i++) {
				var thisTpl = (i == curPage ? aIsCurTpl : aNotCurTpl);
				outPuts += baidu.string.format(thisTpl, i);
			}
		} else if(totalPages > 10) {
			for(var i = 1; i < totalPages + 1; i++) {
				var thisTpl = (i == curPage ? aIsCurTpl : aNotCurTpl);
				if(Math.abs(i - curPage) <= neighbour || i == 1 || i == totalPages) {
					outPuts += baidu.string.format(thisTpl, i);
				} else {
					outPuts += ellipsis;
				}
			}
			outPuts = outPuts.replace(/[·]+/g, ellipsis);
		}
		// html填充
		var t =   '<div class="' + pagerContainerStyle + '">'
				+   '<span hidefocus="hidefocus" action="prev" class="' + prevStyle + ' ' + (_isFirst() ? prevStyleDis : '') + '"><strong class="' + lgthen + ' ' + (_isFirst() ? lgthenDis : '') + '">&lt;</strong>上一页</span>'
				+       outPuts
				+   '<span hidefocus="hidefocus" action="next" class="' + nextStyle + ' ' + (_isLast() ? nextStyleDis : '') + '">下一页<strong class="' + lgthen + ' ' + (_isLast() ? lgthenDis : '') + '">&gt;</strong></span>'
				+ '</div>';
		placeHolder.innerHTML = t;
	};
	// set
	function _set(nowPage) {
		if(nowPage > totalPages)
			nowPage = totalPages;
		// 重新赋值
		curPage = (+ nowPage);
		// 恢复原始html
		// outPuts = '';
		_render();
	};
	// setTotal
	function _setTotal(total) {
		totalPages = (+ total);
		_set(1);
	};
	// get
	function _get() {
		return (+ curPage);
	};
	// clear
	function _clear() {
		placeHolder.innerHTML = '';
	};
	// 事件绑定
	baidu.event.on(placeHolder, 'click', function(e) {
		e = e || window.event;
		var target = e.target || e.srcElement;
		var action;
		if((target.tagName.toLowerCase() == 'span'
			&& target.getAttribute('page'))
			|| 
			(target.tagName.toLowerCase() == 'span'
			&& target.getAttribute('action'))) {
			if(action = target.getAttribute('action')) {
				// 如果是上一页下一页
				switch(action) {
					// 上一页
					case 'prev':
						if(_isFirst()) 
							break;
						var now = (+ curPage - 1);
						_set(now);
						callBack(now)
						break;
					// 下一页
					case 'next':
						if(_isLast())
							break;
						var now = (+ curPage + 1);
						_set(now);
						callBack(now);
						break;
				}
			}
			else {
				// 正常翻页
				var now = target.getAttribute('page');
				_set(now);
				callBack(now);
			}
		}
	});
	// 暴露接口
	return {
		render: _render,
		set: _set,
		get: _get,
		clear: _clear,
		setTotal: _setTotal
	};
};
// 逻辑变量
// var map;
// var firstpos, haschange = false;
// var posData    = baidu.json.parse(__course_location_info);
// var posTotal   = __course_location_info.length;
var perPageNum = 6;
var pager = function() {
	var target = baidu.dom.g('pager');
	var _pager = PagerConstructor(
		target,
		1,
		1,
		function(page) {
			// 分页在这里
			createList(page);
			map.clearOverlays();
			callBack();
		}
	);
	_pager.render();
	// 需要暴露几个方法
	return {
		setTotal: function(total) {
			_pager.setTotal(total);
		},
		set: function(page) {
			_pager.set(page);
		},
		get: function() {
			return _pager.get();
		},
		hide: function() {
			target.style.display = 'none';
		},
		show: function() {
			target.style.display = '';
		}
	};
}();

var _total = Math.ceil(posData.length / perPageNum);
if(_total >= 2)
	pager.setTotal(_total);
if(_total == 1)
	pager.hide();