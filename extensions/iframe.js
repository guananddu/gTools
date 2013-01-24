/**
 * 页面中内嵌一个iframe，里面的iframe的高度如何进行自适应调节
 */
(function() {
    /**
     * 获取GT命名空间
     */
    var N = window[__$_GTNAMESPACE_$__];

    // 如果是内嵌页面，需要根据内容设置页面高度
    // 通信1，跨域的话，这里的细节需要修改
    _ISEMBED_ && (baidu.event.on(window.top['new-search-result'], 'load', function() {
        window
            .top
            .document
            .getElementById('new-search-result')
            .style
            .height = document.body.scrollHeight + 'px';
        // 轮询iframe高度修改器
        var ov = document.body.scrollHeight;
        setInterval(function() {
            var nv = document.body.scrollHeight;
            if(ov == nv)
                return;
            ov = nv;
            window
                .top
                .document
                .getElementById('new-search-result')
                .style
                .height = document.body.scrollHeight + 'px';
        }, 150);
    }));
})();