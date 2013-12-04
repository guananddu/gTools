define( function ( require ) {

    var util = require( './util' );

    function hoverInteraction() {

        util.hoverInteraction( {

            trigger: '.ffy-list-item',
            target: '.header-desc',

            initialState: {
                bottom: '155px'
            },
            afterState: {
                bottom: '0px'
            }

        } );

    }

    return {

        init: function () {

            // 初始化页面交互
            hoverInteraction();

        }

    };

} );