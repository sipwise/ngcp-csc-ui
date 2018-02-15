
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    var promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        var  matchingClient = null;
        for (var i = 0; i < windowClients.length; i++) {
            var windowClient = windowClients[i];
            var url = new URL(windowClient.url);
            if(url.pathname.match(/^\/csc/g)) {
                return windowClient.focus();
            }
        }
    });
    event.waitUntil(promiseChain);
});

