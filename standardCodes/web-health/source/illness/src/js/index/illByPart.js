/**
 * @file 新疾病首页 - 按部位查找
 * @author guanwei01(guanwei01@baidu.com)
 */

define( function ( require ) {

    var util = require( 'asset/js/util' );
    var ajax = require( 'commonDir/ajax' );

    var log = require( 'commonDir/ui/log' );
    var logRespect = require( 'commonDir/logRespect' );
    var logList = require( './indexLogs' );

    var antis = require( 'asset/js/antis' );

    var ScrollBar = require( 'commonDir/ui/ScrollBar' );
    var Human = require( 'commonDir/biz/human/main' );

    /**
     * 人体模型初始化
     *
     * @type {Human}
     */
    var human = new Human({
        main: 'human-container',
        exclude: ['膝', '腹膜', '输尿管', '上肢骨'],

        /**
         * 点击人体的某一个区域
         *
         * @event
         * @see 'commonDir/biz/human/main'
         * 
         * @param {Object} data 返回点击区域相关信息
         * @param {string} data.text 点击区域的文字名称
         */
        onchange: function( data ) {

            partTarget = data.text;
            requestAll( getParams() );

        }
    });

    /**
     * 可滚动区域的css前缀设置
     * 
     * @type {String}
     */
    var scrollBarPrefix = 'ill-scrollbar';

    /**
     * 可滚动区域初始化
     * 
     * @type {ScrollBar}
     * @see 'commonDir/ui/ScrollBar'
     */
    var scrollbar = new ScrollBar( {
        // 容器
        main: $( '#' + scrollBarPrefix )[ 0 ],
        // css类名前缀
        prefix: scrollBarPrefix,
        // 滑轮速度
        wheelspeed: 0.3
    } );
    // 渲染
    scrollbar.render();

    // 下面的容器变量作为这个模块中的全局变量，需要提前声明下作用域

    /**
     * 疾病信息容器
     *
     * @type {jQuery Object}
     */
    var infoIll;

    /**
     * 疾病tab容器
     *
     * @type {jQuery Object}
     */
    var infoTabs;

    /**
     * 当前选中的target
     *
     * @type {string}
     */
    var partTarget;

    /**
     * 模版
     * 
     * @type {Object}
     */
    var template = {

        // 疾病列表
        ill: '<span title="${ill}" class="ill-span${selected}">${ill}</span>',

        // 百科文字
        wiki: [
            '<div class="ill-wiki">',
                '<a href="${moreLink}" target="_blank" class="wiki-desc">',
                    '${desc}',
                '</a>',
                '<a href="${moreLink}" target="_blank" class="wiki-more">',
                    '详情&gt;&gt;',
                '</a>',
            '</div>'
        ].join( '' ),

        // tab项
        tab: [
            '<div class="ill-tab${noMargin}">',
                '<a href="${tabLink}" target="_blank" class="tab-header">',
                    '${tab}',
                '</a>',
                '<div class="tab-body">',
                    '${articles}',
                '</div>',
            '</div>'
        ].join( '' ),

        // 文章链接
        article: [
            '<p>',
                '<a href="${titleLink}" class="item-title" target="_blank" ',
                    'title="${title}">${titleCut}</a>',
                '<a href="${hospitalLink}" class="item-hosp" target="_blank" ',
                    'title="${hospital}">${hospitalCut}</a>',
            '</p>'
        ].join( '' ),

        // 列表容器
        outer: '<div class="ill-tabs-container">${html}</div>'

    };

    /**
     * 获取请求参数
     * 
     * @param  {Object} params 请求参数/可有可无
     */
    function getParams( params ) {

        // 检查是不是有已经选择的状态
        if ( !partTarget ) {
            // 第一次请求
            params || ( params = human.getData() );
            partTarget = params.text;
        }

        return {
            target: ( partTarget )
        };

    }

    /**
     * 在切换人体部位时，请求全部数据
     * 
     * @param  {Object} params 参数
     */
    function requestAll( params ) {

        ajax.get( {

            url: global.ajaxIllByPart,
            data: params,

            onsuccess: function ( res ) {
                if ( res.status == 0 ) {
                    if ( !res.data 
                        || !res.data.frequent ) {
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
     * 渲染数据
     * 
     * @param  {Object} data 后端响应的数据
     */
    function render( data ) {

        // 渲染疾病列表
        renderFrequent( data.frequent );

        // 渲染tabs&&wiki
        renderWikiTabs( data.knowledge );

        $( '#info-ill-name' ).html( partTarget );

    }

    /**
     * 渲染疾病数据
     * 
     * @param  {Array} frequent 后端响应的疾病数据
     */
    function renderFrequent( frequent ) {

        var html = '';
        for ( var i = 0, len = frequent.length; i < len; i ++ ) {
            html += util.format( 
                template.ill, 
                { 
                    ill: frequent[ i ], 
                    selected: i == 0 ? ' selected' : ''
                 }
             );
        }

        infoIll.html( html );

        afterRenderIll();

    }

    /**
     * 渲染wiki&tabs数据
     * 
     * @param  {Object} knowledge 后端响应的数据
     */
    function renderWikiTabs( knowledge ) {

        var html = '';

        if ( knowledge.wiki 
            && knowledge.wiki.desc
            &&  knowledge.wiki.moreLink) {
            html += util.format( 
                template.wiki,
                knowledge.wiki
             );
        }

        for ( var i = 0, len = knowledge.tabs.length; i < len; i ++ ) {

            knowledge.tabs[ i ].articles 
                = getArticles( knowledge.tabs[ i ].articles );

            knowledge.tabs[ i ].noMargin = i == knowledge.tabs.length - 1
                ? ' no-margin-bottom'
                : '';

            html += util.format(
                template.tab,
                knowledge.tabs[ i ]
            );
        }

        infoTabs.html( 
            util.format( template.outer, { html: html } ) 
        );

        window.setTimeout( 

            function () {
                scrollbar.refresh();
                scrollbar.scrollTo( 'top' );
            },
            500 

        );

        afterRenderWiki( knowledge.signTime );

    }

    /**
     * 生成articles的html
     * 
     * @param  {Array} articles 文章数组
     * @return {string}         html
     */
    function getArticles( articles ) {

        var html = '';

        for ( var i = 0, len = articles.length; i < len; i ++ ) {
            html += util.format(
                template.article,
                articles[ i ]
            );
        }

        return html;

    }

    /**
     * 请求右侧数据
     * 
     * @param  {string} key 疾病名称
     */
    function requestWikiTabs( key ) {

        var params = getParams();
        params.key = ( key );

        ajax.get( {

            url: global.ajaxIllByPart,
            data: params,

            onsuccess: function ( res ) {
                if ( res.status == 0 ) {
                    if ( !res.data ) {
                        // clearList();
                        return;
                    }

                    // 单独渲染
                    renderWikiTabs( res.data );
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
     * 事件代理写在这里
     */
    function bindEvent() {

        infoIll.delegate( 
            '.ill-span',
            'click',

            /**
             * 点击某一个疾病
             *
             * @event
             */
            function () {
                var target = $( this );
                if ( target.hasClass( 'selected' ) )
                    return;
                var key = target.attr( 'title' );

                infoIll.find( '.ill-span' ).removeClass( 'selected' );
                target.addClass( 'selected' );
                
                // 单独对wiki&tabs数据进行请求
                requestWikiTabs( key );            
            }
         );

    }

    /**
     * 渲染完毕疾病列表
     * 
     * @return {[type]} [description]
     */
    function afterRenderIll() {

        logRespect( logList.infoIll );

    }

    /**
     * 渲染完右侧的tabs数据后，需要执行的
     * 
     * @param  {number} signTime 反作弊
     */
    function afterRenderWiki ( signTime ) {

        antis.ajaxIllByPart( signTime );
        logRespect( logList.infoWiki );

    }

    /**
     * 页面初始化完毕
     */
    function afterInit() {

        // 人体日志先不加，会统一来加
        // logRespect( logList.human );

    }

    return {

        /**
         * 初始化
         */
        init: function () {

            infoIll = $( '#info-ill' );
            infoTabs = $( '#' + scrollBarPrefix + '-content-main' );

            // 事件代理
            bindEvent();

            // 第一次请求所有的信息
            // requestAll( getParams() );

            afterInit();

        }

    };

} );
