export type Role = 'CUSTOMER' | 'ADMIN';

export interface UserMetadata {
  name?: string;
  role?: Role;
}
