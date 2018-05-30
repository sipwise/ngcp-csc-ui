#!/bin/bash

case "$1" in
    *)
    cp -f ./dev-config/ngcp-panel_csc.customtt.tt2 /etc/ngcp-config/templates/etc/nginx/sites-available/
    cp -f ./dev-config/ngcp-panel_params.customtt.tt2 /etc/ngcp-config/templates/etc/nginx/

    ngcpcfg set /etc/ngcp-config/config.yml www_admin.http_csc.csc_js_enable=yes
    ngcpcfg set /etc/ngcp-config/config.yml rtcengine.enable=yes
    ngcpcfg set /etc/ngcp-config/config.yml pbx.enable=yes
    ngcpcfg set /etc/ngcp-config/config.yml www_admin.privileges.subscriberadmin.subscribers.0=write

    ngcpcfg apply 'csc, pbx, rtcengine'
    ;;
esac
