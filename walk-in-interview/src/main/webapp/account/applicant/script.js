/**
 * This file is specific to account/applicant/index.html. 
 * It renders the fields on the page dynamically.
 */

// TODO(issue/21): get the language from the browser
const CurrentLocale = 'en';

/**
 * Import statements are static so its parameters cannot be dynamic.
 * TODO(issue/22): figure out how to use dynamic imports
 */
import {AppStrings} from '../../strings.en.js';
import {APPLICANT_ID_PARAM, APPLICANT_DETAILS_PARAM} from '../../common-functions.js';

const HOMEPAGE_PATH = '../../index.html';
const EDIT_ACCOUNT_PATH = './edit/index.html';
const STRINGS = AppStrings['applicant'];

window.onload = () => {
  let accountId = getId();
  renderPageElements(accountId);
};

/** Gets the ID of this account. */
function getId() {
  // TODO
  return 'Not Implemented';
}

/**
 * Adds all the text element in the page.
 * 
 * @param {String} accountId Id of this account.
 */
function renderPageElements(accountId) {
  var accountDetails = getAccountDetails(accountId);

  const backButton = document.getElementById('back');
  backButton.innerText = STRINGS['back'];

  const editForm = document.getElementById('edit-form');
  editForm.method = 'GET';
  editForm.action = EDIT_ACCOUNT_PATH;

  const applicantIdElement = document.getElementById('applicant-id');
  applicantIdElement.setAttribute('type', 'hidden');
  applicantIdElement.setAttribute('name', APPLICANT_ID_PARAM);
  applicantIdElement.setAttribute('value', accountId);

  const applicantDetailElement = document.getElementById('applicant-details');
  applicantDetailElement.setAttribute('type', 'hidden');
  applicantDetailElement.setAttribute('name', APPLICANT_DETAILS_PARAM);
  applicantDetailElement.setAttribute('value', JSON.stringify(accountDetails));

  const editButton = document.getElementById('edit');
  editButton.setAttribute('value', STRINGS['edit']);
  editButton.setAttribute('type', 'submit');
  // in case it was disabled earlier
  editButton.disabled = false;

  const nameLabel = document.getElementById('name-label');
  nameLabel.innerText = STRINGS['name'];
  const name = document.getElementById('name');
  name.innerText = accountDetails.name;

  const skillsTitle = document.getElementById('skills-title');
  skillsTitle.innerText = STRINGS['skills-title'];

  renderSkills(accountDetails.skills);
}

/**
 * Gets the account detail from the database
 * 
 * @param {String} accountId Id of this account.
 * @returns Detail json.
 */
function getAccountDetails(accountId) {
  const applicantId = getId();
  let accountDetails = {
    accountId: applicantId,
    name: 'test',
    skills: [
      'O Level',
      'English',
    ],
  };

  // if there is no details related to such id, return empty details
  // (TODO)
  return accountDetails;
}

function renderSkills(skills) {
  const skillsListElement =
    document.getElementById('skills');

  // resets the list so we don't render the same skills twice
  skillsListElement.innerHTML = '';
  const skillElementTemplate =
    document.getElementById('skill-element-template');
  
  for (var i = 0; i < skills.length; i++) {
    const skill = skills[i];
    const skillElement = skillElementTemplate
      .cloneNode( /* includes child elements */ true);

    const div = skillElement.children[0];
    div.setAttribute('id', skill);
    div.innerText = skill;

    skillsListElement.appendChild(skillElement);
  }
}

const backButton = document.getElementById('back');
backButton.addEventListener('click', (_) => {
  window.location.href = HOMEPAGE_PATH;
});
