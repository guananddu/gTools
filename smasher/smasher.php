<?php

class Smasher
{
    protected $config_xml;
	protected $type;
	protected $group;
	protected $engine;
	protected $engine_yui;
	protected $engine_cc;
	protected $nominify = NULL;
	protected $encode   = NULL;
	protected $redirect = NULL;
    protected $cachejssourcedic;
	protected $cachejsassetdic;
	protected $cachecsssourcedic;
	protected $cachecssassetdic;
    protected $root_dir   = '';
    protected $java_bin   = '';
	protected $final_name = '';

	//加载配置
    protected function load_config($config)
    {
		//读取配置文件
        $this->config_xml = @simplexml_load_file($config['conf']);
        if (!$this->config_xml) {
            throw new Exception('Cannot load config file: ' . $config);
        }
		$this->type       = $config['type'];
		$this->group      = $config['group'];
		$this->engine     = $config['engine'];
		$this->engine_yui = $config['engine-yui'];
		$this->engine_cc  = $config['engine-cc'];
		$this->nominify   = $config['nominify'];
		$this->nogtools   = $config['nogtools'];
		$this->encode     = $config['encode'];
		$this->redirect   = $config['redirect'];
		$this->cachejssourcedic  = $config['cachejssourcedic'];
		$this->cachejsassetdic   = $config['cachejsassetdic'];
		$this->cachecsssourcedic = $config['cachecsssourcedic'];
		$this->cachecssassetdic  = $config['cachecssassetdic'];
		$this->root_dir          = '';//在解析xml配置文件的时候会填充此项
		$this->java_bin          = $config['javabin'];
    }

    protected function get_group_xml($id)
    {
        $group_xml = $this->config_xml->xpath("group[@id='$id']");
        return count($group_xml) === 1 ? $group_xml[0] : NULL;
    }

    protected function concatenate($files, $type)
    {
		$temp_name = ($type === 'js') ? ($this->cachejssourcedic . $this->get_final_filename($files, $type)) : 
						($this->cachecsssourcedic . $this->get_final_filename($files, $type));
		//检查是否存在已经合并的缓存文件
		if(file_exists($temp_name)){
			return $temp_name;
		}
        $temp_file = fopen($temp_name, 'w+');

        foreach ($files as $file) {
            fwrite($temp_file, file_get_contents($file));
            fwrite($temp_file, "\n");
        }

        fclose($temp_file);
        return $temp_name;
    }

    protected function minify($file, $type)
    {
		if($this->engine === 'yui'){
			return shell_exec($this->java_bin .
				' -jar ' . $this->engine_yui .
				' --type ' . $type .
				' --charset utf-8' .
				' ' . escapeshellarg($file));
		}else if($this->engine === 'cc'){
			if($type === 'css'){
				$this->engine  = 'yui';
				return $this->minify($file, 'css');
			}
			return shell_exec($this->java_bin .
				' -jar ' . $this->engine_cc .
				' --js ' .
				escapeshellarg($file));
		}
    }

	public function get_final_filename($files, $type)
	{
		$temp = array();
		foreach($files as $k => $v){
			$_t       = strrpos($v, '/');
			$startpos = $_t === FALSE ? 0 : ($_t + 1);
			$temp[]   = substr($v, $startpos, (strrpos($v, '.') - $startpos));
		}
		$prename      = implode('-', $temp) . '.min';
		$prename      = $this->encode ? md5($prename) : $prename;
		$this->final_name = $prename . '.' . $type;
		return $this->final_name;
	}
	
    public function build_js()
    {
        $group_xml = $this->get_group_xml($this->group);
        if (!$group_xml) {
            throw new Exception('Invalid group: ' . $group);
        }
		//获取对应group的rootdir
		$this->root_dir = (string)$group_xml->attributes()->rootdir;
        $files = array();
        foreach ($group_xml->xpath("file[@type='js']") as $file) {
            $files []= $this->root_dir . ((string) $file['src']);
        }

		//判断是否连带上主文件（默认压缩）
		if($this->nogtools){
			//不需要带上主文件
		}else{
			//需要带上主文件（默认）
			array_unshift($files, 'gTools.js');
		}
        $concatenated_file = $this->concatenate($files, 'js');
		//先检查是否需要压缩
		if($this->nominify){
			//不需要
			if($this->redirect){
				header("Location: " . $concatenated_file);
				exit;
			}else{
				return file_get_contents($concatenated_file);	
			}
		}else{
			//需要，先要检查是否存在压缩后的缓存文件
			if(file_exists($this->cachejsassetdic . $this->final_name)){
				//有缓存文件
				if($this->redirect){
					header("Location: " . $this->cachejsassetdic . $this->final_name);
					exit;
				}else{
					return file_get_contents($this->cachejsassetdic . $this->final_name);
				}
			}else{
				//没有缓存文件
				$output = $this->minify($concatenated_file, 'js');
				file_put_contents(($this->cachejsassetdic . $this->final_name), $output);
				return $output;
			}
		}
    }

    public function build_css()
    {
        $group_xml = $this->get_group_xml($this->group);
        if (!$group_xml) {
            throw new Exception('Invalid group: ' . $group);
        }
		//获取对应group的rootdir
		$this->root_dir = (string)$group_xml->attributes()->rootdir;
        $files = array();
        foreach ($group_xml->xpath("file[@type='css']") as $file) {
            $files []= $this->root_dir . ((string) $file['src']);
        }
        $concatenated_file = $this->concatenate($files, 'css');
		//先检查是否需要压缩
		if($this->nominify){
			//不需要
			if($this->redirect){
				header("Location: " . $concatenated_file);
				exit;
			}else{
				return file_get_contents($concatenated_file);	
			}
		}else{
			//需要，先要检查是否存在压缩后的缓存文件
			if(file_exists($this->cachecssassetdic . $this->final_name)){
				//有缓存文件
				if($this->redirect){
					header("Location: " . $this->cachecssassetdic . $this->final_name);
					exit;
				}else{
					return file_get_contents($this->cachecssassetdic . $this->final_name);	
				}
			}else{
				//没有缓存文件
				$output = $this->minify($concatenated_file, 'css');
				file_put_contents(($this->cachecssassetdic . $this->final_name), $output);
				return $output;
			}
		}
    }
	
    public function __construct($config)
    {
        $this->load_config($config);
    }
}