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

    /**
     * 创建Button click交互，切换button的背景图
     * @param  {HTMLElement} target 目标元素
     * @param  {Object} pos 图片的位置坐标信息
     * @param  {string} pos.md mousedown以后的图片坐标，例如('-73px -52px')
     * @param  {string} pos.mu mouseup以后的图片坐标（即初始坐标），例如('-123px -52px')
     * @param  {Object} calls 回调函数集
     * @param  {Function} calls.md mousedown之后的回调函数
     * @param  {Function} calls.mu mouseup之后的回调函数
     */
    N.interactive.buttonClick = function(target, pos, calls) {
        var mouseDown = function(e) {
            target.style.backgroundPosition = pos.md;
            calls && calls.md && calls.md.call(target);
        };
        var mouseUp   = function(e) {
            target.style.backgroundPosition = pos.mu;
            calls && calls.mu && calls.mu.call(target);
        };
        // 这里的baidu.event.on是为事件加载器，视情况而不同
        baidu.event.on(target, 'mousedown', mouseDown);
        baidu.event.on(target, 'mouseup', mouseUp);
        baidu.event.on(target, 'mouseout', mouseUp);
    };
})();