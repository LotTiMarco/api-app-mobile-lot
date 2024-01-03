// firebase admin sdk with alias
import * as admin from "firebase-admin";

import { readFile } from 'fs/promises';

export default class FCMIntegration {
    constructor() {
        this._firebase = null;
    }

    async configure() {
        try {
            const serviceAccount = JSON.parse(
                await readFile(
                    new URL('../../app-mobile-lot---test-firebase-adminsdk-as3q5-8c16ee0a0c.json', import.meta.url)
                )
            );

            console.log(serviceAccount)

            // Initialize Firebase
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });

            this._firebase = admin;
            console.log("Firebase configured successfully")
            return;
        } catch (error) {
            throw error;
        }
    }

    async sendNotification(deviceToken, message={}) {
        try {
            // messageFormat = {
            //     notification: {
            //         title,
            //         body,
            //     },
            //     data: data,
            //     topic: topic
            // }
            const options = {
                priority: "high",
                timeToLive: 60 * 60 * 24,
            };

            this._firebase
                .messaging()
                .sendToDevice(deviceToken, message, options)
                .then((response) => {
                    return console.log("Notification sent successfully");
                })
                .catch((error) => {
                    error.deviceToken = deviceToken;
                    throw error;
                });

        } catch (error) {
            throw error;
        }
    }
}