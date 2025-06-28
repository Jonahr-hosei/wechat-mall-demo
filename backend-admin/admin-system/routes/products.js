const express = require('express');
const path = require('path');
const multer = require('multer');
const supabase = require('../config/database');

const router = express.Router();

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
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category_id, status, search, sortField, sortOrder } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select(`
        *,
        categories(name)
      `);

    // 添加过滤条件
    if (category_id && category_id !== '') {
      query = query.eq('category_id', category_id);
    }

    if (status !== undefined && status !== '') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // 添加排序
    if (sortField && sortOrder) {
      const order = sortOrder === 'descend' ? 'desc' : 'asc';
      if (sortField === 'category_name') {
        query = query.order('categories.name', { ascending: order === 'asc' });
      } else {
        query = query.order(sortField, { ascending: order === 'asc' });
      }
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // 添加分页
    query = query.range(offset, offset + limit - 1);

    const { data: products, error, count } = await query;

    if (error) {
      console.error('Supabase查询错误:', error);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    // 获取总数
    let countQuery = supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (category_id && category_id !== '') {
      countQuery = countQuery.eq('category_id', category_id);
    }

    if (status !== undefined && status !== '') {
      countQuery = countQuery.eq('status', status);
    }

    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { count: total, error: countError } = await countQuery;

    if (countError) {
      console.error('Supabase计数错误:', countError);
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
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('获取商品列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取商品详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase查询错误:', error);
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
  } catch (error) {
    console.error('获取商品详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 创建商品
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      original_price,
      category_id,
      stock,
      points
    } = req.body;

    console.log('收到商品创建请求:', { name, price, category_id });
    console.log('上传的文件:', req.file);

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: '商品名称和价格不能为空'
      });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;
    console.log('图片路径:', image);

    const { data, error } = await supabase
      .from('products')
      .insert([{
        name,
        description,
        price: parseFloat(price),
        original_price: original_price ? parseFloat(original_price) : null,
        image,
        category_id: category_id ? parseInt(category_id) : null,
        stock: stock ? parseInt(stock) : 0,
        points: points ? parseInt(points) : 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase插入错误:', error);
      return res.status(500).json({
        success: false,
        message: '商品创建失败'
      });
    }

    console.log('商品创建成功，ID:', data.id);
    res.json({
      success: true,
      message: '商品创建成功',
      data: { id: data.id }
    });
  } catch (error) {
    console.error('创建商品错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 更新商品
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
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

    const updateData = {
      name,
      description,
      price: price ? parseFloat(price) : undefined,
      original_price: original_price ? parseFloat(original_price) : undefined,
      category_id: category_id ? parseInt(category_id) : undefined,
      stock: stock ? parseInt(stock) : undefined,
      points: points ? parseInt(points) : undefined,
      status: status !== undefined ? parseInt(status) : undefined
    };

    // 如果有上传新图片，添加图片路径
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    // 移除undefined的字段
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase更新错误:', error);
      return res.status(500).json({
        success: false,
        message: '商品更新失败'
      });
    }

    res.json({
      success: true,
      message: '商品更新成功',
      data
    });
  } catch (error) {
    console.error('更新商品错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 删除商品
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase删除错误:', error);
      return res.status(500).json({
        success: false,
        message: '商品删除失败'
      });
    }

    res.json({
      success: true,
      message: '商品删除成功'
    });
  } catch (error) {
    console.error('删除商品错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 批量删除商品
router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择要删除的商品'
      });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Supabase批量删除错误:', error);
      return res.status(500).json({
        success: false,
        message: '批量删除失败'
      });
    }

    res.json({
      success: true,
      message: '批量删除成功'
    });
  } catch (error) {
    console.error('批量删除商品错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 更新商品状态
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('products')
      .update({ status: parseInt(status) })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase状态更新错误:', error);
      return res.status(500).json({
        success: false,
        message: '状态更新失败'
      });
    }

    res.json({
      success: true,
      message: '状态更新成功',
      data
    });
  } catch (error) {
    console.error('更新商品状态错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router; 