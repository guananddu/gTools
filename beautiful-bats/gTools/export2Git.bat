@echo off

::��ȡ�������
hostname > %temp%\temp1.temp
for /f %%i in (%temp%\temp1.temp) do set p=%%i

if %p%==T00000013435q (
	::��˾����
	set svnBinDir=E:\programs files\SVN\bin
	set svnAllSourceDir=E:\newPhpEnvironment\Webroot\gTools\gTools\gTools-developing
	set zhuoMian=C:\Documents and Settings\guanwei01\����
)
if %p%==GUANWEI-THINK (
	::�Լ��ĵ���
	set svnBinDir=C:\Program Files\TortoiseSVN\bin
	set svnAllSourceDir=D:\work\php\htdocs\gTools\gTools\gTools-developing
	set zhuoMian=C:\Users\Administrator\Desktop
)

set thiBin=TortoiseProc.exe

echo "��ʼ����Դ��������..."
"%svnBinDir%\%thiBin%" /command:dropexport /path:"%svnAllSourceDir%" /droptarget:"%zhuoMian%" /overwrite /closeonend:0
echo "����Դ�������������"

del %temp%\temp1.temp
echo "������ʱ�ļ���ɣ�"
pause