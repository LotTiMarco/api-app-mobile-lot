// Integracion con el servicio de notificaciones de firebase FCM

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
    apiKey: "AIzaSyBqXsnZ1a8tPeNfMpvLFNk-0Axj7NkNESg",
    authDomain: "backend-app-lot-test.firebaseapp.com",
    projectId: "backend-app-lot-test",
    storageBucket: "backend-app-lot-test.appspot.com",
    messagingSenderId: "981233880265",
    appId: "1:981233880265:web:56c9940c2c15ad9f141118",
    measurementId: "G-T5PC2LL3H5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(app);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function requestPermission() {
    console.log('Requesting permission...');
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            console.log('Notification permission granted.');
        }
    }).catch((err) => {
        console.log('Unable to get permission to notify.', err);
    });
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

getToken(messaging, { vapidKey: 'BHFUpd21qrJbt0bkwDWloS4NE6Sb4yk3Ew7v_1BhfhrGBNC30O39i9SYNpuEco3XseZeSCscKJYU_Df5SLr2unU' }).then((currentToken) => {
    if (currentToken) {
        // Send the token to your server and update the UI if necessary
        console.log(currentToken)
        // ...
    } else {
        // Show permission request UI
        console.log('No registration token available. Request permission to generate one.');
        // ...
    }
}).catch((err) => {
    console.log('An error occurred while retrieving token.', err);
    // ...
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SUBSCRIPCION A TOPICOS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// These registration tokens come from the client FCM SDKs.
const registrationTokens = [
    'YOUR_REGISTRATION_TOKEN_1',
    // ...
    'YOUR_REGISTRATION_TOKEN_n'
];

// Subscribe the devices corresponding to the registration tokens to the
// topic.
getMessaging().subscribeToTopic(registrationTokens, topic)
    .then((response) => {
        // See the MessagingTopicManagementResponse reference documentation
        // for the contents of response.
        console.log('Successfully subscribed to topic:', response);
    })
    .catch((error) => {
        console.log('Error subscribing to topic:', error);
    });

// These registration tokens come from the client FCM SDKs.
const registrationTokens = [
    'YOUR_REGISTRATION_TOKEN_1',
    // ...
    'YOUR_REGISTRATION_TOKEN_n'
];

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DESUBSCRIPCION A TOPICOS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Unsubscribe the devices corresponding to the registration tokens from
// the topic.
getMessaging().unsubscribeFromTopic(registrationTokens, topic)
    .then((response) => {
        // See the MessagingTopicManagementResponse reference documentation
        // for the contents of response.
        console.log('Successfully unsubscribed from topic:', response);
    })
    .catch((error) => {
        console.log('Error unsubscribing from topic:', error);
    });


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ENVIO DE NOTIFICACIONES
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// The topic name can be optionally prefixed with "/topics/".
const topic = 'highScores';

const message = {
    data: {
        score: '850',
        time: '2:45'
    },
    topic: topic
};

// Send a message to devices subscribed to the provided topic.
getMessaging().send(message)
    .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
    })
    .catch((error) => {
        console.log('Error sending message:', error);
    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Define a condition which will send to devices which are subscribed
// to either the Google stock or the tech industry topics.
const condition = '\'stock-GOOG\' in topics || \'industry-tech\' in topics';

// See documentation on defining a message payload.
const message = {
    notification: {
        title: '$FooCorp up 1.43% on the day',
        body: '$FooCorp gained 11.80 points to close at 835.67, up 1.43% on the day.'
    },
    condition: condition
};

// Send a message to devices subscribed to the combination of topics
// specified by the provided condition.
getMessaging().send(message)
    .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
    })
    .catch((error) => {
        console.log('Error sending message:', error);
    });


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


