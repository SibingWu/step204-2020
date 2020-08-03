/**
 * This file wraps some commonly used job related function as a reusable module.
 */

// TODO(issue/21): get the language from the browser
const CurrentLocale = 'en';

/**
 * Import statements are static so its parameters cannot be dynamic.
 * TODO(issue/22): figure out how to use dynamic imports
 */
import {AppStrings} from './strings.en.js';

const STRINGS = AppStrings['common'];
const JOB_ID_PARAM = 'jobId';
const APPLICANT_ID_PARAM = 'applicantId';
const APPLICANT_DETAILS_PARAM = 'applicantDetails';

/**
 * Gets the requirements list from the servlet
 * (which gets it from the database).
 * @return {Object} the requirements list in a key-value mapping format.
 */
function getRequirementsList() {
  // TODO(issue/17): GET request to servlet to get from database
  // returning some hardcoded values for now
  return {
    'O_LEVEL': 'O Level',
    'LANGUAGE_ENGLISH': 'English',
    'DRIVING_LICENSE_C': 'Category C Driving License',
  };
}

/**
 * Sets the error message according to the param.
 * @param {String} errorMessageElementId the element id
 *    for html error message div.
 * @param {String} msg the message that the error div should display.
 * @param {boolean} includesDefaultMsg whether the includes default message.
 *    Default to be true.
 */
function setErrorMessage(errorMessageElementId, msg, includesDefaultMsg=true) {
  document.getElementById(errorMessageElementId).innerText =
    (includesDefaultMsg ? STRINGS['error-message'] + msg : msg);
}

/**
 * Add the keys and values from the options map to the select element.
 * @param {Element} select The select element.
 * @param {Map} options The map of options to be added.
 */
function renderSelectOptions(select, options) {
  select.options.length = 0;
  select.options[0] = new Option('Select', '');
  select.options[0].setAttribute('disabled', true);

  for (const key in options) {
    if (options.hasOwnProperty(key)) {
      select.options[select.options.length] =
        new Option(options[key], key);
    }
  }
}

export {JOB_ID_PARAM, APPLICANT_ID_PARAM, APPLICANT_DETAILS_PARAM,
  getRequirementsList, setErrorMessage, renderSelectOptions};
