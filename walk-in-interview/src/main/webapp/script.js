/**
 * This file is specific to index.html for homepage. It renders the fields
 * on the page dynamically, and it also makes the POST request when the form
 * is submitted.
 */

// TODO(issue/21): get the language from the browser
const CurrentLocale = 'en';

/**
 * Import statements are static so its parameters cannot be dynamic.
 * TODO(issue/22): figure out how to use dynamic imports
 */
import {AppStrings} from './strings.en.js';
import {JOB_ID_PARAM, DEFAULT_PAGE_SIZE,
  getRequirementsList, setErrorMessage} from './common-functions.js';
import {createMap, addMarker} from './maps.js';

const STRINGS = AppStrings['homepage'];
const CREATE_ACCOUNT_PAGE_PATH = '/account/create-account/index.html'
const LOG_IN_PAGE_PATH = '/account/log-in/index.html';
const JOBPAGE_PATH = '/new-job/index.html';
const JOB_DETAILS_PATH = '/job-details/index.html';
const POSTS_MADE_PATH = '/business-jobs-list/index.html';
const INTEREST_JOBS_PATH = '/applicant-interested-list/index.html';
const SALARY_PARAM = 'SALARY';

/**
 * Note that this is needed because in JS we can hold bigger Integer
 * values than in Java.
 */
const JAVA_INTEGER_MAX_VALUE = Math.pow(2, 31) - 1;

// TODO(issue/34): implement pagination for job listings

let map;

window.onload = () => {
  renderHomepageElements();
};

/** Adds all the titles to the fields on this page. */
function renderHomepageElements() {
  const homepageTitle = document.getElementById('page-title');
  homepageTitle.innerText = STRINGS['page-title'];

  const newPostButton = document.getElementById('new-post');
  newPostButton.innerText = STRINGS['new-post'];
  newPostButton.addEventListener('click', (_) => {
    window.location.href = JOBPAGE_PATH;
  });

  const accountButton = document.getElementById('account');
  accountButton.innerText = STRINGS['account'];
  accountButton.addEventListener('click', (_) => {
    window.location.href = CREATE_ACCOUNT_PAGE_PATH;
  });

  const loginButton = document.getElementById('log-in');
  loginButton.innerText = STRINGS['log-in'];
  loginButton.addEventListener('click', (_) => {
    window.location.href = LOG_IN_PAGE_PATH;
  });

  const showJobPostsButton = document.getElementById('show-job-posts-made');
  showJobPostsButton.innerText = STRINGS['show-job-posts-made'];
  showJobPostsButton.addEventListener('click', (_) => {
    window.location.href = POSTS_MADE_PATH;
  });

  const interestedJobButton = document.getElementById('interested-job-list');
  interestedJobButton.innerText = STRINGS['interested-job-list'];
  interestedJobButton.addEventListener('click', (_) => {
    window.location.href = INTEREST_JOBS_PATH;
  });

  const sortByTitle = document.getElementById('sort-by-title');
  sortByTitle.innerText = STRINGS['sort-by-title'];

  renderSelectOptions('sort-by');

  const showByTitle = document.getElementById('show-by-region-title');
  showByTitle.innerText = STRINGS['show-by-region-title'];

  renderSelectOptions('show-by-region');

  const LimitsTitle = document.getElementById('filter-limits-title');
  LimitsTitle.innerText = STRINGS['filter-limits-title'];

  const minLimit = document.getElementById('filter-min-limit');
  minLimit.setAttribute('type', 'number');
  minLimit.setAttribute('placeholder', STRINGS['filter-min-limit']);

  const maxLimit = document.getElementById('filter-max-limit');
  maxLimit.setAttribute('type', 'number');
  maxLimit.setAttribute('placeholder', STRINGS['filter-max-limit']);

  renderJobFiltersSubmit();

  const jobListingsTitle =
    document.getElementById('job-listings-title');
  jobListingsTitle.innerText = STRINGS['job-listings-title'];

  map = createMap('homepage-map');

  loadAndDisplayJobListings();

  /* reset the error to make sure no error msg initially present */
  setErrorMessage(/* errorMessageElementId= */ 'error-message',
      /* msg= */ '', /* includesDefaultMsg= */ false);
}

/**
 * Add the keys and values from the options map to the select element.
 * @param {String} id The select element id.
 */
function renderSelectOptions(id) {
  const select = document.getElementById(id);
  const options = STRINGS[id];

  select.options.length = 0;

  for (const key in options) {
    if (options.hasOwnProperty(key)) {
      select.options[select.options.length] =
        new Option(options[key], key);
    }
  }
}

/**
 * Checks that the filter fields are valid.
 * Note that the lower and upper limits can be left empty, by default
 * the lower limit is 0 and the upper limit is Integer.MAX_VALUE
 * @param {String} sortByParam The sorting filter.
 * @param {String} showByParam The region filter.
 * @param {Number} minLimitParam The lower limit given the sorting filter.
 * @param {Number} maxLimitParam The upper limit given the sorting filter.
 * @return {boolean} Indication of whether the fields are valid.
 */
function validateFilters(sortByParam, showByParam,
    minLimitParam, maxLimitParam) {
  if (showByParam == '' || sortByParam == '') {
    /* no need to show error message as this would not be the user's fault */
    console.error('region or sorting was empty');
    return false;
  }

  /* If the field has been filled out, we check that it's a positive int */
  if (!Number.isNaN(minLimitParam) &&
    (minLimitParam > JAVA_INTEGER_MAX_VALUE || minLimitParam < 0)) {
    setErrorMessage(/* errorMessageElementId= */ 'error-message',
        /* msg= */ STRINGS['filter-min-limit'],
        /* includesDefaultMsg= */ true);
    document.getElementById('filter-min-limit').classList.add('error-field');
    return false;
  }

  /* If the field has been filled out, we check that it's a positive int */
  if (!Number.isNaN(maxLimitParam) &&
    (maxLimitParam > JAVA_INTEGER_MAX_VALUE || maxLimitParam < 0)) {
    setErrorMessage(/* errorMessageElementId= */ 'error-message',
        /* msg= */ STRINGS['filter-max-limit'],
        /* includesDefaultMsg= */ true);
    document.getElementById('filter-max-limit').classList.add('error-field');
    return false;
  }

  /* If both fields have been filled out, we check that max >= min */
  if (!Number.isNaN(maxLimitParam) && !Number.isNaN(minLimitParam) &&
    maxLimitParam < minLimitParam) {
    setErrorMessage(/* errorMessageElementId= */ 'error-message',
        /* msg= */ STRINGS['filter-max-limit'],
        /* includesDefaultMsg= */ true);
    document.getElementById('filter-max-limit').classList.add('error-field');
    return false;
  }

  document.getElementById('filter-min-limit').classList.remove('error-field');
  document.getElementById('filter-max-limit').classList.remove('error-field');
  return true;
}

/**
 * Add the attributes and on click function to the filters
 * submit button.
 */
function renderJobFiltersSubmit() {
  const filtersSubmit = document.getElementById('filters-submit');
  filtersSubmit.setAttribute('type', 'submit');
  filtersSubmit.setAttribute('value', STRINGS['filters-submit']);

  filtersSubmit.addEventListener('click', (_) => {
    loadAndDisplayJobListings();
  });
}

/**
 * This will add all the job listings onto the homepage.
 * @param {Object} jobPageData The details to be shown on the homepage.
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

  jobShowing.innerText = `${jobPageData['range'].minimum} -` +
    ` ${jobPageData['range'].maximum} ${STRINGS['job-listings-showing']} ` +
    `${jobPageData['totalCount']}`;
}

/**
 * Builds the job element given the job details from the servlet response.
 * @param {Object} job The job to be displayed.
 * @return {Element} The job listing element.
 */
function buildJobElement(job) {
  const jobPostPreviewTemplate =
    document.getElementById('job-listing-template');

  const jobPostPreview =
    jobPostPreviewTemplate.cloneNode( /* and child elements */ true);
  jobPostPreview.setAttribute('id', job['jobId']);

  const jobTitle = jobPostPreview.children[0];
  jobTitle.innerText = job['jobTitle'];

  const jobAddress = jobPostPreview.children[1];
  const location = job['jobLocation'];
  jobAddress.innerText = `${location['address']}, ${location['postalCode']}`;

  const jobPay = jobPostPreview.children[2];
  const pay = job['jobPay'];
  jobPay.innerText = `${pay['min']} - ${pay['max']} SGD ` +
  `(${pay['paymentFrequency'].toLowerCase()})`;

  const requirementsList = jobPostPreview.children[3];
  const fullRequirementsList = getRequirementsList();
  const requirementsArr = [];

  const jobRequirements = job['requirements'];
  for (const key in jobRequirements) {
    if (jobRequirements.hasOwnProperty(key)) {
      if (jobRequirements[key] /* is true */) {
        requirementsArr.push(fullRequirementsList[key]);
      }
    }
  }

  requirementsList.innerText =
  `Requirements List: ${requirementsArr.join(', ')}`;

  const detailsForm = jobPostPreview.children[4];
  detailsForm.method = 'GET';
  detailsForm.action = JOB_DETAILS_PATH;

  const jobIdElement = jobPostPreview.children[4].children[0];
  jobIdElement.setAttribute('type', 'hidden');
  jobIdElement.setAttribute('name', JOB_ID_PARAM);
  const jobId = job[JOB_ID_PARAM];
  jobIdElement.setAttribute('value', jobId);

  jobPostPreview.addEventListener('click', (_) => {
    if (jobId === '') {
      throw new Error('jobId should not be empty');
    }
    detailsForm.submit();
  });

  const marker = addMarker(map, job);
  marker.addListener('click', function() {
    new google.maps.InfoWindow({
      content: jobPostPreview.innerHTML,
    }).open(map, marker);
    // TODO(issue/73): link this to the job in the list?
  });

  /* double clicking on the marker goes to the job details page */
  marker.addListener('dblclick', function() {
    if (jobId === '') {
      throw new Error('jobId should not be empty');
    }
    detailsForm.submit();
  });

  return jobPostPreview;
}

/**
 * Add the list of jobs that are stored in the database
 * given the filter fields.
 */
async function loadAndDisplayJobListings() {
  const sortingParam = document.getElementById('sort-by').value;
  const regionParam = document.getElementById('show-by-region').value;
  let minLimitParam = document.getElementById('filter-min-limit')
      .valueAsNumber;
  let maxLimitParam = document.getElementById('filter-max-limit')
      .valueAsNumber;

  if (!validateFilters(sortingParam, regionParam,
      minLimitParam, maxLimitParam)) {
    return;
  }

  /*
   * Note that this platform currently only sorts by Salary.
   * TODO(issue/62): support more filters
   */
  if (!sortingParam.includes(SALARY_PARAM)) {
    console.error('this app currently only sorts by salary');
    return;
  }

  const sortByParam = SALARY_PARAM;
  const orderByParam = sortingParam.substring(7);

  if (Number.isNaN(minLimitParam)) {
    minLimitParam = 0;
  }

  if (Number.isNaN(maxLimitParam)) {
    maxLimitParam = JAVA_INTEGER_MAX_VALUE;
  }

  const jobPageData = await getJobListings(regionParam, sortByParam,
      minLimitParam, maxLimitParam, orderByParam,
      DEFAULT_PAGE_SIZE, /* pageIndex= */ 0)
      .catch((error) => {
        console.error('error fetching job listings', error);
        setErrorMessage(/* errorMessageElementId= */ 'error-message',
            /* msg= */ STRINGS['get-jobs-error-message'],
            /* include default msg= */ false);
      });

  displayJobListings(jobPageData);
}

/**
 * Makes GET request to retrieve all the job listings from the database
 * given the sorting and order. This function is called when the
 * homepage is loaded and also when the sorting is changed.
 * @param {String} region The Singapore region.
 * @param {String} sortBy How the jobs should be sorted.
 * @param {int} minLimit The lower limit for filtering.
 * @param {int} maxLimit The upper limit for filtering.
 * @param {String} order The order of the sorting.
 * @param {int} pageSize The number of jobs for one page.
 * @param {int} pageIndex The page index (starting from 0).
 * @return {Object} The data returned from the servlet.
 */
function getJobListings(region, sortBy, minLimit, maxLimit,
    order, pageSize, pageIndex) {
  const params = `region=${region}&sortBy=${sortBy}&minLimit=${minLimit}&` +
    `maxLimit=${maxLimit}&order=${order}&pageSize=${pageSize}` +
    `&pageIndex=${pageIndex}`;

  return fetch(`/jobs/listings?${params}`)
      .then((response) => response.json())
      .then((data) => {
        console.log('data', data);
        /* reset the error (there might have been an error msg from earlier) */
        setErrorMessage(/* errorMessageElementId= */ 'error-message',
            /* msg= */ '', /* includesDefaultMsg= */ false);
        return data;
      });
}
