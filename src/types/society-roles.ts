export interface SocietyRole {
  id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  permissions: any;
  society_id: string;
  created_at: string;
  updated_at: string;
}

export type CreateSocietyRole = Omit<SocietyRole, 'id' | 'created_at' | 'updated_at'>;
export type UpdateSocietyRole = Partial<CreateSocietyRole>;
