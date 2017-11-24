# CONVERSATIONS MODULE

IMPORTANT: This document is meant for internal use at Sipwise, as it requires a vagrant-ngcp environment to be able to generate the test data.

Here are both details on how to, for the /api/conversations endpoint that the conversations module is consuming, both manually and via database dump, create/import test data.

## DATABASE DUMP

1. Spin up a fresh vagrant ngcp-csc environment
1. Download the test data database, available in this WF task under Documents:
[https://sipwise.attask-ondemand.com/task/view?ID=59ef06f4006d6e70b643d3599cd20655](https://sipwise.attask-ondemand.com/task/view?ID=59ef06f4006d6e70b643d3599cd20655)
1. Extract the test data database archive and add to shared vagrant volume, for example:
`
cd ~/Downloads
tar -xzvf conversations_dump.sql.tgz
cp root/conversations_dump.sql.tgz ~/Sipwise/mr/
`
1. SSH in to the vagrant box and become root
1. Backup the existing database:
`mysqldump --extended-insert --complete-insert --add-drop-database --databases accounting billing carrier fileshare kamailio ldap prosody provisioning rtcengine > ~/backup_before_conversations_dump.sql`
1. Import the test data database from your shared vagrant volume folder, for example:
`
cd /usr/local/devel
mysql < ./conversations_dump.sql
`
1. Might need to add test.example.org in vagrant /etc/hosts to redirect the ip address of vagrant, but is being verified by Kirill:
`mysql -e 'select * from provisioning.voip_domains'`

## VOICEMAIL

1. Go to Settings > Subscribers > Details > Preferences, and under Call Forwards create a call forward destination under "Call Forward Unconditional" to voicemail
1. Initiate a call from another subscriber to the subscriber you just set call forward for, and leave a voicemail

See [calls section](#calls) for information on how to initiate calls.

## SMS

1. SSH in to the vagrant box, become root, and edit config.yml, set sms: enable: yes, and enter sms credentials for all affected fields:
[https://wiki.sipwise.com/wiki/index.php/SMS](https://wiki.sipwise.com/wiki/index.php/SMS)
1. ngcpcfg apply 'commit msg'
1. Go to Settings > Subscribers, find subscriber you want to use, and click "Details"
1. Copy one of the numbers from wiki (link in step 1 above) and add to E164 Number field
1. Send sms from a mobile phone to E164 number
1. To troubleshoot you can check log:
`tail -f /var/log/kannel/sms*`

For outgoing you need to use the api (also with E 164 number set to sms number from wiki). According to gjungwirth pretty simple with POST request containing the destination number and the content. 

## FAX
1. Go to Settings > Subscribers, find subscriber you want to use as caller, and click "Details"
1. Under "Master Data" click edit, and enter subscribers number also in the E164 field
1. Repeat the two steps above, this time for the callee
1. SSH in to the vagrant box, become root, and create a text file to use for sending fax:
`echo 'test test' > filetosend.txt`
1. Use the ngcp-fax tool to send a fax:
`ngcp-fax --caller 43993003 --callee 43993002 --file filetosend.txt`
1. To troubleshoot you can check log:
`tail -f /var/log/ngcp/faxserver.log`

## CALLS

Can be created by calling from one subscriber to another using the ngcp-csc-ui call (rtc:engine) feature.

Another option is to use a soft phone client such as linphone for desktop and mobile. Simply enter the subscriber username and password, and in the domain field enter the ip of the vagrant box you're using.

## XMPP CHAT

Should be created using an xmpp client authenticating as subscribers, but have not been able to verify this.

## MOCK DATA

You can also use mock data in src/api/conversations.js, replacing the resolve() with this:

`
resolve(
    {
      "_embedded": {
        "ngcp:conversations": [
          {
            "_links": {
            },
            "call_id": "SZ8e64JkCq",
            "call_type": "call",
            "callee": "43993006",
            "caller": "43993007",
            "direction": "out",
            "duration": "0:00:08.592",
            "id": 3,
            "rating_status": "ok",
            "start_time": "2017-11-07 14:19:00.526",
            "status": "ok",
            "type": "call"
          },
          {
            "_links": {
            },
            "callee": "43993006",
            "caller": "43993007",
            "filename": "2cfb4c14-1958-472e-87a4-731ce5233514.tif",
            "id": 1,
            "pages": 0,
            "start_time": "2017-11-07 10:46:11",
            "status": "FAILED",
            "subscriber_id": 235,
            "type": "fax"
          },
          {
            "_links": {
            },
            "callee": "43993006",
            "caller": "43993007",
            "filename": "264ba55c-e23c-4d41-8493-f096bb98add9.tif",
            "id": 3,
            "pages": 0,
            "start_time": "2017-11-07 10:49:23",
            "status": "FAILED",
            "subscriber_id": 235,
            "type": "fax"
          },
          {
            "_links": {
            },
            "call_type": "cfu",
            "callee": "43993007",
            "caller": "vmu43993006@voicebox.local",
            "direction": "out",
            "duration": "0:00:06.854",
            "id": 4,
            "rating_status": "ok",
            "start_time": "2017-11-07 15:21:55",
            "status": "ok",
            "type": "call"
          },
        ]
      },
      "_links": {
        "curies": {
          "href": "http://purl.org/sipwise/ngcp-api/#rel-{rel}",
          "name": "ngcp",
          "templated": true
        },
        "ngcp:conversations": [
          {
            "href": "/api/conversations/4?type=call"
          },
          {
            "href": "/api/conversations/1?type=fax"
          },
          {
            "href": "/api/conversations/4?type=fax"
          }
        ],
        "profile": {
          "href": "http://purl.org/sipwise/ngcp-api/"
        },
        "self": {
          "href": "/api/conversations/?page=1&rows=10"
        }
      },
      "total_count": 4
    }
);
`
