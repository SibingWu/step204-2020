/**
 * This file is specific to log-in/index.html.
 * It renders the fields on the page dynamically
 */

// TODO(issue/21): get the language from the browser
const CurrentLocale = 'en';

/**
 * Import statements are static so its parameters cannot be dynamic.
 * TODO(issue/22): figure out how to use dynamic imports
 */
import {AppStrings} from '../strings.en.js';

const STRINGS = AppStrings['log-in'];
const APPLICANT_LOG_IN_PAGE = './applicant/index.html';
const BUSINESS_LOG_IN_PAGE = './business/index.html';
const HOMEPAGE_PATH = '../index.html';

window.onload = () => {
  renderPageElements();
};

/** Adds all the button text to the fields on this page. */
function renderPageElements() {
  const applicantButton = document.getElementById('applicant-log-in');
  applicantButton.innerText = STRINGS['applicant-log-in'];

  const businessButton = document.getElementById('business-log-in');
  businessButton.innerText = STRINGS['business-log-in'];

  const backButton = document.getElementById('back');
  backButton.innerText = STRINGS['back'];
}

const applicantButton = document.getElementById('applicant-log-in');
applicantButton.addEventListener('click', (_) => {
  window.location.href = APPLICANT_LOG_IN_PAGE;
});

const businessButton = document.getElementById('business-log-in');
businessButton.addEventListener('click', (_) => {
  window.location.href = BUSINESS_LOG_IN_PAGE;
});

const backButton = document.getElementById('back');
backButton.addEventListener('click', (_) => {
  window.location.href = HOMEPAGE_PATH;
});
