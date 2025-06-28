const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../database/mall.db');
const db = new sqlite3.Database(dbPath);

// 获取总体统计数据
router.get('/overview', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  const queries = [
    // 用户统计
    'SELECT COUNT(*) as total_users FROM users',
    'SELECT COUNT(*) as today_users FROM users WHERE DATE(created_at) = ?',
    
    // 商品统计
    'SELECT COUNT(*) as total_products FROM products',
    'SELECT COUNT(*) as active_products FROM products WHERE status = 1',
    
    // 订单统计
    'SELECT COUNT(*) as total_orders FROM orders',
    'SELECT COUNT(*) as today_orders FROM orders WHERE DATE(created_at) = ?',
    'SELECT SUM(total_amount) as total_revenue FROM orders WHERE status = "completed"',
    'SELECT SUM(total_amount) as today_revenue FROM orders WHERE status = "completed" AND DATE(created_at) = ?',
    
    // 停车统计
    'SELECT COUNT(*) as total_parking FROM parking_records',
    'SELECT COUNT(*) as parking_now FROM parking_records WHERE status = "parking"',
    'SELECT SUM(fee) as parking_revenue FROM parking_records WHERE status = "completed"',
    
    // 积分统计
    'SELECT SUM(points) as total_points FROM users',
    'SELECT COUNT(*) as users_with_points FROM users WHERE points > 0'
  ];

  Promise.all(queries.map(query => {
    return new Promise((resolve, reject) => {
      db.get(query, query.includes('DATE') ? [today] : [], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }))
  .then(results => {
    const [
      totalUsers, todayUsers,
      totalProducts, activeProducts,
      totalOrders, todayOrders, totalRevenue, todayRevenue,
      totalParking, parkingNow, parkingRevenue,
      totalPoints, usersWithPoints
    ] = results;

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers.total_users,
          today: todayUsers.today_users
        },
        products: {
          total: totalProducts.total_products,
          active: activeProducts.active_products
        },
        orders: {
          total: totalOrders.total_orders,
          today: todayOrders.today_orders,
          revenue: totalRevenue.total_revenue || 0,
          todayRevenue: todayRevenue.today_revenue || 0
        },
        parking: {
          total: totalParking.total_parking,
          now: parkingNow.parking_now,
          revenue: parkingRevenue.parking_revenue || 0
        },
        points: {
          total: totalPoints.total_points || 0,
          users: usersWithPoints.users_with_points
        }
      }
    });
  })
  .catch(err => {
    res.status(500).json({
      success: false,
      message: '获取统计数据失败'
    });
  });
});

// 获取销售趋势数据
router.get('/sales-trend', (req, res) => {
  const { days = 7 } = req.query;
  
  const query = `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as order_count,
      SUM(total_amount) as revenue
    FROM orders 
    WHERE created_at >= date('now', '-${days} days')
    GROUP BY DATE(created_at)
    ORDER BY date
  `;

  db.all(query, [], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '获取销售趋势失败'
      });
    }

    res.json({
      success: true,
      data: results
    });
  });
});

// 获取商品销售排行
router.get('/product-ranking', (req, res) => {
  const { limit = 10 } = req.query;
  
  const query = `
    SELECT 
      p.name,
      p.sales,
      p.price,
      c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.sales DESC
    LIMIT ?
  `;

  db.all(query, [limit], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '获取商品排行失败'
      });
    }

    res.json({
      success: true,
      data: results
    });
  });
});

// 获取用户活跃度统计
router.get('/user-activity', (req, res) => {
  const { days = 30 } = req.query;
  
  const query = `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as new_users
    FROM users 
    WHERE created_at >= date('now', '-${days} days')
    GROUP BY DATE(created_at)
    ORDER BY date
  `;

  db.all(query, [], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '获取用户活跃度失败'
      });
    }

    res.json({
      success: true,
      data: results
    });
  });
});

// 获取停车使用统计
router.get('/parking-usage', (req, res) => {
  const { days = 7 } = req.query;
  
  const query = `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as usage_count,
      SUM(fee) as revenue
    FROM parking_records 
    WHERE created_at >= date('now', '-${days} days')
    GROUP BY DATE(created_at)
    ORDER BY date
  `;

  db.all(query, [], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '获取停车使用统计失败'
      });
    }

    res.json({
      success: true,
      data: results
    });
  });
});

module.exports = router; 