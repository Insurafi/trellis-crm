import sgMail from '@sendgrid/mail';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendCodeEmail() {
  try {
    // Create a list of files to attach
    const zipPath = path.join(__dirname, 'trellis-crm-export.zip');
    
    // Check if the ZIP file exists
    if (!fs.existsSync(zipPath)) {
      console.error('ZIP file not found. Please make sure trellis-crm-export.zip exists.');
      return;
    }
    
    // Read the ZIP file as base64
    const zipContent = fs.readFileSync(zipPath).toString('base64');
    
    // Prepare the email
    const msg = {
      to: 'inga@insurafi.co',
      from: 'noreply@replit.app', // This is a default sender, it will be changed in SendGrid
      subject: 'Trellis CRM Source Code',
      text: 'Please find attached the complete source code for Trellis CRM.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f46e5;">Trellis CRM Source Code</h1>
          
          <p>Hello Inga,</p>
          
          <p>As requested, I'm sending you the complete source code for the Trellis CRM application. 
          The code is attached as a ZIP file.</p>
          
          <h2 style="color: #6366f1; margin-top: 30px;">Project Structure</h2>
          <pre style="background-color: #f1f5f9; padding: 15px; border-radius: 6px;">
├── client/           # React frontend
├── server/           # Express backend
├── shared/           # Shared types and schemas
├── migrations/       # Database migrations
└── public/           # Static assets</pre>
          
          <h2 style="color: #6366f1; margin-top: 30px;">Setting Up Locally</h2>
          <ol>
            <li>Extract the ZIP file</li>
            <li>Run <code>npm install</code> to install dependencies</li>
            <li>Set up a PostgreSQL database</li>
            <li>Configure environment variables</li>
            <li>Run <code>npm run dev</code> to start the application</li>
          </ol>
          
          <p>If you have any questions or need assistance, please let me know.</p>
          
          <p>Best regards,<br>Trellis CRM Team</p>
        </div>
      `,
      attachments: [
        {
          content: zipContent,
          filename: 'trellis-crm-source-code.zip',
          type: 'application/zip',
          disposition: 'attachment'
        }
      ]
    };
    
    // Send the email
    await sgMail.send(msg);
    console.log('Email sent successfully to inga@insurafi.co');
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('SendGrid Error:', error.response.body);
    }
  }
}

// Execute the function
sendCodeEmail();