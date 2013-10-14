@echo off

::目标文件夹
REM set thisDir=.\VisualSVNServerRepositories
REM set descDir=Backups\%thisDir:~2%
::获取计算机名
hostname > %temp%\temp1.temp
for /f %%i in (%temp%\temp1.temp) do set p=%%i
::desktop T00000013435q
::laptop ??
REM if %p%==T00000013435q (
	REM set deskDir=C:\Documents and Settings\guanwei01\桌面\
	REM set jinshanDir=X:\
REM )
REM if %p%==laptop (
	REM set deskDir=C:\Documents and Settings\
	REM set jinshanDir=X:\
REM )
if %p%==T00000013435q (
	::这是公司电脑
	::svn安装目录
	set svnBinDir=E:\programs files\SVN\bin
	::Dbank网盘地址
	set dBankDir=E:\Dbanks\My DBank\我的类库\Javascript
	set svnAllSourceDir=E:\newPhpEnvironment\Webroot\gTools
)
if %p%==GUANWEI-THINK (
	::自己的电脑
	set svnBinDir=C:\Program Files\TortoiseSVN\bin
	set dBankDir=D:\DbankAnsyc\我的类库\Javascript
	set svnAllSourceDir=D:\work\php\htdocs\gTools
)
REM set deskDir=C:\Documents and Settings\%USERNAME%\桌面
set jinshanDir=X:
::start backup
REM echo "备份至桌面..."
REM xcopy "%thisDir%" "%deskDir%\%descDir%" /E /H /Y /I
REM echo "桌面备份文件夹备份结束"

REM echo "备份至金山快盘..."
REM xcopy "%thisDir%" "%jinshanDir%\%descDir%" /E /H /Y /I
REM echo "金山快盘备份文件夹备份结束"
::end backup

set thiBin=TortoiseProc.exe
::开始备份我的类库文件SVN导出
echo "开始导出源码至DBank网盘..."
::echo "删除原始版本备份"
::rmdir /Q /S "%dBankDir%"
::echo "删除原始版本成功"
::"%svnBinDir%\%thiBin%" /command:export /path:"%dBankDir%" /closeonend:0
"%svnBinDir%\%thiBin%" /command:dropexport /path:"%svnAllSourceDir%" /droptarget:"%dBankDir%" /overwrite /closeonend:0
echo "导出源码至DBank网盘结束！"

echo "开始导出源码至金山快盘..."
::echo "删除原始版本备份"
::rmdir /Q /S "%jinshanDir%\我的类库\Javascript"
::echo "删除原始版本成功"
::"%svnBinDir%\%thiBin%" /command:export /path:"%jinshanDir%\我的类库\Javascript" /closeonend:0
"%svnBinDir%\%thiBin%" /command:dropexport /path:"%svnAllSourceDir%" /droptarget:"%jinshanDir%\我的类库\Javascript" /overwrite /closeonend:0
echo "导出源码至金山快盘结束！"

::在laptop上导至Git
REM set GitHub=C:\Documents and Settings\Administrator\gw
REM if %p%==GW5216197 (
	REM "%svnBinDir%\%thiBin%" /command:export /path:"%GitHub%" /closeonend:0
REM )

del %temp%\temp1.temp
echo "清理临时文件完成！"
pause