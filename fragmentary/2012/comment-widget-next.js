/**
 * 此文件主要展示一种页面通用组件的书写及组织方法（改进版）
 */
// 页面组件声明，注意采用享元模式
var widget = function() {
    // 静态私有变量容器
    var _widgets  = {};
    var _widgetId = {};

    // 特殊包装函数
    var _appendFunc = helper.appendFunc;

    // 调试用
    /*window._widgets = _widgets;
    window._widgetId = _widgetId;*/
    // 获取私有配置
    function _getParam(name, callback, me) {
        if(name == '') {
            callback.call(me, _widgets[me._type][me._id]);
            return;
        }
        name     = typeof name === 'string' ?
            [name] : name;
        var args = [];
        for(var i = 0, len = name.length; i < len; 
            args.push(_widgets[me._type][me._id][name[i ++]])
        ) {}
        // 调用回调
        callback.apply(me, args);
    };

    // 初始化组件的前置工作
    function _beforeInit(me, opts) {
        // 初始化记录
        _widgetId[me._type] 
            ? _widgetId[me._type] ++ 
            : _widgetId[me._type] = 1;
        // 存储自身id
        me._id   = _widgetId[me._type];
        _widgets[me._type]
            ? (_widgets[me._type][me._id] = opts)
            : ((_widgets[me._type] = {}) 
                && (_widgets[me._type][me._id] = opts));
    };

    // 掺元参数混入函数，实现继承的一种简易方法
    function _mixInClass(proto) {
        // 获取参数
        proto.getParam = function(name, callback) {
            var me = this;
            _getParam(name, callback, me);
            return me;
        };

        // 析构函数
        proto.destructor = function() {
            var me = this;
            // 析构函数还需要链式调用否！？
            // 主要来删除存储的参数列表
            delete _widgets[me._type][me._id];
        };
    };

    // 搜索输入框组件
    var searchInputer = function() {
        // 私有静态变量
        // 0:和原始数组索引一致；1:词（以做过bold处理）
        var _listTemplate = '<li inx-data="#{0}" class="#{2}">#{1}</li>';
        var _boldPre      = '<span class="bold">';
        var _boldPost     = '</span>';

        // 私有临时变量存储
        var _pool         = {};
        /**
         * searchInputer构造器
         *
         * @constructor
         */
        var SearchInputer = function(opts) {
            if(!opts || !opts.inputer || !opts.suggestContainer
                || !opts.suggestUl
                || !opts.hinter)
                throw hints[10];
            // 存储自己的类型
            this._type = 'SearchInputer'; // 和构造函数同名就成了
            // 初始化前置函数
            _beforeInit(this, opts);
        };
        // 原型方法
        SearchInputer.prototype = {
            // 恢复构造器
            constructor: SearchInputer,
            // 初始化函数
            init: function() {
                var me = this;
                // 添加hinter
                _addHinter.call(me);
                // 添加input事件处理
                _addOnChange.call(me);
                // 添加input的keydown事件
                _addOnKeyDown.call(me);
                // 添加hintlayer的用户点击事件
                _addOnClickLayer.call(me);
                // 页面初始化填值
                var q;
                if(helper.hashMonitor.has('q'))
                    helper.hashMonitor.get('q', function(s) {
                        // decode一下
                        q = decodeURIComponent(s);
                    });
                !_ISEMBED_ 
                    && (q != '') 
                    && (q != undefined) 
                    && me.set(q);
                // alert(q);
                return me;
            },
            // 获取值
            get: function(callback) {
                var me = this;
                me.getParam(['inputer', 'hinter'], function(
                    inputer, hinter
                ) {
                    var v = inputer.value;
                    v     = (v == '' || v == hinter || /^\s+$/.test(v))
                        ? null : v;
                    // 为空的话就是null
                    callback
                        && callback.call(me, v);
                });
                return me;
            },
            // 设置值
            set: function(v) {
                var me = this;
                me.getParam(['inputer', 'hinter'], function(
                    inputer, hinter
                ) {
                    v = (v != hinter && !/^\s+$/.test(v)) ? v : '';
                    // 记得变色
                    inputer.style.color = '#000';
                    // ie7,8下不能打开提示框
                    _IE_ <= 8 && _setTemp.call(me, 'action:cantopen', true);
                    inputer.value = v;
                });
                return me;
            },
            // 关闭提示框
            closeLayer: function() {
                var me = this;
                _hideLayer.call(me);
                return me;
            }
        };
        // 掺元添加方法
        _mixInClass(SearchInputer.prototype);
        // 特殊包装一下destructor函数
        (function() {
            var _destructor = SearchInputer
                .prototype
                .destructor;
            SearchInputer
                .prototype
                .destructor = function() {
                    var me = this;
                    _appendFunc(
                        _destructor,
                        // 附加
                        function() {
                            delete _pool[me._id];
                        },
                        me
                    )();
                };
        })();
        // 私有方法
        
        // 简易缓存函数
        function _getTemp(name) {
            var me = this;
            return _pool[me._id][name];
        };
        function _setTemp(name, value) {
            var me = this;
            (_pool[me._id] = _pool[me._id] || {})[name] = value;
            return me;
        };
        function _hasTemp(name) {
            var me = this;
            return !!(_pool[me._id] && (_pool[me._id][name] != undefined));
        };

        // 更新list
        function _refreshList(ul, index) {
            var me  = this;
            var lis = ul.getElementsByTagName('li');
            for(var i = 0, len = lis.length; i < len; i ++) {
                lis[i].getAttribute('inx-data') == index
                    ? lis[i].className = 'suggestion-list-li-selected'
                    : lis[i].className = ''
            }
        };

        function _handleUpDown(keycode) {
            var me = this;
            // 设置当前inx，从-1开始
            !_hasTemp.call(me, 'action:index')
                && _setTemp.call(me, 'action:index', -1);
            // 在ie类型的浏览器下，上下切换搜索词的时候，是不能再次触发change事件的
            _IE_ && _setTemp.call(me, 'action:notchange', true);
            var index = + _getTemp.call(me, 'action:index');
            var ins   = keycode == 40 ? 1 : -1;
            index    += (+ ins);
            // 记得处理
            var max   = _getTemp.call(me, 'list:data').length;
            // 归位
            index == max && (index = -1);
            index == -2 && (index = max - 1);
            me.getParam(['suggestUl', 'inputer'], function(
                suggestUl, inputer
            ) {
                _refreshList.call(me, suggestUl, index);
                // 设置存储值
                _setTemp.call(me, 'action:index', index);
                // 填值
                inputer.value = index != -1 
                    ? helper.cutString(_getTemp.call(me, 'list:data')[index].word, 74)
                    // -1 
                    : _getTemp.call(me, 'action:userinput');
            });
        };

        function _handleEnter() {
            var me    = this;
            var index = _getTemp.call(me, 'action:index');
            _ensureSelect.call(me, index);
        };

        // 确认选择
        function _ensureSelect(index) {
            var me = this;
            /*var inx = eventI.target.getAttribute('inx-data')
                || eventI.target.parentNode.getAttribute('inx-data');*/
            me.getParam(['inputer', 'selectCallBack'], function(
                inputer, selectCallBack
            ) {
                // var v = _getTemp.call(me, 'list:data')[index].word;
                var v = (index != -1 && index != undefined) 
                    ? _getTemp.call(me, 'list:data')[index].word
                    // -1 && undefined
                    : _getTemp.call(me, 'action:userinput');
                // 更新inputer
                inputer.value = v;
                // 关闭浮层
                _IE_ <= 8 && _setTemp.call(me, 'action:cantopen', true);
                _hideLayer.call(me);
                // 回调
                selectCallBack
                    && selectCallBack(
                        v,
                        index
                    );
            });
        };

        // focus事件处理器
        function _inputKeyDown() {
            var me = this;
            return function(e) {
                var eventI = helper.eventFixer(e);
                (_hasTemp.call(me, 'action:hasclose') 
                    && !_getTemp.call(me, 'action:hasclose'))
                    && (function() {
                        var keycode = eventI.event.keyCode;
                        switch(keycode) {
                            case 40:
                            case 38:
                                // 上38
                                // 下40
                                _handleUpDown.call(me, keycode);
                                break;
                            case 13:
                                // 回车
                                _handleEnter.call(me);
                                break;
                            default:
                                // 在这种情况下需要更新用户定义的值（应该是keyup事件）
                                // _setTemp.call(me, 'action:userinput', eventI.target.value);
                        }
                    })();
            };
        };

        // input的OnKeyDown事件
        function _addOnKeyDown() {
            var me = this;
            me.getParam('inputer', function(inputer) {
                baidu.event.on(
                    inputer,
                    'keydown',
                    _inputKeyDown.call(me)
                );
                baidu.event.on(
                    inputer,
                    'keyup',
                    function(e) {
                        var eventI = helper.eventFixer(e);
                        eventI.event.keyCode != 40
                            && eventI.event.keyCode != 38
                            && _setTemp.call(me, 'action:userinput', eventI.target.value);
                    }
                );
            });
            return me;
        };

        // 添加hintlayer的用户点击事件
        function _addOnClickLayer() {
            var me = this;
            me.getParam('suggestContainer', function(
                suggestContainer
            ) {
                baidu.event.on(
                    suggestContainer,
                    'click',
                    function(e) {
                        var eventI = helper.eventFixer(e);
                        if(eventI.targetTagName == 'li'
                            || eventI.targetTagName == 'span') {
                            var inx = eventI.target.getAttribute('inx-data')
                                || eventI.target.parentNode.getAttribute('inx-data');
                            _ensureSelect.call(me, inx);
                        }
                        eventI.preventDefault();
                        eventI.stopPropagation();
                    }
                );
                baidu.event.on(
                    suggestContainer,
                    'mouseover',
                    function(e) {
                        var eventI = helper.eventFixer(e);
                        if(eventI.targetTagName == 'li') {
                            // 防止出现闪烁现象
                            if(helper.domCheckHover(eventI.event)) {
                                var inx = eventI.target.getAttribute('inx-data');
                                me.getParam(['suggestUl'], function(
                                    suggestUl
                                ) {
                                    _refreshList.call(me, suggestUl, inx);
                                    // 设置存储值
                                    _setTemp.call(me, 'action:index', inx);
                                });
                            }
                        }
                        eventI.preventDefault();
                        eventI.stopPropagation();
                    }
                );
                baidu.event.on(
                    suggestContainer,
                    'mouseout',
                    function(e) {
                        var eventI = helper.eventFixer(e);
                        if(eventI.targetTagName == 'li') {
                            // 防止出现闪烁现象
                            if(helper.domCheckHover(eventI.event)) {
                                eventI.target.className = '';
                                // 归位存储值
                                _setTemp.call(me, 'action:index', -1);
                            }
                        }
                        eventI.preventDefault();
                        eventI.stopPropagation();
                    }
                );
            });
            return me;
        };

        // 生成列表
        function _renderLayer(arr, inputText) {
            var me = this;
            // 放入缓存
            _setTemp.call(me, 'list:data', arr);
            // helper.savingEnergy(_setTemp, ['action:userinput', inputText], me, 2000);
            // _setTemp.call(me, 'action:userinput', inputText);
            me.getParam(['suggestContainer', 'suggestUl'], function(
                suggestContainer, suggestUl
            ) {
                var result  = '';
                for(var i   = 0, len = arr.length; i < len; i ++) {
                    result += baidu.format(
                        _listTemplate, 
                        // 索引
                        i,
                        // 词
                        helper.handleBold(
                            helper.cutString(arr[i].word, 74),
                            (!_IE_ ? inputText : _getTemp.call(me, 'action:userinput')),
                            {
                                pre: _boldPre,
                                post: _boldPost
                            }
                        ),
                        // ie7,8,9的特殊处理
                        ((_IE_ <= 9
                            && _hasTemp.call(me, 'action:index')
                            && _getTemp.call(me, 'action:index') == i)
                            ? 'suggestion-list-li-selected'
                            : '')
                    );
                }
                // 放入ul
                suggestUl.innerHTML = result;
                // 显示
                suggestContainer.style.display = 'block';
                // 设置标志
                _setTemp.call(me, 'action:hasclose', false);
            });
            return me;
        };

        // 获取到了变化
        function _change(v) {
            var me = this;
            // 如果为空
            if(v == '') 
                return _hideLayer.call(me);
            if(_IE_ <= 8 
                && _hasTemp.call(me, 'action:cantopen')
                && !!_getTemp.call(me, 'action:cantopen')
            ) {
                return _hideLayer.call(me);
            }
            // 字母数字组合，3个以上才搜索
            if(helper.checkSearching(v))
                return _hideLayer.call(me);
            // ie浏览器下，通过这个判断是不是应该发起请求
            if(_IE_ && _getTemp.call(me, 'action:notchange'))
                return;
            // 不为空
            helper.requester({
                url: requestUrls.recommend + '?q=' + helper.encodeSearchWord(v)/* + '&r=' + (+ (new Date()))*/,
                method: 'GET',
                ons: function(o) {
                    // o是一个数组: [{word:xxx},{},...]
                    // 如果为空
                    if(!o || o.length == 0) {
                        return;
                    }
                    // 生成列表
                    _renderLayer.call(me, o, v);
                }
            });
            return me;
        };

        // 隐藏提示层
        function _hideLayer() {
            var me = this;
            me.getParam('suggestContainer', function(suggestContainer) {
                suggestContainer.style.display = 'none';
                // 拨回标志
                _setTemp.call(me, 'action:hasclose', true);
                _setTemp.call(me, 'action:index', -1);
                _setTemp.call(me, 'action:userinput', '');
            });
            return me;
        };

        // 添加事件处理
        function _addOnChange() {
            var me = this;
            me.getParam(
                ['inputer', 'hinter'], 
                function(inputer, hinter) {
                    helper.inputerListener(
                        inputer,
                        function(v) {
                            // 对值进行判断
                            v != hinter
                                && !/^\s+$/.test(v)
                                // 要把为空的情况放行
                                && _change.call(me, v);
                        }
                    );
                    // ie7,8下的特殊处理
                    _IE_ <= 8 && baidu.event.on(
                        inputer,
                        'keydown',
                        function(e) {
                            var keycode = helper.eventFixer(e).event.keyCode;
                            /*keycode != 37 || keycode != 38
                                && keycode != 39 || keycode != 40
                                && */
                            if(keycode != 38 
                                && keycode != 40 
                                && keycode != 13
                                && keycode != 37 
                                && keycode != 39) 
                                _setTemp.call(me, 'action:cantopen', false);
                        }
                    );
                    // 打开onchange的标志
                    _IE_ && baidu.event.on(
                        inputer,
                        'keydown',
                        function(e) {
                            var keycode = helper.eventFixer(e).event.keyCode;
                            if(keycode != 38 
                                && keycode != 40 
                                // && keycode != 13
                                && keycode != 37 
                                && keycode != 39) 
                                _setTemp.call(me, 'action:notchange', false);
                        }
                    );
                    // 没有显示浮层，点击回车
                    baidu.event.on(
                        inputer,
                        'keydown',
                        function(e) {
                            var keycode = helper.eventFixer(e).event.keyCode;
                            keycode == 13 
                                && (!_hasTemp.call(me, 'action:hasclose') 
                                        || _getTemp.call(me, 'action:hasclose'))
                                && me.getParam('selectCallBack', function(
                                    selectCallBack
                                ) {
                                    var v = inputer.value;
                                    v != '' 
                                        && v != hinter
                                        && !/^\s+$/.test(v)
                                        // 回调
                                        && selectCallBack
                                        && selectCallBack(v);
                                });
                        }
                    );
                    // ie9的特殊处理
                    /*_IE_ == 9 && baidu.event.on(
                        inputer,
                        'blur',
                        function() {
                            _setTemp.call(me, 'action:cantopen', true);
                        }
                    );*/
                }
            );
            return me;
        };

        // 添加hinter
        function _addHinter() {
            var me = this;
            me.getParam(
                ['inputer', 'hinter'], 
                helper.addHint
            );
            return me;
        };
        // 返回构造器
        return SearchInputer;
    }();

    // 整体搜索逻辑组件
    var searcher = function() {
        // 私有变量
        var _icons   = {
            // 名词解释
            explain: 'icon-1',
            text: 'icon-2',
            txt: 'icon-2',
            word: 'icon-3',
            excel: 'icon-4',
            ppt: 'icon-5',
            pdf: 'icon-6',
            // rar&&zip
            // rarzip: 'icon-7',
            rar: 'icon-7',
            zip: 'icon-7',
            // avi、rmvb、flv、swf、mpeg、mkv、swf、flv
            // av: 'icon-8',
            avi: 'icon-8',
            rmvb: 'icon-8',
            flv: 'icon-8',
            swf: 'icon-8',
            mpeg: 'icon-8',
            mkv: 'icon-8',
            swf: 'icon-8',
            flv: 'icon-8',
            other: 'icon-9'
        };
        // 产品->id map
        var _products  = {
            1: '产品1',
            2: '产品2',
            3: '产品3',
            4: '产品4'
        };
        var _templates = {
            // 结果列表模板
            resultLi:   '<li>' +
                            '<div id="result-header" class="result-header">' +
                                // #{0} 指代背景icon的class
                                '<span class="result-icon #{0}"></span>' +
                                '<span class="result-title">' +
                                    // #{1} 指代title的url
                                    '<a href="#{1}">' +
                                       // #{2} 指代title文字
                                       '#{2}' +
                                    '</a>' +
                                '</span>' +
                                // #{3} 指代大小（前端不需处理）
                                '<span class="result-size">#{3}</span>' +
                                // #{4} 指代所属产品
                                '<span class="result-product">#{4}</span>' +
                            '</div>' +
                            '<p id="result-content" class="result-content">' +
                                // #{5} 指代描述信息
                                '#{5}' +
                            '</p>' +
                        '</li>',
            // 相关结果列表
            relatedLi: '<a hidefocus="hidefocus" href="#" search-data="#{0}">#{0}</a>',
            empty: '<li class="result-empty">非常抱歉，没有找到与“ <strong class="red">#{0}</strong> ”相关的结果</li>',
            emptyEmbed: ''
        };

        // 私有临时变量存储
        var _pool      = {};

        /**
         * Searcher构造器
         *
         * @constructor
         */
        var Searcher = function(opts) {
            if(!opts || !opts.ulContainer || !opts.pagerContainer
                || !opts.totalNumContainer
                || !opts.relatedContainer
                || !opts.url)
                throw hints[10];
            // 存储自己的类型
            this._type = 'Searcher'; // 和构造函数同名就成了
            // 初始化前置函数
            _beforeInit(this, opts);
        };

        // 原型方法
        Searcher.prototype = {
            // 恢复构造器
            constructor: Searcher,
            // 初始化函数
            init: function() {
                var me = this;
                // 检查当前的hash，看看有没有参数
                var q, page;
                if(helper.hashMonitor.has('q'))
                    helper.hashMonitor.get('q', function(s) {
                        // decode一下
                        q = decodeURIComponent(s);
                    });
                if(q == '')
                    return me;
                if(helper.hashMonitor.has('page'))
                    helper.hashMonitor.get('page', function(p) {
                        page = p;
                        // 设置当前页面
                        // _setTemp.call(me, 'pager:curr', page);
                    });
                // 搜索参数配置
                // alert(q);
                var params = {
                    q: q,
                    page: page,
                    pageSize: configs.pageSize,
                    productid: configs.productid
                };
                // 执行搜索
                me.search(params);
                // 相关搜索绑定事件
                _relatedEvent.call(me);
                return me;
            },
            // 主搜索函数
            search: function(params) {
                var me = this;
                if(params.q) {
                    // 请求前处理
                    params = _beforeRequest.call(me, params);
                    // 主请求
                    _mainRequest.call(me, params, _handleMainResult);
                    // 相关搜索请求
                    _relatedRequest.call(me, params, _handleRelatedRequest);
                }
                return me;
            }
        };

        // 掺元添加方法
        _mixInClass(Searcher.prototype);

        // 特殊包装一下destructor函数
        (function() {
            var _destructor = Searcher
                .prototype
                .destructor;
            Searcher
                .prototype
                .destructor = function() {
                    var me = this;
                    _appendFunc(
                        _destructor,
                        // 附加
                        function() {
                            delete _pool[me._id];
                        },
                        me
                    )();
                };
        })();

        // 私有方法
        
        // 相关搜索绑定事件
        function _relatedEvent() {
            var me = this;
            me.getParam(['relatedContainer', 'relatedCallBack'], function(
                relatedContainer, relatedCallBack
            ) {
                baidu.event.on(
                    relatedContainer,
                    'click',
                    function(e) {
                        var eventI = helper.eventFixer(e);
                        if(eventI.targetTagName == 'a') {
                            var searchData = eventI.target.getAttribute('search-data');
                            // 搜索
                            var params = {
                                q: searchData,
                                page: 1,
                                pageSize: configs.pageSize,
                                productid: configs.productid
                            };
                            /*// 请求前处理
                            params = _beforeRequest.call(me, params);
                            // 主请求
                            _mainRequest.call(me, params, function(o) {
                                _renderMain.call(me, o.list);
                                // 更新分页器
                                _getTemp.call(me, 'pager:needle').setTotal(
                                    Math.ceil(o.num / _getTemp.call(me, 'pager:size'))
                                );
                            });
                            // 相关搜索请求
                            _relatedRequest.call(me, params, _handleRelatedRequest);*/
                            // 直接使用search函数
                            me.search(params);
                            // 回调
                            relatedCallBack
                                && relatedCallBack(searchData);
                        }
                        eventI.preventDefault();
                        eventI.stopPropagation();
                    }
                );
            });
        };

        // 请求前处理
        function _beforeRequest(params) {
            var me = this;
            // 存入当前第几页
            _setTemp.call(me, 'pager:curr', params.page);
            // 存入页面大小
            _setTemp.call(me, 'pager:size', params.pageSize);
            params = _handleParam(params);
            // 设置hash
            _setHash(params);
            // 记录params
            _setTemp.call(me, 'request:params', params);
            return params;
        };

        // 相关请求处理
        function _handleRelatedRequest(result) {
            var me = this;
            // result是数组
            me.getParam('relatedContainer', function(
                relatedContainer
            ) {
                // 判断是否为空
                if(!result || result.length == 0) {
                    // 隐藏相关搜索
                    _hideOrShow(
                        relatedContainer.parentNode,
                        'none'
                    );
                    return;
                }
                var s = '';
                for(var i = 0, len = result.length; i < len; i ++) {
                    s += baidu.format(
                        _templates.relatedLi,
                        helper.cutString(
                            result[i].word,
                            configs.relatedLen
                        )
                    );
                }
                relatedContainer.innerHTML = s;
                // 显示
                _hideOrShow(
                    relatedContainer.parentNode,
                    'block'
                );
            });
        };

        // 相关请求
        function _relatedRequest(params, callback) {
            var me = this;
            me.getParam('url', function(url) {
                helper.requester({
                    url: url.related + '?' + _getRelatedQS(params, true),
                    method: 'GET',
                    ons: function(o) {
                        callback.call(me, o);
                    }
                });
            });
        };

        // 主函数处理
        function _handleMainResult(result) {
            var me = this;
            var totalNum = result.num;
            // 在这里判断为空情况
            if(result.num  == 0) {
                _mainResultEmpty.call(me);
                return;
            }
            var lists    = result.list;
            // 结果列表渲染
            _renderMain.call(me, lists);
            // 分页插件组件
            _renderPager.call(me, totalNum);
        };

        // 结果为空
        function _mainResultEmpty() {
            var me = this;
            me.getParam(['ulContainer', 'pagerContainer'], function(
                ulContainer, pagerContainer
            ) {
                var word = decodeURIComponent(
                    _getTemp.call(me, 'request:params').q
                ); 
                ulContainer.innerHTML 
                    = baidu.format(_templates.empty, word);
                _hideOrShow(
                    pagerContainer.parentNode,
                    'none'
                );
            });
        };

        // 隐藏/显示
        function _hideOrShow(target, flag) {
            target.style.display = flag;
        };

        // 主请求
        function _mainRequest(params, callback) {
            var me = this;
            me.getParam('url', function(url) {
                // console.log(url.main + '?' + _getQueryStr(params, true));
                helper.requester({
                    url: url.main + '?' + _getQueryStr(params, true),
                    method: 'GET',
                    ons: function(o) {
                        // _handleMainResult.call(me, o);
                        callback.call(me, o);
                    }
                });  
            });
        };

        // 分页动作
        function _selectPage(page) {
            var me = this;
            // hash中的page发生改变
            helper.hashMonitor.set('page', page);
            // location.reload();
            // 不是内嵌页面的话，从新发起请求
            var params  = _getTemp.call(me, 'request:params');
            params.page = page;
            /*!_ISEMBED_
                && */
            _mainRequest.call(
                me,
                params,
                function(o) {
                    _renderMain.call(me, o.list);
                }
            );
            // 返回true
            return true;
        };

        // 渲染分页组件
        function _renderPager(totalNum) {
            var me = this;
            me.getParam(['pagerContainer', 'totalNumContainer'], function(
                pagerContainer, totalNumContainer
            ) {
                // 填入文字
                totalNumContainer.innerHTML = totalNum;
                // 计算总页数/当前页
                var totalPage, curr;
                curr      = _getTemp.call(me, 'pager:curr');
                totalPage = Math.ceil(totalNum / _getTemp.call(me, 'pager:size'));
                var pager = _getTemp.call(me, 'pager:needle') || helper.pager(
                    // 父容器
                    pagerContainer,
                    totalPage,
                    curr,
                    function(i) {
                        return _selectPage.call(me, i);
                    }
                );
                // 存入
                !_hasTemp.call(me, 'pager:needle') 
                    && _setTemp.call(me, 'pager:needle', pager);
                // 渲染set里面就有render函数
                pager.set(curr);
                // 显示
                _hideOrShow(
                    pagerContainer.parentNode,
                    'block'
                );
            });
        };

        // 渲染主页面
        function _renderMain(lists) {
            var me = this;
            me.getParam('ulContainer', function(
                ulContainer
            ) {
                var s = '';
                for(var i = 0, len = lists.length; i < len; i ++) {
                    s += baidu.format(
                        _templates.resultLi,
                        _getIcon(lists[i].type, lists[i].fileType),
                        lists[i].url,
                        lists[i].title,
                        lists[i].size,
                        _getProduct(lists[i].productid),
                        // _cut(lists[i].content)
                        // 先不进行剪切了
                        lists[i].content
                    );
                }
                ulContainer.innerHTML = s;
            });
        };

        // 截取内容
        function _cut(content) {
            return helper.cutString(
                content,
                configs.contentLen
            );
        };

        // 得到产品名称
        function _getProduct(productid) {
            return _ISEMBED_ ? '' : ('【' + _products[productid] + '】');
        };

        // 得到icon样式
        function _getIcon(type, fileType) {
            if(type == 0)
                return _icons.other;
            if(type == 1)
                return _icons.explain;
            if(type == 3)
                return _icons.text;
            // 剩余的判断fileType
            return _icons[fileType];
        };

        // 得到搜索字符串
        function _getQueryStr(params, nocache) {
            var s = [];
            for(var key in params) {
                s.push(key + '=' + params[key]);
            }
            nocache
                && s.push('r=' + (+ new Date()));
            return s.join('&');
        };

        // 得到相关搜索的搜索字符串
        function _getRelatedQS(params, nocache) {
            var s = [];
            for(var key in params) {
                (key == 'q' || key == 'productid')
                    && s.push(key + '=' + params[key]);
            }
            nocache
                && s.push('r=' + (+ new Date()));
            return s.join('&');
        };

        // 返回处理过的params
        function _handleParam(params) {
            params.q = helper.encodeSearchWord(params.q);
            params.productid == 0
                && (delete params.productid);
            return params;
        };

        // 设置/获取hash值
        function _setHash(name, value) {
            var me = this;
            if(typeof name != 'string') {
                for(var key in name) {
                    arguments.callee.call(me, key, name[key]);
                }
                return;
            }
            var method = helper.hashMonitor.has(name)
                ? 'set' : 'append';
            helper.hashMonitor[method](name, value);
        };
        function _getHash(name) {
            var me = this;
            var v;
            helper.hashMonitor.get(name, function(o) {
                v = o;
            });
            return v;
        };
        
        // 简易缓存函数
        function _getTemp(name) {
            var me = this;
            return _pool[me._id][name];
        };
        function _setTemp(name, value) {
            var me = this;
            (_pool[me._id] = _pool[me._id] || {})[name] = value;
            return me;
        };
        function _hasTemp(name) {
            var me = this;
            return !!(_pool[me._id] && (_pool[me._id][name] != undefined));
        };

        // 返回构造器
        return Searcher;
    }();

    // 暴露组件
    return {
        searcher: searcher,
        searchInputer: searchInputer
    };
}();

/**
 * 应用配置
 * 
 * @type {Object}
 */
var configs = {
    pageSize: _ISEMBED_ ? 8 : 10,
    contentLen: _ISEMBED_ ? (43 * 2 * 3) : (63 * 2 * 3),
    relatedLen: 9 * 2
};
(function() {
    var pid = 0;
    _ISEMBED_ && helper.hashMonitor.get('pid', function(v) {
        pid = v;
    });
    configs.productid = pid;
})();

// 应用逻辑
var search = {
    // 添加初始化函数
    addIniter: function(initer, condition) {
        var me = this;
        // 执行条件
        if(condition != undefined 
            && !condition)
            return me;
        (me._inits = me._inits || [])
            .push(initer);
        return me;
    },
    // 总体初始化
    init: function() {
        var me = this;
        me._inits = me._inits || [];
        if(me._inits.length == 0)
            return;
        for(var i = 0, len = me._inits.length; i < len; me._inits[i ++].call(me)) {}
        return me;
    },
    // 内部容器，存放组件
    _pool: {},
    // 放入池中
    putIn: function(name, o) {
        var me = this;
        name && o 
            && (search._pool[name] = o);
        return me;
    },
    // 拿出来
    pullOut: function(name, callback) {
        var me = this;
        name && callback 
            && callback.call(me, search._pool[name]);
        return me;
    }
};

/**
 * 应用回调函数集
 * 
 * @type {Object}
 */
var callbacks = {
    // 初始化用户名回调
    initUser: function(o) {
        // 没登陆
        if(!o || o.ucid == 0)
            return; // 什么都不做
        // 登陆了
        GLO.ucName = o.ucName;
        GLO.ucid   = o.ucid;
        // 页面处理
        // 登录按钮隐藏
        doms['header-login'].style.display = 'none';
        // username填写
        doms['header-user-name'].innerHTML = GLO.ucName;
        // 显示
        doms['header-user-name'].style.display
            = doms['header-user-name-split'].style.display
            = doms['header-logout'].style.display
            = 'inline-block';
    },

    // 处理hover状态的回调
    layerHoverCall: function() {
        doms['list-a-hover'].style.fontWeight = 'bold';
    },
    layerOutCall: function() {
        doms['list-a-hover'].style.fontWeight = 'normal';
    },

    // IE8特殊处理
    productListMoreOver: function(e) {
        var ei = helper.eventFixer(e);
        if(ei.targetTagName == 'a') {
            ei.target.style.fontWeight = 'bold';
            ei.target.style.textDecoration = 'underline';
        }
    },
    productListMoreOut: function(e) {
        var ei = helper.eventFixer(e);
        if(ei.targetTagName == 'a') {
            ei.target.style.fontWeight = 'normal';
            ei.target.style.textDecoration = 'none';
        }
    },

    // 搜索按键点击
    searchButtonOnClick: function(e, inputer) {
        inputer
            .get(function(v) {
                // 得到了需要搜索的值
                search.pullOut('searcher', function(
                    searcher
                ) {
                    var params = {
                        q: v,
                        page: '1',
                        pageSize: configs.pageSize,
                        productid: configs.productid
                    };
                    searcher
                        .search(params);
                });
            })
            .closeLayer();
    },

    relatedCallBack: function(word, inputer) {
        !_ISEMBED_ && inputer.set(word);
        if(_ISEMBED_) {
            // 内嵌页面还要更改父页面的搜索框中的东西
            window
                .top
                .document
                .getElementById('searchKeywordInput')
                .value
                = word;
        }
    }
};

// 应用各种初始化
search
    // 用户名初始化
    .addIniter(function initUser() {
        var me = this;
        // 请求发起
        helper.requester({
            url: requestUrls.user,
            ons: callbacks.initUser
        });
    }, !_ISEMBED_)
    // “更多悬浮框”初始化
    .addIniter(function initHoverLayer() {
        // “更多”按钮的浮出层，ie8下的样式特殊处理
        _IE_ == 8 && (function() {
            baidu.event.on(
                doms['product-list-more'], 
                'mouseover', 
                callbacks.productListMoreOver
            );
            baidu.event.on(
                doms['product-list-more'], 
                'mouseout', 
                callbacks.productListMoreOut
            );
        })();
        // 行为初始化
        helper.hoverNextLayer(
            doms['list-a-hover'],
            doms['product-more'],
            baidu.event.on,
            {
                hover: callbacks.layerHoverCall,
                out: callbacks.layerOutCall
            }
        );
    }, !_ISEMBED_)
    // 输入框行为初始化，特性独立，会实时得将
    .addIniter(function initInputer() {
        var me = this;
        var inputer = new widget.searchInputer({
            inputer: doms['search-input'],
            suggestContainer: doms['search-suggestion-container'],
            suggestUl: doms['suggestion-list'],
            hinter: hints['101'],
            selectCallBack: function(word, inx) {
                // 这里和按钮的点击事件保持一致
                // console.log(word, inx); inx参数不靠谱
                me.pullOut('searcher', function(
                    searcher
                ) {
                    var params = {
                        q: word,
                        page: '1',
                        pageSize: configs.pageSize,
                        productid: configs.productid
                    };
                    // ie7,8下的特殊处理
                    if(_IE_ <= 8) {
                        helper.savingEnergy(
                            searcher.search,
                            [params],
                            searcher,
                            300
                        );
                    }
                    else {
                        searcher
                            .search(params);
                    }
                });
            }
        });
        // 放入容器
        me.putIn('inputer', inputer);
        // inputer初始化
        inputer.init();
        // 调试用
        /*me.pullOut('inputer', function(o) {
            window.inputer = o;
        });*/
    }, !_ISEMBED_)
    // 按钮初始化
    .addIniter(function initButton() {
        var me = this;
        baidu.event.on(
            doms['search-button'],
            'click',
            function(e) {
                var inputer;
                me.pullOut('inputer', function(o) {
                    inputer = o;
                });
                callbacks.searchButtonOnClick(e, inputer);
            }
        );
    }, !_ISEMBED_)
    // 搜索逻辑初始化（无论单独页面还是内嵌页面都需要初始化）
    .addIniter(function initSearch() {
        var me = this;
        var searcher = new widget.searcher({
            // ul容器
            ulContainer: doms['result-list'],
            // 分页容器
            pagerContainer: doms['result-pager-handler'],
            // 总数
            totalNumContainer: doms['result-pager-num'],
            // 相关搜索区域
            relatedContainer: doms['related-search'],
            // 数据请求路径
            url: {
                // 主搜索
                main: requestUrls.search,
                // 相关搜索
                related: requestUrls.related
            },
            // 点击相关搜索时候的回调
            relatedCallBack: function(word) {
                var inputer;
                me.pullOut('inputer', function(o) {
                    inputer = o;
                });
                callbacks.relatedCallBack(word, inputer);
            }
        });
        // 放入容器
        me.putIn('searcher', searcher);
        // searcher初始化
        searcher.init();
    })
    // 总体初始化
    .init();