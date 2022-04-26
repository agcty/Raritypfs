type Attribute = {
  trait_type: string;
  value: string;
};

type NFT = {
  id: string;
  name: string;
  image: string;
  description: string;
  attributes: Attribute[];
};
