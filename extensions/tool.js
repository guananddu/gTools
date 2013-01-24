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
     * 创建简单的分页列表(改进版)
     * 
     * @param {string|HTMLElement} placeHolder 占位符元素ID或者本身（作为jQuery包装过的DOM元素） 
     * @param {number} totalPages 总页数
     * @param {number} curPage 当前页
     * @param {function} callBack 回调函数，会把点击的当前页作为参数传入
     * @return {undefined}
     *
     * @see /fragmentary/one-index-page.js 里面有详细用法，最好再包装一层，当然，用的时候，内部细节需要改动
     */
    /**
     * 典型的class样式：
        ._pager-container a {
            cursor: pointer;
            color: #333;
            display: inline-block;
            border: 1px solid #D4D4D4;
            border-radius: 4px;
            height: 24px;
            line-height: 24px;
            padding: 0 8px;
            margin: 0 3px;
            font-size: 12px;
            text-decoration: none;
        }
        ._pager-container a:hover {
            background-color: #E8E8E8;
            text-decoration: none;
        }
        ._pager-is-current {
            background-color: #7F8081;
            color: #fff !important;
            font-weight: bold;
        }
        ._pager-lgthen {
            color: #337BAC;
        }
        ._pager-prev-disabled, ._pager-next-disabled, ._pager-lgthen-dis {
            color: silver !important;
        }
     */
    N.tool.pagerConstructor = function(placeHolder, totalPages, curPage, callBack) {
        // 邻居间隔有几个
        var neighbour = 3;
        // 占位符处理
        typeof(placeHolder) == 'string' && (placeHolder = $(placeHolder));
        // 默认样式，可以自己设置
        var pagerContainerStyle = '_pager-container';
        var aNotCurTplStyle     = '_pager-not-current';
        var aIsCurTplStyle      = '_pager-is-current';
        // 上一页、下一页的样式
        var prevStyle    = '_pager-prev';
        var prevStyleDis = '_pager-prev-disabled';
        var nextStyle    = '_pager-next';
        var nextStyleDis = '_pager-next-disabled';
        var lgthen       = '_pager-lgthen';
        var lgthenDis    = '_pager-lgthen-dis';
        // 两个模板
        var aNotCurTpl = '<a hidefocus="hidefocus" href="#" page="#{0}" class="' + aNotCurTplStyle + '">#{0}</a>';
        var aIsCurTpl  = '<a hidefocus="hidefocus" href="#" page="#{0}" class="' + aIsCurTplStyle + '">#{0}</a>';
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
                    outPuts += stringFormat(thisTpl, i);
                }
            } else if(totalPages > 10) {
                for(var i = 1; i < totalPages + 1; i++) {
                    var thisTpl = (i == curPage ? aIsCurTpl : aNotCurTpl);
                    if(Math.abs(i - curPage) <= neighbour || i == 1 || i == totalPages) {
                        outPuts += stringFormat(thisTpl, i);
                    } else {
                        outPuts += ellipsis;
                    }
                }
                outPuts = outPuts.replace(/[·]+/g, ellipsis);
            }
            // html填充
            var t =   '<div class="' + pagerContainerStyle + '">'
                    +   '<a hidefocus="hidefocus" href="#" action="prev" class="' + prevStyle + ' ' + (_isFirst() ? prevStyleDis : '') + '"><span class="' + lgthen + ' ' + (_isFirst() ? lgthenDis : '') + '">&lt;</span>上一页</a>'
                    +       outPuts
                    +   '<a hidefocus="hidefocus" href="#" action="next" class="' + nextStyle + ' ' + (_isLast() ? nextStyleDis : '') + '">下一页<span class="' + lgthen + ' ' + (_isLast() ? lgthenDis : '') + '">&gt;</span></a>'
                    + '</div>';
            placeHolder.html(t);
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
            placeHolder.html('');
        };
        // 事件绑定
        placeHolder.on('click', function(e) {
            var target = e.target;
            var action;
            if(target.tagName.toLowerCase() == 'a') {
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
            e.stopPropagation();
            e.preventDefault();
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

    /**
     * 实时监听input输入框的值变化
     * 
     * @param {HTMLElement} input 需要监听的input元素 
     * @param {Function} callback 回调函数，会把当前值传入
     * @return {undefined}
     */
    N.tool.inputerListener = function(input, callback) {
        if("onpropertychange" in input && _IE_ <= 8) { //ie7,8完美支持，ie9不支持
            baidu.event.on(
                input,
                'propertychange',
                function(e) {
                    var eventI = helper.eventFixer(e);
                    eventI.event.propertyName == 'value'
                        && helper.throttle(callback, [input.value], 200);
                }
            );
        } 
        else if(_IE_ == 9) {
            // ie9的特殊处理
            /* 下面的这种方法还是有点瑕疵啊
            // Get the input and remember its last value:
            var lastValue = input.value;
            
            // An oninput function to call:
            var onInput = function() {
                if(lastValue !== input.value) { // selectionchange fires more often than needed
                    lastValue = input.value;
                    helper.throttle(callback, [lastValue]);
                }
            };

            // Called by focus/blur events:
            var onFocusChange = function(event) {
                if(event.type === "focus") {
                    document
                        .addEventListener("selectionchange", onInput, false);
                } 
                else {
                    document
                        .removeEventListener("selectionchange", onInput, false);
                }
            };
            
            // Add events to listen for input in IE9:
            input.addEventListener("input", onInput, false);
            input.addEventListener("focus", onFocusChange, false);
            input.addEventListener("blur", onFocusChange, false);
            */
            var timer;
            var oldV = input.value;
            baidu.event.on(
                input,
                'focus',
                function() {
                    timer = window.setInterval(function(){
                        var newV = input.value;
                        if(newV == oldV)
                            return;
                        // 值发生变化
                        oldV = newV;
                        // 回调函数
                        helper.throttle(callback, [oldV], 200);
                    }, 50);
                }
            );
            baidu.event.on(
                input,
                'blur',
                function() {
                    window.clearInterval(timer);
                    timer = undefined;
                }
            );
        }
        else {
            // 火狐、chrome完美支持
            baidu.event.on(
                input,
                'input',
                function(e) {
                    helper.throttle(callback, [input.value], 200);
                }
            );
        }
    };

    /**
     * 处理推荐搜索词字体加粗
     * 
     * @param {string} text 当前需要处理的字符串
     * @param {string} needle 当前不需要bold的词（即当前输入的搜索词）
     * @param {Object} adorn 点缀字符
     * @param {string} adorn.pre 前置点缀
     * @param {string} adorn.post 后置点缀
     * @return {string} 输出处理过的字符串
     */
    N.tool.handleBold = function(text, needle, adorn) {
        var needleLen = needle.length, start;
        // 必须包含，且从0开始
        if(text.indexOf(needle) == 0) {
            start = needleLen;
        }
        else {
            // 否则返回原始字符串
            return text;
        }
        var returner = [];
        for(var i = 0, len = text.length; i < len; i ++) {
            // 开始
            i == start && returner.push(adorn.pre);
            returner.push(text.charAt(i));
            // 结束
            i == text.length - 1 && returner.push(adorn.post);
        }
        return returner.join('');
    };
})();