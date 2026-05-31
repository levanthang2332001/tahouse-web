import { Injectable } from '@nestjs/common';
import { JsonDbService } from '../database/json-db.service';
import type { IBrand } from './types/brand.types';

@Injectable()
export class BrandsService {
  private getBrands: () => IBrand[];

  constructor(private readonly jsonDb: JsonDbService) {
    this.getBrands = this.jsonDb.register('brands.json', []);
  }

  findAll(): IBrand[] {
    return this.getBrands();
  }
}
