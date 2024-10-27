const puppeteer = require('puppeteer');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function promptUser() {
  return new Promise((resolve) => {
    rl.question('Enter the name to search on LinkedIn: ', (name) => {
      rl.question('Enter the message to send (press Enter for default): ', (message) => {
        resolve({
          name,
          message: message || 'Hello! I came across your profile and would like to connect.'
        });
      });
    });
  });
}

async function linkedInSearch(name, message) {
  const browser = await puppeteer.launch({ 
    headless: true,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // Navigate to LinkedIn
    await page.goto('https://www.linkedin.com/');

    // Wait for and click the "Sign in" button
    await page.waitForSelector('.nav__button-secondary');
    await page.click('.nav__button-secondary');

    // Wait for the login form and enter credentials
    await page.waitForSelector('#username');
    await page.type('#username', 'pranavramesh2022@gmail.com');
    await page.type('#password', 'PR@4563A');
    await page.click('.btn__primary--large');

    // Wait for navigation after login
    await page.waitForNavigation();

    // Search for the person
    await page.waitForSelector('.search-global-typeahead__input');
    await page.type('.search-global-typeahead__input', name);
    await page.keyboard.press('Enter');

    // Wait for search results and click on the "Connect" button
    await page.waitForSelector('button[aria-label^="Invite"][aria-label$="to connect"]');
    await page.click('button[aria-label^="Invite"][aria-label$="to connect"]');

    // Wait for the "Add a note" button if it appears
    try {
      await page.waitForSelector('button[aria-label="Add a note"]', { timeout: 5000 });
      await page.click('button[aria-label="Add a note"]');

      // Wait for the message input field and type the message
      await page.waitForSelector('textarea[name="message"]');
      await page.type('textarea[name="message"]', message);

      // Click the "Send" button
      await page.click('button[aria-label="Send invitation"]');
    } catch (error) {
      console.log('No "Add a note" option, connection request sent directly.');
    }

    console.log(`Connection request sent to ${name} successfully!`);
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await browser.close();
    rl.close();
  }
}



async function main() {
  const { name, message } = await promptUser();
  await linkedInSearch(name, message);
}

main();
