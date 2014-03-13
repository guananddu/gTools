/**
 * @file 新疾病首页
 * @author guanwei01(guanwei01@baidu.com)
 */

define( function ( require ) {

    var util = require( 'asset/js/util' );
    var ajax = require( 'commonDir/ajax' );

    var log = require( 'commonDir/ui/log' );
    var logRespect = require( 'commonDir/logRespect' );
    var logList = require( './indexLogs' );

    var antis = require( 'asset/js/antis' );

    // 按科室查找
    var illByDivision = require( './illByDivision' );
    // 按部位查找
    var illByPart = require( './illByPart' );
    
    /**
     * 页面初次加载完成后，日志初始化
     */
    function logInit() {

        // 首屏展现日志
        log.send({
            act: 'pv_index',
            url: location.href
        });

    }

    /**
     * 当季热搜词初始化
     * 
     * @type {Object} 当季热搜词相关操作对象
     */
    var illBySearch = function () {

        // 需要在这个作用域下声明
        var headerContainer; 
        var listContainer;
        var spans;

        var template = {

            // 列表
            list: [

                '<p>',
                    '<a class="title" href="${titleLink}" target="_blank" ',
                        'title="${title}">${titleCut}</a>',
                    '<a class="hosp" href="${hospitalLink}" target="_blank" ',
                        'title="${hospital}">${hospitalCut}</a>',
                '</p>'

            ].join( '' ),

            // 查看更多
            more: '<a class="more" href="${detailLink}" target="_blank">'
                + '查看<em>${curr}</em>疾病全部信息&gt;&gt;</a>',

            // 列表容器
            listCon: '<div class="list-con">${list}</div>'

        };

        /**
         * 请求并且渲染list
         * 
         * @param  {string} key 当前的疾病名称
         */
        function render( key ) {

            key = $.trim( key );

            // 更改全局变量
            global.currIllBySearch = key;
            key = ( key );

            ajax.get( {

                url: global.ajaxIllBySearch,
                data: {
                    key: key
                },

                onsuccess: function ( res ) {
                    if ( res.status == 0 ) {
                        if ( !res.data 
                            || !res.data.articles ) {
                            // clearList();
                            return;
                        }
                        refresh( res.data );
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
         * 重新刷新这个区域
         * 
         * @param  {Objecy} data 后端的响应数据
         */
        function refresh( data ) {

            var list = '';
            for ( var i = 0, len = data.articles.length; i < len; i ++ ) {
                list += util.format(
                    template.list,
                    data.articles[ i ]
                );
            }

            list = util.format(
                template.listCon,
                { list: list }
            );

            list += util.format(
                template.more,
                {
                    detailLink: data.detail,
                    curr: global.currIllBySearch
                }
            );

            listContainer.html( list );

            afterRender( data.signTime );

        }

        /**
         * 每次渲染完列表都需要运行此函数
         * 
         * @param {number} signTime 计费
         */
        function afterRender( signTime ) {

            // 日志
            logRespect( logList.illBySearch );

            // 反作弊
            antis.illBySearch( signTime );

        }

        return {

            /**
             * 行为初始化
             */
            init: function () {

                headerContainer || (
                    headerContainer = $( '#right-header' )
                );

                listContainer || (
                    listContainer = $( '#right-body' )
                );

                spans || (
                    spans = headerContainer.find( 'span' )
                );

                var me = this;
                // 事件绑定
                me.bindEvent();

                // 第一次请求
                render( global.currIllBySearch );

            },



            /**
             * 点击事件代理
             */
            bindEvent: function () {

                var me = this;

                headerContainer.delegate(
                    'em.show',
                    'click',

                    /**
                     * 点击热搜词的时候触发
                     *
                     * @event
                     */
                    function () {
                        var the = $( this );
                        var curr = the.attr( 'data-text' );

                        if ( the.parent().hasClass( 'selected' ) )
                            return;

                        spans.removeClass( 'selected' );
                        the.parent().addClass( 'selected' );

                        render( curr );
                    }
                );

            }

        };
    }();

    return {

        init: function () {

            // 当季热搜疾病初始化
            illBySearch.init();

            // 按部位查找
            illByPart.init();

            // 按科室查找初始化
            illByDivision.init();

            // 日志相关
            logInit();

            // hunter
            require( 
                [ 'asset/js/hunter' ], 
                function ( hunter ) {
                    new hunter().hunt( pageInfo.key );
                } 
            );

        }

    };

} );
