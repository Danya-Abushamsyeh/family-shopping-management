// // Import the functions you need from the SDKs you need

// import { firebase } from "@react-native-firebase/auth";
// import '@react-native-firebase/auth'
// import { initializeApp } from "firebase/app";

// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyCLBP1DtXiz-daQl1bHRnJXhd0t7W1m3Ww",
//   authDomain: "todolist-84c80.firebaseapp.com",
//   projectId: "todolist-84c80",
//   storageBucket: "todolist-84c80.appspot.com",
//   messagingSenderId: "268694599173",
//   appId: "1:268694599173:web:741db0f89abc76a4b84e6c",
//   measurementId: "G-H1ZH8VSTLF"
// };

// const app = firebase.initializeApp(firebaseConfig);
// const auht = app.auth();

// export { auth };

// firebase.js

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth'

const firebaseConfig = {
    apiKey: "AIzaSyCLBP1DtXiz-daQl1bHRnJXhd0t7W1m3Ww",
    authDomain: "todolist-84c80.firebaseapp.com",
    projectId: "todolist-84c80",
    storageBucket: "todolist-84c80.appspot.com",
    messagingSenderId: "268694599173",
    appId: "1:268694599173:web:741db0f89abc76a4b84e6c",
    measurementId: "G-H1ZH8VSTLF"
  };

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;


