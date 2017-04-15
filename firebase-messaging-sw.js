// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/3.7.6/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.7.6/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  'messagingSenderId': '443400255115'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

//----------------------------Foregound message end------------------------------//
messaging.setBackgroundMessageHandler(function(payload) {
    // Customize notification here
    var msg_id = payload.data.msg_id;
    var url = payload.data.url;
    var sound = payload.data.sound;
    var icon = payload.data.icon;
    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.body,
        icon: icon,
        sound: sound,
        data: {
            url: url,
            msg_id: msg_id,
        }
    };
    var params = "msg_id="+msg_id+"&status=received&device_type=browser";
    updateStatus('received', params);

  return self.registration.showNotification(notificationTitle,
      notificationOptions);
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
                    var msg_id = event.notification.data.msg_id;
                    var params = "msg_id="+msg_id+"&status=opened&device_type=browser";
                    console.log(params);
                    updateStatus('opened', params);
                    return clients.openWindow(event.notification.data.url);    
                }
            })
            );
});


function updateStatus(status, params) {
    var url = "https://alerts.thedailystar.net/notification/" + status;
    fetch(url, {  
      method: 'post',  
      headers: {  
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"  
      },  
      body: params  
    })
    .then(function(res){
      console.log(res);
    })
    .catch(function (error) {  
        console.log('Request failed', error);  
    });
}




