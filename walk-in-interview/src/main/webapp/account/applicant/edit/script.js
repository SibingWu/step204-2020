
/**
 * This file is specific to account/applicant/edit/index.html. 
 * It renders the fields on the page dynamically.
 */

// TODO(issue/21): get the language from the browser
const CurrentLocale = 'en';

/**
 * Import statements are static so its parameters cannot be dynamic.
 * TODO(issue/22): figure out how to use dynamic imports
 */
import {AppStrings} from '../../../strings.en.js';
import {API} from '../../../apis.js';

import {APPLICANT_ID_PARAM, APPLICANT_DETAILS_PARAM, 
  getRequirementsList, setErrorMessage} from '../../../common-functions.js';

const HOMEPAGE_PATH = '../../../index.html';
const STRINGS = AppStrings['applicant'];
const BAD_REQUEST_STATUS_CODE = 400;

window.onload = () => {
  renderPageElements();
};

/**
 * Adds text into the page.
 */
function renderPageElements() {
  const applicantDetails = getApplicantDetails();

  const backButton = document.getElementById('back');
  backButton.innerText = STRINGS['back'];

  const submitButton = document.getElementById('submit');
  submitButton.setAttribute('value', STRINGS['submit']);
  submitButton.setAttribute('type', 'submit');


  const nameLabel = document.getElementById('name-label');
  nameLabel.innerText = STRINGS['name'];

  const name = document.getElementById('name');
  name.setAttribute('type',  'text');
  name.setAttribute('value', applicantDetails.name);

  const skillsTitle = document.getElementById('skills-title');
  skillsTitle.innerText = STRINGS['skills-title'];

  renderSkillsList(applicantDetails.skills);
}

/**
 * Gets the applicantId from the url.
 * @return {String} The applicantId.
 */
function getApplicantId() {
  const queryString = window.location.search;

  const urlParams = new URLSearchParams(queryString);
  if (urlParams === '') {
    throw new Error('url params should not be empty');
  }

  return urlParams.get(APPLICANT_ID_PARAM);
}

/**
 * Gets the applicant details from the url.
 * @return {JSON} The applicant detail json.
 */
function getApplicantDetails() {
  const queryString = window.location.search;

  const urlParams = new URLSearchParams(queryString);
  if (urlParams === '') {
    throw new Error('url params should not be empty');
  }

  return JSON.parse(urlParams.get(APPLICANT_DETAILS_PARAM));
}

/**
 * Renders the skill list with existing skills prefilled.
 * 
 * @param {Array} skills Existing skills.
 */
function renderSkillsList(skills) {
  const fullSkillsMap = getRequirementsList();

  const skillsListElement = document.getElementById('skills');

  // Resets the list in case renders the same requirements twice
  skillsListElement.innerHTML = '';
  const skillElementTemplate =
    document.getElementById('skill-element-template');

  for (const key in fullSkillsMap) {
    if (!fullSkillsMap.hasOwnProperty(key)) {
      continue;
    }

    const skillElement = skillElementTemplate
        .cloneNode(/* includes child elements */ true);

    // tick box
    const checkbox = skillElement.children[0];
    checkbox.setAttribute('id', key);
    checkbox.setAttribute('value', key);
    checkbox.setAttribute('name', 'skill');

    // If this skill is one of the existing for this applicant, tick it
    if (skills.includes(fullSkillsMap[key])) {
      checkbox.setAttribute('checked', true);
    }

    // text label
    const label = skillElement.children[1];
    label.setAttribute('for', key);
    label.innerHTML = fullSkillsMap[key];

    skillsListElement.appendChild(skillElement);
  }
}

function getApplicantDetailsFromUserInput() {
  const applicantId = getApplicantId();
  const applicantName = document.getElementById('name').value;

  const skillsCheckboxes =
    document.getElementsByName('skill');
  const skillsList = [];
  skillsCheckboxes.forEach(({checked, id}) => {
    if (checked) {
      skillsList.push(id);
    }
  });

  const applicantDetails = {
    accountId: applicantId,
    name: applicantName,
    skills: skillsList,
  };

  return applicantDetails;
}

/**
* Validates the user input.
* Shows error message on the webpage if there is field with invalid input.
*
* @return {boolean} depending on whether the input is valid or not.
*/
function validateRequiredUserInput() {
  const applicantId = getApplicantId();
  const name = document.getElementById('name').value;

  if (applicantId === '') {
    setErrorMessage(/* errorMessageElementId= */'error-message',
        /* msg= */ 'Empty Applicant Id found.',
        /* includesDefault= */false);
    return false;
  }

  if (name === '') {
    setErrorMessage(/* errorMessageElementId= */'error-message',
        /* msg= */ STRINGS['name']);
    return false;
  }

  return true;
}

const backButton = document.getElementById('back');
backButton.addEventListener('click', (_) => {
  window.location.href = HOMEPAGE_PATH;
});

const submitButton = document.getElementById('submit');
submitButton.addEventListener('click', (_) => {
  if (!validateRequiredUserInput()) {
    return;
  }

  const jobDetails = getApplicantDetailsFromUserInput();

  fetch(API['update-applicant-account'], {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(jobDetails),
  })
      .then((response) => {
        if (response.status == BAD_REQUEST_STATUS_CODE) {
          setErrorMessage(/* errorMessageElementId= */'error-message',
              /* msg= */ STRINGS['update-error-message'],
              /* includesDefault= */false);
          throw new Error(STRINGS['update-error-message']);
        }

        /** reset the error (there might have been an error msg from earlier) */
        setErrorMessage(/* errorMessageElementId= */'error-message',
            /* msg= */ '', /* includesDefault= */false);
        window.location.href= HOMEPAGE_PATH;
      })
      .catch((error) => {
        // Not the server response error already caught and thrown
        if (error.message != STRINGS['update-error-message']) {
          setErrorMessage(/* errorMessageElementId= */'error-message',
              /* msg= */ STRINGS['error-message'],
              /* includesDefault= */false);
          console.log('error', error);
        }
      });
});
