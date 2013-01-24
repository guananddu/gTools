/**
 * 创建页面交互
 */
(function () {
    /**
     * 获取GT命名空间
     */
    var N = window[__$_GTNAMESPACE_$__];

    N.interactive = N.interactive || {};
    
    /**
     * 创建hover交互
     * 
     * @param {HTMLElement} target 初始hover元素DOM 
     * @param {HTMLElement} layer 触发hover元素DOM
     * @param {Function} eventHandler 事件处理器
     * @param {Object} callbacks 两个回调函数
     * @param {Function} callbacks.hover hover后的回调
     * @param {Function} callbacks.out out后的回调
     * @return {undefined}
     */
    N.interactive.hoverNextLayer = function(target, layer, eventHandler, callbacks) {
        var hide = true;
        // 函数定义
        function addE(o, type, fun) {
            eventHandler(o, type, fun);
            // 为了链式调用
            return arguments.callee;
        };
        function showlayer(){
            hide = false;
            layer.style.display = 'block';
            callbacks
                && callbacks.hover
                && callbacks.hover();
        };
        function hidelayer(){
            hide = true;
            setTimeout(function(){
                hidelayerreal();
            }, 800);
        };
        function hidelayerreal(){
            if(hide != false){
                layer.style.display = 'none';
                callbacks
                    && callbacks.out
                    && callbacks.out();
            }
        };
        // 事件定义
        function cmouseOver(e) {
            showlayer();
            helper
                .eventFixer(e)
                .stopPropagation();
        };
        function cmouseOut(e) {
            hidelayer();
            helper
                .eventFixer(e)
                .stopPropagation();
        };
        // 事件绑定
        addE(target, 'mouseover', cmouseOver)
            (layer,  'mouseover', cmouseOver)
            (target, 'mouseout', cmouseOut)
            (layer,  'mouseout', cmouseOut);
    };
})();