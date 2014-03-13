<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>百度健康_查疾病</title>

    {include file="../common/conf.tpl" module="illness"}
    <link href="{$common_host}/css/main.less" rel="stylesheet/less" />

    <link href="{$module_host}/css/newindex.less" rel="stylesheet/less" />
    <link href="http://www.baidu.com/favicon.ico" rel="shortcut icon" />
</head>

<body class="{if $isIframe}health-in-iframe{/if}">
    {include file="../common/header.tpl" moduleType="illness"}

    <div class="main">
        <div class="container">
            
            <!-- 按人群 -->
            <div class="ill-by-people">
                <div class="header">
                    <span class="header-title">
                        按人群  查疾病
                    </span>
                    <span class="header-text">
                        当季热搜疾病
                    </span>
                </div>
                <div class="body">
                    <div class="body-left result-op" data-click='{ldelim}"mod":"content_illbype_left"{rdelim}'>
                        {foreach from=$tplData.illByPeople item=illByPeople name=illByPeople}
                            <div class="left-item">
                                <div class="item-header">
                                    <span class="header-icon icon-{$smarty.foreach.illByPeople.index}"></span>
                                    <span class="header-title">
                                        {$illByPeople.classify|escape}常见疾病
                                    </span>
                                </div>
                                <div class="item-body">
                                    {foreach from=$illByPeople.illness item=illness name=illness}
                                        <a data-click='{ldelim}"act":"a_illbype_left","rsv_currcls":"{$illByPeople.classify|escape}"{rdelim}' href="{$illness.link}" target="_blank">
                                            {$illness.name|escape}
                                        </a>
                                    {/foreach}
                                </div>
                            </div>
                        {/foreach}
                        <span class="h-split"></span>
                        <span class="v-split"></span>
                    </div>
                    <div class="body-right result-op" data-click='{ldelim}"mod":"content_illbype_right"{rdelim}'>

                        <div id="right-header" class="right-header">
                            {foreach from=$tplData.illBySearch item=illBySearch name=illBySearch}
                                <span {if $smarty.foreach.illBySearch.index == 0} class="selected"{/if}>
                                    <em data-click='{ldelim}"act":"b_illbyse_chanill"{rdelim}' data-text="{$illBySearch|escape}" class="show OP_LOG_BTN">
                                        {$illBySearch|escape}
                                    </em>
                                    <em class="hidden">
                                        {$illBySearch|escape}
                                    </em>
                                </span>
                            {/foreach}
                        </div>

                        <div id="right-body" class="right-body"></div>

                    </div>
                </div>
            </div>

            <!-- 按部位 -->
            <div class="ill-by-part">
                <div class="header">
                    <span class="header-title">
                        按部位  查疾病
                    </span>
                    <span class="header-text">
                        点击对应的身体部分，搜索相关疾病信息
                    </span>
                </div>
                <div class="body">
                    <div id="human-container" class="human-container result-op" data-click='{ldelim}"mod":"content_illbypa_human"{rdelim}' >
                    </div>
                    <div class="info-container">
                        <div class="info-header"><span id="info-ill-name"></span>部位 常见疾病</div>
                        <div class="info-body">
                            <div id="info-ill" class="info-ill result-op" data-click='{ldelim}"mod":"content_illbypa_infoill"{rdelim}'>
                            </div>
                            <div id="info-tabs" class="info-tabs result-op" data-click='{ldelim}"mod":"content_illbypa_infotabs"{rdelim}'>
                                {$scrollBarPrefix = 'ill-scrollbar'}
                                <div id="{$scrollBarPrefix}" class="{$scrollBarPrefix}">
                                    <div class="{$scrollBarPrefix}-track">
                                        <i id="{$scrollBarPrefix}-thumb" class="{$scrollBarPrefix}-thumb"></i>
                                    </div>
                                    
                                    <div class="{$scrollBarPrefix}-panel">
                                        <div id="{$scrollBarPrefix}-content-main">
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 按科室 -->
            <div class="ill-by-division">
                <a name="idvmock" id="idvmock"></a>
                <div class="header">
                    <span class="header-title">
                        按科室  查疾病
                    </span>
                    <span class="header-text">
                        根据医院科室分类，搜索相关疾病知识
                    </span>
                </div>
                <div class="body">
                    <div id="filters-container" class="filters result-op" data-click='{ldelim}"mod":"select_illbydiv"{rdelim}'>
                    </div>
                    <div id="list-container" class="list">
                        <div id="list-left" class="list-item list-left result-op" data-click='{ldelim}"mod":"content_illbydiv_left"{rdelim}'></div>
                        <div id="list-right" class="list-item list-right result-op" data-click='{ldelim}"mod":"content_illbydiv_right"{rdelim}'></div>
                    </div>
                </div>
            </div>

            <!-- 按科室找疾病的分页 -->
            <div id="ill-by-division-pager" class="ill-by-division-pager result-op" data-click='{ldelim}"mod":"others_illbydiv_pager"{rdelim}'>

            </div>

        </div>
    </div>

    <div id="footer-nav"></div>

    {include file="../common/widgets.tpl"}

    <script type="text/javascript">

        /**
         * 页面监控基础数据
         * 
         * @type {Object}
         */
        var LOG_DATA = {
            cat: 'illnessIndex',
            q: "{$hFormData.key|escape}"
        };

    </script>

    {include file="../common/script.tpl"}
    
    <script type="text/javascript">
        
        /**
         * 主要为ajax设置初始化参数
         * 
         * @type {Object}
         */
        var pageInfo = {
            aType: "{$aType}",
            key: "{$tplData.key}",
            signTime: "{$signTime}"
        };

        /**
         * hunter监控依赖全局变量配置
         * 
         * @type {Object}
         */
        var Hunter = { };

        /**
         * 健康全局变量
         * 
         * @type {Object}
         */
        var health = { };

        /**
         * ajax请求路径配置
         * 
         * @type {Object}
         */
        var global = {

            ajaxIllBySearch: '{$ajaxIllBySearch}',
            ajaxIllByPart: '{$ajaxIllByPart}',
            ajaxIllByDivision: '{$ajaxIllByDivision}',
            ajaxIllByDivisionDetail: '{$ajaxIllByDivisionDetail}',

            currIllBySearch: '{$tplData.illBySearch[ 0 ]|escape}'

        };

        // 页面初始化
        require( 
            [ 'asset/js/index/index' ], 
            function ( index ) {
                index.init();
            }
        );

    </script>
</body>
</html>