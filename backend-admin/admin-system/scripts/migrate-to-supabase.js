const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function migrateData() {
  console.log('开始迁移数据到 Supabase...');

  try {
    // 迁移管理员数据
    await migrateAdmins();
    
    // 迁移用户数据
    await migrateUsers();
    
    // 迁移分类数据
    await migrateCategories();
    
    // 迁移商品数据
    await migrateProducts();
    
    // 迁移订单数据
    await migrateOrders();
    
    // 迁移积分记录
    await migratePointRecords();
    
    // 迁移停车记录
    await migrateParkingRecords();
    
    // 迁移优惠券数据
    await migrateCoupons();
    
    console.log('数据迁移完成！');
  } catch (error) {
    console.error('迁移失败:', error);
  }
}

async function migrateAdmins() {
  return new Promise((resolve, reject) => {
    supabase
      .from('admins')
      .select()
      .then(data => {
        if (data.error) {
          reject(data.error);
          return;
        }
        
        for (const row of data.data) {
          try {
            const { error } = supabase
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
        
        console.log(`迁移了 ${data.data.length} 条管理员数据`);
        resolve();
      })
      .catch(error => {
        reject(error);
      });
  });
}

async function migrateUsers() {
  return new Promise((resolve, reject) => {
    supabase
      .from('users')
      .select()
      .then(data => {
        if (data.error) {
          reject(data.error);
          return;
        }
        
        for (const row of data.data) {
          try {
            const { error } = supabase
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
        
        console.log(`迁移了 ${data.data.length} 条用户数据`);
        resolve();
      })
      .catch(error => {
        reject(error);
      });
  });
}

async function migrateCategories() {
  return new Promise((resolve, reject) => {
    supabase
      .from('categories')
      .select()
      .then(data => {
        if (data.error) {
          reject(data.error);
          return;
        }
        
        for (const row of data.data) {
          try {
            const { error } = supabase
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
        
        console.log(`迁移了 ${data.data.length} 条分类数据`);
        resolve();
      })
      .catch(error => {
        reject(error);
      });
  });
}

async function migrateProducts() {
  return new Promise((resolve, reject) => {
    supabase
      .from('products')
      .select()
      .then(data => {
        if (data.error) {
          reject(data.error);
          return;
        }
        
        for (const row of data.data) {
          try {
            const { error } = supabase
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
        
        console.log(`迁移了 ${data.data.length} 条商品数据`);
        resolve();
      })
      .catch(error => {
        reject(error);
      });
  });
}

async function migrateOrders() {
  return new Promise((resolve, reject) => {
    supabase
      .from('orders')
      .select()
      .then(data => {
        if (data.error) {
          reject(data.error);
          return;
        }
        
        for (const row of data.data) {
          try {
            const { error } = supabase
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
        
        console.log(`迁移了 ${data.data.length} 条订单数据`);
        resolve();
      })
      .catch(error => {
        reject(error);
      });
  });
}

async function migratePointRecords() {
  return new Promise((resolve, reject) => {
    supabase
      .from('point_records')
      .select()
      .then(data => {
        if (data.error) {
          reject(data.error);
          return;
        }
        
        for (const row of data.data) {
          try {
            const { error } = supabase
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
        
        console.log(`迁移了 ${data.data.length} 条积分记录`);
        resolve();
      })
      .catch(error => {
        reject(error);
      });
  });
}

async function migrateParkingRecords() {
  return new Promise((resolve, reject) => {
    supabase
      .from('parking_records')
      .select()
      .then(data => {
        if (data.error) {
          reject(data.error);
          return;
        }
        
        for (const row of data.data) {
          try {
            const { error } = supabase
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
        
        console.log(`迁移了 ${data.data.length} 条停车记录`);
        resolve();
      })
      .catch(error => {
        reject(error);
      });
  });
}

async function migrateCoupons() {
  return new Promise((resolve, reject) => {
    supabase
      .from('coupons')
      .select()
      .then(data => {
        if (data.error) {
          reject(data.error);
          return;
        }
        
        for (const row of data.data) {
          try {
            const { error } = supabase
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
        
        console.log(`迁移了 ${data.data.length} 条优惠券数据`);
        resolve();
      })
      .catch(error => {
        reject(error);
      });
  });
}

// 运行迁移
migrateData(); 