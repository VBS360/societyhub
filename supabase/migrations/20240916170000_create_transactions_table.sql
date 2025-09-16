-- Create the transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  payment_method VARCHAR(50) NOT NULL,
  reference VARCHAR(100),
  transaction_date DATE NOT NULL,
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  receipt_url TEXT
);

-- Add comments
COMMENT ON TABLE public.transactions IS 'Stores all financial transactions (income and expenses) for societies';
COMMENT ON COLUMN public.transactions.type IS 'Type of transaction: income or expense';
COMMENT ON COLUMN public.transactions.amount IS 'Transaction amount (positive for income, negative for expenses)';
COMMENT ON COLUMN public.transactions.category IS 'Category of the transaction';
COMMENT ON COLUMN public.transactions.payment_method IS 'Payment method used';
COMMENT ON COLUMN public.transactions.reference IS 'Reference number or identifier';
COMMENT ON COLUMN public.transactions.transaction_date IS 'Date when the transaction occurred';
COMMENT ON COLUMN public.transactions.receipt_url IS 'URL to the receipt or supporting document';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_society_id ON public.transactions(society_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users in the same society"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (
    society_id IN (
      SELECT society_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Enable insert for society admins and committee members"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE 
        profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'society_admin', 'committee_member')
        AND profiles.society_id = society_id
    )
  );

CREATE POLICY "Enable update for society admins and committee members"
  ON public.transactions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE 
        profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'society_admin', 'committee_member')
        AND profiles.society_id = society_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE 
        profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'society_admin', 'committee_member')
        AND profiles.society_id = society_id
    )
  );

CREATE POLICY "Enable delete for society admins only"
  ON public.transactions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE 
        profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'society_admin')
        AND profiles.society_id = society_id
    )
  );

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column on update
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
