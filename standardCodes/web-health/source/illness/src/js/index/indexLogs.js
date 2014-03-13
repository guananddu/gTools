/**
 * @file 概述页和其余Tab页面的日志统计
 * @author guanwei01(guanwei01@baidu.com)
 */

define( function ( require ) {

    var commonList = require('commonDir/logList');

    // 当季热搜疾病的列表
    var illBySearch = {

        '#right-body .title': {
            act: 'a_illbyse_title'
        },

        '#right-body .hosp': {
            act: 'a_illbyse_hosp'
        },

        '#right-body .more': {
            act: 'a_illbyse_more'
        }

    };

    // 按科室查找疾病
    var illByDivisionFilters = {

        '#filters-container .filter-item': {
            act: 'b_illbydiv_filters',
            type: 'OP_LOG_BTN'
        },

        '#filters-container .filter-more': {
            act: 'b_illbydiv_filters_more',
            type: 'OP_LOG_BTN'
        }

    };

    // 整体列表
    var list = {

        '#list-container .header-text': {
            act: 'a_illbydiv_headertext'
        },

        '#list-container .header-tab': {
            act: 'a_illbydiv_headertab'
        },

        '#list-container .item-title': {
            act: 'a_illbydiv_itemtitle'
        },

        '#list-container .item-hosp': {
            act: 'a_illbydiv_itemhosp'
        }

    };

    // 分页区域
    var pager = {

        '#ill-by-division-pager a': {
            act: 'page_illbydiv'
        }

    };

    /**
     * 人体点击日志
     */
    var human = {

        '#human-container .health-human-sex-male': {
            act: 'b_illbypa_malechange',
            type: 'OP_LOG_BTN'
        },

        '#human-container .health-human-sex-female': {
            act: 'b_illbypa_femalechange',
            type: 'OP_LOG_BTN'
        },

        '#human-container .health-human-face-front': {
            act: 'b_illbypa_frontchange',
            type: 'OP_LOG_BTN'
        },

        '#human-container .health-human-face-back': {
            act: 'b_illbypa_backchange',
            type: 'OP_LOG_BTN'
        }

    };

    // 疾病信息
    var infoIll = {

        '#info-ill .ill-span': {
            act: 'b_illbypa_illspan',
            type: 'OP_LOG_BTN'
        }

    };

    // 疾病信息中的百科区域
    var infoWiki = {

        '#info-tabs a.wiki-desc': {
            act: 'a_illbypa_wikidesc'
        },

        '#info-tabs a.wiki-more': {
            act: 'a_illbypa_wikimore'
        },

        '#info-tabs a.tab-header': {
            act: 'a_illbypa_tabheader'
        },

        '#info-tabs a.item-title': {
            act: 'a_illbypa_itemtitle'
        },

        '#info-tabs a.item-hosp': {
            act: 'a_illbypa_itemhsop'
        }

    };

    return {

        list: list,
        pager: pager,

        human: human,
        infoIll: infoIll,

        infoWiki: infoWiki,

        illBySearch: illBySearch,
        illByDivisionFilters: illByDivisionFilters

    };

} );