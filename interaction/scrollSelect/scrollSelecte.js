/**
 * 左侧存在半固定定位导航列表
 * 在页面上下滚动的时候，要对应着上下选择导航栏的交互
 * 参见：http://jiankang.baidu.com/jibing
 */
define(function(require) {

    var ie = /msie (\d+\.\d+)/i.test(navigator.userAgent) 
        ? (document.documentMode || + RegExp['\x241']) 
        : undefined;

    /**
     * 控制左侧点击行为
     */
    function bindLeftClassify() {

        var ul = $( '#illnesses-left' );
        var lis = ul.find( 'li' );

        var ulRight = $( '#illnesses-right' );
        var lisTitle = ulRight.find( 'li.ill-list-title' );

        ul.delegate( 'li', 'click', function () {

            lis.removeClass( 'selected-left-nav' );
            lisTitle.removeClass( 'selected-right-nav' );

            var li = $( this );
            var id = li.attr( 'data-illcid' );

            li.addClass( 'selected-left-nav' );
            ulRight.find( '#ill-title-' + id ).addClass( 'selected-right-nav' );

            vNavSliderHandler( id, li.position() );

        } );

    }

    function vNavSliderHandler( id, position ) {

        var navTop = position.top;
        var rightTop = $( '#ill-title-' + id ).position().top;

        var top = rightTop - navTop;

        // 移动左侧的导航栏
        $( '#illnesses-left' ).animate( {
            top: top
        }, 200 );

        // 屏幕滚动
        $( window ).scrollTop( top );
        
    }

    /**
     * 绑定相关组件事件
     */
    function bindEvents() {

        bindUpTopEvent();

        // 左侧导航栏动作初始化
        window.setTimeout( function () {
            leftNavInit();
        }, 500 );

    }

    var onScroll;

    function leftNavInit() {

        var illnessesLeft = $( '#illnesses-left' );
        var indexContainer = $( '#index-container' );

        var navLis = illnessesLeft.find( 'li' );
        var contents = $( '.ill-list-desc' );

        // 导航栏的高度
        var nHeight = illnessesLeft.height();
        // 内容底端距离 -- 定值
        var contentBottomHeight = 263;
        var contentTopHeight = 213;

        // 最后一段的高度
        var lastHeight = $( '.ill-list-desc:last' ).height();
        // 底端距离
        var nBottom = contentBottomHeight + lastHeight;

        var $window = $( window );
        // 视口高度
        var wHeight = $window.height();
        // 视口宽度
        var wWidth = $window.width();

        // 获取到了被设置为fix定位时的top坐标
        var topFix = wHeight - nBottom - nHeight;
        var leftFix = ( wWidth - indexContainer.width() ) / 2;

        // 滑动到指定位置时需要重置position
        var shouldFixScrollTop = contentTopHeight - topFix;

        fixMinHeight();

        // 修正用户视口高度过小的极限情况
        function fixMinHeight() {

            shouldFixScrollTop = shouldFixScrollTop >= contentTopHeight
                ? contentTopHeight
                : shouldFixScrollTop;
            topFix = topFix >= 0
                ? topFix
                : 0;

        }

        function setFixed() {

            illnessesLeft.attr( 'data-pos-state', 'fixed' );
            illnessesLeft.css( {
                position: 'fixed',
                left: leftFix,
                top: topFix
            } );

        }

        function setAbso() {

            illnessesLeft.attr( 'data-pos-state', 'absolute' );
            illnessesLeft.css( {
                position: 'absolute',
                left: 0,
                top: 42
            } );

        }

        var compareHeights;
        var selected = {};

        function resetSlected( compareHeights ) {

            var scrollTop = $window.scrollTop();
            // 重置选择
            for ( var inx in compareHeights ) {
                if ( scrollTop >= compareHeights[ inx ].low
                    && scrollTop <= compareHeights[ inx ].high ) {
                    navLis.removeClass( 'selected-left-nav' );
                    $( '#left-li-' + inx ).addClass( 'selected-left-nav' );
                }
            }

        }

        onScroll = function ( isResize ) {

            var scrollTop = $window.scrollTop();
            // 更新状态
            if ( isResize || !compareHeights ) {
                compareHeights = getHeights();
            }

            resetSlected( compareHeights );

            if ( scrollTop >= shouldFixScrollTop ) {

                // ie6 奇葩
                if ( ie == 6 ) {
                    illnessesLeft.css( {
                        top: 42 + scrollTop - shouldFixScrollTop
                    }, 100 );
                    return;
                }

                if ( illnessesLeft.attr( 'data-pos-state' ) == 'fixed' 
                    && !isResize )
                    return; 
                setFixed();

            }
            else {

                if ( illnessesLeft.attr( 'data-pos-state' ) == 'absolute' 
                    && !isResize )
                    return; 
                setAbso();

            }

        }

        function getHeights() {

            var heights = {};
            var old = 0;
            var len = contents.length;
            contents.each( function ( index ) {

                var item = $( this );

                // 第一个和最后一个的滚动数值范围要扩展
                heights[ index + 1 ] = {
                    low: ( index == 0 ? 0 : shouldFixScrollTop )  + old,
                    high: index == len - 1
                        ? 9999999
                        : ( shouldFixScrollTop + item.height() + old )
                    // high: ( shouldFixScrollTop + item.height() + old )
                };

                old += item.height();

                ie <= 7 && ( old -= 4 );

            } );

            return heights;

        }

        illnessesLeft.delegate( 'li', 'click', function () {

            var li = $( this );
            var id = li.attr( 'data-illcid' );
            var scrollLow = compareHeights[ id ].low;
            $( window ).scrollTop( scrollLow );
            navLis.removeClass( 'selected-left-nav' );
            li.addClass( 'selected-left-nav' );

        } );

        $window.bind( 'resize', function () {
            // 重新计算
            topFix = $window.height() - nBottom - nHeight;
            leftFix = ( $window.width() - indexContainer.width() ) / 2;
            shouldFixScrollTop = contentTopHeight - topFix;

            fixMinHeight();
            onScroll( true );

        } );

        $window.bind( 'scroll', onScroll );

    }


    /**
     * 节流函数
     * @param {Function} method 需要节流的函数 
     * @param {Array} args 传入参数列表
     * @param {Object} context 执行上线文
     * @param {Number} delay 执行delay
     */
    function throttle(method, args, context, delay) {
        context = context == undefined ? null : context;
        method.tId && clearTimeout(method.tId);
        method.tId = setTimeout(function() {
            method.apply(context, args);
        }, (delay ? delay : 140));
    };

    /**
     * 重置left的左侧目录fixed位置
     */
    function resetPosition() {

        var target = $( '#illnesses-left' );
        var top    = 42;

        function reset() {
            var scrollTop = lib.getScrollTop();
            // 更新target位置
            target.animate( {
                top: top + scrollTop
            }, 180 );
        }

        function callback() {
            throttle( reset, [], target, 150 );
        }

        $( window )
            .bind( 'scroll', callback )
            .bind( 'load', callback );

    }

    /**
     * 详情中有好几行的，画出分割线
     */
    function drawnLine() {

        var descs = $( '.ill-list-desc-container' );

        descs.each( function () {

            var desc = $( this );
            var height = desc.height();
            var per = 48;

            if( height <= per )
                return;

            var count = parseInt( height / per );
            count = count - 1;

            for ( var i = 0; i < count; i ++ ) {
                desc.append( '<span class="li-desc-split" style="top:' 
                    +  (( i + 1 ) * per - 2)
                    + 'px"></span>' );
            }

        } );

    }

    /**
     * 重置左侧的选中状态
     */
    function resetLeft( id ) {

        if ( id == undefined ) {
            var hash = window.location.hash;
            if ( !hash ) {
                return;
            }
        }

        id = id == undefined 
            ? hash.substring( 2 )
            : id;
        var ul = $( '#illnesses-left' );
        var lis = ul.find( 'li' );

        lis.removeClass( 'selected-left-nav' );
        $( '#left-li-' + id ).addClass( 'selected-left-nav' );

    }

    function removeFocus() {

        $( 'a' ).attr( 'hidefocus', 'hidefocus' );

    }

    var before;
    function initClick() {

        $( '#illnesses-right' )
            .delegate( '.ill-href', 'click', function () {

                if ( before ) {
                    before.removeClass( 'selected-ill-href' );
                }

                var thisA = $( this );
                before = thisA;

                var id = thisA.attr( 'data-cid' );
                resetLeft( id );

                thisA.addClass( 'selected-ill-href' );

            } );

    }


    return {

        /**
         * 页面加载完以后会调用
         */
        loadHandler: function () {

            var hash;
            if ( hash = window.location.hash ) {
                window.location.hash = '';
                window.location.hash = hash;
            }
            resetLeft();
            drawnLine();
            removeFocus();
            initClick();

        },

        /**
         * 初始化页面
         */
        init: function() {

            // 待首屏渲染完毕显示所有页面
            $(document.body).removeClass('hide');

            //绑定相关事件
            bindEvents();
        },

        waitScroll: function () {
            var me = this;
            var timer = window.setInterval( function() {
                if ( !onScroll ) 
                    return;
                onScroll();
                window.clearTimeout( timer );
            }, 50 );
        }
    };

});