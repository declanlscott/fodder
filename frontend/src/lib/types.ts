export type NavLinkItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
};

export type Restaurant = {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  fod: string;
  fodImageUrl: string;
  slug: string;
};
