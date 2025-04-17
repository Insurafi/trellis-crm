// Test sending an email with the SendGrid API

import { sendEmail } from '../server/email-service.js';

async function main() {
  try {
    console.log('Attempting to send test email...');
    
    const success = await sendEmail({
      to: 'inga.damota@me.com',
      from: 'admin@trellis-crm.com',
      subject: 'Test Email from Trellis CRM',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #4a6cf7;">Trellis CRM Test Email</h1>
          <p>This is a test email to confirm that our email service is working correctly.</p>
          <p>If you received this email, it means the SendGrid integration is working properly.</p>
        </div>
      `
    });
    
    if (success) {
      console.log('Email sent successfully!');
    } else {
      console.log('Failed to send email. Check server logs for details.');
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

main();