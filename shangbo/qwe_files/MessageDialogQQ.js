//����:���B(www.0379zd.com����)
//ʱ��2009��6��30��9:02:51���޸ģ�
//�汾:v 1.1.1.2(�ڶ����汾)�����ڹ���������ʱ����Ϣ�����¹�����BUG
   
(function($) {
         $.fn.extend({
             Show: function(widht,height) {
            var TopY=0;//��ʼ��Ԫ�ؾุԪ�صľ���
             $(this).css("width",widht+"px").css("height",height+"px");//������Ϣ��Ĵ�С
             $(this).slideDown(1000);//����
             $("#messageTool").css("margin-top",-height);//Ϊ���ݲ��ִ����߶�   ���
             $("#message_close").click(function() {//������رհ�ť��ʱ��
                 if(TopY==0)
                  {
                        $("#messageTC").slideUp(1000);//����֮������slideUp��Ϊ�˼���Firefox�����
                  }
                else
                 {
                       $("#messageTC").animate({top: TopY+height}, "slow", function() { $("#messageTC").hide(); });//��TopY������0ʱ   ie�º�FirefoxЧ��һ��
                 }
              });
              $(window).scroll(function() {
                  $("#messageTC").css("top", $(window).scrollTop() + $(window).height() - $("#messageTC").height());//��������������ʱ��ʼ������Ļ�����½�
                  TopY=$("#messageTC").offset().top;//��������������ʱ����ʱ����Ԫ�ؾุԭ�ؾ���
               });
             }
          })}
)(jQuery);
