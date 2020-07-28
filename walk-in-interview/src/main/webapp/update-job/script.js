/**
 * This file is specific to update-job/index.html. It renders the fields on the
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

import {JOB_ID_PARAM, getRequirementsList,
  setErrorMessage, renderSelectOptions} from '../common-functions.js';

const STRINGS = AppStrings['job'];
const UPDATE_JOB_STRINGS = AppStrings['update-job'];
const COMMON_STRINGS = AppStrings['common'];
const HOMEPAGE_PATH = '../index.html';
const BAD_REQUEST_STATUS_CODE = 400;

// Status of this job post, default to be ACTIVE
let status = 'ACTIVE';

window.onload = () => {
  loadAndShowJob(getJobId());
};

/**
 * Gets the jobId from the url.
 * @return {String} The jobId.
 */
function getJobId() {
  const queryString = window.location.search;

  const urlParams = new URLSearchParams(queryString);
  if (urlParams === '') {
    throw new Error('url params should not be empty');
  }

  return urlParams.get(JOB_ID_PARAM);
}

/**
 * Gets the Job post given its id.
 *
 * @param {String} jobId Cloud Firestore Job Id.
 */
function loadAndShowJob(jobId) {
  if (jobId === '') {
    setErrorMessage(/* errorMessageElementId= */'error-message',
        /* msg= */ COMMON_STRINGS['empty-job-id-error-message'],
        /* includesDefault= */false);
    return;
  }

  // Renders the html elements.
  renderPageElements();

  // Only run it for selenium test.
  // var job = getJobForSeleniumTest();
  // addPrefilledInfo(job);
  // status = job.jobStatus;
  // return;

  // TODO(issue/53): run the web page to test once doGet finishes in JobServlet
  const url = `${API['get-individual-job']}?jobId=${jobId}`;
  fetch(url, {
    method: 'GET',
    headers: {'Content-Type': 'application/json'},
  })
      .then((response) => response.json())
      .then((job) => {
        addPrefilledInfo(job);
        // Sets the status of this job post
        status = job.jobStatus;
      })
      .catch((error) => {
        setErrorMessage(/* errorMessageElementId= */'error-message',
            /* msg= */ UPDATE_JOB_STRINGS['error-message'],
            /* includesDefault= */false);
        console.log('error', error);
      });
}

/**
 * Adds all the titles on this page.
 */
function renderPageElements() {
  const cancelButton = document.getElementById('cancel');
  cancelButton.setAttribute('value', STRINGS['cancel']);
  cancelButton.setAttribute('type', 'reset');

  const jobPageTitle = document.getElementById('page-title');
  jobPageTitle.innerText = UPDATE_JOB_STRINGS['page-title'];

  const submitButton = document.getElementById('update');
  submitButton.setAttribute('value', UPDATE_JOB_STRINGS['update']);
  submitButton.setAttribute('type', 'submit');

  const jobTitle = document.getElementById('title');
  jobTitle.setAttribute('type', 'text');

  const jobDescription = document.getElementById('description');
  jobDescription.setAttribute('type', 'text');

  const jobAddress = document.getElementById('address');
  jobAddress.setAttribute('type', 'text');

  const postalCode = document.getElementById('postal-code');
  postalCode.setAttribute('type', 'text');

  const requirementsTitle = document.getElementById('requirements-title');
  requirementsTitle.innerText = STRINGS['requirements-title'];

  const payTitle = document.getElementById('pay-title');
  payTitle.innerText = STRINGS['pay-title'];

  const jobPayMin = document.getElementById('pay-min');
  jobPayMin.setAttribute('type', 'number');

  const jobPayMax = document.getElementById('pay-max');
  jobPayMax.setAttribute('type', 'number');

  const durationTitle = document.getElementById('duration-title');
  durationTitle.innerText = STRINGS['duration-title'];

  const expiryTitle = document.getElementById('expiry-title');
  expiryTitle.innerText = STRINGS['expiry-title'];
  const jobExpiry = document.getElementById('expiry');
  jobExpiry.setAttribute('type', 'date');

  // Resets the error to make sure no error msg initially present.
  setErrorMessage(/* errorMessageElementId= */'error-message',
      /* msg= */'', /* includesDefault= */false);
}

/**
 * Adds pre-filled info to the fields on this page.
 *
 * @param {Job} job Job json.
 */
function addPrefilledInfo(job) {
  if (job == null) {
    throw new Error(UPDATE_JOB_STRINGS['error-message']);
  }

  const jobTitle = document.getElementById('title');
  const jobTitleContent = job.jobTitle;
  jobTitle.setAttribute('value', jobTitleContent);

  const jobDescription = document.getElementById('description');
  const jobDescriptionContent = job.jobDescription;
  jobDescription.innerText = jobDescriptionContent;

  const jobAddress = document.getElementById('address');
  const jobAddressContent = job.jobLocation.address;
  jobAddress.setAttribute('value', jobAddressContent);

  const postalCode = document.getElementById('postal-code');
  const postalCodeContent = job.jobLocation.postalCode;
  postalCode.setAttribute('value', postalCodeContent);

  const requirements = job.requirements;
  renderRequirementsList(requirements);

  const jobPayFrequency = job.jobPay.paymentFrequency;
  renderJobPayFrequencyOptions(jobPayFrequency);

  const jobPayMin = document.getElementById('pay-min');
  const jobPayMinContent = job.jobPay.min;
  jobPayMin.setAttribute('value', jobPayMinContent);

  const jobPayMax = document.getElementById('pay-max');
  const jobPayMaxContent = job.jobPay.max;
  jobPayMax.setAttribute('value', jobPayMaxContent);

  const jobDuration = job.jobDuration;
  renderJobDurationOptions(jobDuration);

  const jobExpiryTimestamp = job.postExpiryTimestamp;
  renderJobExpiryLimits(jobExpiryTimestamp);

  // Resets the error to make sure no error msg initially present.
  setErrorMessage(/* errorMessageElementId= */'error-message',
      /* msg= */'', /* includesDefault= */false);
}

/**
 * Adds the list of requirements that are stored in the database.
 *
 * @param {Array} requirements An array of requirements(string) of the job post.
 */
function renderRequirementsList(requirements) {
  const requirementsMap = getRequirementsList();
  const requirementsListElement = document.getElementById('requirements-list');

  // Resets the list in case renders the same requirements twice
  requirementsListElement.innerHTML = '';
  const requirementElementTemplate =
    document.getElementById('requirement-element-template');

  for (const key in requirementsMap) {
    if (!requirementsMap.hasOwnProperty(key)) {
      continue;
    }

    const requirementElement = requirementElementTemplate
        .cloneNode(/* includes child elements */ true);

    // tick box
    const checkbox = requirementElement.children[0];
    checkbox.setAttribute('id', key);
    checkbox.setAttribute('value', key);
    checkbox.setAttribute('name', 'requirement');

    // If this requirement is one of the criteria for this job box, tick it
    const selected = requirements[key];
    if (selected) {
      checkbox.setAttribute('checked', requirements[key]);
    }

    // text label
    const label = requirementElement.children[1];
    label.setAttribute('for', key);
    label.innerHTML = requirementsMap[key];

    requirementsListElement.appendChild(requirementElement);
  }
}

/**
 * Dynamically adds the options for job pay frequency.
 *
 * @param {String} jobPayFrequency Original pay frequency of the current job.
 */
function renderJobPayFrequencyOptions(jobPayFrequency) {
  const jobPaySelectElement = document.getElementById('pay-frequency');
  jobPaySelectElement.setAttribute('required', true);

  renderSelectOptions(jobPaySelectElement, STRINGS['pay-frequency']);
  jobPaySelectElement.value = jobPayFrequency;
}

/**
 * Dynamically adds the options for job duration.
 *
 * @param {String} jobDuration Original duration of the current job.
 */
function renderJobDurationOptions(jobDuration) {
  const jobDurationSelect = document.getElementById('duration');
  jobDurationSelect.setAttribute('required', true);

  renderSelectOptions(jobDurationSelect, STRINGS['duration']);
  jobDurationSelect.value = jobDuration;
}

/**
 * Dynamically adds the limits for choosing the new job post expiry.
 *
 * @param {long} jobExpiryTimestamp Timestamp of the expiry for this job post.
 */
function renderJobExpiryLimits(jobExpiryTimestamp) {
  const expiryDate = new Date(jobExpiryTimestamp).toISOString().substr(0, 10);

  const date = new Date();
  const min = date.toISOString().substr(0, 10);
  date.setFullYear(date.getFullYear() + 1);
  const max = date.toISOString().substr(0, 10);

  const datePicker = document.getElementById('expiry');
  datePicker.setAttribute('min', min);
  datePicker.setAttribute('max', max);
  datePicker.setAttribute('type', 'date');
  datePicker.setAttribute('value', expiryDate);
}

/**
 * Gets job detail from user input.
 * @param {String} status Status for the current job post.
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

  const jobPostId = getJobId();

  if (status === '') {
    status = 'ACTIVE';
  }

  const jobDetails = {
    jobId: jobPostId,
    jobStatus: status,
    jobTitle: name,
    jobLocation: {
      address: address,
      postalCode: postalCode,
      lat: 1.3039, // TODO(issue/13): get these from places api
      lon: 103.8358,
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
* Validates the user input.
* Shows error message on the webpage if there is field with invalid input.
*
* @return {boolean} depending on whether the input is valid or not.
*/
function validateRequiredUserInput() {
  // TODO(issue/19): add more validation checks
  const jobId = getJobId();
  const name = document.getElementById('title');
  const description = document.getElementById('description');
  const address = document.getElementById('address');
  const postalCode = document.getElementById('postal-code');
  const payFrequency = document.getElementById('pay-frequency').value;
  const payMin = document.getElementById('pay-min').valueAsNumber;
  const payMax = document.getElementById('pay-max').valueAsNumber;
  const duration = document.getElementById('duration').value;
  const expiry = document.getElementById('expiry').valueAsNumber;

  if (jobId === '') {
    setErrorMessage(/* errorMessageElementId= */'error-message',
        /* msg= */ 'Empty Job Id found.',
        /* includesDefault= */false);
    return false;
  }

  if (name.value === '') {
    setErrorMessage(/* errorMessageElementId= */'error-message',
        /* msg= */ STRINGS['title']);
    return false;
  }

  if (description.value === '') {
    setErrorMessage(/* errorMessageElementId= */'error-message',
        /* msg= */ STRINGS['description']);
    return false;
  }

  if (address.value === '') {
    setErrorMessage(/* errorMessageElementId= */'error-message',
        /* msg= */ STRINGS['address']);
    return false;
  }

  if (postalCode.value === '') {
    setErrorMessage(/* errorMessageElementId= */'error-message',
        /* msg= */ STRINGS['postal-code']);
    return false;
  }

  if (payFrequency === '' || Number.isNaN(payMin) || Number.isNaN(payMax) ||
    payMin > payMax || payMin < 0 || payMax < 0) {
    setErrorMessage(/* errorMessageElementId= */'error-message',
        /* msg= */ document.getElementById('pay-title').textContent);
    return false;
  }

  if (duration === '') {
    setErrorMessage(/* errorMessageElementId= */'error-message',
        /* msg= */ document.getElementById('duration-title').textContent);
    return false;
  }

  if (Number.isNaN(expiry)) {
    setErrorMessage(/* errorMessageElementId= */'error-message',
        /* msg= */ document.getElementById('expiry-title').textContent);
    return false;
  }

  return true;
}

const submitButton = document.getElementById('update');
submitButton.addEventListener('click', (_) => {
  if (!validateRequiredUserInput()) {
    return;
  }

  const jobDetails = getJobDetailsFromUserInput();

  fetch(API['update-job'], {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(jobDetails),
  })
      .then((response) => {
        if (response.status == BAD_REQUEST_STATUS_CODE) {
          setErrorMessage(/* errorMessageElementId= */'error-message',
              /* msg= */ UPDATE_JOB_STRINGS['storing-error-message'],
              /* includesDefault= */false);
          throw new Error(UPDATE_JOB_STRINGS['storing-error-message']);
        }

        /** reset the error (there might have been an error msg from earlier) */
        setErrorMessage(/* errorMessageElementId= */'error-message',
            /* msg= */ '', /* includesDefault= */false);
        window.location.href= HOMEPAGE_PATH;
      })
      .catch((error) => {
        // Not the server response error already caught and thrown
        if (error.message != UPDATE_JOB_STRINGS['storing-error-message']) {
          setErrorMessage(/* errorMessageElementId= */'error-message',
              /* msg= */ UPDATE_JOB_STRINGS['error-message'],
              /* includesDefault= */false);
          console.log('error', error);
        }
      });
});

const cancelButton = document.getElementById('cancel');
cancelButton.addEventListener('click', (_) => {
  window.location.href= HOMEPAGE_PATH;
});

/**
 * Returns a dummy jobId only for selenium ui test
 * since getJobId is not implemented yet.
 * @return {String} jobId for selenium test.
 */
function getJobIdForSeleniumTest() {
  return 'seleniumTestJobId';
}

/**
 * Returns a hard-coded job object only for selenium ui test
 * since the GET request to retreive the job from servlet
 * is not implemented by partner yet.
 * @return {Object} jobDetails for selenium test.
 */
function getJobForSeleniumTest() {
  const jobDetails = {
    jobStatus: 'ACTIVE',
    jobTitle: 'Software Engineer',
    jobLocation: {
      address: 'Maple Tree',
      postalCode: '123',
      lat: 1.3039, // TODO(issue/13): get these from places api
      lon: 103.8358,
    },
    jobDescription: 'Fight to defeat hair line receding',
    jobPay: {
      paymentFrequency: 'MONTHLY',
      min: 1,
      max: 4,
    },
    requirements: {
      'O_LEVEL': true,
      'LANGUAGE_ENGLISH': true,
      'DRIVING_LICENSE_C': false,
    },
    postExpiryTimestamp: 1601856000000,
    jobDuration: 'ONE_WEEK',
  };

  return jobDetails;
}
