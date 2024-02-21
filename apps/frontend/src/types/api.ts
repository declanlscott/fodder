export type RestaurantsData = {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  slug: string;
  fod: {
    name: string;
    imageUrl: string;
    slug: string;
  };
}[];

export type RestaurantData = {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  flavors: {
    date: string;
    name: string;
    imageUrl: string;
    slug: string;
  }[];
};

export type FlavorsData = {
  name: string;
  imageUrl: string;
  slug: string;
}[];

export type FlavorData = {
  name: string;
  description: string;
  imageUrl: string;
  allergens: string[];
};
