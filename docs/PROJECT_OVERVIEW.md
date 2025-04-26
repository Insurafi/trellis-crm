# Trellis CRM Project Overview

## Project Description

Trellis CRM is a comprehensive customer relationship management system designed specifically for life insurance professionals. The platform simplifies complex workflows through intelligent technology and user-friendly interfaces.

## Key Technologies

- **Frontend**: React with TypeScript, TanStack Query, React Hook Form, Zod, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express.js, PostgreSQL, Drizzle ORM
- **Infrastructure**: Replit, WebSockets for real-time updates

## Core Features

- **Lead Management**: Tracking and converting prospects into clients
- **Client Management**: Storing and managing client information
- **Policy Management**: Tracking insurance policies and their details
- **Task Management**: Creating and assigning tasks to team members
- **Calendar & Scheduling**: Managing appointments and reminders
- **Document Management**: Storing and organizing client documents
- **Sales Pipeline**: Tracking opportunities through customizable stages
- **Commission Tracking**: Monitoring and managing commission payments
- **Analytics Dashboard**: Visualizing performance metrics and KPIs
- **Communication Templates**: Managing templates for emails, calls, and SMS

## Database Schema

The database is structured around these primary entities:

- **Users**: Brokers, agents, team leaders, and support staff
- **Agents**: Insurance agents with license information
- **Clients**: Individuals or businesses who have purchased policies
- **Leads**: Prospective clients in various stages of conversion
- **Policies**: Insurance policies with details and status
- **Tasks**: Assignments and to-dos for team members
- **Calendar Events**: Scheduled appointments and reminders
- **Documents**: Stored files associated with clients
- **Pipeline Stages**: Customizable sales pipeline stages
- **Pipeline Opportunities**: Deals in progress through the sales pipeline
- **Commissions**: Commission records for policies
- **Communication Templates**: Templates for various communication types

## File Structure

- `/client`: Frontend React application
  - `/src/pages`: Individual application pages
  - `/src/components`: Reusable UI components
  - `/src/hooks`: Custom React hooks
  - `/src/lib`: Utility functions and API clients
- `/server`: Backend Express application
  - `index.ts`: Main server entry point
  - `routes.ts`: API routes and handlers
  - `storage.ts`: Database storage interface
  - `auth.ts`: Authentication logic
  - `database-storage.ts`: Implementation of storage using Drizzle ORM
- `/shared`: Code shared between frontend and backend
  - `schema.ts`: Database schema and type definitions using Drizzle

## Recent Fixes

1. **Lead-to-Client Conversion Fix**: Disabled automatic conversion of leads to clients to give agents more control over the process.
2. **Monica's Permission Fix**: Added special handling for Monica Palmer's account (Agent ID: 9) to see all leads in the system.
3. **Lead Status Default Value**: Changed default status from "new" to "Leads" with proper capitalization.
4. **Lead Form Fixes**: Resolved issues with the lead creation form including duplicate form definitions, initialization order, and missing fields.

## User Roles

- **Admin**: Full system access and control
- **Team Leader**: Manages a team of agents and views their performance
- **Agent**: Manages leads, clients, and policies
- **Support**: Handles administrative tasks and supports agents

## Getting Started

To run the application:

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up the PostgreSQL database
4. Configure environment variables
5. Run the application with `npm run dev`

## Development Guidelines

- Follow TypeScript best practices for type safety
- Use React Query for data fetching and mutations
- Follow the existing component patterns in the UI
- Keep API routes RESTful and well-documented
- Add proper error handling for all operations
- Write tests for critical functionality