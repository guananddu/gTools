/**
 * array.js 数组先关操作&举例
 */
(function(){
	/**
	 * 获取GT命名空间
	 */
	var N   = eval('window.' + window.__$_GTNAMESPACE_$__);
	
	N.array = {};

	/*
	 * 一种可以提高循环效率的方法，倒序遍历，同步模式
	 */
	N.array.reverseFor = function(arr, handler){
		for(var i = arr.length; i --;){
			// 传入三个参数，当前数组项的值，索引，原始数组
			handler(arr[i], i, arr);
		}
	};

	/*
	 * Duff's Device 经典实现，同步模式，目的是减少迭代次数
	 */
	N.array.duffDevFor = function(arr, handler){
		var length     = arr.length;
		// 下舍入
		var times      = Math.ceil(length / 8),
			start      = length % 8,
			inx        = 0;

		do{
			switch(start){
				case 0 : handler(arr[inx ++], inx - 1, arr);
				case 7 : handler(arr[inx ++], inx - 1, arr);
				case 6 : handler(arr[inx ++], inx - 1, arr);
				case 5 : handler(arr[inx ++], inx - 1, arr);
				case 4 : handler(arr[inx ++], inx - 1, arr);
				case 3 : handler(arr[inx ++], inx - 1, arr);
				case 2 : handler(arr[inx ++], inx - 1, arr);
				case 1 : handler(arr[inx ++], inx - 1, arr);
			}
			start = 0;//归位
		}while(-- times)
	};

	/*
	 * 优化后的 Duff's Device，同步模式，目的是减少迭代次数
	 */
	N.array.duffDevBetFor = function(arr, handler){
		var length    = arr.length;
		var inx       = 0;
		// 余数循环
		var remainder = length % 8;
		while(remainder){
			handler(arr[inx ++], inx - 1, arr);
			remainder --;
		}
		// 主循环
		var times     = Math.floor(length / 8);
		while(times){
			handler(arr[inx ++], inx - 1, arr);
			handler(arr[inx ++], inx - 1, arr);
			handler(arr[inx ++], inx - 1, arr);
			handler(arr[inx ++], inx - 1, arr);
			handler(arr[inx ++], inx - 1, arr);
			handler(arr[inx ++], inx - 1, arr);
			handler(arr[inx ++], inx - 1, arr);
			handler(arr[inx ++], inx - 1, arr);
			times --;
		}
	};

	/**
	 * 异步迭代器
	 * 
	 * @param {Object} opt
	 *
	 * @param {Number} opt.from 起始数字
	 * @param {Number} opt.to 结束数字（可正可负，为负的时候，step相应的也是复数）
	 * @param {Number} opt.step 每一次迭代的步子大小
	 * @param {Number} opt.iterate 在每一次interval之中，迭代多少次，默认是1次
	 * @param {Number} opt.interval 时间间隔，毫秒记
	 * @param {Function} opt.stepCallback 每一此迭代处理的调用函数，会传入每次迭代的index
	 * @param {Function} opt.finalCallBack 全部结束后的回调函数，传入最后一次迭代的index
	 */
	N.array.asyncFor = function(
		/*{from : , to : , step : , iterate : , interval : , stepCallback : , finalCallBack : }*/
		opt
	){
		var from      = opt.from,
			to        = opt.to,
			iterate   = opt.iterate || 1,
			positive  = opt.step > 0,
			over      = false;
			beStop    = function(){
				// 等于-1的时候，条件不满足
				return positive ? (
					from == to ? 1 : from > to ? 0 : -1
				) : (
					from == to ? 1 : from < to ? 0 : -1
				);
			};
		// 第一次调用
		main();
		var timer = window.setInterval(function(){
			main();
		}, opt.interval);
		// 主循环体
		function main(){
			// 如果第一次调用main就已经全部执行完的话，在下次清除timer
			if(over){
				window.clearInterval(timer);
				return;
			}
			while(iterate){
				var temp  = beStop();
				if(!(temp == -1)){
					// 结束条件满足
					window.clearInterval(timer);
					// 如果from == to，需要调用一次stepCallback
					if(temp == 1)
						if(opt.stepCallback)
							opt.stepCallback(from);
					if(opt.finalCallBack)
						opt.finalCallBack(
							temp == 0 ? (from -= opt.step) : from
						);
					over = true;
					// 跳出循环
					break;
				}
				if(opt.stepCallback)
					opt.stepCallback(from);
				from += opt.step;
				iterate --;
			}
			// 归位
			iterate = opt.iterate || 1;
		};
	};
})();