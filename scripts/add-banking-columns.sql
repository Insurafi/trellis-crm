-- Add banking information columns to the agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS bank_account_type TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS bank_routing_number TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS bank_payment_method TEXT;