/**
 * This file is where we will write tests for the
 * functions in update-job/script.js using mocha and selenium.
 * Running `npm test` in the command line will run all
 * the mocha tests in the walk-in-interview directory.
 * Also note that the Dev App Server should be running
 * using `mvn package appengine:run` before running the tests.
 * The tests can also be run by cd-ing into this directory and
 * running `mocha script_test.js` in the command line.
 * To get test report formatted nicely, cd into this folder and
 * run `mocha script_test.js --reporter mochawesome --reporter-options
 * autoOpen=true`.
 */

/**
 * Unable to make imports from other files.
 * TODO(issue/38): import getRequirementsList() here.
 */
const REQUIREMENTS_LIST = {
  'O_LEVEL': 'O Level',
  'LANGUAGE_ENGLISH': 'English',
  'DRIVING_LICENSE_C': 'Category C Driving License',
};

/**
 * Note that if `https` is used instead in the url below then
 * we get the following error: ERR_SSL_PROTOCOL_ERROR
 */
const JOBPAGE_URL = 'http://localhost:3000/update-job/index.html';
const HOMEPAGE_URL = 'http://localhost:3000/job-details/index.html';

const assert = require('chai').assert;
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('chromedriver').path;

const service = new chrome.ServiceBuilder(path).build();
chrome.setDefaultService(service);

const By = webdriver.By;
const until = webdriver.until;
const options = new chrome.Options();

/**
 * Note that these tests are headless.
 * To see the test browser pop up, remove this line.
 */
options.addArguments('headless');

/**
 * Set timeout to 50s so tests all have a chance to run.
 */
const TIMEOUT_MILLISECONDS = 50000;

let driver;

/** Note that this.timeout() will not work with arrow functions. */
describe('Update Job Tests', function() {
  this.timeout(TIMEOUT_MILLISECONDS);

  before(() => {
    driver = new webdriver.Builder().setChromeOptions(options)
        .withCapabilities(webdriver.Capabilities.chrome())
        .build();
    return driver.get(JOBPAGE_URL);
  });

  after(() => {
    return driver.quit();
  });

  describe('Page Rendering Tests', () => {
    describe('Page Title', () => {
      it('checks the title text', () => {
        return driver.findElement(By.id('page-title'))
            .getText()
            .then((title) => {
              assert.equal(title, 'Update Job Post');
            });
      });
    });

    describe('Cancel Button', () => {
      it('checks the value attribute', () => {
        return driver.findElement(By.id('cancel'))
            .getAttribute('value')
            .then((value) => {
              assert.equal(value, 'Cancel');
            });
      });

      it('checks the type attribute', () => {
        return driver.findElement(By.id('cancel'))
            .getAttribute('type')
            .then((value) => {
              assert.equal(value, 'reset');
            });
      });
    });

    describe('Submit Button', () => {
      it('checks the value attribute', () => {
        return driver.findElement(By.id('update'))
            .getAttribute('value')
            .then((value) => {
              assert.equal(value, 'Update');
            });
      });

      it('checks the type attribute', () => {
        return driver.findElement(By.id('update'))
            .getAttribute('type')
            .then((value) => {
              assert.equal(value, 'submit');
            });
      });
    });

    describe('Error Message', () => {
      it('checks initially empty', () => {
        return driver.findElement(By.id('error-message'))
            .getText()
            .then((msg) => {
              assert.isEmpty(msg);
            });
      });
    });

    describe('Job Title', () => {
      it('checks the type attribute', () => {
        return driver.findElement(By.id('title'))
            .getAttribute('type')
            .then((value) => {
              assert.equal(value, 'text');
            });
      });

      it('checks the default value text', () => {
        return driver.findElement(By.id('title'))
            .getAttribute('value')
            .then((value) => {
              assert.equal(value, 'Software Engineer');
            });
      });
    });

    describe('Job Description', () => {
      it('checks the type attribute', () => {
        return driver.findElement(By.id('description'))
            .getAttribute('type')
            .then((value) => {
              assert.equal(value, 'textarea');
            });
      });

      it('checks the default value text', () => {
        return driver.findElement(By.id('description'))
            .getAttribute('value')
            .then((value) => {
              assert.equal(value, 'Fight to defeat hair line receding');
            });
      });
    });

    describe('Job Address', () => {
      it('checks the type attribute', () => {
        return driver.findElement(By.id('address'))
            .getAttribute('type')
            .then((value) => {
              assert.equal(value, 'text');
            });
      });

      it('checks the default value text', () => {
        return driver.findElement(By.id('address'))
            .getAttribute('value')
            .then((value) => {
              assert.equal(value, 'Maple Tree');
            });
      });

      describe('Postal Code', () => {
        it('checks the type attribute', () => {
          return driver.findElement(By.id('postal-code'))
              .getAttribute('type')
              .then((value) => {
                assert.equal(value, 'text');
              });
        });

        it('checks the default value text', () => {
          return driver.findElement(By.id('postal-code'))
              .getAttribute('value')
              .then((value) => {
                assert.equal(value, '123');
              });
        });
      });
    });

    describe('Job Requirements', () => {
      it('checks the title text', () => {
        return driver.findElement(By.id('requirements-title'))
            .getText()
            .then((title) => {
              assert.equal(title, 'Requirements');
            });
      });

      it('checks correct requirement list rendered', () => {
        return driver.findElement(By.id('requirements-list'))
            .getText()
            .then((text) => {
              const list = REQUIREMENTS_LIST;
              for (const key in list) {
                if (list.hasOwnProperty(key)) {
                  if (!text.includes(list[key])) {
                    assert.fail(list[key] + ' requirement not included');
                  }
                }
              }
            });
      });

      it('checks only the default options properly ticked', () => {
        return driver.findElements(By.name('requirement'))
            .then((requirements) => {
              requirements.map((requirement) => {
                requirement.getAttribute('id')
                    .then((id) => {
                      if (id === 'O Level' || id === 'English') {
                        driver.findElement(By.id(id))
                            .then((requirement) => {
                              requirement.getAttribute('checked')
                                  .then((checked) => {
                                    assert.isTrue(checked);
                                  });
                            });
                      } else {
                        driver.findElement(By.id(id))
                            .then((requirement) => {
                              requirement.getAttribute('checked')
                                  .then((checked) => {
                                    assert.isNotTrue(checked);
                                  });
                            });
                      }
                    });
              });
            });
      });
    });

    describe('Job Pay', () => {
      it('checks the title text', () => {
        return driver.findElement(By.id('pay-title'))
            .getText()
            .then((title) => {
              assert.equal(title, 'Job Pay');
            });
      });

      it('checks correct select options rendered', () => {
        return driver.findElement(By.id('pay-frequency'))
            .getText()
            .then((text) => {
              const options = {
                'HOURLY': 'Hourly',
                'WEEKLY': 'Weekly',
                'MONTHLY': 'Monthly',
                'YEARLY': 'Yearly',
              };

              for (const key in options) {
                if (options.hasOwnProperty(key)) {
                  if (!text.includes(options[key])) {
                    assert.fail(options[key] + ' option not included');
                  }
                }
              }
            });
      });

      it('checks if default option properly selected', () => {
        return driver.findElement(By.id('pay-frequency'))
            .getAttribute('value')
            .then((value) => {
              assert.equal(value, 'MONTHLY');
            });
      });

      it('min: checks the type attribute', () => {
        return driver.findElement(By.id('pay-min'))
            .getAttribute('type')
            .then((value) => {
              assert.equal(value, 'number');
            });
      });

      it('min: checks the default value text', () => {
        return driver.findElement(By.id('pay-min'))
            .getAttribute('value')
            .then((value) => {
              assert.equal(value, '1');
            });
      });

      it('max: checks the type attribute', () => {
        return driver.findElement(By.id('pay-max'))
            .getAttribute('type')
            .then((value) => {
              assert.equal(value, 'number');
            });
      });

      it('max: checks the default value text', () => {
        return driver.findElement(By.id('pay-max'))
            .getAttribute('value')
            .then((value) => {
              assert.equal(value, '4');
            });
      });
    });

    describe('Job Duration', () => {
      it('checks the title text', () => {
        return driver.findElement(By.id('duration-title'))
            .getText()
            .then((title) => {
              assert.equal(title, 'Job Duration');
            });
      });

      it('checks correct select options rendered', () => {
        return driver.findElement(By.id('duration'))
            .getText()
            .then((text) => {
              const options = {
                'ONE_WEEK': '1 Week',
                'TWO_WEEKS': '2 Weeks',
                'ONE_MONTH': '1 Month',
                'SIX_MONTHS': '6 Months',
                'ONE_YEAR': '1 Year',
                'OTHER': 'Other',
              };

              for (const key in options) {
                if (options.hasOwnProperty(key)) {
                  if (!text.includes(options[key])) {
                    assert.fail(options[key] + ' option not included');
                  }
                }
              }
            });
      });

      it('checks if default option properly selected', () => {
        return driver.findElement(By.id('duration'))
            .getAttribute('value')
            .then((value) => {
              assert.equal(value, 'ONE_WEEK');
            });
      });
    });

    describe('Job Expiry', () => {
      it('checks the title text', () => {
        return driver.findElement(By.id('expiry-title'))
            .getText()
            .then((title) => {
              assert.equal(title, 'Job Expiry');
            });
      });

      it('checks the type attribute', () => {
        return driver.findElement(By.id('expiry'))
            .getAttribute('type')
            .then((value) => {
              assert.equal(value, 'date');
            });
      });

      it('checks the min attribute', () => {
        return driver.findElement(By.id('expiry'))
            .getAttribute('min')
            .then((value) => {
              const expected = new Date().toISOString().substr(0, 10);

              assert.equal(value, expected);
            });
      });

      it('checks the max attribute', () => {
        return driver.findElement(By.id('expiry'))
            .getAttribute('max')
            .then((value) => {
              const date = new Date();
              date.setFullYear(date.getFullYear() + 1);
              const expected = date.toISOString().substr(0, 10);

              assert.equal(value, expected);
            });
      });

      it('checks if default option properly selected', () => {
        return driver.findElement(By.id('expiry'))
            .getAttribute('value')
            .then((value) => {
              assert.equal(value, '2020-10-05');
            });
      });
    });
  });

  describe('Page Functionality Tests', () => {
    // TODO(issue/63): add more tests for invalid input.
    beforeEach(() => {
      /**
       * For the functionality tests, since we are testing the
       * cancel/submit buttons, the page url may have changed
       * in the test.
       * Always resets the current page to the job page
       * for the rest of the tests.
       */
      return driver.get(JOBPAGE_URL);
    });

    describe('Cancel Button', () => {
      /**
       * Clicking the cancel button should return the user to the homepage
       * and not make any POST request.
       */
      it('should return to homepage', () => {
        return clickCancel(driver)
            .then(() => driver.wait(until.urlIs(HOMEPAGE_URL)))
            .then(() => driver.getCurrentUrl())
            .then((currUrl) => assert.equal(currUrl, HOMEPAGE_URL));
      });
    });

    /**
     * If a field is not valid, then clicking submit will display an error
     * message with the invalid field, and no POST request will be made.
     */
    describe('Submit Button', () => {
      // Since all fields should be pre-filled with existing job post,
      // there is no need to add valid inputs to all fields again.

      it('no job title', () => {
        /**
         * The job title must be cleared here to test it.
         */
        return driver.findElement(By.id('title')).clear()
            .then(() => clickUpdate(driver))
            .then(() => driver.findElement(By.id('error-message')).getText())
            .then((text) => assert.equal(text,
                'There is an error in the following field: Job Title'));
      });

      it('incorrect job address format', () => {
        // TODO(issue/13&33): add tests for address once places api implemented
      });

      it('incorrect postal code', () => {
        // TODO(issue/13&33): add tests for address once places api implemented
      });

      it('min greater than max', () => {
        /**
         * The pay-min and pay-max fields must be cleared before sending
         * another key.
         */
        return driver.findElement(By.id('pay-min')).clear()
            .then(() => driver.findElement(By.id('pay-max')).clear())
            .then(() => driver.findElement(By.id('pay-min')).sendKeys('7'))
            .then(() => driver.findElement(By.id('pay-max')).sendKeys('6'))
            .then(() => clickUpdate(driver))
            .then(() => driver.findElement(By.id('error-message')).getText())
            .then((text) => assert.equal(text,
                'There is an error in the following field: Job Pay'));
      });

      it('expiry date not chosen', () => {
        return driver.findElement(By.id('expiry')).clear()
            .then(() => clickUpdate(driver))
            .then(() => driver.findElement(By.id('error-message')).getText())
            .then((text) => assert.equal(text,
                'There is an error in the following field: Job Expiry'));
      });

      /**
       * If all the fields(including jobId) are valid, then a POST request
       * should be made and the user should be returned to the homepage.
       * However, since so far cloud firestore cannot be set up locally
       * and only a dummy jobId is passed, it can only catch an error.
       */
      it('not update successfully', () => {
        return clickUpdate(driver)
            .then(() => driver.findElement(By.id('error-message')).getText())
            .then((text) => assert.equal(text,
                'There was an error while storing the job post. ' +
                  'Please try again'));
      });

      /**
       * TODO(issue/40): check that POST request has been made
       * & also check that the response is what was expected
       */
    });
  });
});

/**
 * This function just to submit the updated job with the
 * filled out fields.
 * @param {webdriver} driver the current driver being tested.
 * @return {webdriver} the altered driver.
 */
function clickUpdate(driver) {
  return driver.findElement(By.id('update')).click();
};

/**
 * This function just to click the cancel button and return
 * to the homepage.
 * @param {webdriver} driver the current driver being tested.
 * @return {webdriver} the altered driver.
 */
function clickCancel(driver) {
  return driver.findElement(By.id('cancel')).click();
};
