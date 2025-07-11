import Dexie from 'dexie';

const db = new Dexie('StockManagementDB');
db.version(1).stores({
  products: '++id, name, price, stock, image, category',
  productSettings: '++id, productId, threshold'
});



export default db;
