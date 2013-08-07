/**
 * @file    pager模块
 * @author  guanwei01
 */

define( function (require) {

    var config = require('js/config');
    var util   = require('js/util');

    /**
     * 简易分页组件的构造函数
     * @param {DOMElement} placeHolder 分页组建的父元素
     * @param {number} totalPages  总页数
     * @param {number} curPage     当前页数
     * @param {function} callBack   切换页数以后的回调函数（会将page传入）
     * @return {Object} {
     *       render: _render, // 主渲染函数
     *       set: _set, // 设置当前页
     *       get: _get, // 获取当前页
     *       clear: _clear, // 清空
     *       setTotal: _setTotal // 设置总页数
     * }
     */
    function PagerConstructor(placeHolder, totalPages, curPage, callBack) {
        // 邻居间隔有几个
        var neighbour = 2;
        // 占位符处理
        typeof(placeHolder) == 'string'
            && (placeHolder = baidu.g(placeHolder));
        // 默认样式，可以自己设置
        var pagerContainerStyle = 'edu-course-pager-container';
        var aNotCurTplStyle     = 'edu-course-pager-not-current';
        var aIsCurTplStyle      = 'edu-course-pager-is-current';
        // 上一页、下一页的样式
        var prevStyle    = 'edu-course-pager-prev';
        var prevStyleDis = 'edu-course-pager-prev-disabled';
        var nextStyle    = 'edu-course-pager-next';
        var nextStyleDis = 'edu-course-pager-next-disabled';
        var lgthen       = 'edu-course-pager-lgthen';
        var lgthenDis    = 'edu-course-pager-lgthen-dis';
        // 两个模板
        var aNotCurTpl = '<span data-nolog="1" hidefocus="hidefocus" page="#{0}" class="' + aNotCurTplStyle + '">#{0}</span>';
        var aIsCurTpl  = '<span data-nolog="1" hidefocus="hidefocus" page="#{0}" class="' + aIsCurTplStyle + '">#{0}</span>';
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
                    +   '<span data-nolog="1" action="prev" class="' + prevStyle + ' ' + (_isFirst() ? prevStyleDis : '') + '"><strong class="' + lgthen + ' ' + (_isFirst() ? lgthenDis : '') + '">&lt;&lt;</strong>上一页</span>'
                    +       outPuts
                    +   '<span data-nolog="1" action="next" class="' + nextStyle + ' ' + (_isLast() ? nextStyleDis : '') + '">下一页<strong class="' + lgthen + ' ' + (_isLast() ? lgthenDis : '') + '">&gt;&gt;</strong></span>'
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
    }

    /**
     * 分页器
     */
    var pager =  function () {
        var target = baidu.dom.g('pager-container');
        if (!target) {
            return;
        }

        var callback = function () {};
        var _pager = PagerConstructor(
            target,
            1,
            1,
            function(page) {
                callback( page );
            }
        );
        _pager.render();
        // 需要暴露几个方法
        return {
            /**
             * 设置回调函数
             * @param  {Function} c 切换页数的回调函数
             */
            setCallBack: function (c) {
                callback = c;
                return this;
            },

            /**
             * 设置总页数（会重新渲染）
             * @param {number} total 总页数
             */
            setTotal: function(total) {
                _pager.setTotal(total);
                return this;
            },

            /**
             * 设置当前页数
             * @param {number} page 当前页数
             */
            set: function(page) {
                _pager.set(page);
                return this;
            },

            /**
             * 获取当前页
             * @return {number} 当前页数
             */
            get: function() {
                return _pager.get();
            },

            /**
             * 隐藏分页器
             * @return {undefined}
             */
            hide: function() {
                target.style.display = 'none';
                return this;
            },

             /**
             * 显示分页器
             * @return {undefined}
             */
            show: function() {
                target.style.display = '';
                return this;
            }
        };
    }();

    var perPageCount = 12;

    return {

        /**
         * 分页器初始化
         */
        init: function () {

            var me = this;

            var totalpage = util.get( 'totalpage' );
            var total = util.get( 'count' );

            pager                    
                // 设置回调
                .setCallBack( function ( page ) {
                    me.fire( 'event-page-change', {
                        page: page
                    } );
                } )

            if ( + perPageCount >= + total) {

                // 此时就不用显示分页
                pager.hide();

            }
            else {

                pager
                    // 设置总数
                    .setTotal( totalpage )
                    // 设置当前页
                    .set( util.get( 'page' ) )
                    // 显示
                    .show();

            }

            return me;

        },

        /**
         * 外部可以调用的设置函数
         * @param  {number} totalpage 总页数
         * @param  {number} page      当前页
         * @return {Object}           返回调用对象
         */
        set: function( totalpage, page ) {

            var me = this;

            // 控制显示与否
            if ( totalpage == 1 ) {
                pager.hide();
            }
            else {
                pager.show();
            }

            pager
                .setTotal( totalpage )
                .set( page );

            return me;

        }

    };

});