export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  payment_method: string;
  reference: string | null;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
  // Additional fields from useFinances
  status?: string;
  paymentMethod?: string;
  date?: string | number | Date;
  transaction_date?: string;
  updated_at?: string;
  society_id?: string;
  created_by?: string;
  approved_by?: string | null;
  receipt_url?: string | null;
}
