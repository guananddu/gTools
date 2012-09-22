<?php

ini_set("error_reporting", "E_ALL & ~E_NOTICE");

/* 如果通过get方式获得了"type"键名的特殊变量，则返回一个相应数据 */
function getSpecialValOfTheTypeFromStr($typeText, $responseText){
	if($_GET['type'] && $_GET['type'] == $typeText){
		exit($responseText);
	}
};

/* 如果通过post方式获得了"type"键名的特殊变量，则返回一个相应数据 */
function postSpecialValOfTheTypeFromStr($typeText, $responseText){
	if($_POST['type'] && $_POST['type'] == $typeText){
		exit($responseText);
	}
};

/* 如果通过get方式获得了"type"键名的特殊变量，则调用一个回调函数，此回调函数可以返回数据 */
function getSpecialValOfTheTypeFromFunc($typeText, $callBack){
	if($_GET['type'] && $_GET['type'] == $typeText){
		exit($callBack());
	}
};

/* 如果通过post方式获得了"type"键名的特殊变量，则调用一个回调函数，此回调函数可以返回数据 */
function postSpecialValOfTheTypeFromFunc($typeText, $callBack){
	if($_POST['type'] && $_POST['type'] == $typeText){
		exit($callBack());
	}
};

/* 如果通过get方式获得了某个键名的特殊变量，则调用一个回调函数，此回调函数可以返回数据 */
function getSpecialValOfTheTypeFromFuncFromKey($key, $value, $callBack){
	if($_GET[$key] && $_GET[$key] == $value){
		exit($callBack());
	}
};

/* 如果通过post方式获得了某个键名的特殊变量，则调用一个回调函数，此回调函数可以返回数据 */
function postSpecialValOfTheTypeFromFuncFromKey($key, $value, $callBack){
	if($_POST[$key] && $_POST[$key] == $value){
		exit($callBack());
	}
};

/* 生成指定格式的json数据 */
function createJson($from, $to, $step, $ColArr){
	$arr    = array();
	$tArray = array();
	for($i = $from; $i <= $to; $i += $step){
		foreach ($ColArr as $key => $value) {
			$tArray[$key] = $value($i);
		}
		array_push($arr, $tArray);
	}
	$temp = array('status' => 200, 'errorCode' => array('message' => ''), 'data' => $arr);
	return json_encode($temp);
};
/*下面是使用方法*/
/*echo createJson(1, 100, 2, array('abc' => function($i){
	return $i * 2;
}, 'cde' => function($i){
	return $i * 5;
}));*/
//通过Chrome浏览器上传纯粹的文件流方式测试
getSpecialValOfTheTypeFromFunc('upload', function(){
	sleep(1.5);
	$filename = 'test.png';
	$file = fopen($filename, "w");//打开文件准备写入
	fwrite($file, $GLOBALS["HTTP_RAW_POST_DATA"]);//写入
	fclose($file);//关闭
	return '{"status":200,"data":"http://www.naoidu.comsdckajsdjs/renamsssssssssssssssssssssssssssssssssssssexxxxxxxxx33333333xasdasdsads.png"}';
});