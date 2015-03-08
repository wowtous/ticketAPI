1.修改系统启动项
sudo vi /etc/default/grub ## 修改timeout=0
sudo update-grub

2.程序环境配置
sudo apt-get install libpixman-1-dev libcairo2-dev
sudo apt-get install libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++

3.系统字体设置
sudo apt-get install ttf-wqy-microhei
sudo cp /project/ticketAPI/test/69-language-selector-zh-cn.conf /etc/fonts/conf.d
sudo cp /project/ticketAPI/test/49-sansserif.conf /etc/fonts/conf.d

4.System settings
sudo apt-get install --reinstall unity-control-center

5.系统备份和恢复
sudo su
tar -cvpzf /media/ubuntu/uuid_save/ticket-date.tgz -C /media/ubuntu/tar_uuid .
cd /media/ubuntu/uuid
tar -zvpzf /media/ubuntu/uuid_save/ticket-date.tgz

6.检查PrintDriver路径，修改/opt/kiosk.sh

7.sudo reboot
