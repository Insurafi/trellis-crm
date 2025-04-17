import { MailService } from '@sendgrid/mail';

// Create a mail service instance
const mailService = new MailService();

// If the SendGrid API key is provided, set it
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send an email using SendGrid
 * @param params Email parameters including to, from, subject, text and html content
 * @returns Promise<boolean> indicating success or failure
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    // Check if we have a SendGrid API key
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key is not set. Email not sent.');
      return false;
    }

    console.log('Attempting to send email with the following params:');
    console.log('To:', params.to);
    console.log('From:', params.from);
    console.log('Subject:', params.subject);
    
    // Send the email
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    });
    
    console.log('✅ Email sent successfully to', params.to);
    return true;
  } catch (error: any) {
    console.error('SendGrid email error:', error);
    
    // Log more detailed error information
    if (error?.response) {
      console.error('SendGrid error response code:', error.code);
      
      if (error.response.body) {
        console.error('SendGrid error body:', JSON.stringify(error.response.body, null, 2));
        
        // Check for specific SendGrid errors and provide guidance
        const errors = error.response.body.errors || [];
        for (const err of errors) {
          if (err.field === 'from' && err.message && err.message.includes('verified Sender Identity')) {
            console.error('ERROR: The sender email address must be verified in your SendGrid account.');
            console.error('Please visit https://sendgrid.com/docs/for-developers/sending-email/sender-identity/');
            console.error('to learn how to verify your sender identity.');
          }
        }
      }
    }
    
    return false;
  }
}

/**
 * Process a template string by replacing placeholders with actual values
 * @param template The template string with placeholders like [NAME]
 * @param replacements Object containing key-value pairs for replacements
 * @returns The processed string with placeholders replaced
 */
export function processTemplate(template: string, replacements: Record<string, string>): string {
  let result = template;
  
  // Replace all placeholders in the template
  Object.entries(replacements).forEach(([key, value]) => {
    // Create a regex that looks for [KEY] and replace it with the value
    const regex = new RegExp(`\\[${key}\\]`, 'g');
    result = result.replace(regex, value);
  });
  
  return result;
}

/**
 * Replace [AGENT_NAME] placeholder with the actual agent's full name
 * @param template The template string with [AGENT_NAME] placeholder
 * @param agentFullName The agent's full name to use as replacement
 * @returns The processed string with [AGENT_NAME] replaced
 */
export function replaceAgentName(template: string, agentFullName: string): string {
  if (!template) return '';
  
  // Replace all occurrences of [AGENT_NAME] with the agent's full name
  return template.replace(/\[AGENT_NAME\]/g, agentFullName);
}