/**
 * This file is specific to index.html for new-job. It renders the fields on the
 * page dynamically, and it also makes the POST request when the form
 * is submitted.
 */

// TODO(issue/21): get the language from the browser
const CurrentLocale = 'en';

/**
 * Import statements are static so its parameters cannot be dynamic.
 * TODO(issue/22): figure out how to use dynamic imports
 */
import {AppStrings} from '../strings.en.js';
import {API} from '../apis.js';

import {getRequirementsList, setErrorMessage,
  renderSelectOptions} from '../common-functions.js';

const STRINGS = AppStrings['job'];
const NEW_JOB_STRINGS = AppStrings['new-job'];
const HOMEPAGE_PATH = '../index.html';

/**
 * Note that this is needed because in JS we can hold bigger Integer
 * values than in Java.
 */
const JAVA_INTEGER_MAX_VALUE = Math.pow(2, 31) - 1;

window.onload = () => {
  renderJobPageElements();
};

/** Adds all the titles to the fields on this page. */
function renderJobPageElements() {
  const cancelButton = document.getElementById('cancel');
  cancelButton.setAttribute('value', STRINGS['cancel']);
  cancelButton.setAttribute('type', 'reset');

  const jobPageTitle = document.getElementById('page-title');
  jobPageTitle.innerText = NEW_JOB_STRINGS['page-title'];

  const submitButton = document.getElementById('submit');
  submitButton.setAttribute('value', NEW_JOB_STRINGS['submit']);
  submitButton.setAttribute('type', 'submit');

  const jobTitle = document.getElementById('title');
  jobTitle.setAttribute('type', 'text');
  jobTitle.setAttribute('placeholder', STRINGS['title']);
  jobTitle.setAttribute('required', true);

  const jobDescription = document.getElementById('description');
  jobDescription.setAttribute('placeholder', STRINGS['description']);
  jobDescription.setAttribute('required', true);

  const jobAddress = document.getElementById('address');
  jobAddress.setAttribute('placeholder', STRINGS['address']);
  jobAddress.setAttribute('required', true);

  const postalCode = document.getElementById('postal-code');
  postalCode.setAttribute('type', 'text');
  postalCode.setAttribute('placeholder', STRINGS['postal-code']);
  postalCode.setAttribute('required', true);

  const requirementsTitle =
    document.getElementById('requirements-title');
  requirementsTitle.innerText = STRINGS['requirements-title'];
  renderRequirementsList();

  const payTitle = document.getElementById('pay-title');
  payTitle.innerText = STRINGS['pay-title'];
  renderJobPayFrequencyOptions();

  const payMin = document.getElementById('pay-min');
  payMin.setAttribute('type', 'number');
  payMin.setAttribute('placeholder', STRINGS['pay-min']);
  payMin.setAttribute('required', true);

  const payMax = document.getElementById('pay-max');
  payMax.setAttribute('type', 'number');
  payMax.setAttribute('placeholder', STRINGS['pay-max']);
  payMax.setAttribute('required', true);

  const durationTitle = document.getElementById('duration-title');
  durationTitle.innerText = STRINGS['duration-title'];
  renderJobDurationOptions();

  const expiryTitle = document.getElementById('expiry-title');
  expiryTitle.innerText = STRINGS['expiry-title'];
  const expiryInput = document.getElementById('expiry');
  expiryInput.setAttribute('type', 'date');
  expiryInput.setAttribute('required', true);
  renderJobExpiryLimits();

  /* reset the error to make sure no error msg initially present */
  setErrorMessage(/* errorMessageElementId= */ 'error-message', /* msg= */ '',
      /* includesDefaultMsg= */ false);
}

/**
 * Sets the error message according to the param. This function
 * will also highlight the field where the error is.
 * @param {String} errorFieldId The element in which the error is.
 * @param {String} msg The message that the error div should display.
 * @param {boolean} includesDefaultMsg Whether the deafult
 *    message should be included.
 */
function setErrorMessageAndField(errorFieldId, msg, includesDefaultMsg) {
  setErrorMessage('error-message', msg, includesDefaultMsg);

  document.getElementById(errorFieldId).classList.add('error-field');
}

/** Add the list of requirements that are stored in the database. */
function renderRequirementsList() {
  const requirementsList = getRequirementsList();
  const requirementsListElement =
    document.getElementById('requirements-list');

  /* reset the list so we don't render the same requirements twice */
  requirementsListElement.innerHTML = '';
  const requirementElementTemplate =
    document.getElementById('requirement-element-template');
  for (const key in requirementsList) {
    if (requirementsList.hasOwnProperty(key)) {
      const requirementElement = requirementElementTemplate
          .cloneNode( /* and child elements */ true);
      requirementElement.setAttribute('id', key);

      const checkbox = requirementElement.children[0];
      checkbox.setAttribute('id', key);
      checkbox.setAttribute('value', key);
      checkbox.setAttribute('name', 'requirement');

      const label = requirementElement.children[1];
      label.setAttribute('for', key);
      label.innerText = requirementsList[key];

      requirementsListElement.appendChild(requirementElement);
    }
  }
}

/** Dynamically add the options for job pay frequency. */
function renderJobPayFrequencyOptions() {
  const jobPaySelect = document.getElementById('pay-frequency');
  jobPaySelect.setAttribute('required', true);

  renderSelectOptions(jobPaySelect, STRINGS['pay-frequency']);
}

/** Dynamically add the options for job duration. */
function renderJobDurationOptions() {
  const jobDurationSelect = document.getElementById('duration');
  jobDurationSelect.setAttribute('required', true);

  renderSelectOptions(jobDurationSelect, STRINGS['duration']);
}

/** Dynamically add the limits for choosing the new job post expiry. */
function renderJobExpiryLimits() {
  const date = new Date();
  const min = date.toISOString().substr(0, 10);
  date.setFullYear(date.getFullYear() + 1);
  const max = date.toISOString().substr(0, 10);

  const datePicker = document.getElementById('expiry');
  datePicker.setAttribute('min', min);
  datePicker.setAttribute('max', max);
}

/**
 * Gets job detail from user input.
 * @return {Object} containing the user inputs.
 */
function getJobDetailsFromUserInput() {
  const name = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const address = document.getElementById('address').value;
  const postalCode = document.getElementById('postal-code').value;
  const payFrequency = document.getElementById('pay-frequency').value;
  const payMin = document.getElementById('pay-min').valueAsNumber;
  const payMax = document.getElementById('pay-max').valueAsNumber;

  const requirementsCheckboxes =
    document.getElementsByName('requirement');
  const requirementsMap = new Map();
  requirementsCheckboxes.forEach(({checked, id}) => {
    requirementsMap[id] = checked;
  });

  const expiry = document.getElementById('expiry').valueAsNumber;
  const duration = document.getElementById('duration').value;

  const jobDetails = {
    jobTitle: name,
    jobLocation: {
      address: address,
      postalCode: postalCode,
      region: findRegion(postalCode),
      latitude: 1.3039, // TODO(issue/13): get these from places api
      longitude: 103.8358,
    },
    jobDescription: description,
    jobPay: {
      paymentFrequency: payFrequency,
      min: payMin,
      max: payMax,
    },
    requirements: requirementsMap,
    postExpiryTimestamp: expiry,
    jobDuration: duration,
  };

  return jobDetails;
}

/**
 * Returns the Singapore region based on the postal code.
 * This is done by taking the first two digits of the postal
 * code and seeing which region it corresponds to.
 * Central: 01-45
 * West:  58-71
 * East: 46-52, 81
 * North: 72-73, 75-80
 * North-East: 53-57, 82
 * @param {String} postalCode The Singapore postal code.
 * @return {String} The Singapore region.
 */
function findRegion(postalCode) {
  /*
   * We have made the assumption that if the user's
   * postal code region is 01, they would have written
   * 01xxx rather than 1xxx.
   */
  if (postalCode.length < 2) {
    throw new Error('postalCode length should not be less than 2');
  }
  const digits = parseInt(postalCode.substring(0, 2));

  if (digits >= 1 && digits <= 45) {
    return 'CENTRAL';
  } else if (digits >= 58 && digits <= 71) {
    return 'WEST';
  } else if ((digits >= 46 && digits <= 52) ||
      digits === 81) {
    return 'EAST';
  } else if ((digits >= 72 && digits <= 73) ||
      (digits >= 75 && digits <= 80)) {
    return 'NORTH';
  } else if ((digits >= 53 && digits <= 57) ||
      digits === 82) {
    return 'NORTH_EAST';
  }

  throw new Error(`invalid postal code: ${postalCode}`);
}

/**
 * Validates the user input
 * @return {boolean} depending on whether the input is valid or not.
 */
function validateRequiredUserInput() {
  // TODO(issue/19): add more validation checks
  const name = document.getElementById('title');
  const description = document.getElementById('description');
  const address = document.getElementById('address');
  const payFrequency = document.getElementById('pay-frequency').value;
  const payMin = document.getElementById('pay-min').valueAsNumber;
  const payMax = document.getElementById('pay-max').valueAsNumber;
  const duration = document.getElementById('duration').value;
  const expiry = document.getElementById('expiry').valueAsNumber;

  /* Reset the fields that may have had errors before. */
  const elements = document.getElementsByClassName('error-field');
  for (const element of elements) {
    element.classList.remove('error-field');
  }

  if (name.value === '') {
    setErrorMessageAndField( /* errorFieldId= */ 'title',
        /* msg= */ name.placeholder, /* includesDefaultMsg= */ true);
    return false;
  }

  if (description.value === '') {
    setErrorMessageAndField(/* errorFieldId= */ 'description',
        /* msg= */ description.placeholder, /* includesDefaultMsg= */ true);
    return false;
  }

  if (address.value === '') {
    setErrorMessageAndField(/* errorFieldId= */ 'address',
        /* msg= */ address.placeholder, /* includesDefaultMsg= */ true);
    return false;
  }

  if (payFrequency === '') {
    setErrorMessageAndField(/* errorFieldId= */'pay-frequency',
        /* msg= */ document.getElementById('pay-title').textContent,
        /* includesDefaultMsg= */ true);
    return false;
  }

  if (Number.isNaN(payMin) || (payMin > JAVA_INTEGER_MAX_VALUE) || payMin < 0) {
    setErrorMessageAndField(/* errorFieldId= */ 'pay-min',
        /* msg= */ document.getElementById('pay-title').textContent,
        /* includesDefaultMsg= */ true);
    return false;
  }

  if (Number.isNaN(payMax) || (payMax > JAVA_INTEGER_MAX_VALUE) ||
    payMin > payMax || payMax < 0) {
    setErrorMessageAndField(/* errorFieldId= */ 'pay-max',
        /* msg= */ document.getElementById('pay-title').textContent,
        /* includesDefaultMsg= */ true);
    return false;
  }

  if (duration === '') {
    setErrorMessageAndField(/* errorFieldId= */ 'duration',
        /* msg= */ document.getElementById('duration-title').textContent,
        /* includesDefaultMsg= */ true);
    return false;
  }

  if (Number.isNaN(expiry)) {
    setErrorMessageAndField(/* errorFieldId= */ 'expiry',
        /* msg= */ document.getElementById('expiry-title').textContent,
        /* includesDefaultMsg= */ true);
    return false;
  }

  return true && validatePostalCode();
}

/**
 * Validation for the postalCode.
 * @return {boolean} Whether its valid.
 */
function validatePostalCode() {
  const postalCode = document.getElementById('postal-code');

  /*
   * The first two digits of the postal code must be numbers within
   * the below range because those two digits correspond to the location's
   * district, which indicates its region in Singapore.
   */
  if (postalCode.value === '' || postalCode.length < 2 ||
    Number.isNaN(parseInt(postalCode.value[0])) ||
    Number.isNaN(parseInt(postalCode.value[1]))) {
    setErrorMessageAndField(/* errorFieldId= */ 'postal-code',
        /* msg= */ postalCode.placeholder, /* includesDefaultMsg= */ true);
    return false;
  }

  const postalCodeDigits = parseInt(postalCode.value.substring(0, 2));
  if (Number.isNaN(postalCodeDigits) || postalCodeDigits < 0 ||
    postalCodeDigits === 74 || postalCodeDigits > 82) {
    setErrorMessageAndField(/* errorFieldId= */ 'postal-code',
        /* msg= */ STRINGS['postal-code'], /* includesDefaultMsg= */ true);
    return false;
  }

  return true;
}

const submitButton = document.getElementById('submit');
submitButton.addEventListener('click', (_) => {
  if (!validateRequiredUserInput()) {
    return;
  }

  const jobDetails = getJobDetailsFromUserInput();
  fetch(API['new-job'], {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(jobDetails),
  })
      .then((response) => response.text())
      .then((data) => {
        console.log('data', data);
        /* reset the error (there might have been an error msg from earlier) */
        setErrorMessage(/* errorMessageElementId= */ 'error-message',
            /* msg= */ '', /* include default msg= */ false);
        window.location.href= HOMEPAGE_PATH;
      })
      .catch((error) => {
        setErrorMessage(/* errorMessageElementId= */ 'error-message',
            /* msg= */ STRINGS['creating-job-error-message'],
            /* include default msg= */ false);
        console.error('error creating job listing', error);
      });
});

const cancelButton = document.getElementById('cancel');
cancelButton.addEventListener('click', (_) => {
  window.location.href= HOMEPAGE_PATH;
});
