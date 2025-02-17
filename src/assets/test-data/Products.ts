import { Product } from 'src/app/shared/models/Product.model';
import { TestDataShops } from './Shops';

export const TestDataProducts: Product[] = [
    {
        Id: '00000000-0000-0000-0000-000000000001',
        Shop: TestDataShops[0],
        Name: 'Test product',
        Stock: 25,
        Price: 1250,
        Visible: true
    },
    {
        Id: '00000000-0000-0000-0000-000000000002',
        Shop: TestDataShops[0],
        Name: 'Test product 2',
        Stock: 0,
        Price: 250,
        Visible: true
    }
];