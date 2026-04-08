export interface MLProduct {
  id: string;
  title: string;
  price: number;
  currency_id: string;
  available_quantity: number;
  sold_quantity: number;
  condition: string;
  thumbnail: string;
  permalink: string;
  seller: {
    id: number;
    nickname: string;
  };
  shipping: {
    free_shipping: boolean;
    store_pick_up: boolean;
  };
}

export interface MLSearchResult {
  query: string;
  paging: {
    total: number;
    offset: number;
    limit: number;
  };
  results: MLProduct[];
}

export interface MLCategory {
  id: string;
  name: string;
}

export interface MLProductAnalysis {
  keyword: string;
  totalListings: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  freeShippingPercent: number;
  newConditionPercent: number;
  topSellers: number;
  estimatedDemand: number;
  competitionScore: number;
  marginScore: number;
  demandScore: number;
  rawResults: MLProduct[];
}