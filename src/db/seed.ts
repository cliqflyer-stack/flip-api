import { db } from './index.js';
import {
  categories,
  merchants,
  storeLocations,
  flyers,
  flyerPages,
  products,
  hotspots,
  deals,
} from './schema.js';

export async function seed() {
  console.log('🌱 Starting database seed...');

  // 1. Categories
  console.log('Inserting categories...');
  await db
    .insert(categories)
    .values([
      { id: 'for_you', name: 'For you', icon: 'sparkles', displayOrder: 1 },
      { id: 'groceries', name: 'Groceries', icon: 'shopping-cart', displayOrder: 2 },
      { id: 'pharmacy', name: 'Pharmacy & Health', icon: 'heart', displayOrder: 3 },
      { id: 'home', name: 'Home & Hardware', icon: 'home', displayOrder: 4 },
      { id: 'beauty', name: 'Beauty', icon: 'smile', displayOrder: 5 },
      { id: 'latest', name: 'Latest Deals', icon: 'zap', displayOrder: 6 },
    ])
    .onConflictDoNothing();

  // 2. Merchants
  console.log('Inserting merchants...');
  await db
    .insert(merchants)
    .values([
      {
        id: 'merch_drug_mart',
        name: 'MY DRUG MART',
        slug: 'my-drug-mart',
        initial: 'M',
        logoBg: '#075E50',
        logoColor: '#D8F36A',
        categoryId: 'pharmacy',
        website: 'https://shoppersdrugmart.ca',
      },
      {
        id: 'merch_longos',
        name: "Longo's",
        slug: 'longos',
        initial: 'L',
        logoBg: '#CC0000',
        logoColor: '#FFFFFF',
        categoryId: 'groceries',
        website: 'https://longos.com',
      },
      {
        id: 'merch_hardware',
        name: 'Home Hardware',
        slug: 'home-hardware',
        initial: 'HH',
        logoBg: '#CC0000',
        logoColor: '#FFFFFF',
        categoryId: 'home',
        website: 'https://homehardware.ca',
      },
      {
        id: 'merch_nofrills',
        name: 'No Frills',
        slug: 'no-frills',
        initial: 'NF',
        logoBg: '#FFE000',
        logoColor: '#123D38',
        categoryId: 'groceries',
        website: 'https://nofrills.ca',
      },
      {
        id: 'merch_walmart',
        name: 'Walmart Canada',
        slug: 'walmart',
        initial: 'W',
        logoBg: '#0071DC',
        logoColor: '#FFC220',
        categoryId: 'groceries',
        website: 'https://walmart.ca',
      },
    ])
    .onConflictDoNothing();

  // 3. Store Locations
  console.log('Inserting store locations...');
  await db
    .insert(storeLocations)
    .values([
      {
        id: 'loc_dm_markham',
        merchantId: 'merch_drug_mart',
        name: 'MY DRUG MART Markham Town Sq',
        address: '179 Enterprise Blvd',
        city: 'Markham',
        province: 'ON',
        postalCode: 'L6G 0A2',
        latitude: 43.8561,
        longitude: -79.337,
        phone: '(905) 555-0101',
      },
      {
        id: 'loc_longos_markham',
        merchantId: 'merch_longos',
        name: "Longo's Markham",
        address: '3085 Hwy 7',
        city: 'Markham',
        province: 'ON',
        postalCode: 'L3R 0J8',
        latitude: 43.8542,
        longitude: -79.3512,
        phone: '(905) 555-0102',
      },
      {
        id: 'loc_nofrills_markham',
        merchantId: 'merch_nofrills',
        name: 'No Frills Markham Plaza',
        address: '5221 Hwy 7',
        city: 'Markham',
        province: 'ON',
        postalCode: 'L3P 1B8',
        latitude: 43.8711,
        longitude: -79.281,
        phone: '(905) 555-0103',
      },
    ])
    .onConflictDoNothing();

  // 4. Products
  console.log('Inserting products catalog...');
  await db
    .insert(products)
    .values([
      {
        id: 'prod_coca_cola',
        merchantId: 'merch_nofrills',
        name: 'Coca-Cola 12 Pack',
        brand: 'Coca-Cola',
        description: 'Classic Coca-Cola soft drink, 12-pack of 12 fl oz cans.',
        regularPrice: '8.99',
        offerPrice: '5.99',
        unit: '12 x 355mL',
        category: 'Beverages',
        imageUrl: '/uploads/products/coca-cola.jpg',
      },
      {
        id: 'prod_pepsi',
        merchantId: 'merch_nofrills',
        name: 'Pepsi Original',
        brand: 'Pepsi',
        description: 'Crisp, refreshing cola soda, 12-pack cans.',
        regularPrice: '7.99',
        offerPrice: '6.49',
        unit: '12 x 355mL',
        category: 'Beverages',
        imageUrl: '/uploads/flyers/pepsi.png',
      },
      {
        id: 'prod_lays',
        merchantId: 'merch_longos',
        name: "Lay's Classic Chips",
        brand: "Lay's",
        description: 'Classic salted potato chips, 8 oz bag.',
        regularPrice: '4.99',
        offerPrice: '2.99',
        unit: '235g',
        category: 'Snacks',
        imageUrl: '/uploads/products/lays.jpg',
      },
      {
        id: 'prod_oreo',
        merchantId: 'merch_longos',
        name: 'Oreo Chocolate Cookies',
        brand: 'Nabisco',
        description: 'Chocolate sandwich cookies with creamy filling, 14.3 oz.',
        regularPrice: '5.49',
        offerPrice: '3.49',
        unit: '303g',
        category: 'Snacks',
        imageUrl: '/uploads/products/oreo.jpg',
      },
      {
        id: 'prod_tide',
        merchantId: 'merch_drug_mart',
        name: 'Tide Liquid Detergent',
        brand: 'Tide',
        description: 'Original scent liquid laundry detergent, 64 loads.',
        regularPrice: '12.99',
        offerPrice: '9.99',
        unit: '2.95L',
        category: 'Household',
        imageUrl: '/uploads/products/tide.jpg',
      },
      {
        id: 'prod_red_bull',
        merchantId: 'merch_drug_mart',
        name: 'Red Bull Energy Drink',
        brand: 'Red Bull',
        description: 'Energy drink 4-pack of 250 ml cans.',
        regularPrice: '9.99',
        offerPrice: '7.99',
        unit: '4 x 250mL',
        category: 'Beverages',
        imageUrl: '/uploads/products/red-bull.jpg',
      },
      {
        id: 'prod_aveeno',
        merchantId: 'merch_drug_mart',
        name: 'Aveeno Daily Moisturizing Body Wash',
        brand: 'Aveeno',
        description: 'Nourishing body wash with soothing prebiotic oat, 354 mL.',
        regularPrice: '10.99',
        offerPrice: '8.79',
        unit: '354mL',
        category: 'Personal Care',
        imageUrl: '/uploads/products/colgate.jpg',
      },
      {
        id: 'prod_jamieson_d3',
        merchantId: 'merch_drug_mart',
        name: 'Jamieson Vitamin D3 1000 IU',
        brand: 'Jamieson',
        description: 'High potency vitamin D3 tablets, 240+40 bonus count.',
        regularPrice: '9.99',
        offerPrice: '6.99',
        unit: '280 tablets',
        category: 'Health & Vitamins',
        imageUrl: '/uploads/products/coca-cola.jpg',
      },
      {
        id: 'prod_vitalux',
        merchantId: 'merch_drug_mart',
        name: 'Vitalux Advanced Ocular Multivitamin',
        brand: 'Vitalux',
        description: 'Scientifically formulated with lutein and zeaxanthin.',
        regularPrice: '19.99',
        offerPrice: '14.99',
        unit: '60 caplets',
        category: 'Health & Vitamins',
        imageUrl: '/uploads/products/red-bull.jpg',
      },
      {
        id: 'prod_gravol',
        merchantId: 'merch_drug_mart',
        name: 'Gravol Ginger 500mg Lozenges',
        brand: 'Gravol',
        description: 'Certified organic ginger lozenges for nausea relief, 20 count.',
        regularPrice: '7.49',
        offerPrice: '5.49',
        unit: '20 count',
        category: 'Medicine',
        imageUrl: '/uploads/products/froot-loops.jpg',
      },
      {
        id: 'prod_doritos',
        merchantId: 'merch_longos',
        name: 'Doritos Nacho Cheese',
        brand: 'Doritos',
        description: 'Nacho cheese flavored tortilla chips, 15 oz bag.',
        regularPrice: '5.99',
        offerPrice: '3.99',
        unit: '280g',
        category: 'Snacks',
        imageUrl: '/uploads/products/doritos.jpg',
      },
    ])
    .onConflictDoNothing();

  // 5. Flyers
  console.log('Inserting flyers...');
  await db
    .insert(flyers)
    .values([
      {
        id: 'flyer_drug_mart',
        merchantId: 'merch_drug_mart',
        title: 'MY DRUG MART',
        subtitle: 'Sample flyer · Oct 13–19',
        badgeText: 'NEW',
        badgeVariant: 'lime',
        flyerImageUrl: '/uploads/flyers/full_drug_mart_flyer.png',
        aspectRatio: 1.414,
        status: 'published',
        pageCount: 1,
      },
      {
        id: 'flyer_longos',
        merchantId: 'merch_longos',
        title: "Longo's",
        subtitle: 'Reference preview · Oct 15–21',
        badgeText: 'MEMBER PRICING',
        badgeVariant: 'dark',
        flyerImageUrl: '/uploads/flyers/longos_flyer.png',
        aspectRatio: 1.5,
        status: 'published',
        pageCount: 1,
      },
      {
        id: 'flyer_hardware',
        merchantId: 'merch_hardware',
        title: 'Home Hardware',
        subtitle: 'Sample flyer · Oct 1–28',
        badgeText: 'NEW',
        badgeVariant: 'lime',
        flyerImageUrl: '/uploads/flyers/hardware_flyer.png',
        aspectRatio: 1.4,
        status: 'published',
        pageCount: 1,
      },
    ])
    .onConflictDoNothing();

  // 6. Flyer Pages
  console.log('Inserting flyer pages...');
  await db
    .insert(flyerPages)
    .values([
      {
        id: 'page_drug_mart_1',
        flyerId: 'flyer_drug_mart',
        pageNumber: 1,
        imageUrl: '/uploads/flyers/full_drug_mart_flyer.png',
        aspectRatio: 1.414,
        width: 1200,
        height: 1697,
      },
      {
        id: 'page_longos_1',
        flyerId: 'flyer_longos',
        pageNumber: 1,
        imageUrl: '/uploads/flyers/longos_flyer.png',
        aspectRatio: 1.5,
        width: 1200,
        height: 1800,
      },
    ])
    .onConflictDoNothing();

  // 7. Hotspots (Normalized coordinates 0..1 for interactive canvas)
  console.log('Inserting hotspots...');
  await db
    .insert(hotspots)
    .values([
      {
        id: 'hs_aveeno',
        flyerId: 'flyer_drug_mart',
        flyerPageId: 'page_drug_mart_1',
        productId: 'prod_aveeno',
        x: 0.05,
        y: 0.165,
        width: 0.21,
        height: 0.075,
      },
      {
        id: 'hs_jamieson',
        flyerId: 'flyer_drug_mart',
        flyerPageId: 'page_drug_mart_1',
        productId: 'prod_jamieson_d3',
        x: 0.28,
        y: 0.165,
        width: 0.21,
        height: 0.075,
      },
      {
        id: 'hs_vitalux',
        flyerId: 'flyer_drug_mart',
        flyerPageId: 'page_drug_mart_1',
        productId: 'prod_vitalux',
        x: 0.51,
        y: 0.165,
        width: 0.21,
        height: 0.075,
      },
      {
        id: 'hs_gravol',
        flyerId: 'flyer_drug_mart',
        flyerPageId: 'page_drug_mart_1',
        productId: 'prod_gravol',
        x: 0.74,
        y: 0.165,
        width: 0.21,
        height: 0.075,
      },
    ])
    .onConflictDoNothing();

  // 8. Deals
  console.log('Inserting deals...');
  await db
    .insert(deals)
    .values([
      {
        id: 'deal_pepsi',
        merchantId: 'merch_nofrills',
        productId: 'prod_pepsi',
        flyerId: 'flyer_drug_mart',
        title: 'Pepsi Original',
        details: '12 × 355 mL',
        priceText: '$6.49',
        discountPercent: 19,
        badgeText: 'POPULAR',
        imageUrl: '/uploads/flyers/pepsi.png',
        isFeatured: true,
      },
      {
        id: 'deal_coke',
        merchantId: 'merch_walmart',
        productId: 'prod_coca_cola',
        flyerId: 'flyer_longos',
        title: 'Coca-Cola Original',
        details: '12 × 355 mL',
        priceText: '$6.99',
        discountPercent: 22,
        badgeText: 'SAVER',
        imageUrl: '/uploads/flyers/coke.png',
        isFeatured: true,
      },
    ])
    .onConflictDoNothing();

  console.log('✅ Seed completed successfully!');
}

seed()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
