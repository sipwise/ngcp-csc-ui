
import loadScript from 'load-script'

var scriptId = 'cdk';
var scriptPath = '/rtc/files/dist/cdk-prod.js';
var webSocketPath = '/rtc/api';
var webSocketUrl = 'wss://' + window.location.host + webSocketPath;

export function loadCdkLib() {
    return new Promise((resolve, reject)=>{
        if(!document.getElementById(scriptId)) {
            loadScript(scriptPath, {
                attrs: {
                    id: scriptId
                }
            }, function(err, script){
                if(err) {
                    reject(err);
                }
                else {
                    resolve(script);
                }
            });
        }
        else {
            resolve();
        }
    });
}

export function connectCdkClient(session) {
    return new Promise((resolve, reject)=>{
        var client = new cdk.Client({
            url: webSocketUrl,
            userSession: session
        });
        client.onConnect(()=>{
            resolve(client);
        });
        client.onDisconnect(()=>{
            reject(new Error(client.disconnectReason));
        });
    });
}

export function connectCdkNetwork(session, networkTag) {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            return connectCdkClient(session);
        }).then((client)=>{
            return new Promise(($resolve, $reject)=>{
                var network = client.getNetworkByTag(networkTag);
                network.onConnect(()=>{
                    $resolve(network);
                });
                network.onDisconnect(()=>{
                    $reject(new Error(network.disconnectReason));
                });
            });
        }).then((network)=>{
            resolve(network);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function connectDefaultCdkNetwork(session) {
    return connectCdkNetwork(session, 'sip');
}
