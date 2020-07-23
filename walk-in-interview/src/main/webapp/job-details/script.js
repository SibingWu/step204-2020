// TODO(issue/21): get the language from the browser
const CurrentLocale = 'en';

/**
 * Import statements are static so its parameters cannot be dynamic.
 * TODO(issue/22): figure out how to use dynamic imports
 */
import {AppStrings} from '../strings.en.js';

import {JOB_ID_PARAM, setCookie, setErrorMessage} from '../common-functions.js';

const STRINGS = AppStrings['job-details'];
const COMMON_STRINGS = AppStrings['common'];
const UPDATE_JOB_PATH = '../update-job/index.html';

/**
 * Gets job Id of the current job post.
 */
// TODO(issue/53): implement this function
function getJobId() {
  return 'Not Implemented';
}

const updateButton = document.getElementById('update');
updateButton.addEventListener('click', (_) => {

  const jobId = getJobId();

  if (jobId === '') {
    setErrorMessage(/* errorMessageElementId= */'error-message',
      /* msg= */ COMMON_STRINGS['empty-job-id-error-message'], /* includesDefault= */false);
    return;
  }

  setCookie(JOB_ID_PARAM, jobId);

  fetch('../update-job/index.html', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    credentials: 'include',
  })
  .then(() => {
      /** reset the error (there might have been an error msg from earlier) */
      setErrorMessage(/* errorMessageElementId= */'error-message', /* msg= */ '', 
        /* includesDefault= */false);
      window.location.href= UPDATE_JOB_PATH;
  })
  .catch((error) => {
      setErrorMessage(/* errorMessageElementId= */'error-message',
        /* msg= */ STRINGS['update-error-message'], /* includesDefault= */false);
      console.log('error', error);
  });
});
