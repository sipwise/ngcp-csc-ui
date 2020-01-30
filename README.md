# Customer Self-Care Web UI

## Development
Please follow these steps to set up a development environment for ngcp-csc-ui.

### Node and npm

First make sure you have Node.js and npm installed, and then install and build the app.

1. Install latest Node.js v6 and npm v3. It's recommended to [install and use nvm](https://github.com/creationix/nvm) to make sure you're using the right versions
1. Clone the ngcp-csc-ui repo locally
1. Run npm install

    `npm install`

1. Build the app for dev

    `npm run dev-build`

### Vagrant

To run this app you also need to have a [vagrant-ngcp](https://www.sipwise.org/doc/mr4.1.1/spce/ar01s04.html#_vagrant_box_for_virtualbox) environment up and running.

1. Go to your local vagrant-ngcp folder, for example

    `cd ~/Sipwise/mr/vagrant-ngcp`

1. Spin up a new vagrant box

    `./v n pro1`

1. SSH into vagrant box and become root

    `
    ./v s pro1
    sudo -s
    `

1. Edit config.yml

    `vim /etc/ngcp-config/config.yml`

1. Enable csc by finding the the "http_csc:" section of the file, and setting "csc_js_enable:" to yes

    `csc_js_enable: yes`

1. Run ngcpcfg apply

    `ngcpcfg apply 'Enable http_csc'`

1. Navigate into the vagrant shared local folder (configured via custom_config file in local vagrant-ngcp/users.d/ folder) and execute dev.sh script to set up symlink between local built files and vagrant files served via nginx

    `
    cd /usr/local/devel/ngcp-csc-ui/
    ./dev.sh
    `

You can now access ngcp-csc-ui in browser by using the url provided by the vagrant script.

### Enable Call Feature

To enable use of the call feature, you must first both enable it in ngcp-config and change some options in ngcp-panel.

1. Edit config.yml

    `vim /etc/ngcp-config/config.yml`

1. Enable rtcengine by finding the "rtcengine:" section of the file, and setting "enable:" to yes

    `
    rtcengine:
        enable: yes
    `

1. Run ngcpcfg apply

    `ngcpcfg apply 'Enable rtcengine'`

1. Log in to ngcp-panel with administrator credentials
1. Go to "Settings > Resellers""
1. Look for reseller row with "default" written in "Name" column, and click "Edit" for that row
1. Check "Enable rtc" checkbox and save
1. Go to "Settings > Domains"
1. Look domain row with domain linked to bound to kamailio in the "Domain" column (usually the bottom-most one for vagrant-ngcp environments), and click "Preferences" for that row
1. Go to "NAT and Media Flow Control" section
1. Set "use_rtpproxy" to "Always with rtpproxy as additional ICE candidate" and "transport_protocol" to "UDP/TLS/RTP/SAVPF (encrypted SRTP using DTLS-SRTP with RTCP feedback)"

Before making calls, also make sure that you give the caller and callee E164 Number values:
1. Go to "Settings > Subscriber", find the subscriber and click "Details"
1. Go to "Master Data" section and click "Edit"
1. Input E164 number (for example 43 12 3456) and click save

Troubleshooting tips for when the call feature does not want to enable:
1. Log out and in again of CSC
1. Check that rtcengine is active in your vagrant box, by executing as root:

    `ngcp-service summary`

1. If inactive, restart it:

    `ngcp-service rtcengine restart`

1. If still not working, try restarting the proxy

    `ngcp-service proxy restart`

For the call feature to properly work, make sure you're logged out of ngcp-panel before logging in to CSC.

### PBX Customer

You need a pbx subscriber to be able to access the pbx config specific modules in ngcp-csc-ui as a user. To create a pbx subscriber we first need to enable pbx in vagrant.

1. SSH into the vagrant box and become root

    `
    ./v s pro1
    sudo -s
    `

1. Edit config.yml

    `vim /etc/ngcp-config/config.yml`

1. Enable csc by finding the "pbx:" section of the file, and setting "enable:" to yes

    `enable: yes`

1. Enable write access for subscriberadmins by adding "write" to subscriber privileges as in the following example

    ```
        www_admin
          privileges:
            subscriberadmin:
              subscribers:
              - write
    ```

1. Run ngcpcfg apply

    `ngcpcfg apply 'Enable pbx'`

1. Log in to ngcp-panel with administrator credentials
1. Go to Settings > Customers
1. Look for customer row with "Cloud PBX Account" written in "Product" column, and click "Details" for that row
1. Go to Subscribers, and click "Create Subscribers". It's good to note that the first subscriber we create becomes the "pilot" for this customer
1. In the "Domains" section, select the row with your local vagrant ip address shown in the "Domain" column
1. For E.164 Number input a dummy number, for example 43 12 34567
1. Input dummy "Display Name", "Email", "Web Username/Password", and "Sip Username/Password", and make sure to select  "Administrative", then press "Save"
1. Create another subscriber. This new subscriber (and all subsequent ones) will then becomes a normal pbx subscriber
1. For normal subscribers input an extension in addition to the other fields mentioned above (including "Administrative"), then press "Save"

Now you can log in to csc with one of the normal subscriber you just created. URL for login is the same as for accessing ngcp-panel admin, except with csc suffix and no port specified:

`https://<your-ip-address>/csc`

### Send Fax

You need to first enable faxserver and activate it for the subscriber, to be able to send a fax via the "action button menu".

1. By default, vagrant-ngcp has faxserver enabled by default in the config, so currently we do not need to make any changes here. Otherwise, it would be enabled via /etc/ngcp-config/config.yml by setting "faxserver: enable:" to "yes" and applying the changes with ngcpcfg apply 'enable faxserver'""
1. We need to set up the MTA (Mail Transfer Agent) exim4 so we can send the fax via mail. SSH in to the vagrant system and then execute ``sudoedit /etc/ngcp-config/config.yml` with the following configuration:
`email:
  domain: ''
  hostname: ''
  smarthost:
    hostname: 'mail.sipwise.com'
    password: ''
    reverse_hostnames: []
    username: ''
`
1. Apply the exim configuration changes via `sudo ngcpcfg apply 'adjust exim4 / MTA configuration'`
1. Log in to ngcp-panel with administrator credentials
1. Go to "Settings > Subscribers", find subscriber you want to use as caller, and click "Details"
1. Under "Master Data" click edit, and enter subscribers number also in the E164 field
1. Then go to "Preferences", and set "Fax2Mail and Sendfax" to active
1. Repeat the two steps above, this time for the callee
1. For the callee, you also need to add your internal sipwise email address as "Destination" under "Fax2Mail and Sendfax", and also under "Call Forwards" configure a "Call Forward Unconditional" to "Fax2Mail"
1. Additionally, the visibility of the fax option in "action button menu" is reliant on store state "sendFax: true" in src/store/user.js. This means it can be toggled off in the code as well if needed

### How to add new npm package

1. Remove the package if you've already installed it

    `npm remove <package> <--save-dev || --save>`

1. Ensure that you have a clean node_modules folder
    `
    rm -R node_modules/
    npm install
    `

1. Remove obsolete shrinkwrap file

    `rm npm-shrinkwrap.json`

1. Install new package(s)

    `npm install packageA packageB --save-dev`

1. Generate new shrinkwrap file including all dependencies

    `npm shrinkwrap --dev`

    You should see the following result in console:

    `wrote npm-shrinkwrap.json`

1. Add new shrinkwrap file to git

    `git add .`

## Contributing

See our [Contributing Guide](./CONTRIBUTING.md) file) for information on how to contribute.
