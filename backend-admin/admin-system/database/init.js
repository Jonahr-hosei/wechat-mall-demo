const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'mall.db');
const db = new sqlite3.Database(dbPath);

const initDatabase = () => {
  console.log('正在初始化数据库...');

  // 创建管理员表
  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('创建管理员表失败:', err);
      return;
    }
    console.log('管理员表创建成功');
  });

  // 创建用户表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openid TEXT UNIQUE NOT NULL,
      nickname TEXT,
      avatar_url TEXT,
      phone TEXT,
      points INTEGER DEFAULT 0,
      member_level TEXT DEFAULT '普通会员',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('创建用户表失败:', err);
      return;
    }
    console.log('用户表创建成功');
  });

  // 创建商品分类表
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('创建商品分类表失败:', err);
      return;
    }
    console.log('商品分类表创建成功');
    
    // 在分类表创建完成后插入默认分类
    insertDefaultCategories();
  });

  // 创建商品表
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      original_price DECIMAL(10,2),
      image TEXT,
      category_id INTEGER,
      stock INTEGER DEFAULT 0,
      sales INTEGER DEFAULT 0,
      points INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    )
  `, (err) => {
    if (err) {
      console.error('创建商品表失败:', err);
      return;
    }
    console.log('商品表创建成功');
  });

  // 创建订单表
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_method TEXT,
      payment_time DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `, (err) => {
    if (err) {
      console.error('创建订单表失败:', err);
      return;
    }
    console.log('订单表创建成功');
  });

  // 创建订单详情表
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      product_price DECIMAL(10,2) NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (id),
      FOREIGN KEY (product_id) REFERENCES products (id)
    )
  `, (err) => {
    if (err) {
      console.error('创建订单详情表失败:', err);
      return;
    }
    console.log('订单详情表创建成功');
  });

  // 创建积分记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS point_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      points INTEGER NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `, (err) => {
    if (err) {
      console.error('创建积分记录表失败:', err);
      return;
    }
    console.log('积分记录表创建成功');
  });

  // 创建停车记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS parking_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      plate_number TEXT NOT NULL,
      entry_time DATETIME NOT NULL,
      exit_time DATETIME,
      duration_minutes INTEGER,
      fee DECIMAL(10,2) DEFAULT 0,
      status TEXT DEFAULT 'parking',
      payment_time DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `, (err) => {
    if (err) {
      console.error('创建停车记录表失败:', err);
      return;
    }
    console.log('停车记录表创建成功');
  });

  // 创建优惠券表
  db.run(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      value DECIMAL(10,2) NOT NULL,
      min_amount DECIMAL(10,2) DEFAULT 0,
      start_date DATE,
      end_date DATE,
      total_count INTEGER DEFAULT -1,
      used_count INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('创建优惠券表失败:', err);
      return;
    }
    console.log('优惠券表创建成功');
  });

  // 创建用户优惠券表
  db.run(`
    CREATE TABLE IF NOT EXISTS user_coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      coupon_id INTEGER NOT NULL,
      status TEXT DEFAULT 'unused',
      used_time DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (coupon_id) REFERENCES coupons (id)
    )
  `, (err) => {
    if (err) {
      console.error('创建用户优惠券表失败:', err);
      return;
    }
    console.log('用户优惠券表创建成功');
  });

  // 插入默认管理员
  insertDefaultAdmin();
};

const insertDefaultAdmin = () => {
  const defaultPassword = bcrypt.hashSync('admin123', 10);
  db.run(`
    INSERT OR IGNORE INTO admins (username, password, name, role)
    VALUES ('admin', ?, '系统管理员', 'super_admin')
  `, [defaultPassword], (err) => {
    if (err) {
      console.error('插入默认管理员失败:', err);
      return;
    }
    console.log('默认管理员创建成功');
  });
};

const insertDefaultCategories = () => {
  // 插入默认商品分类
  const categories = [
    { name: '服装鞋帽', description: '时尚服装、鞋帽配饰' },
    { name: '数码电器', description: '手机、电脑、家电' },
    { name: '食品饮料', description: '零食、饮料、生鲜' },
    { name: '家居用品', description: '家具、装饰、日用品' }
  ];

  let completed = 0;
  categories.forEach(category => {
    db.run(`
      INSERT OR IGNORE INTO categories (name, description)
      VALUES (?, ?)
    `, [category.name, category.description], (err) => {
      if (err) {
        console.error('插入分类失败:', err);
        return;
      }
      completed++;
      if (completed === categories.length) {
        console.log('默认分类创建完成');
        // 在分类创建完成后插入示例商品
        insertDefaultProducts();
      }
    });
  });
};

const insertDefaultProducts = () => {
  // 插入示例商品
  const products = [
    {
      name: '时尚女装连衣裙',
      description: '春季新款连衣裙，舒适面料，时尚设计',
      price: 299.00,
      original_price: 399.00,
      category_id: 1,
      stock: 100,
      points: 30
    },
    {
      name: '男士休闲运动鞋',
      description: '舒适透气，适合运动休闲',
      price: 399.00,
      original_price: 499.00,
      category_id: 1,
      stock: 50,
      points: 40
    },
    {
      name: '智能手机',
      description: '高性能智能手机，拍照清晰',
      price: 2999.00,
      original_price: 3499.00,
      category_id: 2,
      stock: 20,
      points: 300
    },
    {
      name: '零食大礼包',
      description: '多种零食组合，美味可口',
      price: 99.00,
      original_price: 129.00,
      category_id: 3,
      stock: 200,
      points: 10
    }
  ];

  let completed = 0;
  products.forEach(product => {
    db.run(`
      INSERT OR IGNORE INTO products (name, description, price, original_price, category_id, stock, points)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [product.name, product.description, product.price, product.original_price, product.category_id, product.stock, product.points], (err) => {
      if (err) {
        console.error('插入商品失败:', err);
        return;
      }
      completed++;
      if (completed === products.length) {
        console.log('示例商品创建完成');
        console.log('数据库初始化完成！');
        console.log('默认管理员账号: admin');
        console.log('默认管理员密码: admin123');
      }
    });
  });
};

module.exports = initDatabase; 