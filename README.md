# Customer Self-Care Web UI

## Development
Please follow these steps to set up a development environment for ngcp-csc-ui.

### Node and npm

First make sure you have Node.js and npm installed, and then install and build the app.

1. Install latest Node.js v6 and npm v3. It's recommended to [install and use nvm](https://github.com/creationix/nvm) to make sure you're using the right versions
1. Clone the ngcp-csc-ui repo locally
1. Run npm install

    ```npm install```

1. Build the app for dev

    ```npm run dev-build```

### Vagrant

To run this app you also need to have a [vagrant-ngcp](https://www.sipwise.org/doc/mr4.1.1/spce/ar01s04.html#_vagrant_box_for_virtualbox) environment up and running.

1. Go to your local vagrant-ngcp folder, for example

    ```cd ~/Sipwise/mr/vagrant-ngcp```

1. Spin up a new vagrant box

    ```./v n pro1```

1. SSH into vagrant box and become root

    ```
    ./v s pro1
    sudo -s
    ```

1. Edit config.yml

    ```vim /etc/ngcp-config/config.yml```

1. Enable csc by finding the the "http_csc:" section of the file, and setting "csc_js_enable:" to yes

    ```csc_js_enable: yes```

1. Run ngcpcfg apply

    ```ngcpcfg apply 'Enable http_csc'```

1. Navigate into the vagrant shared local folder (configured via custom_config file in local vagrant-ngcp/users.d/ folder) and execute dev.sh script to set up symlink between local built files and vagrant files served via nginx

    ```
    cd /usr/local/devel/ngcp-csc-ui/
    ./dev.sh
    ```

You can now access ngcp-csc-ui in browser by using the url provided by the vagrant script.

### PBX Customer

You need a pbx subscriber to be able to access the pbx config specific modules in ngcp-csc-ui as a user. To create a pbx subscriber we first need to enable pbx in vagrant.

1. SSH into the vagrant box and become root

    ```
    ./v s pro1
    sudo -s
    ```

1. Edit config.yml

    ```vim /etc/ngcp-config/config.yml```

1. Enable csc by finding the "pbx:" section of the file, and setting "enable:" to yes

    ```enable: yes```

1. Run ngcpcfg apply

    ```ngcpcfg apply 'Enable pbx'```

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

```https://<your-ip-address>/csc```

### How to add new npm package

1. Ensure that you have a clean node_modules folder
    
    ```
    rm -R node_modules/
    npm install
    ```

1. Remove obsolete shrinkwrap file
    
    ```rm npm-shrinkwrap.json```    
    
1. Install new package(s)    
    
    ```npm install packageA packageB --save-dev```

1. Generate new shrinkwrap file including all dependencies

    ```npm shrinkwrap --dev```
    
    You should see the following result in console:
    
    ```wrote npm-shrinkwrap.json```
    
1. Add new shrinkwrap file to git

    ```git add .```

## Contributing

See our [Contributing Guide](./CONTRIBUTING.md) file) for information on how to contribute.
