const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../database/mall.db');
const db = new sqlite3.Database(dbPath);

// 获取用户列表
router.get('/', (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE 1=1';
  let params = [];

  if (search) {
    whereClause += ' AND (nickname LIKE ? OR phone LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const query = `
    SELECT * FROM users
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) as total FROM users
    ${whereClause}
  `;

  db.get(countQuery, params, (err, countResult) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    db.all(query, [...params, limit, offset], (err, users) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '数据库错误'
        });
      }

      res.json({
        success: true,
        data: users,
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

// 获取用户详情
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
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
  });
});

// 更新用户信息
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nickname, phone, member_level } = req.body;

  db.run(
    `UPDATE users 
     SET nickname = ?, phone = ?, member_level = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [nickname, phone, member_level, id],
    function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '用户信息更新失败'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        message: '用户信息更新成功'
      });
    }
  );
});

// 获取用户统计
router.get('/statistics/summary', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  const queries = [
    'SELECT COUNT(*) as total FROM users',
    'SELECT COUNT(*) as today FROM users WHERE DATE(created_at) = ?',
    'SELECT COUNT(*) as vip FROM users WHERE member_level LIKE "%VIP%"',
    'SELECT AVG(points) as avg_points FROM users'
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
    const [total, today, vip, avgPoints] = results;
    res.json({
      success: true,
      data: {
        total: total.total,
        today: today.today,
        vip: vip.vip,
        avgPoints: Math.round(avgPoints.avg_points || 0)
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