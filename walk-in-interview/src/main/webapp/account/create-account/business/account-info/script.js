/**
 * This file is specific to account/create-account/business/account-info/index.html. 
 * It renders the fields on the page dynamically.
 */

// TODO(issue/21): get the language from the browser
const CURRENT_LOCALE = 'en';

/**
 * Import statements are static so its parameters cannot be dynamic.
 * TODO(issue/22): figure out how to use dynamic imports
 */
import {AppStrings} from '../../../../strings.en.js';
import {API} from '../../../../apis.js';
import {Auth} from '../../../firebase-auth.js';
import {USER_TYPE_COOKIE_PARAM, USER_TYPE_BUSINESS,
  setCookie, setErrorMessage} from '../../../../common-functions.js';

const HOMEPAGE_PATH = '../../../../index.html';
const STRINGS = AppStrings['create-business-account'];
const ACCOUNT_STRINGS = AppStrings['create-account'];
const SUCCESS_STATUS_CODE = 200;

window.onload = () => {
  Auth.subscribeToUserAuthenticationChanges(
    onLogIn, onLogOut, onLogInFailure, onLogOutFailure);
  renderPageElements();
};

/**
 * What to do after the user signed in and the session cookie is created.
 */
function onLogIn() {
  // TODO(issue/100): set the cookie at the server side instead
  setCookie(USER_TYPE_COOKIE_PARAM, USER_TYPE_BUSINESS);
}

/**
 * UI related function to be executed after successfully signed out.
 */
function onLogOut() {
  // No UI change
}

/**
 * UI related function to be executed for user does not sign in successfully.
 */
function onLogInFailure() {
  // No UI change
}

/**
 * UI related function to be executed for user does not sign out successfully.
 */
function onLogOutFailure() {
  // No UI change
}


/** Adds all the text to the fields on this page. */
function renderPageElements() {
  const submitButton = document.getElementById('submit');
  submitButton.setAttribute('value', ACCOUNT_STRINGS['submit']);
  submitButton.setAttribute('type', 'submit');

  const nameLabel = document.getElementById('name-label');
  nameLabel.innerText = STRINGS['name'];

  const name = document.getElementById('name');
  name.setAttribute('type',  'text');
}

/**
 * Gets account detail from user input.
 * 
 * @return {Object} Business account object containing the user inputs.
 */
function getBusinessDetailsFromUserInput() {
  const businessName = document.getElementById('name').value.trim();

  const businessDetails = {
    userType: USER_TYPE_BUSINESS,
    name: businessName,
    // empty job list is created at the server
  };

  return businessDetails;
}

/**
* Validates the user input.
* Shows error message on the webpage if there is field with invalid input.
*
* @return {boolean} depending on whether the input is valid or not.
*/
function validateRequiredUserInput() {
  const name = document.getElementById('name').value.trim();

  if (name === '') {
    setErrorMessage(/* errorMessageElementId= */'error-message',
        /* msg= */ STRINGS['name']);
    return false;
  }

  return true;
}

// Update the created preliminary account with more account information.
const submitButton = document.getElementById('submit');
submitButton.addEventListener('click', (_) => {
  if (!validateRequiredUserInput()) {
    return;
  }

  const accountDetails = getBusinessDetailsFromUserInput();

  // Update the preliminary account object with more info
  fetch(API['update-business-account'], {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(accountDetails),
  })
      .then((response) => {
        if (response.status !== SUCCESS_STATUS_CODE) {
          setErrorMessage(/* errorMessageElementId= */'error-message',
              /* msg= */ ACCOUNT_STRINGS['create-account-error-message'],
              /* includesDefault= */false);
          throw new Error(ACCOUNT_STRINGS['create-account-error-message']);
        }

        /** reset the error (there might have been an error msg from earlier) */
        setErrorMessage(/* errorMessageElementId= */'error-message',
            /* msg= */ '', /* includesDefault= */false);
        window.location.href = HOMEPAGE_PATH;
      })
      .catch((error) => {
        // Not the server response error already caught and thrown
        if (error.message != ACCOUNT_STRINGS['create-account-error-message']) {
          console.log('error', error);

          setErrorMessage(/* errorMessageElementId= */'error-message',
              /* msg= */ ACCOUNT_STRINGS['error-message'],
              /* includesDefault= */false);
        }
      });
});
