export type LocatedRestaurant = {
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
};

export type SluggedRestaurant = {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  flavors: Array<{
    date: string;
    name: string;
    imageUrl: string;
    slug: string;
  }>;
};
