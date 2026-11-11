import { MediaType } from '../schemas/media.schema';

export interface SniffedFileType {
  mime: string;
  ext: string;
  kind: MediaType.IMAGE | MediaType.VIDEO;
}

/** Thông báo liệt kê các định dạng được phép (dùng chung cho mọi lỗi định dạng) */
export const ALLOWED_TYPES_LABEL =
  'ảnh JPG, PNG, WebP, GIF, AVIF và video MP4, WebM, MOV';

const image = (mime: string, ext: string): SniffedFileType => ({
  mime,
  ext,
  kind: MediaType.IMAGE,
});
const video = (mime: string, ext: string): SniffedFileType => ({
  mime,
  ext,
  kind: MediaType.VIDEO,
});

const MP4_BRANDS = new Set([
  'isom',
  'iso2',
  'iso3',
  'iso4',
  'iso5',
  'iso6',
  'mp41',
  'mp42',
  'avc1',
  'dash',
  'M4V ',
  'M4VH',
  'M4VP',
  'mmp4',
  'MSNV',
  'NDAS',
  'f4v ',
]);
const AVIF_BRANDS = new Set(['avif', 'avis']);
/** Atom đầu tiên thường gặp của tệp QuickTime cũ không có hộp ftyp */
const QUICKTIME_LEADING_ATOMS = new Set([
  'moov',
  'mdat',
  'wide',
  'free',
  'pnot',
]);

const ascii = (buf: Buffer, start: number, end: number): string =>
  buf.length >= end ? buf.toString('latin1', start, end) : '';

const startsWith = (buf: Buffer, bytes: number[]): boolean =>
  buf.length >= bytes.length && bytes.every((b, i) => buf[i] === b);

function sniffIsoBmff(buf: Buffer): SniffedFileType | null {
  if (ascii(buf, 4, 8) !== 'ftyp') {
    if (QUICKTIME_LEADING_ATOMS.has(ascii(buf, 4, 8))) {
      return video('video/quicktime', '.mov');
    }
    return null;
  }

  const boxSize = buf.readUInt32BE(0);
  const major = ascii(buf, 8, 12);
  const end = Math.min(buf.length, boxSize >= 16 ? boxSize : 16, 256);
  const compatible: string[] = [];
  for (let offset = 16; offset + 4 <= end; offset += 4) {
    compatible.push(ascii(buf, offset, offset + 4));
  }

  if (AVIF_BRANDS.has(major)) return image('image/avif', '.avif');
  if (
    (major === 'mif1' || major === 'msf1') &&
    compatible.some((b) => AVIF_BRANDS.has(b))
  ) {
    return image('image/avif', '.avif');
  }
  if (major === 'qt  ') return video('video/quicktime', '.mov');
  if (MP4_BRANDS.has(major)) return video('video/mp4', '.mp4');
  return null;
}

/**
 * Nhận diện định dạng thật của tệp từ magic bytes (không tin Content-Type / đuôi tệp do client gửi).
 * Chỉ trả về kết quả với các định dạng được phép; SVG, HEIC, MKV, PDF... đều trả null.
 */
export function sniffFileType(buf: Buffer): SniffedFileType | null {
  if (!buf || buf.length < 12) return null;

  if (startsWith(buf, [0xff, 0xd8, 0xff])) return image('image/jpeg', '.jpg');
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return image('image/png', '.png');
  }
  const head6 = ascii(buf, 0, 6);
  if (head6 === 'GIF87a' || head6 === 'GIF89a') {
    return image('image/gif', '.gif');
  }
  if (ascii(buf, 0, 4) === 'RIFF' && ascii(buf, 8, 12) === 'WEBP') {
    return image('image/webp', '.webp');
  }
  if (startsWith(buf, [0x1a, 0x45, 0xdf, 0xa3])) {
    // EBML: WebM và Matroska dùng chung chữ ký, phân biệt qua DocType
    const header = buf.toString('latin1', 0, Math.min(buf.length, 64));
    return header.includes('webm') ? video('video/webm', '.webm') : null;
  }

  return sniffIsoBmff(buf);
}
