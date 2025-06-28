const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../database/mall.db');
const db = new sqlite3.Database(dbPath);

// 获取订单列表
router.get('/', (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE 1=1';
  let params = [];

  if (status) {
    whereClause += ' AND o.status = ?';
    params.push(status);
  }

  if (search) {
    whereClause += ' AND (o.order_no LIKE ? OR u.nickname LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const query = `
    SELECT o.*, u.nickname, u.phone
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ${whereClause}
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) as total
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ${whereClause}
  `;

  db.get(countQuery, params, (err, countResult) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    db.all(query, [...params, limit, offset], (err, orders) => {
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
router.get('/:id', (req, res) => {
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

      // 获取订单商品详情
      db.all(
        `SELECT oi.*, p.name as product_name, p.image
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

          order.items = items;
          res.json({
            success: true,
            data: order
          });
        }
      );
    }
  );
});

// 更新订单状态
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: '订单状态不能为空'
    });
  }

  db.run(
    'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, id],
    function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '订单状态更新失败'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: '订单不存在'
        });
      }

      res.json({
        success: true,
        message: '订单状态更新成功'
      });
    }
  );
});

// 获取订单统计
router.get('/statistics/summary', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  const queries = [
    'SELECT COUNT(*) as total FROM orders',
    'SELECT COUNT(*) as today FROM orders WHERE DATE(created_at) = ?',
    'SELECT SUM(total_amount) as total_amount FROM orders WHERE status = "completed"',
    'SELECT SUM(total_amount) as today_amount FROM orders WHERE status = "completed" AND DATE(created_at) = ?',
    'SELECT COUNT(*) as pending FROM orders WHERE status = "pending"',
    'SELECT COUNT(*) as processing FROM orders WHERE status = "processing"'
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
    const [total, today, totalAmount, todayAmount, pending, processing] = results;
    res.json({
      success: true,
      data: {
        total: total.total,
        today: today.today,
        totalAmount: totalAmount.total_amount || 0,
        todayAmount: todayAmount.today_amount || 0,
        pending: pending.pending,
        processing: processing.processing
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

module.exports = router; 