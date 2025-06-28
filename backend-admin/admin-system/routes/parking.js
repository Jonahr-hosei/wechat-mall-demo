const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../database/mall.db');
const db = new sqlite3.Database(dbPath);

// 获取停车记录列表
router.get('/records', (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE 1=1';
  let params = [];

  if (status) {
    whereClause += ' AND pr.status = ?';
    params.push(status);
  }

  if (search) {
    whereClause += ' AND (pr.plate_number LIKE ? OR u.nickname LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const query = `
    SELECT pr.*, u.nickname
    FROM parking_records pr
    LEFT JOIN users u ON pr.user_id = u.id
    ${whereClause}
    ORDER BY pr.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) as total
    FROM parking_records pr
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

// 获取停车记录详情
router.get('/records/:id', (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT pr.*, u.nickname, u.phone
     FROM parking_records pr
     LEFT JOIN users u ON pr.user_id = u.id
     WHERE pr.id = ?`,
    [id],
    (err, record) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: '数据库错误'
        });
      }

      if (!record) {
        return res.status(404).json({
          success: false,
          message: '停车记录不存在'
        });
      }

      res.json({
        success: true,
        data: record
      });
    }
  );
});

// 手动结束停车
router.post('/records/:id/end', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM parking_records WHERE id = ? AND status = "parking"', [id], (err, record) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    if (!record) {
      return res.status(404).json({
        success: false,
        message: '停车记录不存在或已结束'
      });
    }

    const exit_time = new Date();
    const duration_minutes = Math.floor((exit_time - new Date(record.entry_time)) / (1000 * 60));
    const fee = calculateParkingFee(duration_minutes);

    db.run(
      `UPDATE parking_records 
       SET exit_time = ?, duration_minutes = ?, fee = ?, status = 'completed', updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [exit_time.toISOString(), duration_minutes, fee, id],
      function(err) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: '结束停车失败'
          });
        }

        res.json({
          success: true,
          message: '停车结束成功',
          data: {
            duration_minutes,
            fee
          }
        });
      }
    );
  });
});

// 手动支付停车费
router.post('/records/:id/pay', (req, res) => {
  const { id } = req.params;
  const { payment_method } = req.body;

  db.run(
    `UPDATE parking_records 
     SET payment_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [id],
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
          message: '停车记录不存在'
        });
      }

      res.json({
        success: true,
        message: '支付成功'
      });
    }
  );
});

// 获取停车统计
router.get('/statistics', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  const queries = [
    'SELECT COUNT(*) as total_records FROM parking_records',
    'SELECT COUNT(*) as today_records FROM parking_records WHERE DATE(created_at) = ?',
    'SELECT COUNT(*) as parking_now FROM parking_records WHERE status = "parking"',
    'SELECT SUM(fee) as total_revenue FROM parking_records WHERE status = "completed"',
    'SELECT SUM(fee) as today_revenue FROM parking_records WHERE status = "completed" AND DATE(exit_time) = ?'
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
    const [totalRecords, todayRecords, parkingNow, totalRevenue, todayRevenue] = results;
    res.json({
      success: true,
      data: {
        totalRecords: totalRecords.total_records,
        todayRecords: todayRecords.today_records,
        parkingNow: parkingNow.parking_now,
        totalRevenue: totalRevenue.total_revenue || 0,
        todayRevenue: todayRevenue.today_revenue || 0
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

// 计算停车费用
function calculateParkingFee(durationMinutes) {
  if (durationMinutes <= 30) {
    return 0; // 30分钟内免费
  } else if (durationMinutes <= 120) {
    return 5; // 2小时内5元
  } else {
    const hours = Math.ceil(durationMinutes / 60);
    return 5 + (hours - 2) * 2; // 超过2小时后每小时2元
  }
}

module.exports = router; 