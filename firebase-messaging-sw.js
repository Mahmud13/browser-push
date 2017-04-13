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
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };
    var msg_id = event.notification.data.msg_id;
    var user_id = event.notification.data.user_id;
    var params = "msg_id="+msg_id+"&user_id="+user_id+"&status=received";
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
                    if (event.action === 'settings') {
                        return clients.openWindow('https://alerts.thedailystar.net/?settings=1');                        
                    } else {
                        var msg_id = event.notification.data.msg_id;
                        var user_id = event.notification.data.user_id;
                        var status = event.notification.data.status;
                        var params = "msg_id="+msg_id+"&user_id="+user_id+"&status=opened";
                        updateStatus('opened', params);
                        return clients.openWindow(event.notification.data.url);    
                    }
                }
            })
            );
});


function updateStatus(status, params) {
    var url = "http://realpush.anontech.info/notification/" + status;
    var http = window.XDomainRequest ? new window.XDomainRequest() : new XMLHttpRequest();
    http.open("POST", url, true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http.setRequestHeader("Content-length", params.length);
    http.setRequestHeader("Connection", "close");
    http.send(params);
}

