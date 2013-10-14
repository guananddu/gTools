@echo off

::获取计算机名
hostname > %temp%\temp1.temp
for /f %%i in (%temp%\temp1.temp) do set p=%%i

if %p%==T00000013435q (
	::公司电脑
	set svnBinDir=E:\programs files\SVN\bin
	set svnAllSourceDir=E:\newPhpEnvironment\Webroot\gTools\gTools\gTools-developing
	set zhuoMian=C:\Documents and Settings\guanwei01\桌面
)
if %p%==GUANWEI-THINK (
	::自己的电脑
	set svnBinDir=C:\Program Files\TortoiseSVN\bin
	set svnAllSourceDir=D:\work\php\htdocs\gTools\gTools\gTools-developing
	set zhuoMian=C:\Users\Administrator\Desktop
)

set thiBin=TortoiseProc.exe

echo "开始导出源码至桌面..."
"%svnBinDir%\%thiBin%" /command:dropexport /path:"%svnAllSourceDir%" /droptarget:"%zhuoMian%" /overwrite /closeonend:0
echo "导出源码至桌面结束！"

del %temp%\temp1.temp
echo "清理临时文件完成！"
pause