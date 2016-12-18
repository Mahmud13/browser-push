'use strict';

function querySt(e) {
    var hu = '', ft = '';
    hu = window.location.search.substring(1).split("&");
    for (var i = 0; i < hu.length; i++) {
        ft = hu[i].split("=");
        if (ft[0] == e) {
            return ft[1]
        }
    }
    return '';
}
var matchid = querySt('matchid') || '';
var sections = querySt('sections') || '';
var unsubscribe = querySt('unsubscribe') || '';
var settings = querySt('settings') || '';
var tds = querySt('__test') || 'no';
var site = 'cricket';
var cname = site + '_isSubscribed';
var parentsite = document.referrer || 'http://www.thedailystar.net';
parentsite = (parentsite.indexOf('.js') > -1) ? 'http://www.thedailystar.net' : parentsite;
parentsite = parentsite + ((parentsite.indexOf('?') > -1)?'&':'?') + 'browserpush=true'
if (tds == 'yes') {
    parentsite = '';
}
var regObj = '';

window.addEventListener('load', function () {
    // enhance and add push messaging support, otherwise continue without it.  
    if ('serviceWorker' in navigator) {
         navigator.serviceWorker.register('firebase-messaging-sw.js')
                .then(initialiseState)
                .catch(function (error) {
                    printMsg('<span style="color:#D67C7C;">Your browser is not supporting this feature, please get chrome (42+) or firefox (44+) </span>' + error)
                });
    } else {
        printMsg('Service workers aren\'t supported in this browser.');
        redirectToParent(2000);
    }
});
function initialiseState() {
    if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
        printMsg('Notifications aren\'t supported.');
        redirectToParent(2000);
        return;
    }

    if (Notification.permission == 'default' && settings == '') {
        overlayAction('block');
    }

    if (Notification.permission === 'denied') {
        overlayAction('none');
        printMsg('<span style="color:#D67C7C;">You have blocked notifications for this site.</span><br/><span style="color:#7ADA10;">Fix: Please click <img style="position:relative;top:3px;" src="images/bar-help.png" alt="Green Icon in address bar" title="Green Icon in address bar"/> and allow notification permission and refresh this page.</span>');
    }

    if (!('PushManager' in window)) {
        overlayAction('none');
        printMsg('Push messaging isn\'t supported.');
        redirectToParent(2000);
        return;
    }
    navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
        // Do we already have a push message subscription?  
        serviceWorkerRegistration.pushManager.getSubscription()
                .then(function (subscription) {
                    var msg = '';
                    if (!subscription) {
                        // We aren't subscribed to push, so set UI
                        if (settings != '') {
                            msg = 'Hey, you are not subscribed <a style="color:#7ADA10;" href="javascript:void(0);" onclick="subscribe(1);">Click here to subscribe Now</a>';
                            printMsg(msg);
                        } else {
                            subscribe('');
                        }
                        return true;
                    }
                    msg = 'You are already subscribed.';
                    var time = 1000;
                    if (settings != '') {
                        msg += ' <a style="color:#D67C7C;" href="javascript:void(0);" onclick="unSubscribe();"> Click here to Unsubscribe</a> Or <a style="color:#7ADA10;" href="javascript:void(0);" onclick="redirectToParent(1);">Click here to return</a>';
                        time = 20000;
                    }
                    printMsg(msg);
                    redirectToParent(time);
                })
                .catch(function (err) {
                    printMsg('Error during getSubscription()'+ err);
                    redirectToParent(2000);
                    return;
                });
    }).catch(function(error) {
        printMsg('<span style="color:#D67C7C;">Your browser is not supporting this feature, please get chrome (42+) or firefox (44+) </span>' + error);
    });
}

function unSubscribe() {
    navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
        // To unsubscribe from push messaging, you need get the  
        // subscription object, which you can call unsubscribe() on.  
        serviceWorkerRegistration.pushManager.getSubscription().then(
                function (subscription) {
                    // Check we have a subscription to unsubscribe  
                    if (!subscription) {
                        redirectToParent(2000);
                        return;
                    }

                    subscription.unsubscribe().then(function (successful) {
                        var msg = 'You have successfully Un-subscribed';
                        msg += ' <a style="color:#7ADA10;" href="javascript:void(0);" onclick="subscribe(\'\');">Click here to subscribe again</a>';
                        printMsg(msg);
                        redirectToParent(10000);
                        settings = '';
                    }).catch(function (e) {
                        printMsg('Error during getSubscription()' + e);
                        redirectToParent(2000);
                        return;
                    });
                }).catch(function (e) {
                    printMsg('Error thrown while unsubscribing from push messaging.' + e);
                    redirectToParent(2000);
                    return;
                });
    });
}

function subscribe(old) {

    if (Notification.permission == 'default') {
        overlayAction('block');
    }
    if (Notification.permission == 'granted') {
        overlayAction('none');
    }
    navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
        console.log(old);
        console.log("come");
        serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
        .then(function (subscription) {
            var config = { 
                apiKey: "AIzaSyAyHPvsdc6Sv8AvVu03VP1mdMryT_A-ZZ4", 
                authDomain: "graphite-post-87309.firebaseapp.com", 
                databaseURL: "https://graphite-post-87309.firebaseio.com", 
                storageBucket: "graphite-post-87309.appspot.com", 
                messagingSenderId: "850606490152" 
            }; 
            firebase.initializeApp(config); 

            const messaging = firebase.messaging();

            messaging.requestPermission()
            .then(function() {
                return messaging.getToken();
            })
            .then(function(token) {
                console.log(old);
                $.ajax({
                    type: "POST",
                    data: {
                        token: token,
                        device: 'browser',
                        location : "",
                        birth : "",
                        sex : "",
                        old: old
                    },
                    url: 'https://alerts.thedailystar.net/notification/register',
                    success: function(data){
                        overlayAction('none');
                        var msg = 'You have successfully subscribed';
                        printMsg(msg + data);
                        if (settings == '' || old=='1') {
                            onRegisterNotify(serviceWorkerRegistration);
                        }
                        redirectToParent(1000);
                        return true;
                    },
                    error: function(e,x,q){
                        overlayAction('none');
                        printMsg('<span style="color:#D67C7C;">Something wrong hapenned, please refresh the page to try again ['+e.responseText+'].</span>');
                    }
                });
            });
        })
        .catch(function(err) {
            if (Notification.permission === 'denied') {
                overlayAction('none');
                printMsg('<span style="color:#D67C7C;">You have blocked notifications for this site.</span><br/><span style="color:#7ADA10;">Fix: Please click <img style="position:relative;top:3px;" src="images/bar-help.png" alt="Green Icon in address bar" title="Green Icon in address bar"/> and allow notification permission and refresh this page.</span>');
            } else {
                overlayAction('none');
                printMsg('<span style="color:#D67C7C;">Something wrong hapenned, please refresh the page to try again ['+err+'].</span>');
            }
        })
    });
}

function overlayAction(type) {
    if (document.getElementById('tdsnotify') && (type == 'block' || type == 'none')) {
        document.getElementById('tdsnotify').style.display = type;
    }
}
function redirectToParent(time) {
    if (parentsite != '') {
        setTimeout(function () {
            location.href = parentsite;
        }, time);
    }
}

function printMsg(msg) {
    if (document.getElementById('msg')) {
        document.getElementById('msg').innerHTML = msg;
    }
}

function get_browser_info() {
    var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [], d = 'desktop', OSName = 'unknown-os';
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
        d = 'mobile';
    }
    if (navigator.appVersion.indexOf("Win") != -1)
        OSName = "windows";
    if (navigator.appVersion.indexOf("Mac") != -1)
        OSName = "mac";
    if (navigator.appVersion.indexOf("X11") != -1)
        OSName = "unix";
    if (navigator.appVersion.indexOf("Linux") != -1)
        OSName = "linux";
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return {name: 'ie', version: (tem[1] || ''), device: d, os: OSName};
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\bOPR\/(\d+)/)
        if (tem != null) {
            return {name: 'opera', version: tem[1], device: d, os: OSName};
        }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) {
        M.splice(1, 1, tem[1]);
    }
    return {name: M[0].toLowerCase(), version: M[1], device: d, os: OSName};
}

function onRegisterNotify(reg) {
    try {
        var notification = reg.showNotification('The Daily Star', {
            body: 'Thank you for subscribing to News alerts.',
            icon: 'images/tds-logo.png',
            vibrate: [300, 100, 400], // Vibrate 300ms, pause 100ms, then vibrate 400ms
            tag: 'tdsnews-welcome',
            data: {
                url: 'http://www.thedailystar.net?browserpush'
            }
        });
        notification.onclick = function (event) {
            event.target.close();
            window.location.href = event.target.data.url;
            return;
        };
    } catch (err) {/*log this error alert(err.message)*/
    }
}

var browserinfo = get_browser_info();
