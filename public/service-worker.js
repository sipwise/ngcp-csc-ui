
self.addEventListener('notificationclick', function (event) {
    event.notification.close()
    var promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        var matchingClient = null
        for (var i = 0; i < windowClients.length; i++) {
            var windowClient = windowClients[i]
            if (windowClient.url === event.notification.data.url) {
                return windowClient.focus()
            }
        }
    })
    event.waitUntil(promiseChain)
})
