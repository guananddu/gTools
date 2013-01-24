/**
 * 此文件用来展示一个单独页面中的组件式开发思想
 */

(function() {
    // 搜索词初始化
    var worder = function() {
        var target = $('#word');
        return {
            get: function() {
                return target.val();
            },
            set: function(v) {
                target.val(v);
            },
            reset: function() {
                target.val('');
            }
        };
    }();

    // 日历组件初始化
    var dater  = function() {
        // 设置语言
        $.datepicker.setDefaults($.datepicker.regional['zh-CN']);
        var dateStart = $('#date-start');
        var dateEnd   = $('#date-end');
        // 开始日期
        dateStart.datepicker({
            // defaultDate: '-1M',
            maxDate: '0D',
            changeMonth: true,
            numberOfMonths: 2,
            onClose: function(selectedDate) {
                dateEnd
                    .datepicker('option', 'minDate', selectedDate);
            }
        });
        // 结束日期
        dateEnd.datepicker({
            defaultDate: '0D',
            // 结束日期限制
            maxDate: '0D',
            changeMonth: true,
            numberOfMonths: 2,
            onClose: function(selectedDate) {
                dateStart
                    .datepicker('option', 'maxDate', selectedDate);
            }
        });
        // reset函数
        var _reset = function() {
            // 设置默认输入框应该显示的时间
            var begin = new Date(), end = new Date();
            // 默认计算前31天
            begin.setDate(begin.getDate() - 31);
            begin.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            var beginS = dateFormat(begin, 'yyyy-MM-dd');
            var endS   = dateFormat(end, 'yyyy-MM-dd');
            // 控件设置
            dateStart.datepicker('option', 'defaultDate', beginS);
            dateStart.datepicker('option', 'maxDate', endS);
            dateEnd.datepicker('option', 'defaultDate', endS);
            dateEnd.datepicker('option', 'minDate', beginS);
            // 设置值
            dateStart.val(beginS);
            dateEnd.val(endS);
        };
        // 初始调用reset
        _reset();
        return {
            get: function() {
                return {
                    from: dateStart.val(),
                    to: dateEnd.val()
                };
            },
            reset: _reset
        };
    }();

    // 频道初始化
    var producter = function() {
        // 静态变量
        var _products  = {
            0: '全部频道',
            1: '测试频道',
            // 省略
        };
        var _template = '<option value="#{0}">#{1}</option>';
        // 生成options
        var _t        = '';
        var target    = $('#product');
        for(var key in _products) {
            _t += stringFormat(
                _template,
                key,
                _products[key]
            );
        }
        // 注意这里，for in循环并不能保证 _products 中各个频道出现的顺序
        target.html(_t);
        return {
            get: function() {
                return target.val();
            },
            reset: function() {
                target.val('0');
            }
        };
    }();

    // pageSizer初始化
    var pageSizer  = function() {
        var _pageSizer = [20, 50, 100];
        var _template  = '<option value="#{0}">#{1}</option>';
        var _t     = '';
        var target = $('#page-sizer');
        for(var i = 0, len = _pageSizer.length; i < len; i ++) {
            _t += stringFormat(
                _template,
                _pageSizer[i],
                _pageSizer[i]
            );
        }
        target
            .html(_t)
            .on('change', function(event) {
                var v = target.val();
                // 接下来要恢复pager为第一页
                pager.set(1);
                // 这里要执行搜索
                mainSearch();
            });
        return {
            get: function() {
                return target.val();
            }
        };
    }();

    // pager初始化
    var pager = function() {
        var target = $('#pager');
        var _pager = PagerConstructor(
            target,
            // 初始化时就是第一页
            1,
            1,
            function(page) {
                // 这里要执行搜索
                mainSearch();
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
            }
        };
    }();

    // 导出结果初始化
    var exporter = function() {
        var _urls   = {
            get: '/search/report',
            download: '/search/export'
        };
        var _downloading = false;
        var target  = $('#export');
        target.click(function(e) {
            e.preventDefault();
            // 开始下载
            if(_downloading)
                return;
            exporter.download();
        });
        return {
            open: function() {
                target.show('normal');
            },
            close: function() {
                target.hide('normal');
            },
            download: function() {
                _downloading = true;
                // 发起请求
                $.post(
                    _urls.download,
                    {
                        params: {
                            query: encodeURIComponent(worder.get()),
                            from: dater.get().from,
                            to: dater.get().to,
                            productid: producter.get(),
                            page: pager.get(),
                            pageSize: pageSizer.get()
                        }
                    },
                    function(data) {
                        // 成功后
                        _downloading = false;
                    }
                );
            }
        };
    }();

    // 表格初始化
    var tabler   = function() {
        var _products  = {
            0: '全部频道',
            1: '测试频道',
            // 省略
        };
        // 设置各种id和class，这里也用来展示table组件的使用方法
        var _preOpt = {
            // 父元素（可以是id或Dom元素，必须）
            container: 'table-container',
            // 设置主表格的id和class（即table元素的id或class，两者都可选）
            id: 'my-table-id',
            className: 'my-table-class',

            // 设置表头的id或者class（可选）
            header: {
                id: 'my-table-header-id',
                className: 'my-table-header-class'
            },

            // 设置表足的id或者class（可选）
            footer: {
                id: 'my-table-footer-id',
                className: 'my-table-footer-class'
            },

            // 设置表身（tbody元素）的id或者class（可选）
            body: {
                id: 'my-table-body-id',
                className: 'my-table-body-class'
            },

            // 设置子表格中每一个tr的class（可选，通过它可以为子表格添加一些特殊样式）
            subTableTrClass: 'my-sub-table-tr-class',

            // 主表格中的tr hover时切换的类（可选，通过它可以设置主表格被hover时的样式）
            tableTrHover: 'my-table-body-hover-class',

            // 子表格hover的颜色（可选，子表格hover时候的颜色设置）
            subTableTrColor: {
                hover: '#E4EAF9',
                out: '#E7ECEE'
            }
        };
        // 展现等逻辑配置
        var _conOpt = {
            // 设置表头具体格式
            hFormat: [
                '表头1', 
                '表头2', 
                // function(th, tr, inx) {},
                '表头3', 
                '表头4',
                '表头5'
            ],

            // 表头杂项设置，现在可以通过百分数来确定每一个列的宽度
            hFormatMore : [
                {
                    width : '10%'
                }, 
                {
                    // 检索词，需要拥有排序功能
                    sortable: true,
                    sortfield: 'word',
                    sorttype: 'string'
                }, 
                {
                    width : '15%',
                    // 默认此列降序排列
                    sortable: 'desc',
                    // 'asc'，此是升序
                    sortfield: 'queryCount',
                    sorttype: 'num'
                }, 
                {
                    width : '20%'
                }, //此列可以自由伸缩
                {
                    width : '15%',
                    sortable: true,
                    sortfield: 'resultNum',
                    sorttype: 'num'
                }
            ],

            // 表身格式
            bFormat: [
                function(dataItem, i, j, tr, td) {
                    return (+ i + 1);
                }, 
                function(dataItem, i, j, tr, td) {
                    return encodeHTML(dataItem.word);
                }, 
                function(dataItem, i, j, tr, td) {
                    return dataItem.queryCount;
                }, 
                function(dataItem, i, j, tr, td) {
                    return _products[dataItem.channel];
                }, 
                function(dataItem, i, j, tr, td) {
                    return dataItem.resultNum;
                }
            ]/*,

            // bFormatMore
            bFormatMore: [
                {
                    textAlign: 'right'
                },
                {},
                {
                    textAlign: 'right'
                },
                {},
                {
                    textAlign: 'right'
                }
            ]*/
        };
        // 生成构造函数
        var myTableConstructor = sTable(_preOpt);
        // 表格初始化
        var meTable = new myTableConstructor(_conOpt);
        // 暴露接口
        return meTable;
    }();

    // 按钮初始化
    var buttoner = function() {
        /*var _urls   = {
            get: '/search/report',
            download: '/search/export'
        };*/
        var submit = $('#submit');
        var reset  = $('#reset');
        // 提交动作
        submit
            .button()
            .click(function(event) {
                // 不需要验证，因为都有默认值，搜索完了需要从第一页开始
                mainSearch(true);
            });
        // 重置动作
        reset
            .button()
            .click(function(event) {
                resetAll();
            });
    }();

    // 第一遍执行
    resetAll();
    mainSearch(true);

    // 主逻辑函数
    function mainSearch(flag) {
        var _urls   = {
            get: '/search/report',
            download: '/search/export'
        };
        // 如果有flag，则设置第一页
        flag && pager.setTotal(1);
        // 开始搜索
        $.post(
            _urls.get,
            {
                params: {
                    query: encodeURIComponent(worder.get()),
                    from: dater.get().from,
                    to: dater.get().to,
                    productid: producter.get(),
                    page: pager.get(),
                    pageSize: pageSizer.get()
                }
            },
            // 回调函数
            function(data) {
                if(data.status != 200)
                    throw('此请求出错：/search/report，请稍后再试！');
                // 写入总数
                flag && pager.setTotal(data.data.total);
                // 开始渲染表格
                // 设置默认的排序规则
                                console.log(tabler.hasTemp('sortfield'));
                !tabler.hasTemp('sortfield')
                    && tabler.setTemp('sortfield', 'queryCount');
                !tabler.hasTemp('sorttype')
                    && tabler.setTemp('sorttype', 'num');
                !tabler.hasTemp('type')
                    && tabler.setTemp('type', 'desc');
                tabler
                    .setData(data.data.list)
                    // 先排一下序
                    .sort(
                        tabler.getTemp('sortfield'),
                        tabler.getTemp('sorttype'),
                        tabler.getTemp('type')
                    )
                    .render(true);
                // 最后打开下载链接
                exporter.open();
            },
            'json'
        );
    };

    // 全部重置
    function resetAll() {
        worder.reset();
        dater.reset();
        producter.reset();
    };

    /**
     * 创建简单的分页列表
     * 
     * @param {string|HTMLElement} placeHolder 占位符元素ID或者本身（作为jQuery包装过的DOM元素） 
     * @param {number} totalPages 总页数
     * @param {number} curPage 当前页
     * @param {function} callBack 回调函数，会把点击的当前页作为参数传入
     * @return {undefined}
     */
    function PagerConstructor(placeHolder, totalPages, curPage, callBack) {
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

    // 助手函数声明 From Tangram
    /**
     * 处理日期序列化时的补零
     * @private
     */
    function pad(source) {
        return source < 10 ? '0' + source : source;
    };

    /**
     * 对目标日期对象进行格式化
     * 
     * @param {string}  source  目标日期对象
     * @param {string}  pattern 日期格式化规则
     * @return {string} 格式化后的字符串
     */
    function dateFormat(source, pattern) {
        if ('string' != typeof pattern) {
            return source.toString();
        }

        function replacer(patternPart, result) {
            pattern = pattern.replace(patternPart, result);
        }
        
        var /*pad     = baidu.number.pad,*/
            year    = source.getFullYear(),
            month   = source.getMonth() + 1,
            date2   = source.getDate(),
            hours   = source.getHours(),
            minutes = source.getMinutes(),
            seconds = source.getSeconds();

        replacer(/yyyy/g, pad(year, 4));
        replacer(/yy/g, pad(year.toString().slice(2), 2));
        replacer(/MM/g, pad(month, 2));
        replacer(/M/g, month);
        replacer(/dd/g, pad(date2, 2));
        replacer(/d/g, date2);

        replacer(/HH/g, pad(hours, 2));
        replacer(/H/g, hours);
        replacer(/hh/g, pad(hours % 12, 2));
        replacer(/h/g, hours % 12);
        replacer(/mm/g, pad(minutes, 2));
        replacer(/m/g, minutes);
        replacer(/ss/g, pad(seconds, 2));
        replacer(/s/g, seconds);

        return pattern;
    };

    /**
     * 对目标字符串进行格式化
     * 
     * @param {string}          source  目标字符串
     * @param {Object|string*}  opts    提供相应数据的对象
     * @return {string} 格式化后的字符串
     */
    function stringFormat(source, opts) {
        source = String(source);
        var data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
        if(data.length){
            data = data.length == 1 ? 
                /* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
                (opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) 
                : data;
            return source.replace(/#\{(.+?)\}/g, function (match, key){
                var replacer = data[key];
                // chrome 下 typeof /a/ == 'function'
                if('[object Function]' == toString.call(replacer)){
                    replacer = replacer(key);
                }
                return ('undefined' == typeof replacer ? '' : replacer);
            });
        }
        return source;
    };

    function encodeHTML(source) {
        return String(source)
                    .replace(/&/g,'&amp;')
                    .replace(/</g,'&lt;')
                    .replace(/>/g,'&gt;')
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#39;");
    };
})();