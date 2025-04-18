import { db } from "./db";
import { sql, eq, and, between, count, sum, avg, gte, lte, desc } from "drizzle-orm";
import { format, startOfMonth } from "date-fns";
import { 
  policies, leads, agents, users, commissions
} from "@shared/schema";

// Analytics interfaces
interface SalesAnalytics {
  date: string;
  policies: number;
  premium: number;
  commissions: number;
}

interface ConversionAnalytics {
  name: string;
  value: number;
}

interface PolicyTypeAnalytics {
  name: string;
  value: number;
}

interface AgentPerformanceAnalytics {
  name: string;
  id: number;
  policies: number;
  premium: number;
  commissions: number;
  conversion: number;
}

interface DashboardSummaryStats {
  totalPolicies: number;
  totalPremium: number;
  totalCommissions: number;
  conversionRate: number;
  avgPolicyValue: number;
  periodDescription: string;
}

// Generate period description for various time ranges
function getPeriodDescription(from: Date, to: Date): string {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays <= 7) return "Last 7 days";
  if (diffInDays <= 30) return "Last 30 days";
  if (diffInDays <= 90) return "Last 90 days";
  if (diffInDays <= 365) return "Last 12 months";
  return "All time";
}

// Format currency values
function formatCurrency(value: string | number): string {
  if (typeof value === 'string') {
    const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
    if (isNaN(numericValue)) return "$0";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericValue);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Extract numeric value from currency string (e.g., "$5,000" -> 5000)
function extractNumericValue(currencyStr: string): number {
  if (!currencyStr) return 0;
  return parseFloat(currencyStr.replace(/[^0-9.-]+/g, "")) || 0;
}

// Database analytics implementation
// Helper to format Date objects for PostgreSQL
function formatDateForPostgres(date: Date): string {
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
}

export const analyticsService = {
  // Sales analytics by date
  async getSalesAnalytics(from: Date, to: Date): Promise<SalesAnalytics[]> {
    try {
      // Get all policies in date range
      const allPolicies = await db.select({
        id: policies.id,
        issueDate: policies.issueDate,
        faceAmount: policies.faceAmount,
        premium: policies.premium,
      })
      .from(policies)
      .where(
        and(
          gte(policies.issueDate, from),
          lte(policies.issueDate, to)
        )
      );
      
      // Get all commissions in date range
      const allCommissions = await db.select({
        id: commissions.id,
        amount: commissions.amount,
        policyId: commissions.policyId,
        date: commissions.date,
      })
      .from(commissions)
      .where(
        and(
          gte(commissions.date, from),
          lte(commissions.date, to)
        )
      );
      
      // Group by month
      const monthlyData = new Map<string, SalesAnalytics>();
      
      // Process policies
      allPolicies.forEach(policy => {
        const date = policy.issueDate ? new Date(policy.issueDate) : new Date();
        const monthYear = format(date, 'MMM yyyy');
        
        if (!monthlyData.has(monthYear)) {
          monthlyData.set(monthYear, {
            date: monthYear,
            policies: 0,
            premium: 0,
            commissions: 0
          });
        }
        
        const data = monthlyData.get(monthYear)!;
        data.policies += 1;
        data.premium += extractNumericValue(policy.premium || '0');
      });
      
      // Process commissions
      allCommissions.forEach(commission => {
        const date = commission.date ? new Date(commission.date) : new Date();
        const monthYear = format(date, 'MMM yyyy');
        
        if (!monthlyData.has(monthYear)) {
          monthlyData.set(monthYear, {
            date: monthYear,
            policies: 0,
            premium: 0,
            commissions: 0
          });
        }
        
        const data = monthlyData.get(monthYear)!;
        data.commissions += extractNumericValue(commission.amount || '0');
      });
      
      // Convert to array and sort by date
      return Array.from(monthlyData.values()).sort((a, b) => {
        // Convert to comparable date format (MMM yyyy -> Date)
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
    } catch (error) {
      console.error("Error fetching sales analytics:", error);
      return [];
    }
  },
  
  // Sales analytics by agent
  async getSalesAnalyticsByAgent(agentId: number, from: Date, to: Date): Promise<SalesAnalytics[]> {
    try {
      // Get all policies in date range for this agent
      const allPolicies = await db.select({
        id: policies.id,
        issueDate: policies.issueDate,
        faceAmount: policies.faceAmount,
        premium: policies.premium,
      })
      .from(policies)
      .where(
        and(
          eq(policies.agentId, agentId),
          gte(policies.issueDate, from),
          lte(policies.issueDate, to)
        )
      );
      
      // Get all commissions in date range for this agent
      const allCommissions = await db.select({
        id: commissions.id,
        amount: commissions.amount,
        policyId: commissions.policyId,
        date: commissions.date,
      })
      .from(commissions)
      .where(
        and(
          eq(commissions.agentId, agentId),
          gte(commissions.date, from),
          lte(commissions.date, to)
        )
      );
      
      // Group by month
      const monthlyData = new Map<string, SalesAnalytics>();
      
      // Process policies
      allPolicies.forEach(policy => {
        const date = policy.issueDate ? new Date(policy.issueDate) : new Date();
        const monthYear = format(date, 'MMM yyyy');
        
        if (!monthlyData.has(monthYear)) {
          monthlyData.set(monthYear, {
            date: monthYear,
            policies: 0,
            premium: 0,
            commissions: 0
          });
        }
        
        const data = monthlyData.get(monthYear)!;
        data.policies += 1;
        data.premium += extractNumericValue(policy.premium || '0');
      });
      
      // Process commissions
      allCommissions.forEach(commission => {
        const date = commission.date ? new Date(commission.date) : new Date();
        const monthYear = format(date, 'MMM yyyy');
        
        if (!monthlyData.has(monthYear)) {
          monthlyData.set(monthYear, {
            date: monthYear,
            policies: 0,
            premium: 0,
            commissions: 0
          });
        }
        
        const data = monthlyData.get(monthYear)!;
        data.commissions += extractNumericValue(commission.amount || '0');
      });
      
      // Convert to array and sort by date
      return Array.from(monthlyData.values()).sort((a, b) => {
        // Convert to comparable date format (MMM yyyy -> Date)
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
    } catch (error) {
      console.error("Error fetching sales analytics by agent:", error);
      return [];
    }
  },
  
  // Conversion funnel analytics
  async getConversionAnalytics(from: Date, to: Date): Promise<ConversionAnalytics[]> {
    try {
      // Count leads
      const [leadCount] = await db
        .select({ value: count() })
        .from(leads)
        .where(
          and(
            gte(leads.createdAt, from),
            lte(leads.createdAt, to)
          )
        );
      
      // Count contacted leads
      const [contactedCount] = await db
        .select({ value: count() })
        .from(leads)
        .where(
          and(
            gte(leads.createdAt, from),
            lte(leads.createdAt, to),
            eq(leads.status, 'contacted')
          )
        );
      
      // Count quoted leads
      const [quotedCount] = await db
        .select({ value: count() })
        .from(leads)
        .where(
          and(
            gte(leads.createdAt, from),
            lte(leads.createdAt, to),
            eq(leads.status, 'quoted')
          )
        );
      
      // Count application submissions
      const [applicationCount] = await db
        .select({ value: count() })
        .from(leads)
        .where(
          and(
            gte(leads.createdAt, from),
            lte(leads.createdAt, to),
            eq(leads.status, 'application')
          )
        );
      
      // Count closed policies
      const [policyCount] = await db
        .select({ value: count() })
        .from(policies)
        .where(
          and(
            gte(policies.issueDate, from),
            lte(policies.issueDate, to)
          )
        );
      
      return [
        { name: 'Leads', value: leadCount?.value || 0 },
        { name: 'Contacts', value: contactedCount?.value || 0 },
        { name: 'Quotes', value: quotedCount?.value || 0 },
        { name: 'Applications', value: applicationCount?.value || 0 },
        { name: 'Policies', value: policyCount?.value || 0 },
      ];
    } catch (error) {
      console.error("Error fetching conversion analytics:", error);
      return [];
    }
  },
  
  // Conversion funnel analytics by agent
  async getConversionAnalyticsByAgent(agentId: number, from: Date, to: Date): Promise<ConversionAnalytics[]> {
    try {
      // Count leads
      const [leadCount] = await db
        .select({ value: count() })
        .from(leads)
        .where(
          and(
            eq(leads.assignedAgentId, agentId),
            gte(leads.createdAt, from),
            lte(leads.createdAt, to)
          )
        );
      
      // Count contacted leads
      const [contactedCount] = await db
        .select({ value: count() })
        .from(leads)
        .where(
          and(
            eq(leads.assignedAgentId, agentId),
            gte(leads.createdAt, from),
            lte(leads.createdAt, to),
            eq(leads.status, 'contacted')
          )
        );
      
      // Count quoted leads
      const [quotedCount] = await db
        .select({ value: count() })
        .from(leads)
        .where(
          and(
            eq(leads.assignedAgentId, agentId),
            gte(leads.createdAt, from),
            lte(leads.createdAt, to),
            eq(leads.status, 'quoted')
          )
        );
      
      // Count application submissions
      const [applicationCount] = await db
        .select({ value: count() })
        .from(leads)
        .where(
          and(
            eq(leads.assignedAgentId, agentId),
            gte(leads.createdAt, from),
            lte(leads.createdAt, to),
            eq(leads.status, 'application')
          )
        );
      
      // Count closed policies
      const [policyCount] = await db
        .select({ value: count() })
        .from(policies)
        .where(
          and(
            eq(policies.agentId, agentId),
            gte(policies.applicationDate, from),
            lte(policies.applicationDate, to)
          )
        );
      
      return [
        { name: 'Leads', value: leadCount?.value || 0 },
        { name: 'Contacts', value: contactedCount?.value || 0 },
        { name: 'Quotes', value: quotedCount?.value || 0 },
        { name: 'Applications', value: applicationCount?.value || 0 },
        { name: 'Policies', value: policyCount?.value || 0 },
      ];
    } catch (error) {
      console.error("Error fetching conversion analytics by agent:", error);
      return [];
    }
  },
  
  // Policy type distribution analytics
  async getPolicyTypeAnalytics(from: Date, to: Date): Promise<PolicyTypeAnalytics[]> {
    try {
      // Group policies by type
      const policiesByType = await db
        .select({
          policyType: policies.policyType,
          count: count(),
        })
        .from(policies)
        .where(
          and(
            gte(policies.applicationDate, from),
            lte(policies.applicationDate, to)
          )
        )
        .groupBy(policies.policyType);
      
      return policiesByType.map(item => ({
        name: item.policyType || 'Unknown',
        value: item.count || 0
      }));
    } catch (error) {
      console.error("Error fetching policy type analytics:", error);
      return [];
    }
  },
  
  // Policy type distribution analytics by agent
  async getPolicyTypeAnalyticsByAgent(agentId: number, from: Date, to: Date): Promise<PolicyTypeAnalytics[]> {
    try {
      // Group policies by type for this agent
      const policiesByType = await db
        .select({
          policyType: policies.policyType,
          count: count(),
        })
        .from(policies)
        .where(
          and(
            eq(policies.agentId, agentId),
            gte(policies.applicationDate, from),
            lte(policies.applicationDate, to)
          )
        )
        .groupBy(policies.policyType);
      
      return policiesByType.map(item => ({
        name: item.policyType || 'Unknown',
        value: item.count || 0
      }));
    } catch (error) {
      console.error("Error fetching policy type analytics by agent:", error);
      return [];
    }
  },
  
  // Agent performance analytics
  async getAgentPerformanceAnalytics(from: Date, to: Date): Promise<AgentPerformanceAnalytics[]> {
    try {
      // Get all agents
      const allAgents = await db
        .select({
          id: agents.id,
          name: agents.name,
          userId: agents.userId,
        })
        .from(agents);
      
      const agentPerformance: AgentPerformanceAnalytics[] = [];
      
      // For each agent, calculate metrics
      for (const agent of allAgents) {
        // Count policies by this agent
        const [policyCount] = await db
          .select({ count: count() })
          .from(policies)
          .where(
            and(
              eq(policies.agentId, agent.id),
              gte(policies.applicationDate, from),
              lte(policies.applicationDate, to)
            )
          );
        
        // Sum premium by this agent
        const policiesWithPremium = await db
          .select({ premium: policies.premium })
          .from(policies)
          .where(
            and(
              eq(policies.agentId, agent.id),
              gte(policies.applicationDate, from),
              lte(policies.applicationDate, to)
            )
          );
          
        let totalPremium = 0;
        policiesWithPremium.forEach(policy => {
          totalPremium += extractNumericValue(policy.premium || '0');
        });
        
        // Sum commissions by this agent
        const commissionsForAgent = await db
          .select({ amount: commissions.amount })
          .from(commissions)
          .where(
            and(
              eq(commissions.agentId, agent.id),
              gte(commissions.date, from),
              lte(commissions.date, to)
            )
          );
          
        let totalCommissions = 0;
        commissionsForAgent.forEach(commission => {
          totalCommissions += extractNumericValue(commission.amount || '0');
        });
        
        // Get lead conversion rate
        const [totalLeads] = await db
          .select({ count: count() })
          .from(leads)
          .where(
            and(
              eq(leads.assignedAgentId, agent.id),
              gte(leads.createdAt, from),
              lte(leads.createdAt, to)
            )
          );
        
        const conversionRate = totalLeads.count > 0 
          ? Math.round((policyCount.count / totalLeads.count) * 100) 
          : 0;
        
        agentPerformance.push({
          id: agent.id,
          name: agent.name,
          policies: policyCount.count,
          premium: totalPremium,
          commissions: totalCommissions,
          conversion: conversionRate
        });
      }
      
      // Sort by policies sold (descending)
      return agentPerformance.sort((a, b) => b.policies - a.policies);
    } catch (error) {
      console.error("Error fetching agent performance analytics:", error);
      return [];
    }
  },
  
  // Agent performance analytics by team
  async getAgentPerformanceAnalyticsByTeam(teamLeaderId: number, from: Date, to: Date): Promise<AgentPerformanceAnalytics[]> {
    try {
      // Get all agents in this team (with uplineAgentId = teamLeaderId)
      const teamAgents = await db
        .select({
          id: agents.id,
          name: agents.name,
          userId: agents.userId,
        })
        .from(agents)
        .where(eq(agents.uplineAgentId, teamLeaderId));
      
      const agentPerformance: AgentPerformanceAnalytics[] = [];
      
      // For each agent, calculate metrics
      for (const agent of teamAgents) {
        // Count policies by this agent
        const [policyCount] = await db
          .select({ count: count() })
          .from(policies)
          .where(
            and(
              eq(policies.agentId, agent.id),
              gte(policies.applicationDate, from),
              lte(policies.applicationDate, to)
            )
          );
        
        // Sum premium by this agent
        const policiesWithPremium = await db
          .select({ premium: policies.premium })
          .from(policies)
          .where(
            and(
              eq(policies.agentId, agent.id),
              gte(policies.applicationDate, from),
              lte(policies.applicationDate, to)
            )
          );
          
        let totalPremium = 0;
        policiesWithPremium.forEach(policy => {
          totalPremium += extractNumericValue(policy.premium || '0');
        });
        
        // Sum commissions by this agent
        const commissionsForAgent = await db
          .select({ amount: commissions.amount })
          .from(commissions)
          .where(
            and(
              eq(commissions.agentId, agent.id),
              gte(commissions.date, from),
              lte(commissions.date, to)
            )
          );
          
        let totalCommissions = 0;
        commissionsForAgent.forEach(commission => {
          totalCommissions += extractNumericValue(commission.amount || '0');
        });
        
        // Get lead conversion rate
        const [totalLeads] = await db
          .select({ count: count() })
          .from(leads)
          .where(
            and(
              eq(leads.assignedAgentId, agent.id),
              gte(leads.createdAt, from),
              lte(leads.createdAt, to)
            )
          );
        
        const conversionRate = totalLeads.count > 0 
          ? Math.round((policyCount.count / totalLeads.count) * 100) 
          : 0;
        
        agentPerformance.push({
          id: agent.id,
          name: agent.name,
          policies: policyCount.count,
          premium: totalPremium,
          commissions: totalCommissions,
          conversion: conversionRate
        });
      }
      
      // Sort by policies sold (descending)
      return agentPerformance.sort((a, b) => b.policies - a.policies);
    } catch (error) {
      console.error("Error fetching agent performance analytics by team:", error);
      return [];
    }
  },
  
  // Dashboard summary statistics
  async getDashboardSummaryStats(from: Date, to: Date): Promise<DashboardSummaryStats> {
    try {
      // Total policies in period
      const [policyCount] = await db
        .select({ count: count() })
        .from(policies)
        .where(
          and(
            gte(policies.applicationDate, from),
            lte(policies.applicationDate, to)
          )
        );
      
      // Total premium in period
      const policiesWithPremium = await db
        .select({ premium: policies.premium })
        .from(policies)
        .where(
          and(
            gte(policies.applicationDate, from),
            lte(policies.applicationDate, to)
          )
        );
        
      let totalPremium = 0;
      policiesWithPremium.forEach(policy => {
        totalPremium += extractNumericValue(policy.premium || '0');
      });
      
      // Total commissions in period
      const commissionsInPeriod = await db
        .select({ amount: commissions.amount })
        .from(commissions)
        .where(
          and(
            gte(commissions.date, from),
            lte(commissions.date, to)
          )
        );
        
      let totalCommissions = 0;
      commissionsInPeriod.forEach(commission => {
        totalCommissions += extractNumericValue(commission.amount || '0');
      });
      
      // Lead conversion rate
      const [totalLeads] = await db
        .select({ count: count() })
        .from(leads)
        .where(
          and(
            gte(leads.createdAt, from),
            lte(leads.createdAt, to)
          )
        );
      
      const conversionRate = totalLeads.count > 0 
        ? Math.round((policyCount.count / totalLeads.count) * 100) 
        : 0;
      
      // Average policy value
      const avgPolicyValue = policyCount.count > 0 
        ? totalPremium / policyCount.count 
        : 0;
      
      return {
        totalPolicies: policyCount.count,
        totalPremium,
        totalCommissions,
        conversionRate,
        avgPolicyValue,
        periodDescription: getPeriodDescription(from, to)
      };
    } catch (error) {
      console.error("Error fetching dashboard summary stats:", error);
      return {
        totalPolicies: 0,
        totalPremium: 0,
        totalCommissions: 0,
        conversionRate: 0,
        avgPolicyValue: 0,
        periodDescription: getPeriodDescription(from, to)
      };
    }
  },
  
  // Dashboard summary statistics by agent
  async getDashboardSummaryStatsByAgent(agentId: number, from: Date, to: Date): Promise<DashboardSummaryStats> {
    try {
      // Total policies by this agent in period
      const [policyCount] = await db
        .select({ count: count() })
        .from(policies)
        .where(
          and(
            eq(policies.agentId, agentId),
            gte(policies.applicationDate, from),
            lte(policies.applicationDate, to)
          )
        );
      
      // Total premium by this agent in period
      const policiesWithPremium = await db
        .select({ premium: policies.premium })
        .from(policies)
        .where(
          and(
            eq(policies.agentId, agentId),
            gte(policies.applicationDate, from),
            lte(policies.applicationDate, to)
          )
        );
        
      let totalPremium = 0;
      policiesWithPremium.forEach(policy => {
        totalPremium += extractNumericValue(policy.premium || '0');
      });
      
      // Total commissions for this agent in period
      const commissionsForAgent = await db
        .select({ amount: commissions.amount })
        .from(commissions)
        .where(
          and(
            eq(commissions.agentId, agentId),
            gte(commissions.date, from),
            lte(commissions.date, to)
          )
        );
        
      let totalCommissions = 0;
      commissionsForAgent.forEach(commission => {
        totalCommissions += extractNumericValue(commission.amount || '0');
      });
      
      // Lead conversion rate for this agent
      const [totalLeads] = await db
        .select({ count: count() })
        .from(leads)
        .where(
          and(
            eq(leads.assignedAgentId, agentId),
            gte(leads.createdAt, from),
            lte(leads.createdAt, to)
          )
        );
      
      const conversionRate = totalLeads.count > 0 
        ? Math.round((policyCount.count / totalLeads.count) * 100) 
        : 0;
      
      // Average policy value
      const avgPolicyValue = policyCount.count > 0 
        ? totalPremium / policyCount.count 
        : 0;
      
      return {
        totalPolicies: policyCount.count,
        totalPremium,
        totalCommissions,
        conversionRate,
        avgPolicyValue,
        periodDescription: getPeriodDescription(from, to)
      };
    } catch (error) {
      console.error("Error fetching dashboard summary stats by agent:", error);
      return {
        totalPolicies: 0,
        totalPremium: 0,
        totalCommissions: 0,
        conversionRate: 0,
        avgPolicyValue: 0,
        periodDescription: getPeriodDescription(from, to)
      };
    }
  }
};