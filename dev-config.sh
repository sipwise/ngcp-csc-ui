#!/bin/bash

case "$1" in
    *)
    ngcpcfg set /etc/ngcp-config/config.yml www_admin.http_csc.csc_dev=yes
    ngcpcfg set /etc/ngcp-config/config.yml www_admin.http_csc.csc_js_enable=yes
    ngcpcfg set /etc/ngcp-config/config.yml rtcengine.enable=yes
    ngcpcfg set /etc/ngcp-config/config.yml pbx.enable=yes
    ngcpcfg set /etc/ngcp-config/config.yml www_admin.privileges.subscriberadmin.subscribers.0=write
    ngcpcfg set /etc/ngcp-config/config.yml email.smarthost.hostname=mail.sipwise.com
    ngcpcfg apply 'Enable CSC, PBX and RtcEngine'
    ;;
esac
