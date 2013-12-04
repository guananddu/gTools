define( function ( require ) {

    return {

        /**
         * 创建hover交互
         * @param {Object} opt 参数对象
         * @param {string} opt.trigger trigger的selector
         * @param {string} opt.target  target的selector（注意，target是包含在trigger里面的）
         * @param {Object} opt.initialState target的默认初始状态，如：{ bottom: 0 }
         * @param {Object} opt.afterState target执行动作后的状态，如：{ bottom: '155px' }
         * @param {number} opt.delay 动画开始的延迟时间（毫秒），默认100
         * @param {number} opt.duration 动画持续时间（毫秒），默认100
         */
        hoverInteraction: function ( opt ) {

            // 动画开始的延迟时间（毫秒）
            var delay = opt.delay || 100;
            // 动画时间
            var duration = opt.duration || 100;

            $( opt.trigger ).hover( over, out );

            function realOver() {
                var target = $( this ).find( opt.target );
                target.animate( opt.afterState, duration );
            }

            function realOut() {
                var target = $( this ).find( opt.target );
                target.animate( opt.initialState, duration );
            }

            function over() {
                var me = this;

                if ( me.outTimer ) {
                    window.clearTimeout( me.outTimer);
                    me.outTimer = null;
                    return;
                }

                me.overTimer = window.setTimeout( function () {
                    realOver.call( me );
                    window.clearTimeout( me.overTimer );
                    me.overTimer = null;
                } , delay );
            }

            function out() {
                var me = this;

                if ( me.overTimer ) {
                    window.clearTimeout( me.overTimer);
                    me.overTimer = null;
                    return;
                }

                outTimer = window.setTimeout( function () {
                    realOut.call( me );
                    window.clearTimeout( outTimer );
                    outTimer = null;
                } , delay );
            }

        }

    };

} );