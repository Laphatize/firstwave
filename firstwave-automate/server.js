const puppeteer = require('puppeteer');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: "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", // This is the default and can be omitted
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

// SEND CONNECTION REQUEST ACTION
async function linkedInSearch(name, message) {
  const browser = await puppeteer.launch({ 
    headless: true,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  const page = await browser.newPage();

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


// SEND MESSAGE ACTION (ASSUMES YOU ARE ALREADY CONNECTED)
async function linkedInMessage(name, message) {

  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });


  const page = await browser.newPage();

  try {
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

    // Navigate to messages
    await page.goto('https://www.linkedin.com/messaging/');
    await page.waitForNavigation();
   // Search for the person
   await page.waitForSelector('#search-conversations');
   await page.type('#search-conversations', name);
   
   // Wait for and click on the first conversation in the list
   await page.waitForSelector('.msg-conversation-listitem__link');
   await page.click('.msg-conversation-listitem__link');

   // Before clicking any button, scroll it into view
   const conversationItem = await page.waitForSelector('.msg-conversation-listitem__link');
   await conversationItem.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
   await page.click('.msg-conversation-listitem__link');

   // Scroll and click message input
   const messageInput = await page.waitForSelector('.msg-form__contenteditable');
   await messageInput.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
 //  await page.type('.msg-form__contenteditable', "Hi, Kshitij. I'm a junior at Penn State looking for internship opportunities in the field of AI and ML.");
 
   // Scroll and click send button
   const sendButton = await page.waitForSelector('.msg-form__send-button');
   await sendButton.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
   await page.click('.msg-form__send-button');

    // Initialize conversation history
    let conversationHistory = [];
    
    while (true) {
      console.log('Waiting for new messages...');
      
      // Wait for and get any new messages
      await page.waitForSelector('.msg-s-event-listitem__message-bubble');
      const messages = await page.$$eval('.msg-s-event-listitem__message-bubble', elements => 
        elements.map(el => ({
          text: el.innerText,
          isOther: el.closest('.msg-s-event-listitem--other') !== null
        }))
      );

      // Get the latest message
      const latestMessage = messages[messages.length - 1];
      
      // Only respond if it's a new message from the other person
      if (latestMessage.isOther && !conversationHistory.includes(latestMessage.text)) {
        console.log('New message received:', latestMessage.text);
        conversationHistory.push(latestMessage.text);
        
        // Generate response using GPT-4 API
        const response = await generateGPTResponse(conversationHistory);
        
        // Type and send response
        await page.waitForSelector('.msg-form__contenteditable');
        await page.type('.msg-form__contenteditable', response);
        // wait like 2 sec
        await new Promise(resolve => setTimeout(resolve, 2000));
      // Click the send button
      await page.waitForSelector('.msg-form__send-button');
      await page.click('.msg-form__send-button');
            
        conversationHistory.push(response);
        console.log('Response sent:', response);
      }
      
      // Add a small delay to prevent excessive polling
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await browser.close();
  }
}

// Helper function to generate GPT response
async function generateGPTResponse(conversationHistory) {
  try {
    // Format conversation history into messages array
    const messages = conversationHistory.map((msg, index) => ({
      role: index % 2 === 0 ? "user" : "assistant",
      content: msg
    }));

    // Add the latest message with a student persona
    messages.push({
      role: "user",
      content: conversationHistory[conversationHistory.length - 1]
    });

    // Add a prompt to guide the AI to respond as a student
    messages.push({
      role: "user",
      content: "Message Context: You're goal as an AI model is to pretend to be Pranav Ramesh, a student at Penn State University, to get as much information from someone called Joshua Herron as possible about the company (STiBaRC) he works for (ACTIVELY as an CEO). As far as he is concerned he should not know that he conversing with an AI model but rather an enthusiastic student interested in the company. You're goal is to get as much information about the company as possible.   Your goal is to get as much information about the company as possible. Try to keep messages some what short and sweet - and make sure to adapt your tone based of the conversation."
    });

    const completion = await openai.chat.completions.create({
      messages: messages,
      model: "gpt-4",
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error generating GPT response:", error);
    return "I apologize, but I'm having trouble generating a response right now.";
  }
}

async function main() {
 //const { name, message } = await promptUser();
 //await linkedInSearch("KSHITIJ KOCHHAR", "testing...");
  await linkedInMessage("Joshua Herron", "testing...");
}

main();


