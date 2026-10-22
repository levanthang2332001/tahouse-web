import { COMPANY_LEGAL } from "@/data/company-legal";
import type { StorePhoneNumber, StoreSettings } from "@/lib/types/store-settings";

/** Public contact details rendered across the storefront (header, footer, product pages, floating buttons). */
export interface StoreInfo {
  tradeName: string;
  phone: string;
  phoneTel: string;
  phoneSecondary: string;
  phoneSecondaryTel: string;
  phonesDisplay: string;
  zaloUrl: string;
  facebookUrl: string;
  email: string;
  address: string;
  showroomName: string;
  mapUrl: string;
  workingHours: string;
}

/** Hardcoded values used until the settings API answers, and for any field it leaves empty. */
export const FALLBACK_STORE_INFO: StoreInfo = {
  tradeName: COMPANY_LEGAL.tradeName,
  phone: COMPANY_LEGAL.phone,
  phoneTel: COMPANY_LEGAL.phoneTel,
  phoneSecondary: COMPANY_LEGAL.phoneSecondary,
  phoneSecondaryTel: COMPANY_LEGAL.phoneSecondaryTel,
  phonesDisplay: COMPANY_LEGAL.phonesDisplay,
  zaloUrl: COMPANY_LEGAL.zaloUrl,
  facebookUrl: COMPANY_LEGAL.facebookUrl,
  email: COMPANY_LEGAL.email,
  address: COMPANY_LEGAL.address,
  showroomName: COMPANY_LEGAL.showroomName,
  mapUrl: COMPANY_LEGAL.mapsUrl,
  workingHours: COMPANY_LEGAL.workingHours,
};

/** Dialable form for `tel:` links: digits, keeping a leading "+" */
export const toTel = (phone: string) => phone.trim().replace(/(?!^\+)\D/g, "");

/**
 * The storefront shows two numbers: the hotline (or the first entry) and the first other entry.
 * Shared with the admin settings form so admins edit exactly the numbers the site displays.
 */
export function pickSitePhoneIndexes(phones: Pick<StorePhoneNumber, "number" | "isHotline">[]): number[] {
  const usable = phones.flatMap((p, i) => (p.number?.trim() ? [i] : []));
  if (usable.length === 0) return [];
  const primary = usable.find((i) => phones[i].isHotline) ?? usable[0];
  const secondary = usable.find((i) => i !== primary);
  return secondary === undefined ? [primary] : [primary, secondary];
}

const pick = (value: string | undefined | null, fallback: string) => value?.trim() || fallback;

/** Maps the public settings payload onto StoreInfo, field by field, falling back to the hardcoded values. */
export function toStoreInfo(settings: StoreSettings | null | undefined): StoreInfo {
  if (!settings) return FALLBACK_STORE_INFO;
  const f = FALLBACK_STORE_INFO;

  const phones = settings.phoneNumbers ?? [];
  const [primaryIdx, secondaryIdx] = pickSitePhoneIndexes(phones);
  const phone = pick(primaryIdx === undefined ? undefined : phones[primaryIdx].number, f.phone);
  const phoneSecondary = pick(secondaryIdx === undefined ? undefined : phones[secondaryIdx].number, f.phoneSecondary);

  const emails = settings.emails ?? [];
  const email = emails.find((e) => e.isPrimary && e.email?.trim()) ?? emails.find((e) => e.email?.trim());

  const addresses = settings.addresses ?? [];
  const main = addresses.find((a) => a.isMain && a.address?.trim()) ?? addresses.find((a) => a.address?.trim());

  return {
    tradeName: pick(settings.storeName, f.tradeName),
    phone,
    phoneTel: toTel(phone),
    phoneSecondary,
    phoneSecondaryTel: toTel(phoneSecondary),
    phonesDisplay: phoneSecondary && phoneSecondary !== phone ? `${phone} – ${phoneSecondary}` : phone,
    zaloUrl: pick(settings.socialLinks?.zalo, f.zaloUrl),
    facebookUrl: pick(settings.socialLinks?.facebook, f.facebookUrl),
    email: pick(email?.email, f.email),
    address: pick(main?.address, f.address),
    showroomName: pick(main?.branchName, f.showroomName),
    mapUrl: pick(main?.mapUrl, f.mapUrl),
    workingHours: pick(settings.openingHours?.text, f.workingHours),
  };
}
