// Send test email script
import { MailService } from '@sendgrid/mail';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create mail service instance
const mailService = new MailService();

// Set API key
if (!process.env.SENDGRID_API_KEY) {
  console.error('Error: SENDGRID_API_KEY environment variable is not set');
  process.exit(1);
}

mailService.setApiKey(process.env.SENDGRID_API_KEY);

async function sendTestEmail() {
  const toEmail = 'inga.damota@me.com';
  const fromEmail = 'admin@trellis-crm.com';
  const subject = 'Test Email from Trellis CRM';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #4a6cf7;">Trellis CRM</h1>
      </div>
      
      <p>Hello!</p>
      
      <p>This is a test email from the Trellis CRM system to verify that our email service is working correctly.</p>
      
      <p>If you received this email, it means the SendGrid integration is working properly.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #777; font-size: 12px;">
        <p>This is an automated message from Trellis CRM. Please do not reply to this email.</p>
      </div>
    </div>
  `;
  
  try {
    console.log(`Attempting to send test email to ${toEmail}...`);
    
    await mailService.send({
      to: toEmail,
      from: fromEmail,
      subject,
      html
    });
    
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Error sending test email:', error);
    if (error.response) {
      console.error('Error details:', error.response.body);
    }
  }
}

// Run the function
sendTestEmail();