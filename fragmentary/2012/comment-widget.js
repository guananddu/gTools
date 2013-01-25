/**
 * 此文件主要展示一种页面通用组件的书写及组织方法
 */

center.common.widgets = function(){

    /*掺元对象方法*/
    function mixInClassFunc(proto){
        /*为目标prototype增加默认的方法*/
        /*增加验证器*/
        proto.addValidator = function(validator, isUnShift){
            var me = this;
            isUnShift ? me.validators.unshift(validator) : me.validators.push(validator);
            /*增加链式调用支持*/
            return me;
        };
        /*控件自身的验证器*/
        proto.validate = function(inx){
            var me   = this;
            var done = true;
            if(inx != undefined){
                return me.validators[inx].validate();
            }
            for(var i = 0, len = me.validators.length; i < len; i ++){
                 if(!me.validators[i].validate()){
                    done = false;
                    break;
                 }
            }
            return done;
        };
    };

    /*分类管理控件*/
    var Classify = function(){
        /*hinter, validate, get, set, validators*/
        /*私有变量*/
        var templates   = '<div id="ProductClassifyItem#{0}" class="product_classify_item">' + 
                                '<span id="ProductClassifyItemSpan#{0}" class="product_classify_item_span"></span>' +
                                '<span id="ProductClassifyItemInput#{0}" class="product_classify_item_input"></span>' +
                                '<div id="ProductClassifyItemEdit#{0}" class="product_classify_item_edit"></div>' +
                                '<div id="ProductClassifyItemSave#{0}" class="product_classify_item_save"></div>' +
                                '<div id="ProductClassifyItemCancel#{0}" class="product_classify_item_cancel"></div>' + 
                                '<span id="ProductClassifyItemHinter#{0}" class="product_classify_item_hinter"></span>'
                          '</div>';
        /*构造函数*/
        var constructor = function(inx){
            this.inx    = inx;
            /*初始化验证器*/
            this.validators = [];
            /*记录老值*/
            this.olderValue = '';
            /*设置id*/
            this.id         = '';
        };
        /*掺元添加方法*/
        mixInClassFunc(constructor.prototype);
        /*原型函数*/
        /*渲染*/
        constructor.prototype.renderExceptEr = function(containerHtmlElement){
            var me = this;
            containerHtmlElement.appendChild(
                center.common.funcs.getDomElement(
                    baidu.string.format(templates, [me.inx])
                )
            );
        };
        /*渲染Er组件*/
        constructor.prototype.renderEr = function(){
            var me = this;
            /*输入框*/
            me.inputer = new esui.TextInput({
                id: 'ProductClassifyItemInput' + me.inx,
                width: 170,
                height: 25,
                placeholder: center.config.hints.productClassify,
                value: ''
            });
            me.inputerContainer = baidu.dom.g('ProductClassifyItemInput' + me.inx);
            me.inputer.appendTo(me.inputerContainer);
            me.inputerOuter     = baidu.dom.g('ctrltextProductClassifyItemInput' + me.inx);
            /*为input绑定长度限制，使用了原生的控件*/
            center.common.funcs.checkForInputLength(me.inputerOuter, center.config.constants.maxproductclassifylength);
            /*编辑按钮*/
            me.editor = new esui.Button({
                id: 'ProductClassifyItemEdit' + me.inx,
                content: '编辑'
            });
            me.editorContainer = baidu.dom.g('ProductClassifyItemEdit' + me.inx);
            me.editor.appendTo(me.editorContainer);
            /*保存按钮*/
            me.saver = new esui.Button({
                id: 'ProductClassifyItemSave' + me.inx,
                content: '保存'
            });
            me.saverContainer = baidu.dom.g('ProductClassifyItemSave' + me.inx);
            me.saver.appendTo(me.saverContainer);
            /*取消按钮*/
            me.canceler = new esui.Button({
                id: 'ProductClassifyItemCancel' + me.inx,
                content: '取消'
            });
            me.cancelerContainer = baidu.dom.g('ProductClassifyItemCancel' + me.inx);
            me.canceler.appendTo(me.cancelerContainer);
            /*初始化hinter*/
            me.hinter                  = baidu.dom.g('ProductClassifyItemHinter' + me.inx);
            /*初始化此条item的container*/
            me.productClassifyItem     = baidu.dom.g('ProductClassifyItem' + me.inx);
            /*初始化显示标签*/
            me.productClassifyItemSpan = baidu.dom.g('ProductClassifyItemSpan' + me.inx);
        };
        /*追加到某元素*/
        constructor.prototype.append = function(containerHtmlElement){
            var me = this;
            me.renderExceptEr(containerHtmlElement);
            /*渲染ER组件*/
            me.renderEr();
            /*绑定事件*/
            me.giveEvent();
            /*添加验证器*/
            me.addValidator(new center.common.validator(
                    me,
                    function(v){
                        return !(center.config.regexps.isempty.test(v) || v == '');
                    },
                    center.config.hints.emptyClassify
                ));
            me.addValidator(new center.common.validator(
                    //targetWidget, regExp, hinterText, callBack
                    me,
                    center.config.regexps.chinalphanum,//中文、英文、数字，格式的验证
                    center.config.hints.wrongClassify
                ));
            me.addValidator(new center.common.validator(
                    //targetWidget, regExp, hinterText, callBack
                    me,
                    function(v){
/*                      if(v == me.olderValue)//没有改变的验证
                            return false;
                        return true;*/
                        return !(v == me.olderValue);
                    },
                    center.config.hints.metoo
                ));
            /*增加链式调用支持*/
            return me;
        };
        /*赋予事件*/
        constructor.prototype.giveEvent = function(){
            var me = this;
            /*鼠标上移*/
            function itemMouseover(e){
                /*背景色*/
                me.productClassifyItem.style.backgroundColor = '#3662A6';
                /*文字变色*/
                me.productClassifyItemSpan.style.color       = '#FFF';
                /*显示编辑框*/
                me.editorContainer.style.display             = 'inline-block';
            };
            /*鼠标移出*/
            function itemMouseout(e){
                /*背景色*/
                me.productClassifyItem.style.backgroundColor = '#FFF';
                /*文字变色*/
                me.productClassifyItemSpan.style.color       = '#000';
                /*显示编辑框*/
                me.editorContainer.style.display             = 'none';
            };
            /*点击编辑，内置动作*/
            function editorClick(e){
                /*卸载事件*/
                baidu.event.un(me.productClassifyItem, 'mouseover', itemMouseover);
                baidu.event.un(me.productClassifyItem, 'mouseout', itemMouseout);
                me.productClassifyItem.style.backgroundColor = '#FFF';
                /*隐藏编辑按钮*/
                me.editorContainer.style.display         = 'none';
                /*隐藏标签*/
                me.productClassifyItemSpan.style.display = 'none';
                /*显示输入框*/
                me.inputerContainer.style.display        = 'inline-block';
                /*显示保存和取消*/
                me.saverContainer.style.display          = me.cancelerContainer.style.display = 'inline-block';
            };
            /*点击取消*/
            function cancelerClick(e){
                /*加载事件*/
                baidu.event.on(me.productClassifyItem, 'mouseover', itemMouseover);
                baidu.event.on(me.productClassifyItem, 'mouseout', itemMouseout);
                /*显示编辑按钮*/
                me.editorContainer.style.display         = 'inline-block';
                /*显示标签*/
                me.productClassifyItemSpan.style.display = 'inline-block';
                /*隐藏输入框*/
                me.inputerContainer.style.display        = 'none';
                /*隐藏保存和取消*/
                me.saverContainer.style.display          = me.cancelerContainer.style.display = 'none';
                /*恢复老值*/
                me.inputer.setValue(me.olderValue);
                me.productClassifyItemSpan.innerHTML = me.olderValue;
            };
            /*点击保存*/
            function saverClick(){
                if(!me.validate())
                    return;
                /*通过验证，则调用自身的回调函数*/
                if(me.onsubmit)
                    me.onsubmit.call(me, me.get(), me.id, me.inx);//把值传回，自身的string值，和自身的id
            };
            /*鼠标移出*/
            baidu.event.on(me.productClassifyItem, 'mouseover', itemMouseover);
            baidu.event.on(me.productClassifyItem, 'mouseout', itemMouseout);
            /*编辑按钮的动作*/
            me.editor.onclick   = editorClick;
            /*点击取消*/
            me.canceler.onclick = cancelerClick;
            /*点击保存*/
            me.saver.onclick    = saverClick;
        };
        /*get方法*/
        constructor.prototype.get      = function(){
            var me = this;
            return baidu.string.trim(me.inputer.getValue());
        };
        /*set方法*/
        constructor.prototype.set      = function(v, id){
            var me = this;
            me.inputer.setValue(v);
            me.productClassifyItemSpan.innerHTML = v;
            me.olderValue = baidu.string.trim(v);
            /*设置自身的id*/
            me.id         = id;
            /*增加链式调用支持*/
            return me;
        };
        /*setAndBack*/
        constructor.prototype.setAndBack = function(v){
            var me = this;
            me.inputer.setValue(v);
            me.olderValue = baidu.string.trim(v);
            me.canceler.onclick();
            /*增加链式调用支持*/
            return me;
        };
        /*获取焦点*/
        constructor.prototype.setFocus = function(){
            var me = this;
            me.inputerOuter.focus();
            /*增加链式调用支持*/
            return me;
        };
        // /*验证器*/
        // constructor.prototype.validate = function(){
        //  var me   = this;
        //  var done = true;
        //  for(var i = 0, len = me.validators.length; i < len; i ++){
        //       if(!me.validators[i].validate()){
        //          done = false;
        //          break;
        //       }
        //  }
        //  return done;
        // };
        // /*增加验证器*/
        // constructor.prototype.addValidator = function(validator){
        //  var me = this;
        //  me.validators.push(validator);
        //  /*增加链式调用支持*/
        //  return me;
        // };
        return constructor;
    }();

    /*CommonInputer通用输入及其控件*/
    var CommonInputer = function(){
        /*构造函数*/
        var constructor = function(opts){
            // esui inputer
            this.inputer      = esui.util.get(opts.inputer) || null;
            // real inputer
            this.inputerOuter = baidu.dom.g(opts.inputerOuter ? opts.inputerOuter : opts.inputer);
            // hinter
            this.hinter       = baidu.dom.g(opts.hinter);
            // maxlength
            this.maxlength    = opts.maxlength || 100000;
            // 以上的四个是需要在使用的时候初始化的
            // 以下是本身应该有的属性
            // 自身的验证器们
            this.validators   = [];
            this.noFocus      = opts.noFocus;
            this.onBlur       = opts.onBlur;
        };
        /*掺元增加方法*/
        mixInClassFunc(constructor.prototype);
        /*特殊原型方法*/
        constructor.prototype.get = function(){
            var me = this;
            return baidu.string.trim(me.inputer.getValue());
        };
        constructor.prototype.set = function(v){
            var me = this;
            me.inputer.setValue(baidu.string.trim(v));
            // 设置原始值
            me.oldValue = baidu.string.trim(v);
            return me;
        };
        constructor.prototype.reset = function(){
            var me = this;
            me.set('');
            return me;
        };
        constructor.prototype.setFocus = function(){
            var me = this;
            me.inputerOuter.focus();
            return me;
        };
        // 添加外部回调函数
        constructor.prototype.addCallBack = function(func){
            var me = this;
            func.call(me, me.inputer);
            return me;
        };
        /*初始化*/
        constructor.prototype.init = function(){
            var me = this;
            /*添加最长字数限制*/
            if(me.maxlength)
                center.common.funcs.checkForInputLength(me.inputerOuter, me.maxlength);
            /*特殊情况*/
            if(me.noFocus){
                delete me.setFocus;
            }
            if(me.onBlur){
                me.inputer.onblur = function(){
                    me.validate.call(me);
                };
            }
            return me;
        };
        /*返回构造函数*/
        return constructor;
    }();

    /*新建产品文档，选择分类的动作*/
    var ClassifySelecter = function(){
        /*自己的两个私有属性*/
        /*var v1 = 0, v2 = '';*///默认初始化的时候，分类选择“请选择分类”
        var classifySelectorCache = {};
        var editFlag     = false;//是否编辑模式
        var constructor  = function(opts){
            /*分类*/
            this.classifySelector = esui.get(opts.classifySelector) || null;
            /*位置*/
            this.posSelector      = esui.get(opts.posSelector) || null;
            /*hinter*/
            this.hinter           = baidu.dom.g(opts.hinter);
            /*自身的验证器*/
            this.validators       = [];
            /*记录老值*/
            this.olderValueId     = '';
        };
        /*掺元增加方法*/
        mixInClassFunc(constructor.prototype);
        constructor.prototype.get = function(){
            var me = this;
            // 返回一个使用冒号分隔的值
            return me.classifySelector.getValue() + ':' + me.posSelector.getValue();
        };
        constructor.prototype.set = function(v1, v2){
            var me = this;
            // 首先设置分类
            try{
                me.classifySelector.setValue(v1);
                /*记录已选id*/
                me.olderValueId = v1;
            }catch(e){
                console.warn("Can't Find Class's Value!");
            }
            me.classifySelectorOnChange.call(me, v1, null, function(v){
                // 在位置设置成功后，再进行位置的选择
                try{
                    me.posSelector.setValue(v2);
                }catch(e){
                    console.warn("Can't Find Pos's Value!");
                }
            });
            return me;
        };
        constructor.prototype.clearCache = function(){
            var me = this;
            // 复原
            classifySelectorCache = {};
            editFlag = false;
            return me;
        };
        constructor.prototype.reset = function(){
            var me = this;
            me.set(0);
            return me;
        };
        // 正在编辑
        constructor.prototype.edit = function(){
            var me   = this;
            editFlag = true;
            return me;
        };
        // onchange事件
        constructor.prototype.classifySelectorOnChange = function(v, item, callBack){
            var me = this;
            // 如果撤销选择
            if(v == 0){
                me.posSelector.datasource = center.config.constants.initPosition;
                me.posSelector.setValue(1);
                me.posSelector.disable();
                return;
            }
            // 先检查 classifySelectorCache
            if(classifySelectorCache[v]){
                // 调用私有方法
                _setPosSelector.call(me, classifySelectorCache[v], v);
                // 判断是否拥有回调函数，有的话调用回调
                if(callBack)
                    callBack.call(me, classifySelectorCache[v]);
                return;
            }
            // 请求此分类下有多少个产品，使用普通get方式
            center.common.funcs.requester({
                url   : center.config.urls.checkForClassifyProNum,
                data  : {
                    id: v
                },
                ons   : function(o){
                    classifySelectorCache[v] = o;
                    // 设置位置selector
                    _setPosSelector.call(me, classifySelectorCache[v], v);
                    // 判断是否拥有回调函数，有的话调用回调
                    if(callBack)
                        callBack.call(me, classifySelectorCache[v]);
                }
            });
        };
        /*初始化*/
        constructor.prototype.init = function(isEdit){
            var me = this;
            // 是否正在编辑
            editFlag = isEdit ? isEdit : false;
            /*onchange事件*/
            me.classifySelector.onchange = function(v, item){
                // 更改this绑定
                me.classifySelectorOnChange.call(me, v, item);
            };
            return me;
        };
        /*设置自身的私有方法*/
        // 设置位置selector
        function _setPosSelector(count, v){
            var me         = this;
            var datasource = [];
            var len   = (editFlag && v == me.olderValueId) ? count : (count + 1);
            for(var i = 1; i <= len; i ++){
                datasource.push({
                    name: i,
                    value: i
                });
            }
            me.posSelector.datasource = datasource;
            me.posSelector.render();
            // 原先选择的是最大值，改成选择1
            // me.posSelector.setValue(len);
            me.posSelector.setValue(1);
            me.posSelector.enable();
        };
        return constructor;
    }();

    /*上传图片处理类*/
    var ImageUploader = function(){
        //私有属性

        /*私有方法，不可以访问实例*/
        //上传图片
        var _uploadImage  = function(url, file, imgInfo, succCallBack, failCallBack){
            failCallBack  = failCallBack || function(){};
            var xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);//同步模式会引起浏览器卡顿，所以使用异步
            //Set a few headers so we know the file name in the server
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.setRequestHeader("X-File-Name", imgInfo.name);
            xhr.setRequestHeader("X-File-Type", imgInfo.type.substring(imgInfo.type.lastIndexOf('/') + 1));
            function stateChangeHandler(){
                if (xhr.readyState == 4) {
                    try {
                        var stat = xhr.status;
                    } catch (ex) {
                        failCallBack(xhr, xhr.status);
                        return;
                    }
                    if ((stat >= 200 && stat < 300)
                        || stat == 304
                        || stat == 1223) {
                        succCallBack(xhr, xhr.responseText);
                    } else {
                        failCallBack(xhr, xhr.status);
                    }
                }
            };
            xhr.onreadystatechange = stateChangeHandler
            //Initiate upload
            xhr.send(file);
        };
        //获取图片相信信息，依赖于对象FileReader，新型浏览器支持，在获取成功以后会调用回调函数
        var _getImageInfo  = function(file, callBack){
            var img;
            function createImage(){
                img        = document.createElement('img');
                img.onload = imageLoaded;
                img.style.display = 'none'; // If you don't want it showing
                img.src    = fr.result;
                document.body.appendChild(img);
            };
            function imageLoaded() {
                //调用回调函数
                callBack({
                    /*name  : file.fileName || file.name,
                    size    : file.fileSize || file.size,
                    type    : file.type,*/
                    width   : img.width,
                    height  : img.height
                });
                // This next bit removes the image, which is obviously optional
                // to do something with it!
                img.parentNode.removeChild(img);
                img = undefined;
            };
            fr = new FileReader();
            fr.onload = createImage;
            fr.readAsDataURL(file);
        };
        /*构造器*/
        var constructor = function(opts){
            // 可视按钮
            this.button = esui.get(opts.button);
            // 隐藏的文件上传框
            this.fileInput     = baidu.dom.g(opts.fileInput);
            // 文件名称描述父框，默认隐藏
            this.descContainer = baidu.dom.g(opts.descContainer);
            // 文件名称写入目标
            this.descText      = baidu.dom.g(opts.descText);
            // 删除按钮
            this.descDel       = baidu.dom.g(opts.descDel);
            // hinter
            this.hinter        = baidu.dom.g(opts.hinter);
            // image info
            this.imgInfo       = opts.imgInfo;
            // url
            this.uploadUrl     = opts.uploadUrl;
            // 回调函数，成功放回图片的回调函数，会把图片url写入参数
            this.onsuccess     = opts.onsuccess;
            // 回调函数，删除图片之后的回调函数
            this.ondel         = opts.ondel;
            // 回调函数，设置图片路径以后的回调
            this.onset         = opts.onset;
            // 本身的值，简单的url值
            this.value         = '';
            // 本身的整体信息值
            this.allInfo       = {};
            // 对外的验证器
            this.validators    = [];
            // 自己的内部验证器
            this._validators   = [];
            // 默认格式错误的时候的提示语，可以在实例化的时候改变
            this.wrongFormatHint = opts.wrongFormatHint || center.config.hints.wrongFormatOfImage;
        };
        /*掺元增加方法*/
        mixInClassFunc(constructor.prototype);
        /*原型方法*/
        constructor.prototype.init = function(){
            var me = this;
            // fileInput的change事件
            baidu.event.on(me.fileInput, 'change', function(e){
                // 调用私有方法
                _fileInputOnChange.call(me, e);
            });
            // 删除事件
            baidu.event.on(me.descDel, 'click', function(e){
                me.resetDesc.call(me);
                // 调用回调函数
                if(me.ondel)
                    me.ondel.call(me);
            });
            // 为自身添加验证器
            _addValidator.call(me, new center.common.validator(
                me,
                function(v){
                    //格式判断
                    return baidu.array.contains(me.imgInfo.format, v.allInfo.type);
                },
                me.wrongFormatHint,
                function(){
                    me.clearFileInputer.call(me);
                    if(me._hasShowDesc)
                        me.showDesc();
                },
                function(){
                    if(me._hasShowDesc)
                        me.hideDesc();
                }
            ));
            _addValidator.call(me, new center.common.validator(
                me,
                function(v){
                    //大小判断
                    return v.allInfo.size <= me.imgInfo.maxSize;
                },
                baidu.string.format(center.config.hints.tooBigOfImage, [
                    center.common.funcs.unitTransformer(me.imgInfo.maxSize, 'B', 0)
                ]),
                function(){
                    me.clearFileInputer.call(me);
                    if(me._hasShowDesc)
                        me.showDesc();
                },
                function(){
                    if(me._hasShowDesc)
                        me.hideDesc();
                }
            ));
            _addValidator.call(me, new center.common.validator(
                me,
                function(v){
                    //尺寸判断
                    return (
                        v.allInfo.width == me.imgInfo.maxWidth && v.allInfo.height == me.imgInfo.maxHeight
                    );
                },
                baidu.string.format(center.config.hints.wrongPxOfImage, [
                    me.imgInfo.maxWidth,
                    me.imgInfo.maxHeight
                ]),
                function(){
                    me.clearFileInputer.call(me);
                    if(me._hasShowDesc)
                        me.showDesc();
                },
                function(){
                    if(me._hasShowDesc)
                        me.hideDesc();
                }
            ));
            return me;
        };
        /*比较特殊的get方法*/
        constructor.prototype.get  = function(){
            var me = this;
            return {
                value: me.value,//设置成功以后的url链接值
                allInfo: me.allInfo//图片的所有信息
            };
        };
        constructor.prototype.set  = function(value){
            var me   = this;
            me.value = value;
            me.setDesc(value);
            if(me.onset)
                me.onset.call(me, me.value);
            return me;
        };
        constructor.prototype.reset  = function(){
            var me   = this;
            me.resetDesc();
            return me;
        };
        constructor.prototype.hideDesc = function(){
            var me = this;
            me.descContainer.style.display = 'none';
            return me;
        };
        constructor.prototype.showDesc = function(){
            var me = this;
            me.descContainer.style.display = 'inline-block';
            return me;
        };
        /*获取扩展名称，暂时没用到*/
        constructor.prototype.getExt = function(name){
            var me  = this;
            var ext = baidu.string.trim(
                name.substring(name.lastIndexOf('.') + 1).toLowerCase()
            );
            return ext;
        };
        /*清除input框*/
        constructor.prototype.clearFileInputer = function(){
            var me = this;
            me.fileInput.value = null;
            return me;
        };
        constructor.prototype.createDesc = function(value){
            var me = this;
            var totalName = value.substring(value.lastIndexOf('/') + 1);
            var showName  = center.common.funcs.cutString(totalName, center.config.constants.maxImageShowNameLength);
            return {
                total: totalName,
                show: showName
            };
        };
        /*设置显示*/
        constructor.prototype.setDesc = function(value){
            var me = this;
            var descInfo                   = me.createDesc(value);
            me.descText.setAttribute('title', descInfo.total);
            me.descText.innerHTML          = descInfo.show;
            me.hinter.style.display        = 'none';
            me.descContainer.style.display = 'inline-block';
            me._hasShowDesc                = true;
            return me;
        };
        /*恢复*/
        constructor.prototype.resetDesc = function(){
            var me = this;
            me.value                       = '';
            me.descText.setAttribute('title', '');
            me.descText.innerHTML          = '';
            me.hinter.style.display        = 'inline-block';
            me.descContainer.style.display = 'none';
            me._hasShowDesc                = false;
            // 清除fileinputer
            me.clearFileInputer();
            return me;
        };
        /*私有方法，可以访问自身实例*/
        // 获取图片信息后的回调函数
        function _hasGetImageInfo(o, file){
            var me     = this;
            // 设置全值
            me.allInfo.width  = o.width;
            me.allInfo.height = o.height;
            /* o 的结构：{...}
                height: 766
                name: "big.png"
                size: 2169837
                type: "image/png"
                width: 1366
            */
            // 调用自身的_validate方法
            if(_validate.call(me)){
                // 通过验证，开始上传
                /*var _uploadImage = function(url, file, imgInfo, succCallBack, failCallBack){};*/
                me._buttonText = me.button.content;
                me.button.setContent('正在上传..');
                me.button.disable();
                _uploadImage(me.uploadUrl, file, me.allInfo, function(xhr, xhrText){
                    _uploadSucc.call(me, xhr, xhrText);
                }, function(xhr, xhrStatus){
                    _uploadFail.call(me, xhr, xhrStatus);
                });
            }
        };
        //成功
        function _uploadSucc(xhr, xhrText){
            var me   = this;
            var json = baidu.json.parse(xhrText);
            if(json.status != 200){
                alert(json.errorCode.message);
                //reset

                return;
            }
            // 设置自身的value
            me.value = json.data;
            me.setDesc(me.value);
            // 恢复button
            _resetButton.call(me);
            // 总回调函数
            if(me.onsuccess)
                me.onsuccess.call(me, me.value);
        };
        //失败
        function _uploadFail(xhr, xhrStatus){
            var me   = this;
            alert(center.config.hints.imageFailUpload);
            //reset

            // 恢复button
            _resetButton.call(me);
        };
        // 修改button
        function _resetButton(){
            var me = this;
            me.button.setContent(me._buttonText);
            me.button.enable();
        };
        // onchange
        function _fileInputOnChange(e){
            var me = this;
            if(me.fileInput.files.length == 0)
                return;
            // 文件流
            var file = me.fileInput.files[0];
            me.allInfo.name = file.name || file.fileName;
            me.allInfo.size = file.size || file.fileSize;
            me.allInfo.type = file.type || file.fileType;
            // 如果通过格式和大小的验证，开始获取图片的width，height详细信息，私有方法
            if(_validate.call(me, 0) && _validate.call(me, 1)){
                _getImageInfo(file, function(o){
                    _hasGetImageInfo.call(me, o, file);
                });
            }
        };
        // 自身的私有验证器
        /*增加验证器*/
        function _addValidator(validator, isUnShift){
            var me = this;
            isUnShift ? me._validators.unshift(validator) : me._validators.push(validator);
            /*增加链式调用支持*/
            return me;
        };
        /*控件自身的验证器*/
        function _validate(inx){
            var me   = this;
            var done = true;
            if(inx != undefined){
                return me._validators[inx].validate();
            }
            for(var i = 0, len = me._validators.length; i < len; i ++){
                 if(!me._validators[i].validate()){
                    done = false;
                    break;
                 }
            }
            return done;
        };
        return constructor;
    }();

    /*list控件*/
    /**
     *添加一个total属性，即全部的数据，在筛选时0被别的选项占用时使用  add by yangji01
     */
    var List = function(){
        var constructor = function(opts){
            /*Esui Selector Id filter，数据过滤器*/
            this.filter  = opts.filter ? esui.util.get(opts.filter) : null;
            /*Html Element Id，数据统计显示*/
            this.counter  = opts.counter ? baidu.dom.g(opts.counter) : null;
            /*Table 渲染区域Id*/
            this.tableContainer = baidu.dom.g(opts.tableContainer);
            if(!this.tableContainer)
                throw('缺少表格渲染区域！');
            /*Esui Selector Id，数据每页显示多少个*/
            this.perPageCount   = opts.perPageCount ? esui.util.get(opts.perPageCount) : null;
            /*Pager Id，分页控件父容器*/
            this.pager          = opts.pager ? baidu.dom.g(opts.pager) : null;
            this.esuiPager      = null;
            this.esuiTable      = null;
            this.totalNum       = '';// 记录总条数s
            /*自己已获取的全部数据*/
            this.dataBase       = [];
            /*当前需要渲染的数据*/
            this.renderData     = [];
            /*表头数据*/
            this.fields            = [];/*Array*/
            // 筛选器关联字段
            this.relateFilterField = '';
            // 内部存放地
            var dataBase         = [];
            this.setRealDataBase = function(dB){
                dataBase = dB;
                return this;
            };
            this.getRealDataBase = function(){
                return dataBase;
            };
            // 事件委托器
            this.eventDelegaters = {};
        };
        /*原型方法*/
        // 设置dataBase
        constructor.prototype.setDataBase = function(dataBase, page){
            var me      = this;
            me.dataBase = dataBase;
            var counter = me.dataBase.length;
            me.totalNum = counter;
            // 显示总共多少条数据&&分页
            me.setCounter(counter).setPager(page);
            // 第一次设置内部数据
            if((me.getRealDataBase()).length == 0)
                me.setRealDataBase(dataBase);
            return me;
        };
        // 显示分页
        constructor.prototype.setPager = function(page){
            var me       = this;
            var total    = Math.ceil(me.totalNum / me.perPageCount.getValue());
            if(!me.esuiPager){
                me.esuiPager = new esui.Pager({
                    total: total,
                    page: page ? (page - 1) : 0
                });
                // 放入父元素
                me.esuiPager.appendTo(me.pager);
            }else{
                me.esuiPager.total = total;
                me.esuiPager.setPage(page ? (page - 1) : 0);//恢复选择第一页
                me.esuiPager.render();
            }
            return me;
        };
        constructor.prototype.setCurrentPage = function(){
            var me = this;
            me.__currentPage__ = me.esuiPager.getPage() + 1;
            return me;
        };
        // 设置数据显示
        constructor.prototype.setCounter = function(counter){
            var me = this;
            me.counter.innerHTML = counter;
            return me;
        };
        // 设置渲染数据，改为私有方法
/*      constructor.prototype.setRenderData = function(renderData){
            var me = this;
            me.renderData = renderData;
            return me;
        };*/
        // 设置表头格式及其数据读取
        constructor.prototype.setFields = function(fields){
            var me = this;
            me.fields = fields;
            return me;
        };
        // 初始化渲染
        constructor.prototype.run = function(){
            var me = this;
            /*调用beforeRender*/
            if(me.beforeRender)
                me.beforeRender.call(me);
            // run的时候加入异步机制
            var renderTimer = window.setInterval(function(){
                // 还没准备好
                if(me.getRealDataBase().length == 0)
                    return;
                // 数据就绪
                window.clearInterval(renderTimer);
                /*渲染逻辑*/
                _realRender.call(me);
                /*赋予事件*/
                _giveEvent.call(me);
                /*调用afterRender*/
                if(me.afterRender)
                    me.afterRender.call(me);
            }, 20);
            return me;
        };
        // 特殊方法
        constructor.prototype.specialRender = function(){
            var me = this;
            /*specialRender也采用异步方式进行渲染吧*/
            // 先进行清空
            me.setRealDataBase([]);
            /*调用beforeRender*/
            if(me.beforeRender)
                me.beforeRender.call(me);
            var specialRenderTimer = window.setInterval(function(){
                if(me.getRealDataBase().length == 0){
                    // 添加删除到没有时候渲染的问题  
                    _realRender.call(me);
                    return;
                }
                window.clearInterval(specialRenderTimer);
                // 数据就绪
                // 先恢复选页及其filter
                var classify = me.filter ? me.filter.getValue() : (me.total ? me.total : 0);
                var page     = me.__currentPage__ ? me.__currentPage__ : 1;
                me.setDataBase(
                    classify == (me.total ? me.total : 0) ? me.getRealDataBase() : center.common.funcs.handleFilter(me.relateFilterField, classify, me.getRealDataBase()),
                    page
                );
                /*渲染逻辑*/
                _realRender.call(me);
                // 如果删完了。。
                if(me.renderData.length == 0){
                    me.esuiPager.setPage(me.esuiPager.total - 1);
                    //重新渲染
                    _realRender.call(me);
                }
            }, 20);
            return me;
        };
        // 设置beforeRender
        constructor.prototype.setBr = function(func){
            var me = this;
            if(func)
                me.beforeRender = func;
            return me;
        };
        // 设置afterRender
        constructor.prototype.setAr = function(func){
            var me = this;
            if(func)
                me.afterRender = func;
            return me;
        };
        // 设置筛选器关联字段名称
        constructor.prototype.setRelateFilterField = function(field){
            var me = this;
            me.relateFilterField = field;
            return me;
        };
        // 添加事件委托
        constructor.prototype.addEventDelegater = function(type, func){
            var me = this;
            me.eventDelegaters[type] = func;
            return me;
        };
        // 外部回调，在修改了realDatabase之后，需要重新渲染
        constructor.prototype.changeRealDatabaseRender = function(){
            var me       = this;
            var classify = me.filter ? me.filter.getValue() : (me.total ? me.total : 0);
            var page     = me.esuiPager.getPage() + 1;
            me.setDataBase(
                classify == (me.total ? me.total : 0) ? me.getRealDataBase() : center.common.funcs.handleFilter(me.relateFilterField, classify, me.getRealDataBase()),
                page
            );
            // 重新渲染
            _realRender.call(me);
            // 如果删完了。。
            if(me.renderData.length == 0){
                me.esuiPager.setPage(me.esuiPager.total - 1);
                //重新渲染
                _realRender.call(me);
            }
            return me;
        };
        /*私有方法*/
        // 真正的渲染
        function _realRender(){
            /*公用me*/
            var me = this;
            // 数据还没准备好的情况下不能渲染
/*          if(me.dataBase.length == 0)
                return;*/
            // 数据准备好了，可以渲染
            var perPageCount = + me.perPageCount.getValue();//每页显示多少条
            var currontPage  = me.esuiPager.getPage() + 1;//当前第几页
            var start        = perPageCount * (currontPage - 1);
            var end          = (perPageCount * currontPage - 1) + 1;
            end              = end > me.totalNum ? me.totalNum : end;
            //设置渲染数据
            _setRenderData.call(me, me.dataBase.slice(start, end));
            if(!me.esuiTable){
                me.esuiTable     = new esui.Table({
                    datasource: me.renderData,
                    fields: me.fields
                });
                me.esuiTable.appendTo(me.tableContainer);
            }else{
                me.esuiTable.datasource = me.renderData;
                me.esuiTable.render();
            }
        };
        // 赋予事件
        function _giveEvent(){
            var me = this;
            /*筛选器动作*/
            // 如果存在筛选器
            if(me.filter){
                me.filter.onchange = function(classify){
                    me.setDataBase(
                        classify == (me.total ? me.total : 0) ? me.getRealDataBase() : center.common.funcs.handleFilter(me.relateFilterField, classify, me.getRealDataBase())
                    );
                    // 重新渲染
                    _realRender.call(me);
                };
            }
            /*每页显示多少个的动作*/
            me.perPageCount.onchange = function(perPageCount){
                me.setPager();
                // 重新渲染
                _realRender.call(me);
            };
            /*设置翻页动作*/
            me.esuiPager.onchange = function(page){
                // 重新渲染
                setTimeout(function(){
                    _realRender.call(me);
                    me.setCurrentPage();
                }, 0);
            };
            /*操作的事件委托*/
            baidu.event.on(me.tableContainer, 'click', function(e){
                var eventInfo = center.common.funcs.eventFixer(e);
                if(eventInfo.targetTagName == 'a' && eventInfo.target.getAttribute('operation-target')){
                    try{
                        me.eventDelegaters[eventInfo.target.getAttribute('type')].call(me, eventInfo.target.getAttribute('rel'), me.getRealDataBase());
                    }catch(e){
                        console.warn('Not Fond : eventDelegaters.');
                    }
                    eventInfo.stopPropagation();
                    eventInfo.preventDefault();
                }
            });
        };
        // 设置渲染数据，只能私有
        function _setRenderData(renderData){
            var me = this;
            me.renderData = renderData;
        };
        return constructor;
    }();

    /*编辑器整合组件*/
    var Editor = function(){
        var constructor = function(opts){
            this.editorContainer   = baidu.dom.g(opts.editorContainer);//编辑器包含容器 HTMLElement
            this.wordCounter       = baidu.dom.g(opts.wordCounter);//当前字数 HTMLElement
            this.wordOverContainer = baidu.dom.g(opts.wordOverContainer);//字数超出父容器 HTMLElement
            this.wordOverNum       = baidu.dom.g(opts.wordOverNum);//超出多少 HTMLElement
            this.hinter            = baidu.dom.g(opts.hinter);//提示区域 HTMLElement

            // 自身的验证器
            this.validators        = [];
            this.editor            = null;
            this.nowWordNum        = 0;
        };
        /*掺元增加方法*/
        mixInClassFunc(constructor.prototype);
        /*原型方法*/
        constructor.prototype.init = function(){
            var me = this;
            /*画出编辑器*/
            me.editor = new baidu.editor.ui.Editor();
            me.editor.render(me.editorContainer);
            /*添加事件监听器*/
            me.editor.addListener('keyup', function(e){
                // 调用私有方法
                _editorOnKeyUp.call({
                    wrapedEditor: me,
                    editor: me.editor
                }, e);
            });
            return me;
        };
        /*设置一个外部可以调用的更改字数的方法*/
        constructor.prototype.wordChange = function(){
            var me = this;
            // 调用私有方法
            _editorOnKeyUp.call({
                wrapedEditor: me,
                editor: me.editor
            });
            return me;
        };
        /*比较特殊的get*/
        constructor.prototype.get  = function(){
            var me = this;
            return me.editor.getContent();
        };
        constructor.prototype.set  = function(v){
            var me = this;
            me.editor.setContent(v);
            return me;
        };
        constructor.prototype.reset  = function(){
            var me = this;
            me.set('');
            return me;
        };
        /*获取纯文本*/
        constructor.prototype.getText  = function(){
            var me = this;
            return me.editor.getContentTxt();
        };
        /*获取焦点*/
        constructor.prototype.setFocus = function(){
            var me = this;
            me.editor.focus();
            return me;
        };
        /*私有方法*/
        function _editorOnKeyUp(e){
            var me = this;
            //checkStrLength
            var nowWordNum = Math.ceil(
                center.common.funcs.checkStrLength(me.wrapedEditor.getText()) / 2
            );//取上舍入
            // 更新文字
            me.wrapedEditor.wordCounter.innerHTML = nowWordNum;
            me.wrapedEditor.nowWordNum            = nowWordNum;
            // 如果超过
            var maxLength = (me.wrapedEditor.maxLength || center.config.constants.maxEditorContentLength) / 2;
            if(nowWordNum > maxLength){
                var wordOverNum = nowWordNum - maxLength;
                me.wrapedEditor.wordOverNum.innerHTML       = wordOverNum;
                me.wrapedEditor.wordOverContainer.className = 'word_over_text_red';
                me.wrapedEditor.wordCounter.className       = 'word_count_red';
            }else{
                me.wrapedEditor.wordOverContainer.className = 'word_over_text';
                me.wrapedEditor.wordCounter.className       = 'word_count';
            }
        };
        return constructor;
    }();

    /*页面目录和内容*/
    var CatalogContent = function(){
        /*私有属性*/
        var catalogContentsCounter   = 0;//从0开始递增
        var catalogContentsContainer = [];
        /*结构*/
        /*
            {
                id: 初始默认开始都是0
                diffid: 用来区别每一个item
                cataloger: new 出来的自定义组件
                contenter: new 出来的自定义组件
            }
        */
        /*私有模板*/
        // 0: 按照counter分配的唯一不一定连续的id值；1:按照catalogContentsContainer容器数组指定的序列号，真正的序列号
        // 2: 删除按钮是否显示？
        var mainTemplate = '<div id="CatalogAndContent#{0}">' +
                                '<div class="product_form_item">' +
                                    '<label class="product_labels" for="ctrltextProductCatalog#{0}">目录[<strong>#{1}</strong>]</label>' +
                                    '<span id="ProductCatalogContainer#{0}">' +
                                        // 这里采用代码生成esui
                                        //'<input id="ProductCatalog#{0}" ui="type:TextInput;id:ProductCatalog#{0};width:283;height:28" type="text" placeholder="请输入目录名称" value=""/>' +
                                    '</span>' +
                                    '<div id="ProductCatalogDelContainer#{0}" class="product_catalog_del" rel="#{0}" #{2}>' +
                                        // 这里采用代码生成esui
                                        //'<button ui="type:Button;id:ProductCatalogDel#{0};">删除</button>' +
                                    '</div>' +
                                    '<br />' +
                                    '<span id="ProductCatalogHint#{0}" class="product_hints product_title_hint">最多填写6个汉字，只支持中文、英文、数字</span>' +
                                '</div>' +
                                '<div class="product_form_item product_content_item">' +
                                    '<label class="product_labels" for="ProductContentEditor#{0}">内容[<strong>#{1}</strong>]</label>' +
                                    '<div id="ProductContentEditor#{0}" class="content_editor"></div>' +
                                    '<div class="word_counter">' +
                                        '<span class="word_counter_num"><strong id="WordCount#{0}" class="word_count">0</strong> / 2000</span>' +
                                        '<span id="WordoOverText#{0}" class="word_over_text">&nbsp;&nbsp;&nbsp;&nbsp;已超出 <strong id="WordoOverNum#{0}">0</strong> 字</span>' +
                                    '</div>' +
                                    '<span id="ProductContentHint#{0}" class="product_hints product_title_hint"></span>' +
                                '</div>' +
                            '</div>';
        var hrSplit      = '<div class="div_content_hr"></div>';
        var constructor  = function(opts){
            this.container  = baidu.dom.g(opts.container);
            this.addButton  = esui.get(opts.addButton);
            this.maxCCnum   = opts.maxCCnum;

            this.validators = [];
        };
        /*掺元增加方法*/
        mixInClassFunc(constructor.prototype);
        constructor.prototype.init = function(){
            var me = this;
            /*先渲染第一个editor*/
            _create.call(me);
            /*事件监听*/
            // 添加
            me.addButton.onclick = function(){
                _create.call(me);
                // 别忘了滚动
                _scrollDown();
            };
            return me;
        };
        constructor.prototype.get = function(){
            var me  = this;
            // 直接从缓存数组中取值
            var temp = {};
            temp.original = me;
            temp.value    = (function(){
                var t = [];
                for(var i = 0, len = catalogContentsContainer.length; i < len; i ++){
                    t.push({
                        id: catalogContentsContainer[i].id,
                        // 直接返回转义后的值
                        catalog: encodeURIComponent(
                            // 把\转义掉
                            center.common.funcs.escapeBackslash(
                                baidu.string.trim(
                                    catalogContentsContainer[i].cataloger.get()
                                )
                            )
                        ),
                        content: encodeURIComponent(
                            // 进行一个奇特的转义，注意转义的顺序
                            center.common.funcs.escapeDQM(
                                center.common.funcs.escapeBackslash(
                                    catalogContentsContainer[i].contenter.get()
                                )
                            )
                        )
                    });
                }
                return t;
            })();
            // 还是直接返回value吧
            return temp.value;
        };
        constructor.prototype.set = function(data){
            var me     = this;
            var allNum = data.length;
            // 创建套装，在allNum大于1的时候，使用异步迭代器，等于1的时候不能使用
            if(allNum == 1){
                catalogContentsContainer[0].id = data[0].id;
                // 先decode再展示
                // catalogContentsContainer[0].cataloger.set(decodeURIComponent(data[0].catalog));
                // catalogContentsContainer[0].contenter.set(decodeURIComponent(data[0].content));
                // 直接显示
                catalogContentsContainer[0].cataloger.set(data[0].catalog);
                catalogContentsContainer[0].contenter.set(data[0].content);
                catalogContentsContainer[0].contenter.wordChange();
            }else{
                me.customFor(1, allNum - 1, 1, 20, function(inx){
                    _create.call(me);
                }, function(finalStep){
                    // 开始填充数据
                    me.customFor(0, allNum - 1, 1, 30, function(inx){
                        catalogContentsContainer[inx].id = data[inx].id;
                        // 先decode再展示
                        // catalogContentsContainer[inx].cataloger.set(decodeURIComponent(data[inx].catalog));
                        // catalogContentsContainer[inx].contenter.set(decodeURIComponent(data[inx].content));
                        // 直接显示
                        catalogContentsContainer[inx].cataloger.set(data[inx].catalog);
                        catalogContentsContainer[inx].contenter.set(data[inx].content);
                        catalogContentsContainer[inx].contenter.wordChange();
                    }, function(){});
                });
            }
            return me;
        };
        /*简易异步迭代器*/
        constructor.prototype.customFor = function(from, to, step, gap, stepCallback, callBack){
            var timer = window.setInterval(function(){
                if(from >= to){
                    window.clearInterval(timer);
                    if(callBack)
                        callBack(from);
                }
                stepCallback(from);
                from += step;
            }, gap);
        };
        /*重新定义 验证器 */
        constructor.prototype.validate = function(){
            var me    = this;
            var done  = true;
            for(var i = 0, len = catalogContentsContainer.length; i < len; i ++){
                if(!catalogContentsContainer[i].cataloger.validate() || !catalogContentsContainer[i].contenter.validate()){
                    done = false;
                    break;
                }
            }
            return done;
        };
        /*开放一个对外方法*/
        constructor.prototype.resetCatalogContentsContainer = function(){
            var me = this;
            catalogContentsCounter   = 0;
            catalogContentsContainer = [];
            return me;
        };
        /*私有方法*/
        // document body的简易滚动效果
        function _scrollDown(){
            setTimeout(function(){
                var scrollTop = document.body.scrollTop;
                var i         = 1;
                var target    = 550;
                var timer     = window.setInterval(function(){
                    if(i > target){
                        window.clearInterval(timer);
                        return;
                    }
                    document.body.scrollTop = scrollTop + i;
                    i += 50;
                }, 1);
            }, 0);
        };
        function _create(){
            var me = this;
            // 如果超多最大限制，则提示之
            if(catalogContentsContainer.length == me.maxCCnum){
                alert(baidu.string.format(
                    center.config.hints.tooMuchCC,
                    [me.maxCCnum]
                ));
                return;
            }
            // 每创建一对儿，就自增1
            catalogContentsCounter ++;
            // 插入html
            var temp = baidu.string.format(mainTemplate, [
                catalogContentsCounter,
                catalogContentsContainer.length + 1,
                _getStyle.call(me, catalogContentsCounter)
            ]);
            // 如果大于1的话要插入分隔符
            if(catalogContentsCounter > 1){
                me.container.appendChild(
                    center.common.funcs.getDomElement(hrSplit)
                );
            }
            me.container.appendChild(
                center.common.funcs.getDomElement(temp)
            );
            // 创建esui组件
            _createEsui.call(me, catalogContentsCounter);
            // 创建编辑器
            /*_createEditor.call(me, catalogContentsCounter);*/
            // 创建 cataloger组件，并且写入diffid
            var item = _createCataloger.call(me, catalogContentsCounter);
            // 创建simpleEditor组件，写入 contenter 属性
            item     = _createWrapedEditor.call(me, catalogContentsCounter, item);
            // 存入catalogContentsContainer数组
            catalogContentsContainer.push(item);
        };
        // 创建 contenter
        function _createWrapedEditor(inx, o){
            var me = this;
            o.contenter = new center.common.widgets.Editor({
                editorContainer: 'ProductContentEditor' + inx,//编辑器包含容器 HTMLElement
                wordCounter: 'WordCount' + inx,//当前字数 HTMLElement
                wordOverContainer: 'WordoOverText' + inx,//字数超出父容器 HTMLElement
                wordOverNum: 'WordoOverNum' + inx,//超出多少 HTMLElement
                hinter: 'ProductContentHint' + inx//提示区域 HTMLElement
            });
            o.contenter
                .init()
                .addValidator(new center.common.validator(
                    o.contenter,
                    function(v){
                        // 为空验证
                        return !(center.config.regexps.isempty.test(v) || v == '');
                    },
                    center.config.hints.emptyProductContent
                ))
                .addValidator(new center.common.validator(
                    o.contenter,
                    function(v){
                        // 为空验证
                        return !(
                            o.contenter.nowWordNum > center.config.constants.maxEditorContentLength / 2
                        );
                    },
                    center.config.hints.wordOverContent
                ));
            return o;
        };
        // 创建 cataloger，返回obj
        function _createCataloger(inx){
            var me   = this;
            var temp = {};
            // 设置默认id
            temp.id        = 0;
            // 设置diffid
            temp.diffid    = inx;
            temp.cataloger = new center.common.widgets.CommonInputer({
                inputer: 'ProductCatalog' + inx,
                inputerOuter: 'ctrltextProductCatalog' + inx,
                hinter: 'ProductCatalogHint' + inx,
                maxlength: center.config.constants.maxproductcataloglength/*,
                // 特殊情况
                noFocus: false,
                onBlur: false*/
            });
            temp.cataloger
                .init()
                .addValidator(new center.common.validator(
                    temp.cataloger,
                    function(v){
                        // 为空的验证
                        return !(center.config.regexps.isempty.test(v) || v == '');
                    },
                    center.config.hints.emptyProductCatalog
                ))
                .addValidator(new center.common.validator(
                    temp.cataloger,
                    //中文、英文、数字，格式的验证
                    center.config.regexps.chinalphanum,
                    center.config.hints.wrongFormatOfPC
                ))
                .addValidator(new center.common.validator(
                    temp.cataloger,
                    // 重名验证
                    function(v){
                        // 遍历 catalogContentsContainer ，检查每个item中的 cataloger 的get() 方法的值是否有相同的
                        // 从后往前遍历
                        var repeat = false;
                        for(var i = 0, len = catalogContentsContainer.length; i < len; i ++){
                        /*for(var i = catalogContentsContainer.length - 1; i >= 0; i --){*/
                            if(catalogContentsContainer[i].diffid != inx && catalogContentsContainer[i].cataloger.get() == v){
                                repeat = true;
                                break;
                            }
                        }
                        return !repeat;
                    },
                    center.config.hints.repeatProductCatalog
                ));
            // return 回去
            return temp;
        };
        // 创建编辑器
        function _createEditor(inx){
            var me     = this;
            var editor = new baidu.editor.ui.Editor();
            editor.render(
                baidu.dom.g('ProductContentEditor' + inx)
            );
        };
        // 创建esui
        function _createEsui(inx){
            var me = this;
            // 创建输入框
            new esui.TextInput({
                id: 'ProductCatalog' + inx,
                width: 283,
                height: 28,
                placeholder: '请输入目录名称',
                value: ''
            }).appendTo(baidu.dom.g('ProductCatalogContainer' + inx));
            // 创建按钮
            var delButton = new esui.Button({
                id: 'ProductCatalogDel-' + inx,
                content: '删除'
            });
            delButton.appendTo(baidu.dom.g('ProductCatalogDelContainer' + inx));
            // 添加删除动作
            delButton.onclick = function(){
                _del.call(me, this, this.id.substring(this.id.lastIndexOf('-') + 1));
            };
        };
        // 删除动作
        function _del(esuibutton, inx){
            var me = this;
            if(!confirm(center.config.hints.delCataContent))
                return;
            // 删除htm
            var targetContainer = baidu.dom.g('CatalogAndContent' + inx);
            // 删除横线
            var hSplit          = targetContainer.previousElementSibling;
            targetContainer.parentNode.removeChild(targetContainer);
            hSplit.parentNode.removeChild(hSplit);
            // 删除数组中的关联项，寻找diffid == inx的项
            for(var i = 0, len = catalogContentsContainer.length; i < len; i ++){
                if(catalogContentsContainer[i].diffid == inx){
                    // 找到i了
                    catalogContentsContainer.splice(i, 1);
                    break;
                }
            };
            // 恢复数字编号
            _resetNum.call(me, catalogContentsContainer.length);
        };
        // 重设编号
        function _resetNum(length){
            var me = this;
            var allLabels = baidu.dom.query('.product_labels', me.container);
            var start     = 1;
            for(var i = 0, len = allLabels.length; i < len; i ++){
                allLabels[i].getElementsByTagName('strong')[0].innerHTML = start;
                if(i % 2 == 1)
                    start ++;
            }
        };
        function _getStyle(inx){
            return inx == 1 ? 'style="display:none;"' : '';
        };
        return constructor;
    }();

    return {
        List: List,
        Editor: Editor,
        Classify: Classify,
        ImageUploader: ImageUploader,
        CommonInputer: CommonInputer,
        CatalogContent: CatalogContent,
        ClassifySelecter: ClassifySelecter
    }
}();

/*验证器组件*/
center.common.validator = function(){
    /*返回构造函数*/
    /* targetWidget：目标控件，需要有get,set,setFocus方法;
     * regExp 验证的正则表达式，可以为函数，会把当前控件的值传入，返回true/false
     * hinter：提示器（HTMLElement），直接放到控件内部吧
     * hinterText：错误的时候
     * callBack：一个回调函数
     * 
     * 每一个targetWidget可能会绑定多个validator，放在自己的validators属性中；
     * 每一个targetWidget都要拥有set，get方法，同时要有hinter属性，指向自己的提示框HTMLDocument
     * 每一个targetWidget都要有自己的validate方法，返回每一个validator验证后的结果。
     * */
    var constructor = function(targetWidget, regExp, hinterText, callBack, callFront){
        /*实例属性*/
        this.targetWidget = targetWidget;
        /*this.value        = targetWidget.get();*/
        this.value        = '';
        this.regExp       = regExp;
        this.hinterText   = hinterText;
        this.callBack     = callBack;
        this.callFront    = callFront;
    };
    /*原型方法*/
    constructor.prototype.validate = function(){
        var me = this;
        me.value = me.targetWidget.get();
        /*如果为正则表达式*/
        if(me.regExp instanceof RegExp){
            /*如果为空，取消自身对”空“的判断*/
/*          if(center.config.regexps.isempty.test(me.value) || me.value == ''){
                hinterAlert(me.targetWidget.hinter, center.config.hints.notEmpty, me.callBack);
                me.targetWidget.setFocus();
                return false;
            }*/
            /*传入的正则判断*/
            if(!me.regExp.test(me.value)){
                hinterAlert(me.targetWidget.hinter, me.hinterText, me.callBack, me.callFront);
                if(me.targetWidget.setFocus)
                    me.targetWidget.setFocus();
                return false;
            }
            /*都经过验证，返回true*/
            return true;
        }else if(me.regExp instanceof Function){
            /*如果为自定义的验证函数*/
            if(!me.regExp(me.value)){
                hinterAlert(me.targetWidget.hinter, me.hinterText, me.callBack, me.callFront);
                if(me.targetWidget.setFocus)
                    me.targetWidget.setFocus();
                return false;
            }
            /*验证成功*/
            return true;
        }else{
            return;
        }
    };
    /*私有方法*/
    function hinterAlert(hinter, notice, callBack, callFront){
        if(!!hinter.timer)
            return;
        if(callFront)
            callFront();
        var oldText     = hinter.innerHTML;
        var oldDisplay  = baidu.dom.getStyle(hinter, 'display');
        hinter.style.color      = 'red';
        hinter.style.fontWeight = 'bold';
        hinter.innerHTML        = notice;
        hinter.style.display    = 'inline-block';
        //默认5秒后复原
        hinter.timer = window.setTimeout(function(){
            hinter.style.color      = 'gray';
            hinter.style.fontWeight = 'normal';
            hinter.innerHTML        = oldText;
            if(oldDisplay == 'none')
                hinter.style.display = oldDisplay;
            delete hinter.timer;//手动删除
            if(callBack)
                callBack();
        }, 1000 * center.config.constants.maxwrongtexthinter);
    };
    return constructor;
}();