import { communicationTemplates } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export async function initializeCommunicationData() {
  console.log("Initializing communication templates data...");
  
  try {
    // Check if data already exists
    const existingTemplates = await db.select().from(communicationTemplates);
    
    if (existingTemplates.length > 0) {
      console.log("Communication templates data already initialized, skipping initialization");
      return;
    }
    
    // Initialize default communication templates
    await db.insert(communicationTemplates).values([
      // Email templates
      {
        name: "Welcome Email",
        category: "email",
        subject: "Welcome to [COMPANY]!",
        content: `Dear [NAME],

Thank you for choosing [COMPANY] for your insurance needs. We're excited to have you on board!

Best regards,
[BROKER_NAME]`,
        tags: "welcome,onboarding",
        isDefault: true,
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Policy Review Reminder",
        category: "email",
        subject: "Time for Your Annual Policy Review",
        content: `Dear [NAME],

It's time for your annual policy review. Let's schedule a call to make sure your coverage still meets your needs.

Please let me know what days/times work best for you in the coming week.

Best regards,
[BROKER_NAME]`,
        tags: "review,annual",
        isDefault: true,
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Call script templates
      {
        name: "Client Introduction",
        category: "call",
        content: `Hello [NAME], this is [BROKER_NAME] from [COMPANY]. 
I'm calling to introduce myself as your new insurance broker and to discuss your insurance needs.

Key questions to ask:
1. Have you reviewed your life insurance coverage recently?
2. Has your family situation changed since you last purchased insurance?
3. What are your primary financial concerns right now?`,
        tags: "introduction,call",
        isDefault: true,
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Policy Application Follow-up",
        category: "call",
        content: `Hello [NAME], this is [BROKER_NAME] from [COMPANY].
I'm calling to follow up on your life insurance application. 

The underwriting process is [STATUS]. 
[IF ADDITIONAL_INFO_NEEDED] We need the following information to proceed: [DETAILS].

Do you have any questions about the process or timeline?`,
        tags: "follow-up,application",
        isDefault: true,
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // SMS templates
      {
        name: "Meeting Reminder",
        category: "sms",
        content: `Hi [NAME], this is a reminder about our meeting tomorrow at [TIME]. Reply Y to confirm or N to reschedule. [BROKER_NAME]`,
        tags: "reminder,meeting",
        isDefault: true,
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Document Request",
        category: "sms",
        content: `Hi [NAME], we need [DOCUMENT_TYPE] to complete your application. Please email it to [EMAIL] when you have a moment. [BROKER_NAME]`,
        tags: "document,request",
        isDefault: true,
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    
    console.log("Communication templates initialization completed successfully");
  } catch (error) {
    console.error("Error initializing communication templates data:", error);
  }
}