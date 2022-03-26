const functions = require("firebase-functions");
const Filter = require('bad-words');

const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.detectEvilUsers = functions.firestore
        .document('messages/{msgId}')
        .onCreate(async (doc, ctx) => {
            console('here');
            const filter = new Filter();
            const {text, uid} = doc.data();

            //if filter words included
            if(filter.isProfane(text)){
                //got filter words
                const cleaned = filter.clean(text);
                //update a warning msg on the UI
                await doc.ref.update({text: `You got banned for saying... ${cleaned}`});
                //add user into banned collection
                await db.collection('banned').doc(uid).set({});
            }
        })
