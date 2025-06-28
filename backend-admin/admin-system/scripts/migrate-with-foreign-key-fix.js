const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const dbPath = path.join(__dirname, '../database/mall.db');
const db = new sqlite3.Database(dbPath);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function migrateData() {
  console.log('开始迁移数据到 Supabase（修复外键约束）...');

  try {
    // 按依赖关系顺序迁移
    await migrateAdmins();
    await migrateUsers();
    await migrateCategories();
    await migrateProducts();
    await migrateOrders();
    await migrateOrderItems();
    await migratePointRecords();
    await migrateParkingRecords();
    await migrateCoupons();
    await migrateUserCoupons();
    
    console.log('数据迁移完成！');
  } catch (error) {
    console.error('迁移失败:', error);
  } finally {
    db.close();
  }
}

async function migrateAdmins() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM admins', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      for (const row of rows) {
        try {
          const { error } = await supabase
            .from('admins')
            .insert({
              username: row.username,
              password: row.password,
              name: row.name,
              role: row.role,
              created_at: row.created_at,
              updated_at: row.updated_at
            });
          
          if (error) {
            console.error('插入管理员数据失败:', error);
          }
        } catch (error) {
          console.error('处理管理员数据失败:', error);
        }
      }
      
      console.log(`迁移了 ${rows.length} 条管理员数据`);
      resolve();
    });
  });
}

async function migrateUsers() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM users', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      for (const row of rows) {
        try {
          const { error } = await supabase
            .from('users')
            .insert({
              openid: row.openid,
              nickname: row.nickname,
              avatar_url: row.avatar_url,
              phone: row.phone,
              points: row.points,
              member_level: row.member_level,
              created_at: row.created_at,
              updated_at: row.updated_at
            });
          
          if (error) {
            console.error('插入用户数据失败:', error);
          }
        } catch (error) {
          console.error('处理用户数据失败:', error);
        }
      }
      
      console.log(`迁移了 ${rows.length} 条用户数据`);
      resolve();
    });
  });
}

async function migrateCategories() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM categories', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      for (const row of rows) {
        try {
          const { error } = await supabase
            .from('categories')
            .insert({
              name: row.name,
              description: row.description,
              sort_order: row.sort_order,
              status: row.status,
              created_at: row.created_at
            });
          
          if (error) {
            console.error('插入分类数据失败:', error);
          }
        } catch (error) {
          console.error('处理分类数据失败:', error);
        }
      }
      
      console.log(`迁移了 ${rows.length} 条分类数据`);
      resolve();
    });
  });
}

async function migrateProducts() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM products', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      for (const row of rows) {
        try {
          const { error } = await supabase
            .from('products')
            .insert({
              name: row.name,
              description: row.description,
              price: row.price,
              original_price: row.original_price,
              image: row.image,
              category_id: row.category_id,
              stock: row.stock,
              sales: row.sales,
              points: row.points,
              status: row.status,
              created_at: row.created_at,
              updated_at: row.updated_at
            });
          
          if (error) {
            console.error('插入商品数据失败:', error);
          }
        } catch (error) {
          console.error('处理商品数据失败:', error);
        }
      }
      
      console.log(`迁移了 ${rows.length} 条商品数据`);
      resolve();
    });
  });
}

async function migrateOrders() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM orders', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      for (const row of rows) {
        try {
          // 检查用户是否存在，如果不存在则跳过或创建默认用户
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('id', row.user_id)
            .single();
          
          if (!user) {
            console.log(`跳过订单 ${row.order_no}：用户 ${row.user_id} 不存在`);
            continue;
          }
          
          const { error } = await supabase
            .from('orders')
            .insert({
              order_no: row.order_no,
              user_id: row.user_id,
              total_amount: row.total_amount,
              status: row.status,
              payment_method: row.payment_method,
              payment_time: row.payment_time,
              created_at: row.created_at,
              updated_at: row.updated_at
            });
          
          if (error) {
            console.error('插入订单数据失败:', error);
          }
        } catch (error) {
          console.error('处理订单数据失败:', error);
        }
      }
      
      console.log(`迁移了 ${rows.length} 条订单数据`);
      resolve();
    });
  });
}

async function migrateOrderItems() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM order_items', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      for (const row of rows) {
        try {
          const { error } = await supabase
            .from('order_items')
            .insert({
              order_id: row.order_id,
              product_id: row.product_id,
              product_name: row.product_name,
              product_price: row.product_price,
              quantity: row.quantity,
              subtotal: row.subtotal
            });
          
          if (error) {
            console.error('插入订单详情数据失败:', error);
          }
        } catch (error) {
          console.error('处理订单详情数据失败:', error);
        }
      }
      
      console.log(`迁移了 ${rows.length} 条订单详情数据`);
      resolve();
    });
  });
}

async function migratePointRecords() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM point_records', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      for (const row of rows) {
        try {
          const { error } = await supabase
            .from('point_records')
            .insert({
              user_id: row.user_id,
              type: row.type,
              points: row.points,
              description: row.description,
              created_at: row.created_at
            });
          
          if (error) {
            console.error('插入积分记录失败:', error);
          }
        } catch (error) {
          console.error('处理积分记录失败:', error);
        }
      }
      
      console.log(`迁移了 ${rows.length} 条积分记录`);
      resolve();
    });
  });
}

async function migrateParkingRecords() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM parking_records', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      for (const row of rows) {
        try {
          const { error } = await supabase
            .from('parking_records')
            .insert({
              user_id: row.user_id,
              plate_number: row.plate_number,
              entry_time: row.entry_time,
              exit_time: row.exit_time,
              duration_minutes: row.duration_minutes,
              fee: row.fee,
              status: row.status,
              payment_time: row.payment_time,
              created_at: row.created_at
            });
          
          if (error) {
            console.error('插入停车记录失败:', error);
          }
        } catch (error) {
          console.error('处理停车记录失败:', error);
        }
      }
      
      console.log(`迁移了 ${rows.length} 条停车记录`);
      resolve();
    });
  });
}

async function migrateCoupons() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM coupons', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      for (const row of rows) {
        try {
          const { error } = await supabase
            .from('coupons')
            .insert({
              name: row.name,
              type: row.type,
              value: row.value,
              min_amount: row.min_amount,
              start_date: row.start_date,
              end_date: row.end_date,
              total_count: row.total_count,
              used_count: row.used_count,
              status: row.status,
              created_at: row.created_at
            });
          
          if (error) {
            console.error('插入优惠券数据失败:', error);
          }
        } catch (error) {
          console.error('处理优惠券数据失败:', error);
        }
      }
      
      console.log(`迁移了 ${rows.length} 条优惠券数据`);
      resolve();
    });
  });
}

async function migrateUserCoupons() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM user_coupons', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      for (const row of rows) {
        try {
          const { error } = await supabase
            .from('user_coupons')
            .insert({
              user_id: row.user_id,
              coupon_id: row.coupon_id,
              status: row.status,
              used_time: row.used_time,
              created_at: row.created_at
            });
          
          if (error) {
            console.error('插入用户优惠券数据失败:', error);
          }
        } catch (error) {
          console.error('处理用户优惠券数据失败:', error);
        }
      }
      
      console.log(`迁移了 ${rows.length} 条用户优惠券数据`);
      resolve();
    });
  });
}

// 运行迁移
migrateData(); 