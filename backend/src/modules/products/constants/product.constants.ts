export const PRODUCT_DEFAULTS = {
  INSTALLATION: {
    images: [],
    videos: [],
  },
  INSTALLATION_PREVIEW_LIMIT: 3,
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MIN_VALUE: 1,
  },
  SEARCH: {
    TRIM_REGEX: /\s+/g,
    SPLIT_REGEX: /\s+/,
  },
};

export const PRODUCT_FIELDS = {
  EXCLUDED_IN_RESPONSE: ['page_number', 'category_id', 'installation'],
  INCLUDED_IN_LIST: [
    'id',
    'code',
    'name',
    'price',
    'formatted_price',
    'brand',
    'category',
    'images',
    'has_variants',
  ],
};

export const PRODUCT_SORT_ORDER = {
  ASCENDING: -1,
  DESCENDING: 1,
} as const;
