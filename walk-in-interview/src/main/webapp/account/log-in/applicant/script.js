/**
 * This file is specific to log-in/applicant/index.html.
 * It renders the fields on the page dynamically.
 */

// TODO(issue/21): get the language from the browser
const CurrentLocale = 'en';

/**
 * Import statements are static so its parameters cannot be dynamic.
 * TODO(issue/22): figure out how to use dynamic imports
 */
import {AppStrings} from '../../../strings.en.js';
import {Auth} from '../../firebase-auth.js';

const COMMONG_STRINGS = AppStrings['log-in'];
const LOGIN_HOMEPAGE_PATH = '../index.html';
const HOMEPAGE_PATH = '../../../index.html';

window.onload = () => {
  renderPageElements();
};

/** Adds all the text to the fields on this page. */
function renderPageElements() {
  Auth.addPhoneAuthUI('phone-auth', HOMEPAGE_PATH);

  const backButton = document.getElementById('back');
  backButton.innerText = COMMONG_STRINGS['back'];
}

const backButton = document.getElementById('back');
backButton.addEventListener('click', (_) => {
  window.location.href = LOGIN_HOMEPAGE_PATH;
});
