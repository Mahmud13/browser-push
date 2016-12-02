self.addEventListener('install', function (event) {
    self.skipWaiting();
    //console.log('Installed', event);
});

self.addEventListener('activate', function (event) {
    //console.log('Activated', event); //yes
});


var url = "./alerts/alerts.json";
self.addEventListener('push', function (event) {
    event.waitUntil(
      fetch(url+'?'+Math.round(+new Date() / 1000)).then(function (response) {
        if (response.status !== 200) {
            // Either show a message to the user explaining the error  
            // or enter a generic message and handle the
            // onnotificationclick event to direct the user to a web page  
            console.log('Looks like there was a problem. Status Code: ' + response.status);
            throw new Error();
        }

        // Examine the text in the response  
        return response.json().then(function (data) {
            if (data.error || !data.notification) {
                console.log('The API returned an error.', data.error);
                throw new Error();
            }
            var title = data.notification.title;
            var message = data.notification.message;
            var icon = data.notification.icon;
            var dpl = data.notification.dpl;

            return self.registration.showNotification(title, {
                body: message,
                icon: icon,
                vibrate: [300, 100, 400], // Vibrate 300ms, pause 100ms, then vibrate 400ms
                //tag: data.notification.url,
                data: {
                    url: data.notification.url
                },
                actions: [
                    {action: 'settings', title: 'Settings', icon: 'https://alerts.ndtv.com/images/settings.png'},
                    {action: 'readmore', title: (dpl=='1'?'Read more':'Visit NDTV.com'), icon: 'https://alerts.ndtv.com/images/ndtv.png'}
                ]
            });
        });
    }).catch(function (err) {
        console.log('Unable to retrieve data', err);
        /*
         var title = 'NDTV';
         var message = 'Sorry, caught an error, we will fixing this.';  
         var icon = 'images/logo.png';  
         var notificationTag = 'notification-error';  
         return self.registration.showNotification(title, {  
         body: message,  
         icon: icon,
         vibrate: [300, 100, 400], // Vibrate 300ms, pause 100ms, then vibrate 400ms
         tag: notificationTag,
         data: {
         url: 'http://www.ndtv.com'
         }
         });
         */
    })
            );
});

// The user has clicked on the notification ...
self.addEventListener('notificationclick', function (event) {
    //console.log(event.notification.data.url);
    event.notification.close();

    // This looks to see if the current is already open and  
    // focuses if it is  
    event.waitUntil(
            clients.matchAll({
                type: "window"
            })
            .then(function (clientList) {
                for (var i = 0; i < clientList.length; i++) {
                    var client = clientList[i];
                    if (client.url == '/' && 'focus' in client)
                        return client.focus();
                }
                if (clients.openWindow) {
                    if (event.action === 'settings') {
                        return clients.openWindow('https://alerts.ndtv.com/?settings=1');                        
                    } else {
                        return clients.openWindow(event.notification.data.url);    
                    }
                }
            })
            );
});
