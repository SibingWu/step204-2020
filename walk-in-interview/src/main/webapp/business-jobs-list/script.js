/**
 * This file is specific to show-job-posts-made.html
 */

// TODO(issue/21): get the language from the browser
const CurrentLocale = 'en';

/**
 * Import statements are static so its parameters cannot be dynamic.
 * TODO(issue/22): figure out how to use dynamic imports
 */
import {AppStrings} from '../strings.en.js';
import {JOB_ID_PARAM, DEFAULT_PAGE_SIZE,
  setErrorMessage, getRequirementsList} from '../common-functions.js';
import {API} from '../apis.js';

const STRINGS = AppStrings['business-jobs-list'];
const JOB_STRINGS = AppStrings['job'];
const JOB_DETAILS_PATH = '../job-details/index.html';
const HOMEPAGE_PATH = '../index.html';

// TODO(issue/34): implement pagination for job listings

window.onload = () => {
  loadAndDisplayJobListings();
};

/**
 * Add the list of jobs made.
 */
async function loadAndDisplayJobListings() {
  const backButton = document.getElementById('back');
  backButton.innerText = STRINGS['back'];
  backButton.addEventListener('click', (_) => {
    window.location.href = HOMEPAGE_PATH;
  });

  const jobListingsTitle =
    document.getElementById('job-listings-title');
  jobListingsTitle.innerText = STRINGS['job-listings-title'];

  const jobPageData =
    await getJobsMade(DEFAULT_PAGE_SIZE, /* pageIndex= */ 0)
        .catch((error) => {
          console.error('error fetching job listings', error);
          setErrorMessage(/* errorMessageElementId= */ 'error-message',
              /* msg= */ STRINGS['get-jobs-error-message'],
              /* include default msg= */ false);
        });

  displayJobListings(jobPageData);
}

/**
 * Makes GET request to retrieve all the job posts made
 * by the current business user.
 * This function is called when the interest page is loaded.
 *
 * @param {int} pageSize The number of jobs for one page.
 * @param {int} pageIndex The page index (starting from 0).
 * @return {Object} The data returned from the servlet.
 */
function getJobsMade(pageSize, pageIndex) {
  // Checks input type
  const pageSizeParam = parseInt(pageSize);
  const pageIndexParam = parseInt(pageIndex);

  if (Number.isNaN(pageSizeParam) || Number.isNaN(pageIndexParam)) {
    throw new Error('Illegal pagination param');
  }

  const params = `pageSize=${pageSizeParam}&pageIndex=${pageIndexParam}`;

  return fetch(`${API['business-jobs-list']}?${params}`, {
    method: 'GET',
    headers: {'Content-Type': 'application/json'},
  })
      .then((response) => response.json())
      .then((data) => {
        console.log('data', data);
        // Resets the error (there might have been an error msg from earlier)
        setErrorMessage(/* errorMessageElementId= */ 'error-message',
            /* msg= */ '', /* includesDefaultMsg= */ false);
        return data;
      });
}

/**
 * This will add all the job listings onto the page.
 *
 * @param {Object} jobPageData The details to be shown on the page.
 */
function displayJobListings(jobPageData) {
  const jobListingsElement = document.getElementById('job-listings');
  const jobShowing = document.getElementById('job-listings-showing');

  /* reset the list so we don't render the same jobs twice */
  jobListingsElement.innerHTML = '';
  jobShowing.innerHTML = '';

  if (jobPageData === undefined ||
    !jobPageData.hasOwnProperty('jobList') ||
    jobPageData['jobList'].length === 0) {
    setErrorMessage(/* errorMessageElementId= */ 'error-message',
        /* msg= */ STRINGS['no-jobs-error-message'],
        /* includesDefaultMsg= */ false);
    return;
  }

  const jobListings = jobPageData['jobList'];

  jobListings.forEach((job) => {
    jobListingsElement.appendChild(buildJobElement(job));
  });

  jobShowing.innerText = JOB_STRINGS['jobShowing']
      .replace('{MINIMUM}', jobPageData['range'].minimum)
      .replace('{MAXIMUM}', jobPageData['range'].maximum)
      .replace('{TOTAL_COUNT}', jobPageData['totalCount']);
}

/**
 * Builds the job element given the job details from the servlet response.
 *
 * @param {Object} job The job to be displayed.
 * @return {Element} The job listing element.
 */
function buildJobElement(job) {
  const jobPostPreviewTemplate =
    document.getElementById('job-listing-template');

  const jobPost =
    jobPostPreviewTemplate.cloneNode( /* and child elements */ true);
  jobPost.setAttribute('id', 'job-listing-id-' + job['jobId']);

  const jobTitle = jobPost.children[0];
  jobTitle.innerText = job['jobTitle'];

  const jobAddress = jobPost.children[1];
  const location = job['jobLocation'];
  jobAddress.innerText = JOB_STRINGS['jobAddressDescription']
      .replace('{ADDRESS}', location['address'])
      .replace('{POSTAL_CODE}', location['postalCode']);

  const jobPay = jobPost.children[2];
  const pay = job['jobPay'];
  jobPay.innerText = JOB_STRINGS['jobPayDescription']
      .replace('{MIN_PAY}', pay['min'])
      .replace('{MAX_PAY}', pay['max'])
      .replace('{CURRENCY}', JOB_STRINGS['sgd'])
      .replace('{FREQUENCY}',
          JOB_STRINGS['pay-frequency'][pay['paymentFrequency']]);

  const requirementsList = jobPost.children[3];
  const fullRequirementsList = getRequirementsList();
  const requirementsArr = [];

  const jobRequirements = job['requirements'];
  for (const key in jobRequirements) {
    if (jobRequirements.hasOwnProperty(key)) {
      if (jobRequirements[key] === true) {
        requirementsArr.push(fullRequirementsList[key]);
      }
    }
  }

  requirementsList.innerText = JOB_STRINGS['requirementsDescription']
      .replace('{REQUIREMENTS_LIST}', requirementsArr.join(', '));

  const detailsForm = jobPost.children[4];
  detailsForm.method = 'GET';
  detailsForm.action = JOB_DETAILS_PATH;

  const jobIdElement = jobPost.children[4].children[0];
  jobIdElement.setAttribute('type', 'hidden');
  jobIdElement.setAttribute('name', JOB_ID_PARAM);
  const jobId = job[JOB_ID_PARAM];
  jobIdElement.setAttribute('value', jobId);

  jobPost.addEventListener('click', (_) => {
    if (jobId === '') {
      throw new Error('jobId should not be empty');
    }
    detailsForm.submit();
  });

  return jobPost;
}
