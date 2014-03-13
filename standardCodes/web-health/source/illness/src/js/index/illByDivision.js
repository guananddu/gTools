/**
 * @file 新疾病首页 - 按科室查找
 * @author guanwei01(guanwei01@baidu.com)
 */

define( function ( require ) {

    var util = require( 'asset/js/util' );
    var ajax = require( 'commonDir/ajax' );

    var log = require( 'commonDir/ui/log' );
    var logRespect = require( 'commonDir/logRespect' );
    var logList = require( './indexLogs' );

    var antis = require( 'asset/js/antis' );

    var styleFix = require( 'asset/js/styleFix' );
    var Pager = require( 'commonDir/ui/Pager' );

    /**
     * 最初的请求参数，在操作的时候，实时的修改此参数
     * 
     * @type {Object}
     */
    var params = {
        page: 1
    };

    /**
     * 筛选器容器
     *
     * @type {jQuery Object}
     */
    var filtersContainer;

    // 下面的容器变量作为这个模块中的全局变量，需要提前声明下作用域

    /**
     * 列表容器
     *
     * @type {jQuery Object}
     */
    var listContainer;

    /**
     * 分页器容器
     *
     * @type {jQuery Object}
     */
    var pagerContainer;

    /**
     * 左侧列表容器
     *
     * @type {jQuery Object}
     */
    var listLeftContainer;

    /**
     * 右侧列表容器
     *
     * @type {jQuery Object}
     */
    var listRightContainer;

    /**
     * 展开状态记录
     * 
     * @type {Object}
     */
    var filterState = { };

    /**
     * 展开的类名
     * 
     * @type {String}
     */
    var cls = 'filter-list-open';

    /**
     * 展开文字
     * 
     * @type {String}
     */
    var openText = '展开+';

    /**
     * 折起文字
     * 
     * @type {String}
     */
    var closeText = '折起-';

    /**
     * 渲染数据分成左右两边
     * 
     * @type {Object}
     */
    var listData = {
        left: [],
        right: []
    };

    /**
     * 状态记录器
     * 
     * @type {Object}
     */
    var listDataState = {
        left: { },
        right: { }
    };

    /**
     * 状态计时器（setInterval）
     *
     * @type {number}
     */
    var stateTimer;

    /**
     * 渲染模板
     * 
     * @type {Object}
     */
    var template = {

        // 每一行过滤器
        filterList: [
            '<div class="filter-list${state}">',
                '<span class="filter-header">${name}：</span>',
                '<p class="filter-body">',
                    '${body}',
                '</p>',
                '<span data-click=\'{"act":"b_illbydiv_filters_more"}\' ',
                    'class="filter-more OP_LOG_BTN" data-state="0" ',
                    'data-short="${short}">展开+</span>',
            '</div>'
        ].join( '' ),

        // 每一个筛选项
        filterItem: '<span data-click=\'{"act":"b_illbydiv_filters"}\' '
            + 'data-name="${name}" data-short="${short}" '
            + 'class="OP_LOG_BTN filter-item${selected}">${text}</span>',

        // 每一个疾病的区块容器
        halfItem: [
            '<div id="half-${target}-item-${index}" class="half-item">',
            '</div>'
        ].join( '' ),

        // 区块中的详细html
        listItem: [
            '<div class="item-header">',
                '<a data-click=\'{"act":"a_illbydiv_headertext"}\' ',
                    'class="header-text" href="${nameLink}">${name}</a>',
                '${tabs}',
            '</div>',
            '<ul class="item-ul">${lis}</ul>'
        ].join( '' ),

        // 区块中的tab项
        listItemTabs: '<a data-click=\'{"act":"a_illbydiv_headertab"}\' '
            + 'href="${tabLink}" class="header-tab" '
            + 'target="_blank">${tab}</a>',

        // tab的分隔符
        listItemTabsSplit: '<span class="tab-split">|</span>',

        // 列表项
        listItemLi: [
            '<li${noMargin}>',
                '<a href="${titleLink}" ',
                    'data-click=\'{"act":"a_illbydiv_itemtitle"}\' ',
                    'class="item-title" target="_blank" ',
                    'title="${title}">${titleCut}</a>',
                '<a href="${hospitalLink}" ',
                    'data-click=\'{"act":"a_illbydiv_itemhosp"}\' ',
                    'class="item-hosp" target="_blank" ',
                    'title="${hospital}">${hospitalCut}</a>',
            '</li>'
        ].join( '' )

    };

    // 分页器初始化
    var pager = new Pager({

        main: $( '#ill-by-division-pager' )[ 0 ],
        page: 0, // 从 0 开始
        total: 0,
        showAlways: false,
        paddingLeft: 2,
        paddingRight: 0,
        showCount: 7,
        lang: {
            prev: '<i><< </i>上一页',
            next: '下一页<i> >></i>',
            ellipsis: '...'
        }

    });

    pager.on( 
        'change', 

        /**
         * 点击分页
         *
         * @event
         * @param {Object} e 事件对象
         * @param {number} e.page 当前页数，从0开始
         */
        function ( e ) {

            // 修改参数
            params.page = e.page + 1;
            request( params );

        } 
    );

    /**
     * 发起请求并渲染
     * 
     * @param  {Object} params 请求参数
     */
    function request( params ) {

        ajax.get( {

            url: global.ajaxIllByDivision,
            data: params,

            onsuccess: function ( res ) {
                if ( res.status == 0 ) {
                    if ( !res.data 
                        || !res.data.illness ) {
                        // clearList();
                        return;
                    }

                    // 可以渲染了
                    render( res.data );
                    return;
                }
                // clearList();
            },

            onfail: function ( res ) {
                // clearList();
            }

        } );

    }

    /**
     * 调用具体的渲染函数
     * 
     * @param  {Object} data 后端响应的数据
     */
    function render( data ) {

        // 渲染filters
        renderFilters( data.filters );

        // 渲染列表
        renderList( data.illness );

        // 渲染分页器
        renderPager( data.page, data.totalPage );

        // 修改log的分页参数
        log.config( {
            data: {
                pn: data.page
            }
        } );

    }

    /**
     * 渲染过滤器
     * 
     * @param  {Array} filters 过滤器数据
     */
    function renderFilters( filters ) {

        var html = '';
        for ( var i = 0, len = filters.length; i < len; i ++ ) {
            html += util.format(
                template.filterList,
                {
                    name: filters[ i ].name,
                    body: getBody( filters[ i ] ),
                    short: filters[ i ].short,
                    state: ( filterState[ filters[ i ].short ] != undefined 
                        && filterState[ filters[ i ].short ] == 1 )
                            ? ( ' ' + cls )
                            : ''
                }
            );
        }

        filtersContainer.html( html );

        // 填充完成，开始判断是否需要点亮“展开”按钮
        judgeOpen();

        // 渲染过滤器完毕
        afterRenderFilters();

        /**
         * 生成每个选项的html
         * @param  {Object} filter 此项过滤器信息
         */
        function getBody( filter ) {

            var html = '';
            for ( var i = 0, len = filter.items.length; i < len; i ++ ) {

                // 在这里设置一下已有参数
                if ( filter.items[ i ].selected ) {
                    params[ 'filters_' + filter.short ]
                        = encodeURIComponent( filter.items[ i ].text );
                }

                html += util.format(
                    template.filterItem,
                    {
                        name: filter.name,
                        short: filter.short,
                        text: filter.items[ i ].text,
                        selected: filter.items[ i ].selected
                            ? ' selected'
                            : ''
                    }
                );
            }

            return html;

        }

    }

    /**
     * 判断每一个过滤器是不是处于折叠隐藏状态
     */
    function judgeOpen() {

        // 没有折叠隐藏的状态下的高度
        var perHeight = 40;

        var filterBodies = filtersContainer.find( '.filter-body' );

        for ( var i = 0, len = filterBodies.length; i < len; i ++ ) {
            var the = $( filterBodies[ i ] );
            var nextMore = the.next( '.filter-more' );

            // 判断已有的文字和状态
            if ( the.height() > perHeight ) {
                // 在显示之前，要正确处理好已有状态
                if ( filterState[ nextMore.attr( 'data-short' ) ] != undefined
                    && filterState[ nextMore.attr( 'data-short' ) ] == 1 ) {
                    // 已经打开了
                    nextMore.attr( 'data-state', 1 );
                    nextMore.text( closeText );
                }
                else {
                    nextMore.attr( 'data-state', 0 );
                    nextMore.text( openText );
                }
                nextMore.show();
                continue;
            }

            nextMore.hide();
        }

    }

    /**
     * 渲染列表
     * 
     * @param  {Array} illness 疾病列表
     */
    function renderList( illness ) {

        // 复原
        listData = {
            left: [],
            right: []
        };

        // 划分
        cutIllness( illness );

        // 开始计时
        if( stateTimer ) {
            window.clearInterval( stateTimer );
            stateTimer = null;
        }

        stateTimer = window.setInterval( stateCheck , 100 );

        // 开始请求
        for ( var i = 0, len = listData.left.length; i < len; i ++ ) {
            ( function ( inx, target ) {
                requestListItem( inx, target, listData.left[ inx ] );
            } )( i, 'left' );
        }

        for ( var j = 0, lenj = listData.right.length; j < lenj; j ++ ) {
            ( function ( inx, target ) {
                requestListItem( inx, target, listData.right[ inx ] );
            } )( j, 'right' );
        }

    }

    /**
     * 不断地检查状态，直到所有的都加载完毕，调用最后的回调
     */
    function stateCheck() {

        for ( var key in listDataState ) {
            for ( var innerKey in listDataState[ key ] ) {
                if ( !listDataState[ key ][ innerKey ] ) {
                    return;
                }
            }
        }

        window.clearInterval( stateTimer );
        stateTimer = null;

        // 运行完毕代表全部加载完毕了
        afterRenderAllList();

    }

    /**
     * 请求列表中的每一个数据
     * 
     * @param  {number} inx    索引数据
     * @param  {string} target 左侧还是右侧
     * @param  {string} illness 疾病名称
     */
    function requestListItem( inx, target, illness ) {

        var dataIndex = target == 'left'
            ? ( inx * 2 + 1 )
            : ( inx * 2 + 2 );

        ajax.get( {

            url: global.ajaxIllByDivisionDetail,
            data: {
                key: ( illness ),
                // 实际的数据索引，从1开始
                index: dataIndex
            },

            onsuccess: function ( res ) {
                if ( res.status == 0 ) {
                    if ( !res.data ) {
                        // clearList();
                        return;
                    }

                    // 可以渲染了
                    renderListItem( {

                        data: res.data,
                        inx: inx,
                        target: target,
                        illness: illness

                    } );
                    return;
                }
                // clearList();
            },

            onfail: function ( res ) {
                // clearList();
            }

        } );

    }

    /**
     * 渲染每一个list中的item
     * 
     * @param  {Object} obj 参数
     * @param  {Object} obj.data 单个响应数据
     * @param  {number} obj.inx  索引
     * @param  {string} obj.target 目标id
     * @param  {illness} obj.illness 疾病名称
     */
    function renderListItem( obj ) {

        var html = '', tabHtml = [ ], liHtml = '';

        for ( var i = 0, len = obj.data.tabs.length; i < len; i ++ ) {
            tabHtml.push(
                util.format( template.listItemTabs, obj.data.tabs[ i ] )
            );
        }

        tabHtml = tabHtml.join( template.listItemTabsSplit );

        ////
        
        for ( var i = 0, len = obj.data.articles.length; i < len; i ++ ) {
            obj.data.articles[ i ].noMargin = i == obj.data.articles.length - 1
                ? ' class="no-li-margin"'
                : '';
            liHtml += util.format( 
                    template.listItemLi, 
                    obj.data.articles[ i ] 
                );
        }

        ////
        
        html = util.format( 
            template.listItem, 
            {
                name: obj.data.name,
                nameLink: obj.data.nameLink,
                tabs: tabHtml,
                lis: liHtml
            } 
        );

        // 填入
        $( '#half-' + obj.target + '-item-' + obj.inx )
            .html( html )
            .show();

        // 状态设置ready
        listDataState[ obj.target ][ obj.inx ] = true;

        afterRenderListItem( {
            signTime: obj.data.signTime,
            target: obj.target,
            inx: obj.inx
        } );

    }

    /**
     * 将疾病划分成两半，并且生成html的container
     * 
     * @param  {Array} illness 疾病列表
     */
    function cutIllness( illness ) {

        var target, html = {
            left: [],
            right: []
        };
        for ( var i = 0, len = illness.length; i < len; i ++ ) {
            target = i % 2 == 0
                ? 'left'
                : 'right';

            // 填入数据
            listData[ target ].push( illness[ i ] );

            var leng = html[ target ].length;

            // 填入html
            html[ target ][ leng ] = util.format(
                template.halfItem,
                { index: leng, target: target }
            );

            // 重置状态
            listDataState[ target ][ leng ] = false;
        }

        // 填入占位html
        listLeftContainer.html( html.left.join( '' ) );
        listRightContainer.html( html.right.join( '' ) );

    }

    /**
     * 渲染分页器
     * 
     * @param  {number} page      当前第几页
     * @param  {number} totalPage 总共多少页
     */
    function renderPager( page, totalPage ) {

        pager.setTotal( totalPage );
        pager.setPage( page - 1 );
        pager.render();

        afterRenderPager( totalPage );

    }

    /**
     * 事件绑定工厂函数
     * 
     * @return {Object} 返回方法集
     */
    var bindEvent = ( function () {

        /**
         * 加号展开的处理
         *
         * @event
         */
        function moreOpen() {

            var target = $( this );
            var attr = target.attr( 'data-state' );

            var newAttr = attr == 1 ? 0 : 1;
            var newText = newAttr == 1 ? closeText : openText;
            var method  = newAttr == 1 ? 'addClass' : 'removeClass';

            target.attr( 'data-state', newAttr );
            target.text( newText );
            target.parent()[ method ]( cls );

            // 设置状态位
            filterState[ target.attr( 'data-short' ) ] = newAttr;

        }

        /**
         * 点击某一个filter的处理
         *
         * @event
         */
        function itemClick() {

            var target = $( this );
            var shortName = target.attr( 'data-short' );
            var value = $.trim( target.text() );

            // 设置参数
            params.page = 1;
            // params.filters || ( params.filters = { } );
            // params.filters[ shortName ] = encodeURIComponent( value );
            params[ 'filters_' + shortName ]
                = encodeURIComponent( value );

            params[ 'click' ] = shortName;

            // 请求
            request( params );

        }

        return {

            /**
             * 过滤器相关的事件代理
             */
            filters: function () {

                // 展开、折叠
                filtersContainer.delegate(
                    '.filter-more',
                    'click',
                    moreOpen
                );

                // 点击某个filter
                filtersContainer.delegate(
                    '.filter-item',
                    'click',
                    itemClick
                );

            }

        };

    } )();

    /**
     * 渲染过滤器完毕，为其添加日志
     */
    function afterRenderFilters() {

        // 填充日志等内容，直接填充
        // logRespect( logList.illByDivisionFilters );

    }

    /**
     * 已经把整个列表渲染完毕了，用这个来填写列表日志
     */
    function afterRenderAllList() {

        // 重置样式
        styleFix.listEquHeight( 
            '#list-left', '#list-right', '.half-item'
        );

        // logRespect( logList.list );

    }

    /**
     * 每一项！渲染完毕，填入反作弊
     * 
     * @param  {Object} obj 参数对象
     * @param {number} obj.signTime 反作弊
     * @param {string} obj.target left/right
     * @param {number} obj.inx 索引
     */
    function afterRenderListItem( obj ) {

        antis.illByDivisionItem( obj );

    }

    /**
     * 渲染分页器完毕，判断是否需要调用logRespect
     * 
     * @param {number} totalPage 总页数
     */
    function afterRenderPager( totalPage ) {

        totalPage >= 2 && logRespect( logList.pager );

    }

    return {

        /**
         * 页面初始化
         */
        init: function () {

            // 过滤器容器
            filtersContainer = $( '#filters-container' );

            // 列表容器
            listLeftContainer  = $( '#list-left' );
            listRightContainer = $( '#list-right' );

            // 第一次请求数据
            request( params );

            // bindEvent
            bindEvent.filters();

        }

    };

} );
