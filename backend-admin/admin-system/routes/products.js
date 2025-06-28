const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');

const router = express.Router();
const dbPath = path.join(__dirname, '../database/mall.db');
const db = new sqlite3.Database(dbPath);

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 获取商品列表
router.get('/', (req, res) => {
  const { page = 1, limit = 10, category_id, status, search, sortField, sortOrder } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE 1=1';
  let params = [];

  if (category_id && category_id !== '') {
    whereClause += ' AND p.category_id = ?';
    params.push(category_id);
  }

  if (status !== undefined && status !== '') {
    whereClause += ' AND p.status = ?';
    params.push(status);
  }

  if (search) {
    whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  // 排序字段白名单，防止SQL注入
  const allowedSortFields = ['name', 'category_name', 'price', 'stock', 'sales', 'points', 'status'];
  let orderBy = 'ORDER BY p.created_at DESC';
  if (sortField && allowedSortFields.includes(sortField)) {
    let order = 'ASC';
    if (sortOrder === 'descend') order = 'DESC';
    // category_name排序需特殊处理
    if (sortField === 'category_name') {
      orderBy = `ORDER BY c.name ${order}`;
    } else {
      orderBy = `ORDER BY p.${sortField} ${order}`;
    }
  }

  const query = `
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    ${whereClause}
    ${orderBy}
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

      res.json({
        success: true,
        data: products,
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
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT p.*, c.name as category_name 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.id = ?`,
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

      res.json({
        success: true,
        data: product
      });
    }
  );
});

// 创建商品
router.post('/', upload.single('image'), (req, res) => {
  const {
    name,
    description,
    price,
    original_price,
    category_id,
    stock,
    points
  } = req.body;

  console.log('收到商品创建请求:', { name, price, category_id }); // 调试日志
  console.log('上传的文件:', req.file); // 调试日志

  if (!name || !price) {
    return res.status(400).json({
      success: false,
      message: '商品名称和价格不能为空'
    });
  }

  const image = req.file ? `/uploads/${req.file.filename}` : null;
  console.log('图片路径:', image); // 调试日志

  db.run(
    `INSERT INTO products (name, description, price, original_price, image, category_id, stock, points)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, description, price, original_price, image, category_id, stock, points],
    function(err) {
      if (err) {
        console.error('数据库插入错误:', err); // 调试日志
        return res.status(500).json({
          success: false,
          message: '商品创建失败'
        });
      }

      console.log('商品创建成功，ID:', this.lastID); // 调试日志
      res.json({
        success: true,
        message: '商品创建成功',
        data: { id: this.lastID }
      });
    }
  );
});

// 更新商品
router.put('/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    price,
    original_price,
    category_id,
    stock,
    points,
    status
  } = req.body;

  if (!name || !price) {
    return res.status(400).json({
      success: false,
      message: '商品名称和价格不能为空'
    });
  }

  let image = null;
  if (req.file) {
    image = `/uploads/${req.file.filename}`;
  }

  let query = `
    UPDATE products 
    SET name = ?, description = ?, price = ?, original_price = ?, 
        category_id = ?, stock = ?, points = ?, status = ?, updated_at = CURRENT_TIMESTAMP
  `;
  let params = [name, description, price, original_price, category_id, stock, points, status];

  if (image) {
    query = query.replace('updated_at = CURRENT_TIMESTAMP', 'image = ?, updated_at = CURRENT_TIMESTAMP');
    params.splice(4, 0, image);
  }

  query += ' WHERE id = ?';
  params.push(id);

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '商品更新失败'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }

    res.json({
      success: true,
      message: '商品更新成功'
    });
  });
});

// 删除商品
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '商品删除失败'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }

    res.json({
      success: true,
      message: '商品删除成功'
    });
  });
});

// 获取商品分类
router.get('/categories/list', (req, res) => {
  db.all('SELECT MIN(id) as id, name, description, sort_order, status, MIN(created_at) as created_at FROM categories WHERE status = 1 GROUP BY name ORDER BY sort_order, name', (err, categories) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    res.json({
      success: true,
      data: categories
    });
  });
});

// 批量更新商品状态
router.put('/batch/status', (req, res) => {
  const { ids, status } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: '商品ID列表不能为空'
    });
  }

  const placeholders = ids.map(() => '?').join(',');
  const query = `UPDATE products SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`;

  db.run(query, [status, ...ids], function(err) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '批量更新失败'
      });
    }

    res.json({
      success: true,
      message: `成功更新 ${this.changes} 个商品`
    });
  });
});

// 批量删除商品
router.post('/batch-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: '请提供要删除的商品ID数组'
    });
  }

  const placeholders = ids.map(() => '?').join(',');
  const sql = `DELETE FROM products WHERE id IN (${placeholders})`;

  db.run(sql, ids, function(err) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '批量删除失败'
      });
    }
    res.json({
      success: true,
      message: `成功删除${this.changes}个商品`
    });
  });
});

module.exports = router; 