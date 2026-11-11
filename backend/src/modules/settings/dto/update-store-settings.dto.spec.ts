import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateStoreSettingsDto } from './update-store-settings.dto';

async function errorsFor(payload: Record<string, unknown>) {
  const dto = plainToInstance(UpdateStoreSettingsDto, payload);
  const errors = await validate(dto, { whitelist: true });
  return errors.map((e) => e.property);
}

describe('UpdateStoreSettingsDto image lists', () => {
  it('accepts site paths and https URLs', async () => {
    expect(
      await errorsFor({
        heroBanners: ['/parner.jpg', 'https://cdn.example.com/a.jpg'],
        storeImages: ['/store/1.jpg'],
        promoBanners: [],
      }),
    ).toEqual([]);
  });

  it.each([
    ['relative path', 'abc.jpg'],
    ['protocol-relative URL', '//evil.example.com/a.jpg'],
    ['plain http', 'http://example.com/a.jpg'],
    ['javascript URL', 'javascript:alert(1)'],
    ['path with spaces', '/a b.jpg'],
  ])('rejects %s', async (_label, src) => {
    expect(await errorsFor({ promoBanners: [src] })).toEqual(['promoBanners']);
    expect(await errorsFor({ heroBanners: [src] })).toEqual(['heroBanners']);
    expect(await errorsFor({ storeImages: [src] })).toEqual(['storeImages']);
  });

  it('enforces list sizes', async () => {
    expect(await errorsFor({ heroBanners: [] })).toEqual(['heroBanners']);
    expect(await errorsFor({ storeImages: [] })).toEqual(['storeImages']);
    expect(
      await errorsFor({
        promoBanners: Array.from({ length: 11 }, () => '/a.jpg'),
      }),
    ).toEqual(['promoBanners']);
  });

  it('rejects a non-object metadata', async () => {
    expect(await errorsFor({ metadata: 'oops' })).toEqual(['metadata']);
    expect(await errorsFor({ metadata: ['a'] })).toEqual(['metadata']);
  });
});
