export const products = [
  {
    id: 'disneyland',
    name: 'Disneyland Paris',
    category: 'Theme Park',
    price: 146,
    imageUrl: 'https://images.unsplash.com/photo-1598921867885-b072c4e207e9',
    description: 'TICKETS - Disneyland Paris. Enjoy a magical day at the happiest place on earth.',
    stock: 15,
    type: 'digital' as const
  },
  {
    id: 'titlis',
    name: 'Mount Titlis Switzerland',
    category: 'Mountain',
    price: 68,
    imageUrl: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3',
    description: 'TICKETS - Mount Titlis Switzerland. Experience breathtaking views from the rotary cable car.',
    stock: 8,
    type: 'digital' as const
  },
  {
    id: 'cologne1',
    name: 'One Day Trip : Cologne',
    category: 'City Tour',
    price: 68,
    imageUrl: 'https://images.unsplash.com/photo-1545084992-0736bfb1d830',
    description: 'March 14 : One Day Trip : Cologne. Visit the famous cathedral and old town.',
    stock: 20,
    type: 'digital' as const
  },
  {
    id: 'keukenhof5',
    name: 'One Day in Keukenhof Gardens',
    category: 'Nature',
    price: 168,
    imageUrl: 'https://images.unsplash.com/photo-1520697223030-cf8d262fc745',
    description: 'March 21-10 May : Every Saturday & selected Sundays. See the beautiful tulips in bloom.',
    stock: 5,
    type: 'digital' as const
  },
  {
    id: 'giethoorn',
    name: 'MEGA One Day Trip : Giethoorn',
    category: 'Village Tour',
    price: 279,
    imageUrl: 'https://images.unsplash.com/photo-1627494573133-c7e63b6ca14f',
    description: 'March 14 : MEGA One Day Trip : Giethoorn. Explore the Venice of the North.',
    stock: 2,
    type: 'digital' as const
  },
  {
    id: 'etretat',
    name: 'NORMANDY SPECIAL : Étretat & Mont Saint-Michel',
    category: 'Coastal Tour',
    price: 265,
    imageUrl: 'https://images.unsplash.com/photo-1517409224855-32bdc22f03f5',
    description: 'March 21-22 : NORMANDY SPECIAL. Visit iconic cliffs and the famous abbey island.',
    stock: 10,
    type: 'digital' as const
  },
  {
    id: 'monaco-nice-cannes',
    name: 'FRENCH RIVIERA TRIP : Cannes-Nice-Monaco',
    category: 'Coastal Tour',
    price: 124,
    imageUrl: 'https://images.unsplash.com/photo-1581403606670-69bfbbfc0867',
    description: 'Long Weekend Special – April 03-07. Experience the luxury of the Côte dAzur.',
    stock: 0, // Out of stock example
    type: 'digital' as const
  },
  {
    id: 'dolomites',
    name: 'Dolomites Dreamscape',
    category: 'Mountain',
    price: 185,
    imageUrl: 'https://images.unsplash.com/photo-1622322301138-c6f37f90f6e5',
    description: 'ONLY TWICE A YEAR – April 03-07. Explore the stunning Italian Alps.',
    stock: 12,
    type: 'digital' as const
  },
  {
    id: 'keukenhof',
    name: 'FLOWER PARADE DAY SPECIAL MEGA TRIP : Keukenhof',
    category: 'Event Tour',
    price: 128,
    imageUrl: 'https://images.unsplash.com/photo-1520697223030-cf8d262fc745',
    description: 'April 18 : flower parade day special.',
    stock: 25,
    type: 'digital' as const
  },
  {
    id: 'italy-vatican',
    name: 'Greet the Pope Special : Rome, Vatican & Pisa',
    category: 'City Tour',
    price: 111,
    imageUrl: 'https://images.unsplash.com/photo-1529154036614-a60975f5c760',
    description: 'April 03-07 : Rome, Vatican City & Pisa.',
    stock: 30,
    type: 'digital' as const
  },
  {
    id: 'tshirt',
    name: 'See-EU Souvenir T-Shirt',
    category: 'Merchandise',
    price: 25,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
    description: 'High quality cotton T-Shirt to remember your trip.',
    stock: 100,
    type: 'physical' as const
  }
];
