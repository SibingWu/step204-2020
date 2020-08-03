/**
 * This file is specific to log-in/applicant/index.html. 
 * It renders the fields on the page dynamically
 */

// TODO(issue/21): get the language from the browser
const CurrentLocale = 'en';

/**
 * Import statements are static so its parameters cannot be dynamic.
 * TODO(issue/22): figure out how to use dynamic imports
 */
import {AppStrings} from '../../strings.en.js';

const COMMONG_STRINGS = AppStrings['log-in'];
const STRINGS = AppStrings['applicant-log-in'];
const LOGIN_HOMEPAGE_PATH = '../index.html';

window.onload = () => {
  renderPageElements();
}

/** Adds all the text to the fields on this page. */
function renderPageElements() {
  const accountElement = document.getElementById('account');

  const accountLabelElement = accountElement.children[0];
  accountLabelElement.innerText = STRINGS['account'];

  const accountInputElement = accountElement.children[1];
  accountInputElement.setAttribute('name', 'account-input');
  accountInputElement.setAttribute('type', 'text');

  const otpElement = document.getElementById('otp');

  const otpLabelElement = otpElement.children[0];
  otpLabelElement.innerText = STRINGS['otp'];

  const otpInputElement = otpElement.children[1];
  otpInputElement.setAttribute('name', 'otp-input');
  otpInputElement.setAttribute('type', 'text');

  const otpButton = document.getElementById('otp-button');
  otpButton.innerText = STRINGS['otp-button'];

  const backButton = document.getElementById('back');
  backButton.innerText = COMMONG_STRINGS['back'];

  const submitButton = document.getElementById('submit');
  submitButton.innerText = COMMONG_STRINGS['submit'];
}

const otpButton = document.getElementById('otp');
otpButton.addEventListener('click', (_) => {
  // TODO(issue/78): send a OTP sms
});

const backButton = document.getElementById('back');
backButton.addEventListener('click', (_) => {
  window.location.href = LOGIN_HOMEPAGE_PATH;
});

const submitButton = document.getElementById('submit');
submitButton.addEventListener('click', (_) => {
  // TODO(issue/78): send the account & otp input to the firebase auth related stuff
});
