/**
 * This file is specific to index.html for job-details. It renders the fields
 * on the page dynamically, and it also makes the GET request to get the job
 * details.
 */

// TODO(issue/21): get the language from the browser
const CurrentLocale = 'en';

/**
 * Import statements are static so its parameters cannot be dynamic.
 * TODO(issue/22): figure out how to use dynamic imports
 */
import {AppStrings} from '../strings.en.js';
import {API} from '../apis.js';

import {JOB_ID_PARAM, setErrorMessage,
  getRequirementsList} from '../common-functions.js';

import {API} from '../apis.js';

const UPDATE_JOB_PATH = '../update-job/index.html';
const HOMEPAGE_PATH = '../index.html';

const COMMON_STRINGS = AppStrings['common'];
const STRINGS = AppStrings['job-details'];
const JOB_STRINGS = AppStrings['job'];

window.onload = () => {
  renderJobDetailsPageElements();
};

/**
 * Add the current job (given the jobId) details to the page,
 * as well as the other elements on the page.
 */
async function renderJobDetailsPageElements() {
  const homepageButton = document.getElementById('back-to-homepage');
  homepageButton.innerText = STRINGS['back-to-homepage'];
  homepageButton.addEventListener('click', (_) => {
    window.location.href= HOMEPAGE_PATH;
  });

  const jobId = getJobId();
  if (jobId === '') {
    setErrorMessage('error-message', /* msg= */ STRINGS['error-message'],
        /* includesDefaultMsg= */ false);
    throw new Error('jobId should not be empty');
  }

  const updateForm = document.getElementById('update-form');
  updateForm.method = 'GET';
  updateForm.action = UPDATE_JOB_PATH;

  const jobIdElement = document.getElementById('job-id');
  jobIdElement.setAttribute('type', 'hidden');
  jobIdElement.setAttribute('name', JOB_ID_PARAM);
  jobIdElement.setAttribute('value', jobId);

  const updateButton = document.getElementById('update');
  updateButton.setAttribute('value', STRINGS['update']);
  updateButton.setAttribute('type', 'submit');
  // in case it was disabled earlier
  updateButton.disabled = false;

  const deleteButtonElement = document.getElementById('delete');
  deleteButtonElement.innerText = STRINGS['delete'];
  // in case it was disabled earlier
  deleteButtonElement.disabled = false;

  const job = await getJobDetails(jobId)
      .catch((error) => {
        console.error('error fetching job post', error);
        setErrorMessage('error-message', /* msg= */ STRINGS['error-message'],
            /* include default msg= */ false);
        // disable the buttons if theres an error
        updateButton.disabled = true;
        deleteButtonElement.disabled = true;
      });

  displayJobDetails(job);
}

/**
 * This will add the details of the job post onto the page.
 * @param {Object} job The job details.
 */
function displayJobDetails(job) {
  if (job === undefined || job.length === 0) {
    setErrorMessage('error-message', /* msg= */ STRINGS['error-message'],
        /* includesDefaultMsg= */ false);
    // disable the buttons if theres an error
    document.getElementById('update').disabled = true;
    document.getElementById('delete').disabled = true;
    return;
  }

  // in case they were disabled earlier
  document.getElementById('update').disabled = false;
  document.getElementById('delete').disabled = false;

  const jobTitle = document.getElementById('job-title');
  jobTitle.innerText = job['jobTitle'];

  const jobAddress = document.getElementById('address');
  const location = job['jobLocation'];
  jobAddress.innerText = `${location['address']}, ${location['postalCode']}`;

  const jobDescription = document.getElementById('description');
  jobDescription.innerText = job['jobDescription'];

  const jobPayTitle = document.getElementById('pay-title');
  jobPayTitle.innerText = `${JOB_STRINGS['pay-title']}:`;

  const pay = job['jobPay'];
  const jobPayMin = document.getElementById('pay-min');
  jobPayMin.innerText = pay['min'];

  const jobPayMax = document.getElementById('pay-max');
  jobPayMax.innerText = pay['max'];

  const payFrequencyOptions = JOB_STRINGS['pay-frequency'];
  const jobFrequency = document.getElementById('pay-frequency');
  jobFrequency.innerText = `(${payFrequencyOptions[pay['paymentFrequency']]})`;

  const jobDurationTitle = document.getElementById('duration-title');
  jobDurationTitle.innerText = `${JOB_STRINGS['duration-title']}:`;

  const durationOptions = JOB_STRINGS['duration'];
  const jobDuration = document.getElementById('duration');
  jobDuration.innerText = durationOptions[job['jobDuration']];

  const requirementsTitle = document.getElementById('requirements-title');
  requirementsTitle.innerText = `${JOB_STRINGS['requirements-title']}:`;

  const requirementsListElement = document.getElementById('requirements-list');
  // incase there is already something there
  requirementsListElement.innerHTML = '';

  const requirementsList = getRequirementsList();
  const requirementTemplate =
    document.getElementById('requirement-element-template');
  job['requirements'].forEach((req) => {
    const requirementElement = requirementTemplate
        .cloneNode(/* and child elements */ true);
    requirementElement.setAttribute('id', req);
    requirementElement.innerText = requirementsList[req];

    requirementsListElement.appendChild(requirementElement);
  });
}

/**
 * Makes GET request to retrieve the individual job post from the database
 * given the jobId.
 * @param {String} jobId The jobId of the Job we want to get.
 * @return {Object} The Job object returned from the servlet.
 */
function getJobDetails(jobId) {
  return fetch(`${API['get-individual-job']}?jobId=${jobId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log('data', data);
        /* reset the error (there might have been an error msg from earlier) */
        setErrorMessage('error-message', /* msg= */ '',
            /* includesDefaultMsg= */ false);
        return data;
      });
}

/**
 * Gets job Id of the current job post.
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
 * Gets interest status of the current applicant towards the current job post.
 */
// TODO(issue/71): implement this function
function getCurrentInterestStatus() {
  return false;
}

const interestButton = document.getElementById('interest');
interestButton.addEventListener('click', (_) => {
  const jobId = getJobId();

  if (jobId === '') {
    setErrorMessage(/* errorMessageElementId= */'error-message',
      /* msg= */ COMMON_STRINGS['empty-job-id-error-message'], /* includesDefault= */false);
    return;
  }

  const params = new URLSearchParams();
  params.append("jobId", jobId);
  params.append("interested", getCurrentInterestStatus());

  fetch(API['mark-job-as-interested'], {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
  })
  .then(() => {
    /** reset the error (there might have been an error msg from earlier) */
    setErrorMessage(/* errorMessageElementId= */'error-message', /* msg= */ '',
      /* includesDefault= */false);
  })
  .catch((error) => {
      setErrorMessage(/* errorMessageElementId= */'error-message',
        /* msg= */ STRINGS['mark-interest-error-message'], /* includesDefault= */false);
      console.log('error', error);
  });
});

/**
 * Tells the server to delete the this job post.
 * @param {String} jobId Job id for this job post.
 */
function deleteJobPost(jobId) {
  fetch(API['delete-job'], {method: 'PATCH', body: jobId})
      .then((response) => response.text())
      .then((data) => {
        console.log('data', data);
        /* reset the error (there might have been an error msg from earlier) */
        setErrorMessage(/* errorMessageElementId= */'error-message',
            /* msg= */ '', /* includesDefault= */false);
        window.location.href= HOMEPAGE_PATH;
      })
      .catch((error) => {
        setErrorMessage(/* errorMessageElementId= */'error-message',
            /* msg= */ STRINGS['delete-error-message'],
            /* includesDefault= */false);
        console.log('error', error);
      });
}

const deleteButtonElement = document.getElementById('delete');
deleteButtonElement.addEventListener('click', () => {
  const jobId = getJobId();
  if (jobId === '') {
    setErrorMessage(/* errorMessageElementId= */'error-message',
        /* msg= */ COMMON_STRINGS['empty-job-id-error-message'],
        /* includesDefault= */false);
    return;
  }

  deleteJobPost(jobId);
});
