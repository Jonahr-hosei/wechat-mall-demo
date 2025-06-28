const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../database/mall.db');
const db = new sqlite3.Database(dbPath);

// 获取商品分类
router.get('/categories', (req, res) => {
  db.all('SELECT MIN(id) as id, name, description, sort_order, status, MIN(created_at) as created_at FROM categories WHERE status = 1 GROUP BY name ORDER BY sort_order, name', (err, categories) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '获取分类失败'
      });
    }

    res.json({
      success: true,
      data: categories
    });
  });
});

// 获取商品列表
router.get('/products', (req, res) => {
  const { page = 1, limit = 10, category_id, search } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE p.status = 1';
  let params = [];

  if (category_id) {
    whereClause += ' AND p.category_id = ?';
    params.push(category_id);
  }

  if (search) {
    whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const query = `
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    ${whereClause}
    ORDER BY p.created_at DESC 
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) as total 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    ${whereClause}
  `;

  db.get(countQuery, params, (err, countResult) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    db.all(query, [...params, limit, offset], (err, products) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '数据库错误'
        });
      }

      // 处理商品图片路径
      const productsWithImages = products.map(product => ({
        ...product,
        image: product.image ? `http://localhost:5000${product.image}` : null
      }));

      res.json({
        success: true,
        data: productsWithImages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      });
    });
  });
});

// 获取商品详情
router.get('/products/:id', (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT p.*, c.name as category_name 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.id = ? AND p.status = 1`,
    [id],
    (err, product) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '数据库错误'
        });
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          message: '商品不存在'
        });
      }

      // 处理商品图片路径
      const productWithImage = {
        ...product,
        image: product.image ? `http://localhost:5000${product.image}` : null
      };

      res.json({
        success: true,
        data: productWithImage
      });
    }
  );
});

// 创建订单
router.post('/orders', (req, res) => {
  const { user_id, items, total_amount, payment_method } = req.body;

  if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: '订单信息不完整'
    });
  }

  const order_no = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();

  db.run(
    `INSERT INTO orders (order_no, user_id, total_amount, payment_method, status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [order_no, user_id, total_amount, payment_method],
    function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '创建订单失败'
        });
      }

      const order_id = this.lastID;

      // 插入订单商品
      const insertItems = items.map(item => {
        return new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [order_id, item.product_id, item.product_name, item.product_price, item.quantity, item.subtotal],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      });

      Promise.all(insertItems)
        .then(() => {
          res.json({
            success: true,
            message: '订单创建成功',
            data: { order_id, order_no }
          });
        })
        .catch(err => {
          res.status(500).json({
            success: false,
            message: '订单创建失败'
          });
        });
    }
  );
});

// 支付订单
router.post('/orders/:id/pay', (req, res) => {
  const { id } = req.params;
  const { payment_method } = req.body;

  db.run(
    `UPDATE orders 
     SET status = 'completed', payment_method = ?, payment_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [payment_method, id],
    function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '支付失败'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: '订单不存在'
        });
      }

      // 增加用户积分
      db.get('SELECT user_id, total_amount FROM orders WHERE id = ?', [id], (err, order) => {
        if (!err && order) {
          // 计算积分（假设1元=1积分）
          const points = Math.floor(order.total_amount);
          if (points > 0) {
            db.run(
              `UPDATE users SET points = points + ? WHERE id = ?`,
              [points, order.user_id]
            );
            
            // 记录积分
            db.run(
              `INSERT INTO point_records (user_id, type, points, description)
               VALUES (?, 'purchase', ?, '购物获得积分')`,
              [order.user_id, points]
            );
          }
        }
      });

      res.json({
        success: true,
        message: '支付成功'
      });
    }
  );
});

// 获取用户订单列表
router.get('/orders', (req, res) => {
  const { user_id, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  if (!user_id) {
    return res.status(400).json({
      success: false,
      message: '用户ID不能为空'
    });
  }

  const query = `
    SELECT o.*, 
           GROUP_CONCAT(oi.product_name || ' x' || oi.quantity) as items_summary
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) as total 
    FROM orders 
    WHERE user_id = ?
  `;

  db.get(countQuery, [user_id], (err, countResult) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    db.all(query, [user_id, limit, offset], (err, orders) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '数据库错误'
        });
      }

      res.json({
        success: true,
        data: orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      });
    });
  });
});

// 获取订单详情
router.get('/orders/:id', (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT o.*, u.nickname, u.phone
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     WHERE o.id = ?`,
    [id],
    (err, order) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '数据库错误'
        });
      }

      if (!order) {
        return res.status(404).json({
          success: false,
          message: '订单不存在'
        });
      }

      // 获取订单商品
      db.all(
        `SELECT oi.*, p.image
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [id],
        (err, items) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: '数据库错误'
            });
          }

          // 处理商品图片路径
          const itemsWithImages = items.map(item => ({
            ...item,
            image: item.image ? `http://localhost:5000${item.image}` : null
          }));

          res.json({
            success: true,
            data: {
              ...order,
              items: itemsWithImages
            }
          });
        }
      );
    }
  );
});

// 获取用户信息
router.get('/user/:openid', (req, res) => {
  const { openid } = req.params;

  db.get(
    'SELECT * FROM users WHERE openid = ?',
    [openid],
    (err, user) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '数据库错误'
        });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        data: user
      });
    }
  );
});

// 创建或更新用户
router.post('/user', (req, res) => {
  const { openid, nickname, avatar_url, phone } = req.body;

  if (!openid) {
    return res.status(400).json({
      success: false,
      message: 'openid不能为空'
    });
  }

  db.run(
    `INSERT OR REPLACE INTO users (openid, nickname, avatar_url, phone, updated_at)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [openid, nickname, avatar_url, phone],
    function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '用户创建失败'
        });
      }

      res.json({
        success: true,
        message: '用户信息保存成功',
        data: { id: this.lastID }
      });
    }
  );
});

// 获取用户积分记录
router.get('/user/:user_id/points', (req, res) => {
  const { user_id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const query = `
    SELECT * FROM point_records 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) as total 
    FROM point_records 
    WHERE user_id = ?
  `;

  db.get(countQuery, [user_id], (err, countResult) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    db.all(query, [user_id, limit, offset], (err, records) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '数据库错误'
        });
      }

      res.json({
        success: true,
        data: records,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      });
    });
  });
});

// 停车相关API
router.post('/parking/entry', (req, res) => {
  const { user_id, plate_number } = req.body;

  if (!plate_number) {
    return res.status(400).json({
      success: false,
      message: '车牌号不能为空'
    });
  }

  db.run(
    `INSERT INTO parking_records (user_id, plate_number, entry_time, status)
     VALUES (?, ?, CURRENT_TIMESTAMP, 'parking')`,
    [user_id, plate_number],
    function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '停车记录创建失败'
        });
      }

      res.json({
        success: true,
        message: '停车记录创建成功',
        data: { id: this.lastID }
      });
    }
  );
});

router.post('/parking/exit', (req, res) => {
  const { record_id } = req.body;

  if (!record_id) {
    return res.status(400).json({
      success: false,
      message: '记录ID不能为空'
    });
  }

  db.run(
    `UPDATE parking_records 
     SET exit_time = CURRENT_TIMESTAMP, 
         duration_minutes = ROUND((julianday('now') - julianday(entry_time)) * 24 * 60),
         fee = ROUND((julianday('now') - julianday(entry_time)) * 24 * 60) * 2,
         status = 'completed'
     WHERE id = ? AND status = 'parking'`,
    [record_id],
    function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '停车记录更新失败'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: '停车记录不存在或已结束'
        });
      }

      res.json({
        success: true,
        message: '停车记录更新成功'
      });
    }
  );
});

router.get('/parking/records/:user_id', (req, res) => {
  const { user_id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const query = `
    SELECT * FROM parking_records 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) as total 
    FROM parking_records 
    WHERE user_id = ?
  `;

  db.get(countQuery, [user_id], (err, countResult) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    db.all(query, [user_id, limit, offset], (err, records) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '数据库错误'
        });
      }

      res.json({
        success: true,
        data: records,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      });
    });
  });
});

// 取消订单
router.post('/orders/:id/cancel', (req, res) => {
  const { id } = req.params;

  db.run(
    `UPDATE orders 
     SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
     WHERE id = ? AND status = 'pending'`,
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '取消订单失败'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: '订单不存在或无法取消'
        });
      }

      res.json({
        success: true,
        message: '订单已取消'
      });
    }
  );
});

// 获取订单状态
router.get('/orders/:id/status', (req, res) => {
  const { id } = req.params;

  db.get(
    'SELECT status, created_at, payment_time FROM orders WHERE id = ?',
    [id],
    (err, order) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '数据库错误'
        });
      }

      if (!order) {
        return res.status(404).json({
          success: false,
          message: '订单不存在'
        });
      }

      // 检查订单是否超时
      const now = new Date();
      const created = new Date(order.created_at);
      const timeDiff = now - created;
      const isTimeout = timeDiff > 15 * 60 * 1000 && order.status === 'pending';

      res.json({
        success: true,
        data: {
          status: isTimeout ? 'timeout' : order.status,
          created_at: order.created_at,
          payment_time: order.payment_time,
          is_timeout: isTimeout
        }
      });
    }
  );
});

// 热门商品接口
router.get('/products/hot', (req, res) => {
  const { mallId, limit = 10 } = req.query;
  // 这里只是示例，实际可根据销量、浏览量等排序
  const sql = `SELECT * FROM products ORDER BY sales DESC LIMIT ?`;
  db.all(sql, [limit], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: '数据库错误' });
    }
    res.json({ success: true, data: rows });
  });
});

// 公告列表接口
router.get('/notices', (req, res) => {
  const { mallId, limit = 5 } = req.query;
  // 如果没有公告表，直接返回空数组
  res.json({ success: true, data: [] });
});

module.exports = router; 