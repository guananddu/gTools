/**
 * 高亮关键词
 *
 * @param opt
 * @param opt.container string 要高亮的区块ID
 * @param opt.words Object 需要高亮的单词信息，结构：{ "$word": "$repeat", ... }
 *        opt.wrapper string 需要用什么结构包装起来，默认：'<em class="hl">#</em>'
 */
 function highlight( opt ) {

    opt.container = typeof opt.container == 'string'
        ? document.querySelector( '#' + opt.container )
        : opt.container;

    opt.wrapper = opt.wrapper || '<em class="hl">#</em>';

    function createNI () {
        return document.createNodeIterator(
            opt.container,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function( node ) {
                    if ( ! /^\s*$/.test( node.data ) ) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                }
            },
            false
        );
    };

    // var nodeIterator = createNI();

    var helper = {
        regs: { },
        times: { },
        oks: { }
    };

    for ( var item in opt.words ) {
        helper.regs[ item ] = new RegExp( '(' + item + ')', 'g' );
        helper.times[ item ] = 0;
        helper.oks[ item ] = 0;
    }

    // 拿一个就成
    function createWord () {
        for ( var key in opt.words ) {
            return key;
            break;
        }
        return null;
    }

    var w;
    while ( w = createWord() ) {
        wrapper( w );
    }

    function wrapper ( word ) {
        var node;
        var nodeIterator = createNI();
        while ( node = nodeIterator.nextNode() ) {
            if ( helper.oks[ word ] )
                break;
            var temp = node.data;
            var itemtimes = ( temp.match( helper.regs[ word ] ) || [ ] ).length;
            helper.times[ word ] += itemtimes;
            if ( + helper.times[ word ] >= ( + opt.words[ word ] ) ) {

                var offset = itemtimes - ( helper.times[ word ] - opt.words[ word ] );
                helper.oks[ word ] = 1;
                delete opt.words[ word ];
                var tempArr = temp.split( word );
                var newdata = '';
                for ( var i = 0, len = tempArr.length; i < len - 1; i ++ ) {
                    var append = ( i == ( offset - 1 )  )
                        ? ( opt.wrapper.replace( '#', word ) )
                        : ( word );
                    newdata += ( tempArr[ i ] + append );
                }
                if ( tempArr[ tempArr.length - 1 ] != '' )
                    newdata += tempArr[ tempArr.length - 1 ];
                var tmpfg;
                // 兼容问题
                try {
                    var range = document.createRange();
                    tmpfg = range.createContextualFragment( newdata );
                } catch( e ) {
                    var replaced = opt.wrapper.replace( '#', word );
                    var polyArr = newdata.split( replaced );
                    tmpfg = document.createDocumentFragment();
                    var tmpdiv = document.createElement( 'div' );
                    tmpdiv.innerHTML = replaced;
                    polyArr[ 0 ]
                        && tmpfg.appendChild( document.createTextNode( polyArr[ 0 ] ) );
                    tmpfg.appendChild( tmpdiv.firstChild );
                    polyArr[ 1 ]
                        && tmpfg.appendChild( document.createTextNode( polyArr[ 1 ] ) );
                }
                node.parentNode.replaceChild( tmpfg, node );
                return;
            }
        }

        // 到头了还没找到，那就直接标记为ok
        helper.oks[ word ] = 1;
        delete opt.words[ word ];
    };

}

function run() {

    var words = {
            '一': 5,
            '关键词': 6,
            '幸福': 10
        };

    console.time( 'highlight' );
    highlight( {
        container: 'content',
        words: words,
        wrapper: '<em class="hl">#</em>'
    } );
    console.timeEnd( 'highlight' );

}