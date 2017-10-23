# CONVERSATIONS MODILE

Here are details on how to create test data for the /api/conversations endpoint that the conversations module is consuming.

## VOICEMAIL 

1. Go to Settings > Subscribers > Details > Preferences, and under Call Forwards create a call forward destination under "Call Forward Unconditional" to voicemail 
1. Initiate a call from another subscriber to the subscriber you just set call forward for, and leave a voicemail 

See [calls section](#calls) for informatin on how to initiate calls.

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

Should be created using an xmpp client authenticating as subscribers, but have not been able to verify this
