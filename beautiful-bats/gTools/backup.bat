@echo off

::Ŀ���ļ���
REM set thisDir=.\VisualSVNServerRepositories
REM set descDir=Backups\%thisDir:~2%
::��ȡ�������
hostname > %temp%\temp1.temp
for /f %%i in (%temp%\temp1.temp) do set p=%%i
::desktop T00000013435q
::laptop ??
REM if %p%==T00000013435q (
	REM set deskDir=C:\Documents and Settings\guanwei01\����\
	REM set jinshanDir=X:\
REM )
REM if %p%==laptop (
	REM set deskDir=C:\Documents and Settings\
	REM set jinshanDir=X:\
REM )
if %p%==T00000013435q (
	::���ǹ�˾����
	::svn��װĿ¼
	set svnBinDir=E:\programs files\SVN\bin
	::Dbank���̵�ַ
	set dBankDir=E:\Dbanks\My DBank\�ҵ����\Javascript
	set svnAllSourceDir=E:\newPhpEnvironment\Webroot\gTools
)
if %p%==GUANWEI-THINK (
	::�Լ��ĵ���
	set svnBinDir=C:\Program Files\TortoiseSVN\bin
	set dBankDir=D:\DbankAnsyc\�ҵ����\Javascript
	set svnAllSourceDir=D:\work\php\htdocs\gTools
)
REM set deskDir=C:\Documents and Settings\%USERNAME%\����
set jinshanDir=X:
::start backup
REM echo "����������..."
REM xcopy "%thisDir%" "%deskDir%\%descDir%" /E /H /Y /I
REM echo "���汸���ļ��б��ݽ���"

REM echo "��������ɽ����..."
REM xcopy "%thisDir%" "%jinshanDir%\%descDir%" /E /H /Y /I
REM echo "��ɽ���̱����ļ��б��ݽ���"
::end backup

set thiBin=TortoiseProc.exe
::��ʼ�����ҵ�����ļ�SVN����
echo "��ʼ����Դ����DBank����..."
::echo "ɾ��ԭʼ�汾����"
::rmdir /Q /S "%dBankDir%"
::echo "ɾ��ԭʼ�汾�ɹ�"
::"%svnBinDir%\%thiBin%" /command:export /path:"%dBankDir%" /closeonend:0
"%svnBinDir%\%thiBin%" /command:dropexport /path:"%svnAllSourceDir%" /droptarget:"%dBankDir%" /overwrite /closeonend:0
echo "����Դ����DBank���̽�����"

echo "��ʼ����Դ������ɽ����..."
::echo "ɾ��ԭʼ�汾����"
::rmdir /Q /S "%jinshanDir%\�ҵ����\Javascript"
::echo "ɾ��ԭʼ�汾�ɹ�"
::"%svnBinDir%\%thiBin%" /command:export /path:"%jinshanDir%\�ҵ����\Javascript" /closeonend:0
"%svnBinDir%\%thiBin%" /command:dropexport /path:"%svnAllSourceDir%" /droptarget:"%jinshanDir%\�ҵ����\Javascript" /overwrite /closeonend:0
echo "����Դ������ɽ���̽�����"

::��laptop�ϵ���Git
REM set GitHub=C:\Documents and Settings\Administrator\gw
REM if %p%==GW5216197 (
	REM "%svnBinDir%\%thiBin%" /command:export /path:"%GitHub%" /closeonend:0
REM )

del %temp%\temp1.temp
echo "������ʱ�ļ���ɣ�"
pause