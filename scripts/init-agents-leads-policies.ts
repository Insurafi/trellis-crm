import { initializeAgentsLeadsPoliciesData } from "../server/initialize-agents-leads-policies";

async function main() {
  console.log("Initializing agents, leads, and policies data...");
  await initializeAgentsLeadsPoliciesData();
  console.log("Done!");
  process.exit(0);
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});