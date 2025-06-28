const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../database/mall.db');
const db = new sqlite3.Database(dbPath);

// 获取积分记录列表
router.get('/records', (req, res) => {
  const { page = 1, limit = 10, user_id, type } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE 1=1';
  let params = [];

  if (user_id) {
    whereClause += ' AND pr.user_id = ?';
    params.push(user_id);
  }

  if (type) {
    whereClause += ' AND pr.type = ?';
    params.push(type);
  }

  const query = `
    SELECT pr.*, u.nickname
    FROM point_records pr
    LEFT JOIN users u ON pr.user_id = u.id
    ${whereClause}
    ORDER BY pr.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) as total
    FROM point_records pr
    LEFT JOIN users u ON pr.user_id = u.id
    ${whereClause}
  `;

  db.get(countQuery, params, (err, countResult) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    db.all(query, [...params, limit, offset], (err, records) => {
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

// 手动调整用户积分
router.post('/adjust', (req, res) => {
  const { user_id, points, type, description } = req.body;

  if (!user_id || !points || !type || !description) {
    return res.status(400).json({
      success: false,
      message: '参数不完整'
    });
  }

  db.run(
    `UPDATE users SET points = points + ? WHERE id = ?`,
    [points, user_id],
    function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '积分调整失败'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 记录积分变动
      db.run(
        `INSERT INTO point_records (user_id, type, points, description)
         VALUES (?, ?, ?, ?)`,
        [user_id, type, points, description],
        (err) => {
          if (err) {
            console.error('积分记录保存失败:', err);
          }
        }
      );

      res.json({
        success: true,
        message: '积分调整成功'
      });
    }
  );
});

// 获取积分统计
router.get('/statistics', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  const queries = [
    'SELECT SUM(points) as total_points FROM users',
    'SELECT COUNT(*) as total_users FROM users WHERE points > 0',
    'SELECT SUM(points) as today_points FROM point_records WHERE DATE(created_at) = ? AND points > 0',
    'SELECT SUM(points) as today_used FROM point_records WHERE DATE(created_at) = ? AND points < 0'
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
    const [totalPoints, totalUsers, todayPoints, todayUsed] = results;
    res.json({
      success: true,
      data: {
        totalPoints: totalPoints.total_points || 0,
        totalUsers: totalUsers.total_users,
        todayPoints: todayPoints.today_points || 0,
        todayUsed: Math.abs(todayUsed.today_used || 0)
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