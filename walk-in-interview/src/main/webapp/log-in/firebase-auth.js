/**
 * This file will handle all the functions related to firebase auth.
 *
 * Note that the following lines would need to be added to any html
 * file that wishes to use firebase auth:
 * <script src="https://www.gstatic.com/firebasejs/7.17.1/firebase-app.js"></script>
 * <script src="https://www.gstatic.com/firebasejs/7.17.1/firebase-auth.js"></script>
 */

import {AppStrings} from '../strings.en.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDhpzKNLAMNyEdw6ovQ5sPvnOhXDwhse-o',
  authDomain: 'com-walk-in-interview.firebaseapp.com',
  databaseURL: 'https://com-walk-in-interview.firebaseio.com',
  projectId: 'google.com:walk-in-interview',
  storageBucket: 'undefined',
  messagingSenderId: '610715446188',
  appId: '1:610715446188:web:8cec0c2798940bb9d32809',
  measurementId: 'G-RJ55G4ZXN8',
};

firebase.initializeApp(firebaseConfig);

// TODO(issue/21): get the language from the browser
const CurrentLocale = 'en';

firebase.auth().languageCode = CurrentLocale;

const STRINGS = AppStrings['auth'];

/**
 * This will create a new business account.
 *
 * @param {String} email The email for the new business account.
 * @param {String} password The password for the new business account.
 */
function createBusinessAccount(email, password) {
  firebase.auth().createUserWithEmailAndPassword(email, password)
      .catch((error) => {
        console.error(error);
      });
  checkCurrentUser();
}

/**
 * This will sign into an existing business account.
 *
 * @param {String} email The email for the exisiting business account.
 * @param {String} password The password for the existing business account.
 */
function signIntoBusinessAccount(email, password) {
  firebase.auth().signInWithEmailAndPassword(email, password)
      .catch((error) => {
        console.error(error);
      });
  checkCurrentUser();
}

/**
 * This will create a new applicant account.
 *
 * @param {String} phoneNumber The phone number for the new applicant account.
 * @param {Object} appVerifier The recaptcha verifier.
 */
function createApplicantAccount(phoneNumber, appVerifier) {
  // TODO(issue/79): set up phone number sign in with otp and recaptcha
}

/**
 * This will sign into an existing applicant account.
 *
 * @param {String} phoneNumber The number for the existing applicant account.
 * @param {Object} appVerifier The recaptcha verifier.
 */
function signIntoApplicantAccount(phoneNumber, appVerifier) {
  // TODO(issue/79): set up phone number sign in with otp and recaptcha
}

/**
 * Signs out the current user.
 *
 * @param {String} elementId The div in which to show the signed out status.
 */
function signOutCurrentUser(elementId) {
  firebase.auth().signOut().then(() => {
    console.log('sign out successful');
    document.getElementById(elementId).innerText = STRINGS['sign-out-success'];
  }).catch((error) => {
    console.error(error);
  });
}

/**
 * Checks the user sign in status.
 */
function checkCurrentUser() {
  firebase.auth().onAuthStateChanged((firebaseUser) => {
    if (firebaseUser) {
      console.log('signed in', firebaseUser);
    } else {
      console.log('not signed in');
    }
  });
}

export {createBusinessAccount, signIntoBusinessAccount,
  createApplicantAccount, signIntoApplicantAccount, signOutCurrentUser};
