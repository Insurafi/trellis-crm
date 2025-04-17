// Direct SendGrid email test
import { MailService } from '@sendgrid/mail';
import fs from 'fs';

// Initialize the mail service
const sgMail = new MailService();

// Set the API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Define a simple email
const msg = {
  to: 'inga.damota@me.com',
  from: 'admin@trellis-crm.com', // Must be a verified sender
  subject: 'Trellis CRM Test Email',
  text: 'This is a test email from Trellis CRM.',
  html: '<p>This is a test email from Trellis CRM.</p>',
};

// Log the API key (partially masked)
const apiKey = process.env.SENDGRID_API_KEY || '';
const maskedKey = apiKey ? 
  apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4) : 
  'NOT SET';
console.log(`Using SendGrid API Key: ${maskedKey}`);

// Attempt to send the email
console.log('Attempting to send a test email...');
sgMail.send(msg)
  .then(() => {
    console.log('Email sent successfully!');
  })
  .catch((error) => {
    console.error('Error sending email:');
    console.error(error);
    
    // Write the full error details to a file for inspection
    if (error.response) {
      console.error('Error Code:', error.code);
      console.error('Response Body:', error.response.body);
      
      try {
        fs.writeFileSync('sendgrid-error.json', JSON.stringify({
          code: error.code,
          response: error.response
        }, null, 2));
        console.log('Full error details written to sendgrid-error.json');
      } catch (e) {
        console.error('Could not write error details to file:', e);
      }
    }
  });