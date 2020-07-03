/**
 * This file is specific to new-job.html. It renders the fields on the
 * page dynamically, and it also makes the POST request when the form
 * is submitted.
 */

const NEW_JOB_FORM_ID = 'new-job-form';
const NEW_JOB_TITLE_ID = 'new-job-title';
const NEW_JOB_ADDRESS_ID = 'new-job-address';
const NEW_JOB_DESCRIPTION_ID = 'new-job-description';
const NEW_JOB_PAY = {
  FREQUENCY_ID: 'new-job-pay-frequency',
  MIN_ID: 'new-job-pay-min',
  MAX_ID: 'new-job-pay-max',
};
const REQUIREMENTS_LIST_ID = 'requirements-list';
const NEW_JOB_EXPIRY_ID = 'new-job-expiry';
const NEW_JOB_DURATION_ID = 'new-job-duration';

const HOMEPAGE_PATH = '/walk-in-interview/src/main/webapp/index.html';

/**
 * Adds a new job listing by making a POST request to the /jobs servlet.
 * @param {Object} event The event object sent by the submission of a form.
 * @return {boolean} If the request given the parameters was valid or not.
 */
function addJob() {
  event.preventDefault();

  const formElements = document.forms[NEW_JOB_FORM_ID];

  const name = formElements[NEW_JOB_TITLE_ID].value;
  const address = formElements[NEW_JOB_ADDRESS_ID].value;
  const description = formElements[NEW_JOB_DESCRIPTION_ID].value;
  const payFrequency = formElements[NEW_JOB_PAY.FREQUENCY_ID].value;

  const payMin = formElements[NEW_JOB_PAY.MIN_ID].valueAsNumber;
  const payMax = formElements[NEW_JOB_PAY.MAX_ID].valueAsNumber;
  if (payMin > payMax) {
    return false;
  }

  const requirementsCheckboxes = formElements[REQUIREMENTS_LIST_ID];
  const requirementsList = [];
  requirementsCheckboxes.forEach(({checked, id}) => {
    if (checked) {
      requirementsList.push(id);
    }
  });

  const expiry = formElements[NEW_JOB_EXPIRY_ID].value;
  const duration = formElements[NEW_JOB_DURATION_ID].value;

  const jobDetails = {
    jobName: name,
    jobLocation: {
      address: address,
      lat: 1.3039, // TODO(issue/13): get these from places api
      lon: 103.8358,
    },
    jobDescription: description,
    jobPay: {
      frequency: payFrequency,
      min: payMin,
      max: payMax,
    },
    requirements: requirementsList,
    postExpiry: expiry,
  };

  if (duration !== '') {
    jobDetails.jobDuration = duration;
  }

  fetch('/jobs', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(jobDetails),
  }).then((response) => response.text()).then((data) => {
    if (data.status === 200) {
      window.location.href= HOMEPAGE_PATH;
    }
  });
}
