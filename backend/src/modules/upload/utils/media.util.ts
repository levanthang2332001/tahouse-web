import * as path from 'path';
import { MediaType } from '../schemas/media.schema';

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\-_/ ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function determineFileType(
  mimeType: string,
  filename: string,
): MediaType {
  const mime = (mimeType || '').toLowerCase();
  const ext = path.extname(filename || '').toLowerCase();

  if (mime.startsWith('image/')) return MediaType.IMAGE;
  if (mime.startsWith('video/')) return MediaType.VIDEO;
  if (mime.startsWith('audio/')) return MediaType.AUDIO;

  const docExtensions = [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.txt',
    '.zip',
    '.rar',
    '.7z',
    '.csv',
  ];
  if (
    docExtensions.includes(ext) ||
    mime.includes('pdf') ||
    mime.includes('document') ||
    mime.includes('sheet') ||
    mime.includes('zip')
  ) {
    return MediaType.DOCUMENT;
  }

  return MediaType.OTHER;
}
