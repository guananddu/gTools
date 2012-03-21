<?php
/**
 * gTools.php将作为gTools工具箱的PHP自动合并&&压缩工具
 *
 * 对应的配置文件则在同级目录下的gTools.xml文件
 * 调用方法：
 * 		<script src="..../gTools.php" type="text/javascript"></script>
 * 可以接受的参数（GET传值）：
 *		conf {string} (gTools default) 需要加载的配置文件名（省去扩展名），默认是gTools
 * 		type {string} [js || css] (js default) 说明合并&&压缩文件的类型
 * 		group {string} [groupid] (可以为空) 与gTools.xml中的某一个groupid相对应
 * 		engine {string} [yui || cc] (yui default) 使用的压缩引擎（YUI Compressor或者Closure Compiler）
 *      nominify {number} [1 || null(不传)] (null default) 默认情况下会自动压缩代码，若传值为1则不压缩代码
 *		nogtools {number} [1 || null] (null default) 默认情况下，在进行多文件压缩的时候会自动将gTools.js文件合并压缩，如果不需要压缩gTools.js，将此项设置为1
 *		encode {number} [1 || null] (null default) 默认不开启此功能，如果开启，则会把缓存名称进行加密，只应用于多文件合并&&压缩的时候
 *		redirect {number} [1 || null] (null default) 默认不使用重定向获取缓存内容，若设置为1，则会进行重定向，可以避免文件过大的file_get_contents
 *
 * 合并&&压缩后的重命名规则：
 *		gTools.js -> gTools.min.js;
 *      example.css -> example.min.css;
 *      one.js + two.js -> one-two.min.js;
 *      one.css + two.css -> one-two.min.css.
 *
 * Tangram 的命名规则：
 * 当导入：baidu.ajax.request, baidu.string.*时
 * 连接及其压缩后的文件是：
 * baidu.ajax.request-baidu.string.min.js
 * 即省略了.*，最后添加min.js
 *
 * 传参规则：
 * 1>若type和group这两个参数都没有传递，则直接返回gTools.js中的内容；
 * 2>type和group参数必须同时存在；
 * 3>其余的参数可以按需传递
 */
 
//设置自定义的错误处理函数
set_exception_handler('handle_exception');
//参数设置
$smasher_config_base    = 'smasher/config/';
//获取web访问路径
$a = dirname(substr(__FILE__, strpos(__FILE__, basename($_SERVER['DOCUMENT_ROOT']))));
$b = substr($a, strpos($a, DIRECTORY_SEPARATOR));
$c = $_SERVER['SERVER_NAME'] . str_replace(DIRECTORY_SEPARATOR, '/', $b);
$options = array(
    'conf'              => $smasher_config_base . 'gTools.xml',//目标配置文件（默认加载gTools.xml）
    'type'              => NULL,//文件类型（从url获得）
    'group'             => NULL,//设置xml中的目标操作组ID
	'engine'            => NULL,
	'engine-yui'        => 'bin/yuicompressor-2.4.7.jar',//默认压缩引擎
	'engine-cc'         => 'bin/compiler.jar',
    'nominify'          => NULL,//是否不压缩
	'nogtools'          => NULL,
	'encode'            => NULL,
	'redirect'          => NULL,
	//下面的几个就不用传了- -!
	'cachejssourcedic'  => 'smasher/cache/source/js/',//存放连接好的源代码
	'cachejsassetdic'   => 'smasher/cache/asset/js/',//存放最终代码
	'cachecsssourcedic' => 'smasher/cache/source/css/',
	'cachecssassetdic'  => 'smasher/cache/asset/css/',
	'javabin'           => 'C:/WINDOWS/system32/java',
	'tangram'			=> '',
	'weburl'			=> $c
);

//清除缓存
if(isset($_GET['action']) && $_GET['action'] === 'clearcache'){
	$deldir = array(
		'cachejssourcedic',
		'cachejsassetdic',
		'cachecsssourcedic',
		'cachecssassetdic'
	);
	foreach($deldir as $k => $v){
		if (is_dir($options[$v])) {
			if ($dh = opendir($options[$v])) {
				while (($file = readdir($dh)) !== false) {
					/**
					 *  echo "filename: $file : filetype: " . filetype($options[$v] . $file) . "<br />";
					 *
					 *  filename: . : filetype: dir
					 *	filename: .. : filetype: dir
					 *	filename: .svn : filetype: dir
					 *	filename: gTools-oo.min.js : filetype: file
					 */
					if(strpos($file, '.') !== 0 && 
						(substr($file, (strrpos($file, '.') + 1)) === 'js' || substr($file, (strrpos($file, '.') + 1)) === 'css')){
						unlink($options[$v] . $file);
					}
				}
				closedir($dh);
			}
		}
	}
	exit;
}

//若type和group这两个参数都没有传递，则直接返回gTools.js中的内容，单独处理
if(!isset($_GET['type']) && !isset($_GET['group'])){
	//先检查是否需要压缩
	if(isset($_GET['nominify']) && $_GET['nominify'] == 1){
		//不需压缩处理
		if(isset($_GET['redirect']) && $_GET['redirect'] == 1){
			header("Location: gTools.js");
			exit;
		}else{
			header('Content-Type: text/javascript');
			exit(file_get_contents('gTools.js'));	
		}
	}else if(!isset($_GET['nominify'])){
		//需要压缩，先检查是否存在缓存文件
		if(file_exists($options['cachejsassetdic'] . 'gTools.min.js')){
			//有缓存文件
			if(isset($_GET['redirect']) && $_GET['redirect'] == 1){
				header("Location: " . $options['cachejsassetdic'] . 'gTools.min.js');
				exit;
			}else{
				header('Content-Type: text/javascript');
				exit(file_get_contents($options['cachejsassetdic'] . 'gTools.min.js'));
			}
		}else{
			//没有缓存文件，需要压缩了
			if(!isset($_GET['engine']) || $_GET['engine'] === 'yui'){
				//使用yui压缩
				$output = shell_exec(
					$options['javabin'] . ' -jar ' . $options['engine-yui'] . ' --type js --charset utf-8 ' . escapeshellarg('gTools.js'));
			}else if($_GET['engine'] === 'cc'){
				//使用cc压缩
				$output = shell_exec(
					$options['javabin'] . ' -jar ' . $options['engine-cc'] . ' --js=' . escapeshellarg('gTools.js'));
			}
			file_put_contents($options['cachejsassetdic'] . 'gTools.min.js', $output);
			header('Content-Type: text/javascript');
			exit($output);
		}
	}
}

if (isset($_GET['conf'])){
	$options['conf'] = $smasher_config_base . $_GET['conf'] . '.xml';
}

if (!isset($_GET['type'])) {
    throw new Exception('No type specified');
} else {
    $options['type'] = $_GET['type'];
}

if (!isset($_GET['group'])) {
    throw new Exception('No group specified');
} else {
    $options['group'] = $_GET['group'];
}

if (!isset($_GET['engine']) || $_GET['engine'] === 'yui') {
    $options['engine'] = 'yui';
} else if($_GET['engine'] === 'cc'){
    $options['engine'] = 'cc';
}

if (isset($_GET['nominify']) && $_GET['nominify'] == 1){
	$options['nominify'] = TRUE;
}else if(!isset($_GET['nominify'])){
	$options['nominify'] = FALSE;
}

if (isset($_GET['nogtools']) && $_GET['nogtools'] == 1){
	$options['nogtools'] = TRUE;
}else if(!isset($_GET['nogtools'])){
	$options['nogtools'] = FALSE;
}

if (isset($_GET['encode']) && $_GET['encode'] == 1){
	$options['encode'] = TRUE;
}else if(!isset($_GET['encode'])){
	$options['encode'] = FALSE;
}

if (isset($_GET['redirect']) && $_GET['redirect'] == 1){
	$options['redirect'] = TRUE;
}else if(!isset($_GET['redirect'])){
	$options['redirect'] = FALSE;
}

require 'smasher/smasher.php';
//实例化Smasher
$smasher = new Smasher($options);
if ($options['type'] === 'css') {
    header('Content-Type: text/css');
    echo $smasher->build_css();
} else if ($options['type'] === 'js') {
    header('Content-Type: text/javascript');
    echo $smasher->build_js();
} else {
    throw new Exception('Invalid type: ' . $options['type']);
}

// -- Functions ---------------------------------------------------------------

function handle_exception(Exception $ex)
{
    header('HTTP/1.0 404 Not Found');
    header('Content-type: text/html');

    echo '<html>',
           '<head><title></title></head>',
           '<body>',
             '<h1>Smasher error</h1>',
             '<p>', htmlentities($ex->getMessage()), '</p>',
           '</body>',
         '</html>';

    exit;
}