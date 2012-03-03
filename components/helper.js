/**
 * helper.js GT的helper组件小库
 */
(function(){
	/**
	 * 获取GT命名空间
	 */
	var N  = eval('window.' + window.top.__$_GTNAMESPACE_$__);
	
	/**
	 * 声明组件命名空间
	 */
	N.helper = N.helper || {};
	
	/**
	 * 显示简易loading状态图
	 * @author gw
	 * @name N.helper.loading
	 * @grammar new N.helper.loading(options)
	 * @param {Object} options 生成loading图所需要的附加配置
	 *
	 * @config {String} options[imgSrc] 图片路径，默认是（images/loading/loading.gif）；
	 * @config {String|HTMLElement} options[containerId] loading图的父容器ID（或者其元素），loading会出现在中央；若不设置的话则以全屏loading的形式出现；
	 * @config {String} options[info] loading图下方的文字提示，默认为空
	 * @config {Number} options[top] loading图距离屏幕上方的位置（默认300px）
	 *
	 * @warn! 在尝试将loading图放入一个已存在的div中时，会尝试把父元素的position设置成relative；（潜在的影响）
	 */
	 
	/**
	 * 组件接口声明，需要实现的对外（或私有）方法
	 */
	var loadingInterface = new N.oo.Interface('loadingInterface', [
		'show',//显示
		'hide',//隐藏
		'_templates',//提供绘制模板
		'_styleFix'//样式微调
	]);
	
	N.helper.loading     = function(options){
		options          = options || {};
		this.imgSrc      = options.imgSrc || 'images/loading/loading.gif';
		this.containerId = options.containerId || '';
		this.info        = options.info || 'Loading';
		this.top         = options.top || 300;
		
		this.container   = (this.containerId != '') ? N.dom.checkIsDom(this.containerId) : document.body;
	};
	N.helper.loading.prototype = {
		_templates : function(){
			var me    = this;
			var _top;
			if(!me.containerId){
				//没有设置父元素
				_top  = N.browser.ie <= 6 ? (
					N.browser.isStrict ? (document.documentElement.scrollTop + me.top) : (document.body.scrollTop + me.top)
				) : 0;
			}else{
				_top  = '50%';
			}
			return {
				_body_css  : 'position:absolute; top:' + _top + (me.containerId ? '' : 'px') + '; left:50%; z-index:1000;',
				_innerHTML : '<img id="_gtLoadingImage" src="' + me.imgSrc + '" />' +
							 '<br />' +
							 '<span id="_gtLoadingSpan" style="display:inline-block; font-weight:normal; font-size:90%;">' + 
								me.info + 
							 '</span>'
			};
		},
		_styleFix : function(){
			var me = this;
			var _gtLoadingImage             = me._loadingEle.getElementsByTagName('img')[0];
			var _gtLoadingSpan              = me._loadingEle.getElementsByTagName('span')[0];
			var _fixMarginLeft              = function(){
				_gtLoadingSpan.offsetWidth > _gtLoadingImage.offsetWidth ? (
					_gtLoadingImage.style.marginLeft  = (
						(_gtLoadingSpan.offsetWidth - _gtLoadingImage.offsetWidth) / 2 + 'px'
					)
				) : (
					_gtLoadingSpan.style.marginLeft   = (
						(_gtLoadingImage.offsetWidth - _gtLoadingSpan.offsetWidth) / 2 + 'px'
					)
				);
				if(me.containerId){
					me._loadingEle.style.marginTop    = (
						- me._loadingEle.offsetHeight / 2 + 'px'
					);
				}
			};
			
			me._loadingEle.style.marginLeft           = (
				- me._loadingEle.offsetWidth / 2 + 'px'
			);
			_gtLoadingImage.onload                    = function(){
				_fixMarginLeft();
				return;
			};
		},
		show : function(){
			var me = this;
			var newElement           = document.createElement('DIV');
			newElement.id            = '_gtLoadingContainer';
			if(N.browser.ie <= 6){
				//IE6特殊处理
				if(me.containerId)
					me.container.style.position = 'relative';
				newElement.style.cssText = me._templates()._body_css;
			}else{
				//非IE6
				if(!me.containerId){
					//没有设置父元素
					N.style.setAsHeader(newElement, {top: me.top, left: '50%'});	
				}else{
					me.container.style.position = 'relative';
					newElement.style.cssText    = me._templates()._body_css;
				}
			}
			newElement.innerHTML     = me._templates()._innerHTML;
			me.container.appendChild(newElement);
			
			me._loadingEle           = newElement;
			me._styleFix();
		},
		hide : function(){
			var me = this;
			me.container.removeChild(me._loadingEle);
		}
	};
	
	/**
	 * 验证组件“类”实现情况
	 */
	N.oo.Interface.ensureClass(N.helper.loading, loadingInterface);
	
	
	/**
	 * 生成全屏遮罩
	 * @author gw
	 * @name N.helper.masker
	 * @grammar new N.helper.masker(options)
	 * @param {Object} options 生成全屏遮罩时所需要的附加配置
	 *
	 * @config {Number} options[opacity] 设置透明度（默认20），取值为0-100
	 * @config {String} options[color] 设置遮罩颜色（默认#333）
	 * @config {Number} options[zIndex] 设置纵向优先级数目（默认100）
	 */
	 
	/**
	 * 组件接口声明，需要实现的对外方法
	 */
	var maskerInterface = new N.oo.Interface('maskerInterface', [
		'show',//显示
		'hide'//隐藏
	]);
	
	N.helper.masker     = function(options){
		options         = options || {};
		this.opacity    = options.opacity || 20;
		this.color      = options.color   || '#333';
		this.zIndex     = options.zIndex  || 100;
	};
	N.helper.masker.prototype = {
		show : function(){
			/**
			 * 私有方法，得到当前用户的网页可视区高度和宽度，以px为单位
			 */
			var _getHW  = function(){
				//非IE
				if(window.innerHeight)
					return {height: window.innerHeight, width: window.innerWidth};
				//IE
				var ele = N.browser.isStrict ? document.documentElement : document.body;
				return {
					height: ele.clientHeight,
					width : ele.clientWidth
				};
			};
			/**
			 * 私有方法，创建css
			 */
			var _createCss = function(color, opacity, zIndex){
				var _css   = [
					"background-color:" + color,
					"opacity:"          + opacity / 100,
					"filter:"           + "alpha(opacity=" + opacity + ")",
					"z-index:"          + zIndex,
					"display:"          + "block",
					//"height:"			+ _getHW().height + 'px',使用这种模式，在最大化最小化时可能出问题，还是使用100%形式的吧
					//"width:"			+ _getHW().width + 'px'
					"height:"			+ "100%",
					"width:"			+ "100%"
				];
				return _css.join(';');
			};
			return function(){
				var me  = this;
				var ele = document.createElement('DIV');
				me._ele = ele;
				ele.id  = me._id  = '_gtMaskerId';
				ele.style.cssText = _createCss(
					me.color,
					me.opacity,
					me.zIndex
				);
				N.style.setAsHeader(ele, {top: 0, left: 0});
				//挂载
				document.body.appendChild(ele);
			}
		}(),
		hide : function(){
			var me      = this;
			document.body.removeChild(me._ele);
		}
	};
	
	/**
	 * 验证组件“类”实现情况
	 */
	N.oo.Interface.ensureClass(N.helper.masker, maskerInterface);
})();