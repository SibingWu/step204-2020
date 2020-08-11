/**
 * This file is specific to log-in/business/index.html.
 * It renders the fields on the page dynamically
 */

// TODO(issue/21): get the language from the browser
const CurrentLocale = 'en';

/**
 * Import statements are static so its parameters cannot be dynamic.
 * TODO(issue/22): figure out how to use dynamic imports
 */
import {AppStrings} from '../../../strings.en.js';
import {Auth} from '../../firebase-auth.js';
import {setErrorMessage} from '../../../common-functions.js';

const COMMONG_STRINGS = AppStrings['log-in'];
const STRINGS = AppStrings['business-log-in'];
const LOGIN_HOMEPAGE_PATH = '../index.html';
const HOMEPAGE_PATH = '../../../index.html';

const INVALID_EMAIL_ERROR_CODE = 'auth/invalid-email';
const USER_DISABLED_ERROR_CODE = 'auth/user-disabled';
const USER_NOT_FOUND_ERROR_CODE = 'auth/user-not-found';
const WRONG_PASSWORD_ERROR_CODE = 'auth/wrong-password';

window.onload = () => {
  renderPageElements();
};

/** Adds all the text to the fields on this page. */
function renderPageElements() {
  const accountElement = document.getElementById('account');

  const accountLabelElement = accountElement.children[0];
  accountLabelElement.innerText = STRINGS['account'];

  const accountInputElement = accountElement.children[1];
  accountInputElement.setAttribute('name', 'account-input');
  accountInputElement.setAttribute('type', 'text');

  const passwordElement = document.getElementById('password');

  const passwordLabelElement = passwordElement.children[0];
  passwordLabelElement.innerText = STRINGS['password'];

  const passwordInputElement = passwordElement.children[1];
  passwordInputElement.setAttribute('name', 'password-input');
  passwordInputElement.setAttribute('type', 'password');

  const backButton = document.getElementById('back');
  backButton.innerText = COMMONG_STRINGS['back'];

  const submitButton = document.getElementById('submit');
  submitButton.innerText = COMMONG_STRINGS['submit'];
}

const backButton = document.getElementById('back');
backButton.addEventListener('click', (_) => {
  window.location.href = LOGIN_HOMEPAGE_PATH;
});

const submitButton = document.getElementById('submit');
submitButton.addEventListener('click', (_) => {
  // Disables the button to avoid accidental double click
  document.getElementById('submit').disabled = true;

  const account = document.getElementById('account-input').value;

  if (account === '') {
    setErrorMessage(/* errorMessageElementId= */'error-message',
        /* msg= */ STRINGS['empty-email'],
        /* includesDefault= */false);
    return;
  }

  const password = document.getElementById('password-input').value;

  // Resets the error (there might have been an error msg from earlier)
  setErrorMessage(/* errorMessageElementId= */'error-message',
      /* msg= */ '',
      /* includesDefault= */false);

  Auth.signIntoBusinessAccount(account, password)
      .then(() => {
        // Enables the button regardless of success or failure
        document.getElementById('submit').disabled = false;

        // Back to home page
        window.location.href = HOMEPAGE_PATH;
      })
      .catch((error) => {
        showErrorMessageFromError(error);
        document.getElementById('submit').disabled = false;

        // Back to home page
        window.location.href = HOMEPAGE_PATH;
      });
});

/**
 * Displays the error messages according to different situations.
 *
 * @param {Error} error Error from sign in.
 */
function showErrorMessageFromError(error) {
  switch (error.code) {
    case INVALID_EMAIL_ERROR_CODE:
      setErrorMessage(/* errorMessageElementId= */'error-message',
          /* msg= */ STRINGS['invalid-email-error'],
          /* includesDefault= */false);
      break;
    case USER_DISABLED_ERROR_CODE:
      setErrorMessage(/* errorMessageElementId= */'error-message',
          /* msg= */ STRINGS['user-disabled'],
          /* includesDefault= */false);
      break;
    case USER_NOT_FOUND_ERROR_CODE:
      setErrorMessage(/* errorMessageElementId= */'error-message',
          /* msg= */ STRINGS['user-not-found'],
          /* includesDefault= */false);
      break;
    case WRONG_PASSWORD_ERROR_CODE:
      setErrorMessage(/* errorMessageElementId= */'error-message',
          /* msg= */ STRINGS['wrong-password'],
          /* includesDefault= */false);
      break;
    default:
      setErrorMessage(/* errorMessageElementId= */'error-message',
          /* msg= */ COMMONG_STRINGS['error-message'],
          /* includesDefault= */false);
      console.error(error.message);
      break;
  }
}
