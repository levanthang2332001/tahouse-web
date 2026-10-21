/** Mirrors the backend `/settings` and `/admin/settings` contract (see /api/docs). */

export interface StorePhoneNumber {
  id?: string;
  number: string;
  label: string;
  isHotline?: boolean;
}

export interface StoreEmail {
  id?: string;
  email: string;
  label: string;
  isPrimary?: boolean;
}

export interface StoreAddress {
  id?: string;
  branchName: string;
  address: string;
  mapUrl?: string;
  isMain?: boolean;
}

export interface StoreOpeningHours {
  text: string;
  weekdays?: string;
  weekend?: string;
  note?: string;
}

export interface StoreSocialLinks {
  zalo?: string;
  facebook?: string;
  youtube?: string;
  instagram?: string;
  tiktok?: string;
}

/** Fields an admin can edit (body of PUT /admin/settings) */
export interface StoreSettingsInput {
  storeName: string;
  slogan: string;
  socialLinks: StoreSocialLinks;
  phoneNumbers: StorePhoneNumber[];
  emails: StoreEmail[];
  addresses: StoreAddress[];
  openingHours: StoreOpeningHours;
}

export interface StoreSettings extends StoreSettingsInput {
  id: string;
  primaryPhone: string;
  primaryEmail: string;
  mainAddress: string;
  updatedAt: string;
}
