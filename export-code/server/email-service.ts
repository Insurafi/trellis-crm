// This is a placeholder email service
// In a production environment, this would be connected to a real email provider like SendGrid, Mailgun, etc.

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send an email (placeholder implementation)
 * @param params Email parameters including to, from, subject, text and html content
 * @returns Promise<boolean> indicating success or failure
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    // Log that we would send an email in a production environment
    console.log('📧 EMAIL NOTIFICATION (PLACEHOLDER)');
    console.log('================================');
    console.log('To:', params.to);
    console.log('From:', params.from);
    console.log('Subject:', params.subject);
    console.log('Content:', params.text || params.html || '(No content)');
    console.log('================================');
    console.log('NOTE: This is a placeholder. No email was actually sent.');
    console.log('To enable real email sending, you would need to:');
    console.log('1. Set up an account with an email service provider (SendGrid, Mailgun, etc.)');
    console.log('2. Obtain an API key and configure it in your environment');
    console.log('3. Update the email-service.ts file to use the provider\'s SDK');
    console.log('================================');
    
    // For demonstration purposes, we'll simulate success
    return true;
  } catch (error) {
    console.error('Error in email placeholder service:', error);
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