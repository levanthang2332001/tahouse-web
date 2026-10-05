import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import {
  Product,
  ProductDocument,
} from '@/modules/products/schemas/product.schema';
import { Brand, BrandDocument } from '@/modules/brands/schemas/brand.schema';
import { IAdminDashboardStatsResponse } from './types/stats.types';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Brand.name)
    private readonly brandModel: Model<BrandDocument>,
  ) {}

  async getDashboardStats(): Promise<IAdminDashboardStatsResponse> {
    // Pipeline thống kê cấu trúc phân cấp (Brand -> Category -> Subcategory)
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'products',
          let: { bId: '$id', bName: '$name', bSlug: '$slug' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$brandId', '$$bId'] },
                    {
                      $eq: [
                        { $toLower: { $ifNull: ['$brand', ''] } },
                        { $toLower: '$$bName' },
                      ],
                    },
                    {
                      $eq: [
                        { $toLower: { $ifNull: ['$brand', ''] } },
                        { $toLower: '$$bSlug' },
                      ],
                    },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                category: { $toLower: { $ifNull: ['$category', ''] } },
                subcategory: { $toLower: { $ifNull: ['$subcategory', ''] } },
                isDiscounted: {
                  $cond: [
                    {
                      $or: [
                        { $gt: ['$discountPercent', 0] },
                        {
                          $and: [
                            { $ne: ['$originalPrice', null] },
                            { $ne: ['$price', null] },
                            { $gt: ['$originalPrice', '$price'] },
                          ],
                        },
                        {
                          $gt: [
                            {
                              $size: {
                                $filter: {
                                  input: { $ifNull: ['$variants', []] },
                                  as: 'v',
                                  cond: {
                                    $or: [
                                      { $gt: ['$$v.discountPercent', 0] },
                                      {
                                        $and: [
                                          { $ne: ['$$v.originalPrice', null] },
                                          { $ne: ['$$v.price', null] },
                                          {
                                            $gt: [
                                              '$$v.originalPrice',
                                              '$$v.price',
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                },
                              },
                            },
                            0,
                          ],
                        },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          ],
          as: 'products',
        },
      },
      {
        $match: {
          $expr: { $gt: [{ $size: '$products' }, 0] },
        },
      },
      {
        $project: {
          _id: 0,
          id: 1,
          name: 1,
          slug: 1,
          logo: { $ifNull: ['$logo', ''] },
          totalProducts: { $size: '$products' },
          discountedProducts: {
            $sum: '$products.isDiscounted',
          },
          categories: {
            $map: {
              input: { $ifNull: ['$categories', []] },
              as: 'cat',
              in: {
                slug: '$$cat.slug',
                name: '$$cat.name',
                totalProducts: {
                  $size: {
                    $filter: {
                      input: '$products',
                      as: 'p',
                      cond: {
                        $eq: [
                          '$$p.category',
                          { $toLower: { $ifNull: ['$$cat.slug', ''] } },
                        ],
                      },
                    },
                  },
                },
                subcategories: {
                  $map: {
                    input: { $ifNull: ['$$cat.subcategories', []] },
                    as: 'sub',
                    in: {
                      slug: '$$sub.slug',
                      name: '$$sub.name',
                      totalProducts: {
                        $size: {
                          $filter: {
                            input: '$products',
                            as: 'p',
                            cond: {
                              $and: [
                                {
                                  $eq: [
                                    '$$p.category',
                                    {
                                      $toLower: {
                                        $ifNull: ['$$cat.slug', ''],
                                      },
                                    },
                                  ],
                                },
                                {
                                  $eq: [
                                    '$$p.subcategory',
                                    {
                                      $toLower: {
                                        $ifNull: ['$$sub.slug', ''],
                                      },
                                    },
                                  ],
                                },
                              ],
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: '$totalProducts' },
          totalBrands: { $sum: 1 },
          discountedProducts: { $sum: '$discountedProducts' },
          brandsList: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 0,
          totalProducts: 1,
          totalBrands: 1,
          discountedProducts: 1,
          totalCategories: {
            $sum: {
              $map: {
                input: '$brandsList',
                as: 'b',
                in: { $size: '$$b.categories' },
              },
            },
          },
          totalSubcategories: {
            $sum: {
              $map: {
                input: '$brandsList',
                as: 'b',
                in: {
                  $sum: {
                    $map: {
                      input: '$$b.categories',
                      as: 'c',
                      in: { $size: '$$c.subcategories' },
                    },
                  },
                },
              },
            },
          },
          brandsList: 1,
        },
      },
      {
        $project: {
          _id: 0,
          summary: {
            totalProducts: '$totalProducts',
            totalBrands: '$totalBrands',
            totalCategories: '$totalCategories',
            totalSubcategories: '$totalSubcategories',
            discountedProducts: '$discountedProducts',
          },
          brands: {
            $map: {
              input: '$brandsList',
              as: 'b',
              in: {
                id: '$$b.id',
                name: '$$b.name',
                slug: '$$b.slug',
                logo: '$$b.logo',
                totalProducts: '$$b.totalProducts',
                percentage: {
                  $cond: [
                    { $gt: ['$totalProducts', 0] },
                    {
                      $round: [
                        {
                          $multiply: [
                            {
                              $divide: ['$$b.totalProducts', '$totalProducts'],
                            },
                            100,
                          ],
                        },
                        2,
                      ],
                    },
                    0,
                  ],
                },
                categories: {
                  $map: {
                    input: '$$b.categories',
                    as: 'cat',
                    in: {
                      slug: '$$cat.slug',
                      name: '$$cat.name',
                      totalProducts: '$$cat.totalProducts',
                      percentage: {
                        $cond: [
                          { $gt: ['$$b.totalProducts', 0] },
                          {
                            $round: [
                              {
                                $multiply: [
                                  {
                                    $divide: [
                                      '$$cat.totalProducts',
                                      '$$b.totalProducts',
                                    ],
                                  },
                                  100,
                                ],
                              },
                              2,
                            ],
                          },
                          0,
                        ],
                      },
                      subcategories: {
                        $map: {
                          input: '$$cat.subcategories',
                          as: 'sub',
                          in: {
                            slug: '$$sub.slug',
                            name: '$$sub.name',
                            totalProducts: '$$sub.totalProducts',
                            percentage: {
                              $cond: [
                                { $gt: ['$$cat.totalProducts', 0] },
                                {
                                  $round: [
                                    {
                                      $multiply: [
                                        {
                                          $divide: [
                                            '$$sub.totalProducts',
                                            '$$cat.totalProducts',
                                          ],
                                        },
                                        100,
                                      ],
                                    },
                                    2,
                                  ],
                                },
                                0,
                              ],
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          summary: 1,
          brands: {
            $sortArray: { input: '$brands', sortBy: { totalProducts: -1 } },
          },
        },
      },
    ];

    const [result] =
      await this.brandModel.aggregate<IAdminDashboardStatsResponse>(pipeline);

    return (
      result || {
        summary: {
          totalProducts: 0,
          totalBrands: 0,
          totalCategories: 0,
          totalSubcategories: 0,
          discountedProducts: 0,
        },
        brands: [],
      }
    );
  }
}
