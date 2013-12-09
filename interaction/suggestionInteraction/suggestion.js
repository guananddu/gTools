/**
 * 搜索框行为：当用户输入时，实时请求推荐列表
 * 推荐的结果使用浮层，浮于输入框下方
 * 用户点击键盘上下按钮，可以自由选择
 * 类似baidu首页的搜索框行为
 */

define( function ( require ) {

    // 推荐词的请求链接
    var recWordsUrl = '/Suggestion/hint';

    /**
     * 用户在输入的时候，输入字符时间间隔（即用户输入停止超过多久才会发起请求）
     * timer: 计时器
     * delay: 间隔（毫秒级）
     */
    var timer;
    var delay = 200;

    /**
     * 目标元素
     * searchQuery: input输入框（主要）
     * headerRecwords: 推荐浮层的ul元素（主要）
     * moduleType: 额外的元素（次要）
     */
    var searchQuery, headerRecwords, moduleType;

    /**
     * 上下选择相关的变量
     * unDownTarget: 已选中的li元素
     * userInput: 用户当前输入的字符串
     * isSpecialKey: 用户按下的是否是上、下、回车键
     */
    var unDownTarget, userInput, isSpecialKey = false;

    // 是否已经显示了提示浮层
    var isRecShow = false;

    // ie浏览器的判断
    var isIe = /msie (\d+\.\d)/i.test( navigator.userAgent );

    /**
     * 初始化搜索框的搜索推荐词
     */
    function initRecWords() {

        // 输入框
        searchQuery = $( '#search-query' );
        // 下拉框
        headerRecwords = $( '#header-recwords' );
        // 隐藏参数
        moduleType = $( '#moduleType' );

        function handler () {
            if ( timer ) {
                window.clearTimeout( timer );
                timer = null;
            }
            timer = window.setTimeout( searchInput , delay );
        }

        if ( isIe ) {
            handlerIe( handler );
        } 
        else {
            // 非ie使用oninput
            searchQuery.bind( 'input', handler );
        }

        // 自动处理
        searchQuery.bind( 'focus', handler );
        // 移开后，自动清除
        searchQuery.bind( 'blur', handlerBlur );

        // 点击跳转事件
        headerRecwords
            .delegate( 'li', 'click', function () {
                window.location.href
                    = $( this ).find( 'a' ).attr( 'href' );
            } )
            .delegate( 'li', 'mouseover', recLiMouseover);

        // 处理上下选择及其回车键
        searchQuery
            .bind( 'keypress', inputKeyPress )
            .bind( 'keydown', inputKeyDown );

    }

    function recLiMouseover( e ) {
        // 确定元素
        if ( !unDownTarget ) {
            unDownTarget = $( this );
        }
        else {
            // 去除样式
            unDownTarget.removeClass( 'liSelected' );
            unDownTarget = $( this );
        }
        unDownTarget.addClass( 'liSelected' );
    }

    /**
     * 设置用户点击按键类型的监控
     * @param  {Object} e 事件对象
     */
    function toggleSpecialKey( e ) {

        // 回车
        if ( e.which != 38 
            && e.which != 40
            && e.which != 13 ) {
            isSpecialKey = false;
        }
        else {
            isSpecialKey = true;
        }

    }

    function inputKeyPress( e ) {

        if ( !isRecShow )
            return;

        toggleSpecialKey( e );

        // 回车
        if ( e.which == 13 ) {

            if ( unDownTarget ) {
                unDownTarget.trigger( 'click' );
            }
            else {
                clearHinter();
                submitForm();
            }

        }

    }

    function inputKeyDown( e ) {

        if ( !isRecShow )
            return;

        toggleSpecialKey( e );

        // 上键
        if ( e.which == 38 ) {
            // 确定元素
            if ( !unDownTarget ) {
                unDownTarget = headerRecwords.find( 'li:last' )
            }
            else {
                // 去除样式
                unDownTarget.removeClass( 'liSelected' );

                unDownTarget = unDownTarget.prev( 'li' );
                if ( unDownTarget.length == 0 ) {
                    unDownTarget = null;
                }
            }
            unDownTarget && unDownTarget.addClass( 'liSelected' );
        }

        // 下键
        if ( e.which == 40 ) {
            // 确定元素
            if ( !unDownTarget ) {
                unDownTarget = headerRecwords.find( 'li:first' )
            }
            else {
                // 去除样式
                unDownTarget.removeClass( 'liSelected' );

                unDownTarget = unDownTarget.next( 'li' );
                if ( unDownTarget.length == 0 ) {
                    unDownTarget = null;
                }
            }
            unDownTarget && unDownTarget.addClass( 'liSelected' );
        }

        if ( e.which == 40 || e.which == 38 ) {

            searchQuery
                .val( 
                    unDownTarget ? unDownTarget.text() : userInput
                );

            // 可以让光标始终保持在最右边
            e.preventDefault();

        }

    }

    var blurTimer;
    function handlerBlur() {

        if ( blurTimer ) {
            window.clearTimeout( blurTimer );
            blurTimer = null;
        }
        blurTimer = window.setTimeout( clearHinter, 270 );

    }

    /**
     * IE下的交互
     * @param  {Funtion} handler 处理函数
     */
    function handlerIe( handler ) {

        var ietimer;
        var oldV = searchQuery.val();

        searchQuery.bind( 'focus', function () {
            ietimer = window.setInterval( function(){
                var newV = searchQuery.val();
                if(newV == oldV)
                    return;
                // 值发生了变化
                oldV = newV;
                handler();
            }, 30 );
        } );

        searchQuery.bind( 'blur', function () {
            window.clearInterval(ietimer);
            ietimer = null;
        } );

    }

    /**
     * 用户输入事件
     */
    function searchInput() {

        // 判断用户点击的是上下键还是其他按钮
        if ( isSpecialKey )
            return; 

        // 如果为空
        if ( /^\s*$/.test( searchQuery.val() ) ) {
            // 清空
            clearHinter();
            return;
        }

        userInput = $.trim( searchQuery.val() );

        // 生成推荐词下拉框
        renderRecWords( encodeURIComponent( 
            $.trim( searchQuery.val() ) 
        ) );

    }

    /**
     * 清空
     */
    function clearHinter() {

        headerRecwords.hide();
        window.clearTimeout( timer );
        timer = null;

        isRecShow = false;
        isSpecialKey = false;

        unDownTarget = null;

    }

    // 是否已经设置宽度
    var widthed = false;
    /**
     * 请求并生成搜索推荐词
     * @param  {string} word 用户已经输入的有效搜索词
     */
    function renderRecWords( word ) {

        var tpl = '<li><a href="${link}" target="_self">${word}</a></li>';

        /**
         * 渲染
         * @param  {Array} data 返回的数据
         */
        function render( data ) {

            if ( !data 
                || !data.length ) {
                clearHinter();
                return;
            }

            var html = '';
            for ( var i = 0, len = data.length; i < len; i ++ ) {
                html += format( tpl, data[ i ] );
            }

            if ( !widthed ) {
                headerRecwords.css( 
                    'width', 
                    $('#search-box').width() 
                        - $('#search-btn').width() 
                        + 'px' 
                );
                widthed = true;
            }

            headerRecwords
                .html( html )
                .css( 'display', 'block' );

            isRecShow = true;

        }

        var params = {
            query: word
        };

        moduleType.length > 0 
            && ( params.moduleType = moduleType.val() );

        ajax.get( {

            url: recWordsUrl,
            data: params,

            onsuccess: function ( res ) {
                if ( res.status == 0 ) {
                    render( res.data );
                    return;
                }
                clearHinter();
            },

            onfail: function () {
                clearHinter();
            },

            onalways: function () {

            }

        } );

    }


    // 暴露主方法
    return initRecWords;

} );