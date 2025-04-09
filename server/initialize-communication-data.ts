import { db } from "./db";
import { communicationTemplates, type InsertCommunicationTemplate } from "@shared/schema";
import { count } from "drizzle-orm";

export async function initializeCommunicationData() {
  // Check if templates already exist
  const [templateCount] = await db.select({ count: count() }).from(communicationTemplates);
  if (templateCount && templateCount.count > 0) {
    console.log(`Communication templates already exist (${templateCount.count} templates found). Skipping initialization.`);
    return;
  }

  console.log("Initializing communication templates...");

  const templates: InsertCommunicationTemplate[] = [
    {
      name: "Welcome Email",
      category: "email",
      subject: "Welcome to [COMPANY]!",
      content: `Dear [NAME],

Thank you for choosing [COMPANY] for your insurance needs. We're excited to have you on board!

As your dedicated insurance broker, I'm here to help you navigate the complexities of insurance and ensure you have the coverage that best meets your needs and budget.

Here's what you can expect from our partnership:
- Personalized service and advice
- Regular policy reviews to ensure you have the right coverage
- Prompt assistance with claims
- Access to exclusive offers and resources

Please feel free to reach out if you have any questions or concerns. You can contact me directly at [PHONE] or reply to this email.

I look forward to working with you!

Best regards,
[BROKER_NAME]
[COMPANY]
[PHONE]
[EMAIL]`,
      tags: "welcome,onboarding,new client",
      isDefault: true,
      createdBy: 1,
    },
    {
      name: "Policy Renewal Reminder",
      category: "email",
      subject: "Your Insurance Policy Renewal - Action Required",
      content: `Dear [NAME],

This is a friendly reminder that your [POLICY_TYPE] insurance policy #[POLICY_NUMBER] is set to renew on [RENEWAL_DATE].

To ensure continuous coverage, please review the renewal information I've attached and let me know if you'd like to make any changes to your policy.

Key details:
- Policy: [POLICY_TYPE]
- Policy Number: [POLICY_NUMBER]
- Current Expiration: [EXPIRATION_DATE]
- Renewal Date: [RENEWAL_DATE]
- Premium: [PREMIUM]

If you have any questions or would like to discuss your coverage options, please don't hesitate to contact me at [PHONE] or reply to this email.

Thank you for your continued trust in our services.

Best regards,
[BROKER_NAME]
[COMPANY]
[PHONE]
[EMAIL]`,
      tags: "renewal,reminder,policy",
      isDefault: true,
      createdBy: 1,
    },
    {
      name: "Client Introduction Call Script",
      category: "call",
      content: `INTRODUCTION:
"Hello, may I speak with [NAME]? This is [BROKER_NAME] from [COMPANY]. How are you today?"

PURPOSE:
"I'm calling to introduce myself as your new insurance broker and to schedule a quick meeting to review your current policies and make sure you're getting the best coverage for your needs."

KEY QUESTIONS:
1. "When was the last time you had a comprehensive review of your insurance policies?"
2. "Have there been any major life changes recently that might affect your insurance needs? (Marriage, new home, children, retirement planning, etc.)"
3. "What's most important to you when it comes to your insurance coverage? Price? Coverage? Service?"
4. "Do you have any immediate concerns about your current policies?"

SCHEDULING:
"I'd like to set up a time to meet with you for about 30 minutes to go through your current policies and discuss any potential gaps or savings opportunities. Would you prefer a phone call, video meeting, or in-person meeting?"

CLOSE:
"Great! I've scheduled our [MEETING_TYPE] for [DATE] at [TIME]. I'll send you a calendar invitation with all the details. In the meantime, if you have any questions, please feel free to reach me at [PHONE] or [EMAIL]. I'm looking forward to working with you!"

FOLLOW-UP:
"Thank you for your time today, [NAME]. I'll send you an email confirmation of our appointment, and I look forward to speaking with you soon."`,
      tags: "call script,introduction,new client",
      isDefault: true,
      createdBy: 1,
    },
    {
      name: "Policy Review Call Script",
      category: "call",
      content: `INTRODUCTION:
"Hello [NAME], this is [BROKER_NAME] from [COMPANY]. I'm calling for our scheduled policy review. Is this still a good time to talk?"

PURPOSE:
"The purpose of this call is to review your current policies, make sure they still meet your needs, and identify any potential gaps in coverage or opportunities for savings."

POLICY REVIEW:
1. "Let's start by going through your current policies:"
   - Life Insurance: [POLICY_DETAILS]
   - Health Insurance: [POLICY_DETAILS]
   - Auto Insurance: [POLICY_DETAILS]
   - Home/Renters Insurance: [POLICY_DETAILS]
   - Other policies: [POLICY_DETAILS]

2. "Have there been any significant changes in your life since we last spoke? (Marriage, new home, new car, children, retirement planning, etc.)"

3. "Based on what you've shared, I've identified a few areas we should discuss:"
   - [OBSERVATION_1]
   - [OBSERVATION_2]
   - [OBSERVATION_3]

RECOMMENDATIONS:
"I recommend the following adjustments to your policies:"
- [RECOMMENDATION_1]
- [RECOMMENDATION_2]
- [RECOMMENDATION_3]

CLOSE:
"Would you like me to implement these changes for you?"

[IF YES]: "Great! I'll take care of that right away and send you updated policy documents for your records."

[IF NO]: "No problem. Please take some time to think about it, and feel free to call me if you have any questions or want to discuss further."

"Thank you for your time today. Is there anything else I can help you with?"

FOLLOW-UP:
"I'll send you an email summarizing what we discussed today. If you have any questions or concerns, please don't hesitate to contact me."`,
      tags: "call script,review,policy",
      isDefault: true,
      createdBy: 1,
    },
    {
      name: "Policy Renewal SMS",
      category: "sms",
      content: `[COMPANY] Reminder: Your [POLICY_TYPE] insurance policy expires on [EXPIRATION_DATE]. Reply YES to renew or call [PHONE] to discuss options.`,
      tags: "sms,renewal,reminder",
      isDefault: true,
      createdBy: 1,
    },
    {
      name: "Appointment Confirmation SMS",
      category: "sms",
      content: `Your appointment with [BROKER_NAME] from [COMPANY] is confirmed for [DATE] at [TIME]. Reply C to confirm or R to reschedule.`,
      tags: "sms,appointment,confirmation",
      isDefault: true,
      createdBy: 1,
    },
    {
      name: "Quote Follow-up Email",
      category: "email",
      subject: "Your Insurance Quote from [COMPANY]",
      content: `Dear [NAME],

Thank you for requesting a quote for [POLICY_TYPE] insurance. I've analyzed your needs and prepared a customized quote for you.

Quote Details:
- Policy Type: [POLICY_TYPE]
- Coverage Amount: [COVERAGE_AMOUNT]
- Deductible: [DEDUCTIBLE]
- Premium: [PREMIUM]
- Term: [TERM]

This quote offers excellent coverage at a competitive rate and includes the following key benefits:
- [BENEFIT_1]
- [BENEFIT_2]
- [BENEFIT_3]

The quote is valid until [EXPIRATION_DATE]. To proceed with this policy or discuss adjustments, please:
1. Call me at [PHONE]
2. Reply to this email
3. Schedule a meeting using this link: [MEETING_LINK]

I'm here to answer any questions you might have and ensure you get the right coverage for your needs.

Best regards,
[BROKER_NAME]
[COMPANY]
[PHONE]
[EMAIL]`,
      tags: "quote,follow-up,email",
      isDefault: true,
      createdBy: 1,
    },
    {
      name: "Claim Follow-up Call Script",
      category: "call",
      content: `INTRODUCTION:
"Hello [NAME], this is [BROKER_NAME] from [COMPANY]. I'm calling to follow up on the claim you filed regarding [CLAIM_REASON]. Do you have a few minutes to talk?"

CLAIM STATUS:
"I wanted to give you an update on your claim (Claim #[CLAIM_NUMBER])."

[IF CLAIM APPROVED]:
"I'm pleased to inform you that your claim has been approved. The insurance company has approved [APPROVED_AMOUNT] for your claim. The payment will be processed within [TIMEFRAME] by [PAYMENT_METHOD]."

[IF CLAIM PENDING]:
"Your claim is still under review. The insurance company has requested the following additional information/documentation:"
- [REQUESTED_ITEM_1]
- [REQUESTED_ITEM_2]
"Could you provide these by [DEADLINE]? This will help expedite the processing of your claim."

[IF CLAIM DENIED]:
"I'm sorry to inform you that the insurance company has denied your claim. The reason provided is [DENIAL_REASON]. I understand this is disappointing news. We have several options we can discuss:"
- "We can appeal the decision if you believe it was made in error."
- "We can submit additional documentation to support your claim."
- "I can explain the specific policy terms that affected this decision."

NEXT STEPS:
"Here are the next steps in the process:"
- [NEXT_STEP_1]
- [NEXT_STEP_2]
- [NEXT_STEP_3]

"Do you have any questions about your claim or the next steps?"

CLOSE:
"Thank you for your time today. I'll continue to monitor your claim and keep you updated on any developments. If you have any questions or concerns in the meantime, please don't hesitate to call me at [PHONE] or email me at [EMAIL]."

FOLLOW-UP:
"I'll send you an email summarizing what we discussed and outlining the next steps. Thank you again for your time and patience through this process."`,
      tags: "call script,claim,follow-up",
      isDefault: true,
      createdBy: 1,
    },
  ];

  await db.insert(communicationTemplates).values(templates);
  console.log(`Successfully initialized ${templates.length} communication templates.`);
}