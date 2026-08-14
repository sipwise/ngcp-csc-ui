self.addEventListener('notificationclick', function (event) {
    event.notification.close()
    // eslint-disable-next-line no-undef
    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        // eslint-disable-next-line no-unused-vars
        const matchingClient = null
        for (let i = 0; i < windowClients.length; i++) {
            const windowClient = windowClients[i]
            if (windowClient.url === event.notification.data.url) {
                return windowClient.focus()
            }
        }
    })
    event.waitUntil(promiseChain)
})
