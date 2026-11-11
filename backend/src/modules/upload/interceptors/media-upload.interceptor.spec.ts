import { HttpException } from '@nestjs/common';
import { Readable } from 'stream';
import { of, lastValueFrom } from 'rxjs';
import { MediaUploadInterceptor } from './media-upload.interceptor';
import {
  MAX_FILES_PER_REQUEST,
  MAX_TOTAL_UPLOAD_BYTES,
} from '../upload.constants';

const BOUNDARY = '----tahouse-test-boundary';

function multipartBody(fileCount: number, fileBytes = 16): Buffer {
  const parts: Buffer[] = [];
  for (let i = 0; i < fileCount; i++) {
    parts.push(
      Buffer.from(
        `--${BOUNDARY}\r\nContent-Disposition: form-data; name="files"; filename="f${i}.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`,
      ),
      Buffer.alloc(fileBytes, 1),
      Buffer.from('\r\n'),
    );
  }
  parts.push(
    Buffer.from(
      `--${BOUNDARY}\r\nContent-Disposition: form-data; name="folder"\r\n\r\nbanners\r\n--${BOUNDARY}--\r\n`,
    ),
  );
  return Buffer.concat(parts);
}

function makeRequest(body: Buffer, contentLength = body.length) {
  const req = Readable.from([body]) as any;
  req.headers = {
    'content-type': `multipart/form-data; boundary=${BOUNDARY}`,
    'content-length': String(contentLength),
  };
  return req;
}

function makeContext(req: any) {
  return {
    switchToHttp: () => ({ getRequest: () => req, getResponse: () => ({}) }),
  } as any;
}

const handler = { handle: () => of('ok') };

async function statusOf(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (e) {
    if (e instanceof HttpException) return e.getStatus();
    throw e;
  }
  throw new Error('Expected rejection');
}

describe('MediaUploadInterceptor (bug 11)', () => {
  const interceptor = new MediaUploadInterceptor();

  it('parses files and fields within the limits', async () => {
    const req = makeRequest(multipartBody(2));
    const result$ = await interceptor.intercept(makeContext(req), handler);
    expect(await lastValueFrom(result$)).toBe('ok');
    expect(req.files).toHaveLength(2);
    expect(req.body.folder).toBe('banners');
  });

  it('rejects a request whose Content-Length exceeds the total cap with 413 before reading it', async () => {
    const req = makeRequest(Buffer.alloc(0), MAX_TOTAL_UPLOAD_BYTES + 1);
    const promise = interceptor.intercept(makeContext(req), handler);
    expect(await statusOf(promise)).toBe(413);
    await expect(
      interceptor.intercept(makeContext(req), handler),
    ).rejects.toThrow(/Tổng dung lượng tải lên vượt quá 60MB/);
  });

  it(`rejects more than ${MAX_FILES_PER_REQUEST} files with a Vietnamese 400`, async () => {
    const req = makeRequest(multipartBody(MAX_FILES_PER_REQUEST + 1));
    const promise = interceptor.intercept(makeContext(req), handler);
    expect(await statusOf(promise)).toBe(400);
    await expect(
      interceptor.intercept(
        makeContext(makeRequest(multipartBody(MAX_FILES_PER_REQUEST + 1))),
        handler,
      ),
    ).rejects.toThrow(`tối đa ${MAX_FILES_PER_REQUEST} tệp`);
  });
});
