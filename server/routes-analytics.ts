import { Express, Request, Response } from "express";
import { storage } from "./storage";
import { isAuthenticated, isAdmin, isAdminOrTeamLeader } from "./auth";
import { ZodError } from "zod";
import { formatISO, subDays, subMonths, subYears } from "date-fns";

export function registerAnalyticsRoutes(app: Express) {
  // Common error handler for validation errors
  const handleValidationError = (error: unknown, res: Response) => {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "An unexpected error occurred" });
  };

  // Get date range based on request param
  const getDateRange = (dateRange: string): { from: Date; to: Date } => {
    const to = new Date();
    let from: Date;
    
    switch (dateRange) {
      case "7d":
        from = subDays(to, 7);
        break;
      case "30d":
        from = subDays(to, 30);
        break;
      case "90d":
        from = subDays(to, 90);
        break;
      case "1y":
        from = subYears(to, 1);
        break;
      case "all":
      default:
        // Set a far past date for "all"
        from = new Date(2000, 0, 1);
        break;
    }
    
    return { from, to };
  };

  // Sales Analytics API
  app.get("/api/analytics/sales", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { from, to } = getDateRange(req.query.dateRange as string || "30d");
      
      // If admin or team leader, get all data
      // If agent, get only data for that agent
      let salesData;
      if (req.user?.role === "admin" || req.user?.role === "team_leader") {
        salesData = await storage.getSalesAnalytics(from, to);
      } else {
        // For agents, only show their own sales
        salesData = await storage.getSalesAnalyticsByAgent(req.user?.id || 0, from, to);
      }
      
      res.json(salesData);
    } catch (error) {
      console.error("Error fetching sales analytics:", error);
      res.status(500).json({ message: "Error fetching sales analytics" });
    }
  });

  // Conversion Analytics API
  app.get("/api/analytics/conversion", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { from, to } = getDateRange(req.query.dateRange as string || "30d");
      
      // If admin or team leader, get all data
      // If agent, get only data for that agent
      let conversionData;
      if (req.user?.role === "admin" || req.user?.role === "team_leader") {
        conversionData = await storage.getConversionAnalytics(from, to);
      } else {
        // For agents, only show their own conversion rates
        conversionData = await storage.getConversionAnalyticsByAgent(req.user?.id || 0, from, to);
      }
      
      res.json(conversionData);
    } catch (error) {
      console.error("Error fetching conversion analytics:", error);
      res.status(500).json({ message: "Error fetching conversion analytics" });
    }
  });

  // Policy Type Distribution API
  app.get("/api/analytics/policy-types", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { from, to } = getDateRange(req.query.dateRange as string || "30d");
      
      // If admin or team leader, get all data
      // If agent, get only data for that agent
      let policyTypeData;
      if (req.user?.role === "admin" || req.user?.role === "team_leader") {
        policyTypeData = await storage.getPolicyTypeAnalytics(from, to);
      } else {
        // For agents, only show their own policy type distribution
        policyTypeData = await storage.getPolicyTypeAnalyticsByAgent(req.user?.id || 0, from, to);
      }
      
      res.json(policyTypeData);
    } catch (error) {
      console.error("Error fetching policy type analytics:", error);
      res.status(500).json({ message: "Error fetching policy type analytics" });
    }
  });

  // Agent Performance Analytics API (Admin/Team Leader only)
  app.get("/api/analytics/agent-performance", isAdminOrTeamLeader, async (req: Request, res: Response) => {
    try {
      const { from, to } = getDateRange(req.query.dateRange as string || "30d");
      
      // Get performance data for all agents or filtered by team
      let agentPerformanceData;
      if (req.user?.role === "admin") {
        // Admins see all agents
        agentPerformanceData = await storage.getAgentPerformanceAnalytics(from, to);
      } else {
        // Team leaders only see agents in their team
        const teamLeaderId = req.user?.id || 0;
        agentPerformanceData = await storage.getAgentPerformanceAnalyticsByTeam(teamLeaderId, from, to);
      }
      
      res.json(agentPerformanceData);
    } catch (error) {
      console.error("Error fetching agent performance analytics:", error);
      res.status(500).json({ message: "Error fetching agent performance analytics" });
    }
  });

  // Dashboard Summary Stats API
  app.get("/api/analytics/dashboard-summary", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { from, to } = getDateRange(req.query.dateRange as string || "30d");
      
      // If admin or team leader, get all data
      // If agent, get only data for that agent
      let summaryData;
      if (req.user?.role === "admin" || req.user?.role === "team_leader") {
        summaryData = await storage.getDashboardSummaryStats(from, to);
      } else {
        // For agents, only show their own summary stats
        summaryData = await storage.getDashboardSummaryStatsByAgent(req.user?.id || 0, from, to);
      }
      
      res.json(summaryData);
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      res.status(500).json({ message: "Error fetching dashboard summary" });
    }
  });

  // Individual agent analytics endpoints for the agent performance page
  
  // Get sales analytics for a specific agent
  app.get("/api/analytics/sales/by-agent/:agentId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const agentId = parseInt(req.params.agentId);
      const { from, to } = getDateRange(req.query.dateRange as string || "30d");
      
      // Get the agent record to find the associated userId
      const agentRecord = await storage.getAgent(agentId);
      
      // Check permissions: admins and team leaders can view any agent, agents can only view themselves
      const isOwnData = req.user?.id === agentRecord?.userId;
      
      if (isOwnData || req.user?.role === "admin" || req.user?.role === "team_leader") {
        const salesData = await storage.getSalesAnalyticsByAgent(agentId, from, to);
        res.json(salesData);
      } else {
        res.status(403).json({ message: "You don't have permission to view this agent's data" });
      }
    } catch (error) {
      console.error("Error fetching agent sales analytics:", error);
      res.status(500).json({ message: "Error fetching agent sales analytics" });
    }
  });
  
  // Get conversion analytics for a specific agent
  app.get("/api/analytics/conversion/by-agent/:agentId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const agentId = parseInt(req.params.agentId);
      const { from, to } = getDateRange(req.query.dateRange as string || "30d");
      
      // Get the agent record to find the associated userId
      const agentRecord = await storage.getAgent(agentId);
      
      // Check permissions: admins and team leaders can view any agent, agents can only view themselves
      const isOwnData = req.user?.id === agentRecord?.userId;
      
      if (isOwnData || req.user?.role === "admin" || req.user?.role === "team_leader") {
        const conversionData = await storage.getConversionAnalyticsByAgent(agentId, from, to);
        res.json(conversionData);
      } else {
        res.status(403).json({ message: "You don't have permission to view this agent's data" });
      }
    } catch (error) {
      console.error("Error fetching agent conversion analytics:", error);
      res.status(500).json({ message: "Error fetching agent conversion analytics" });
    }
  });
  
  // Get policy type distribution for a specific agent
  app.get("/api/analytics/policy-types/by-agent/:agentId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const agentId = parseInt(req.params.agentId);
      const { from, to } = getDateRange(req.query.dateRange as string || "30d");
      
      // Get the agent record to find the associated userId
      const agentRecord = await storage.getAgent(agentId);
      
      // Check permissions: admins and team leaders can view any agent, agents can only view themselves
      const isOwnData = req.user?.id === agentRecord?.userId;
      
      if (isOwnData || req.user?.role === "admin" || req.user?.role === "team_leader") {
        const policyTypeData = await storage.getPolicyTypeAnalyticsByAgent(agentId, from, to);
        res.json(policyTypeData);
      } else {
        res.status(403).json({ message: "You don't have permission to view this agent's data" });
      }
    } catch (error) {
      console.error("Error fetching agent policy type analytics:", error);
      res.status(500).json({ message: "Error fetching agent policy type analytics" });
    }
  });
  
  // Get dashboard summary stats for a specific agent
  app.get("/api/analytics/summary/by-agent/:agentId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const agentId = parseInt(req.params.agentId);
      const { from, to } = getDateRange(req.query.dateRange as string || "30d");
      
      // Get the agent record to find the associated userId
      const agentRecord = await storage.getAgent(agentId);
      
      // Check permissions: admins and team leaders can view any agent, agents can only view themselves
      const isOwnData = req.user?.id === agentRecord?.userId;
      
      if (isOwnData || req.user?.role === "admin" || req.user?.role === "team_leader") {
        const summaryData = await storage.getDashboardSummaryStatsByAgent(agentId, from, to);
        res.json(summaryData);
      } else {
        res.status(403).json({ message: "You don't have permission to view this agent's data" });
      }
    } catch (error) {
      console.error("Error fetching agent summary stats:", error);
      res.status(500).json({ message: "Error fetching agent summary stats" });
    }
  });
}