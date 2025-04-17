import { sendEmail } from './email-service';

interface AgentCredentials {
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  temporaryPassword: string;
  email: string;
}

/**
 * Send a welcome email to a new agent with their login credentials
 * @param credentials Agent credentials including name, username, and password
 * @returns Promise<boolean> indicating whether the email was sent successfully
 */
export async function sendAgentWelcomeEmail(credentials: AgentCredentials): Promise<boolean> {
  const { firstName, username, temporaryPassword, email } = credentials;
  
  if (!email) {
    console.error('Cannot send welcome email: Agent email is missing');
    return false;
  }

  // Determine which email to send from based on environment
  const fromEmail = process.env.FROM_EMAIL || 'admin@trellis-crm.com';
  
  const subject = 'Welcome to Trellis CRM - Your Account Details';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #4a6cf7;">Welcome to Trellis CRM</h1>
      </div>
      
      <p>Hello ${firstName},</p>
      
      <p>Welcome to Trellis CRM for insurance agents! Your account has been created, and you're ready to start managing your clients, leads, and policies.</p>
      
      <div style="background-color: #f7f9fc; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Your Login Credentials</h3>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
        <p><strong>Login URL:</strong> <a href="https://trellis-inga4.replit.app/">https://trellis-inga4.replit.app/</a></p>
      </div>
      
      <p>For security reasons, we recommend changing your password after your first login.</p>
      
      <h3>Getting Started</h3>
      <p>Here are a few things you can do in Trellis CRM:</p>
      <ul>
        <li>Manage your leads and track their progress</li>
        <li>Create and store client information</li>
        <li>Track policies and commissions</li>
        <li>Manage your calendar and appointments</li>
        <li>Use communication templates for client outreach</li>
      </ul>
      
      <p>If you have any questions or need assistance, please contact your administrator.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #777; font-size: 12px;">
        <p>This is an automated message from Trellis CRM. Please do not reply to this email.</p>
      </div>
    </div>
  `;
  
  try {
    const emailSent = await sendEmail({
      to: email,
      from: fromEmail,
      subject,
      html
    });
    
    if (emailSent) {
      console.log(`Successfully sent welcome email to agent ${firstName} at ${email}`);
      return true;
    } else {
      console.error(`Failed to send welcome email to agent ${firstName} at ${email}`);
      return false;
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}