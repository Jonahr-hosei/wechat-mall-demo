const express = require('express');
const supabase = require('../config/database');

const router = express.Router();

// 获取商品分类
router.get('/categories', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('status', 1)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Supabase查询错误:', error);
      return res.status(500).json({
        success: false,
        message: '获取分类列表失败'
      });
    }

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取分类列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取商品列表（小程序端）
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 10, category_id, search } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select(`
        *,
        categories(name)
      `)
      .eq('status', 1); // 只获取上架商品

    // 添加分类过滤
    if (category_id && category_id !== '') {
      query = query.eq('category_id', category_id);
    }

    // 添加搜索
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // 添加排序和分页
    query = query.order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: products, error } = await query;

    if (error) {
      console.error('Supabase查询错误:', error);
      return res.status(500).json({
        success: false,
        message: '获取商品列表失败'
      });
    }

    // 获取总数
    let countQuery = supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 1);

    if (category_id && category_id !== '') {
      countQuery = countQuery.eq('category_id', category_id);
    }

    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { count: total, error: countError } = await countQuery;

    if (countError) {
      console.error('Supabase计数错误:', countError);
      return res.status(500).json({
        success: false,
        message: '获取商品列表失败'
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

// 获取商品详情（小程序端）
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name)
      `)
      .eq('id', id)
      .eq('status', 1)
      .single();

    if (error) {
      console.error('Supabase查询错误:', error);
      return res.status(500).json({
        success: false,
        message: '获取商品详情失败'
      });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '商品不存在或已下架'
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

  supabase
    .from('orders')
    .insert([
      { order_no, user_id, total_amount, payment_method, status: 'pending' }
    ])
    .then(({ data: orderData, error }) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: '创建订单失败'
        });
      }

      const order_id = orderData[0].id;

      // 插入订单商品
      const insertItems = items.map(item => ({
        order_id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_price: item.product_price,
        quantity: item.quantity,
        subtotal: item.subtotal
      }));

      supabase
        .from('order_items')
        .insert(insertItems)
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
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    });
});

// 支付订单
router.post('/orders/:id/pay', (req, res) => {
  const { id } = req.params;
  const { payment_method } = req.body;

  supabase
    .from('orders')
    .update({
      status: 'completed',
      payment_method,
      payment_time: supabase.from('now').select('now')
    })
    .eq('id', id)
    .eq('status', 'pending')
    .then(({ data: updatedOrder, error }) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: '支付失败'
        });
      }

      if (!updatedOrder || updatedOrder.length === 0) {
        return res.status(404).json({
          success: false,
          message: '订单不存在'
        });
      }

      // 增加用户积分
      supabase
        .from('orders')
        .select('user_id, total_amount')
        .eq('id', id)
        .single()
        .then(({ data: order, error: orderError }) => {
          if (orderError) {
            console.error('获取订单信息错误:', orderError);
          } else {
            const points = Math.floor(order.total_amount);
            if (points > 0) {
              supabase
                .from('users')
                .update({ points: supabase.from('users').update({ points: supabase.from('users').increment({ points: points })).eq('id', order.user_id) })
                .eq('id', order.user_id);
              
              supabase
                .from('point_records')
                .insert([
                  { user_id: order.user_id, type: 'purchase', points, description: '购物获得积分' }
                ]);
            }
          }
        });

      res.json({
        success: true,
        message: '支付成功'
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: '支付失败'
      });
    });
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

  supabase
    .from('orders')
    .select('*', {
      head: true,
      count: 'exact'
    })
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
    .then(({ data: orders, error }) => {
      if (error) {
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
          total: orders.length,
          pages: Math.ceil(orders.length / limit)
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    });
});

// 获取订单详情
router.get('/orders/:id', (req, res) => {
  const { id } = req.params;

  supabase
    .from('orders')
    .select('*', {
      head: true,
      count: 'exact'
    })
    .eq('id', id)
    .then(({ data: order, error }) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: '数据库错误'
        });
      }

      if (!order || order.length === 0) {
        return res.status(404).json({
          success: false,
          message: '订单不存在'
        });
      }

      // 获取订单商品
      supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id)
        .then(({ data: items, error: itemError }) => {
          if (itemError) {
            return res.status(500).json({
              success: false,
              message: '数据库错误'
            });
          }

          res.json({
            success: true,
            data: {
              ...order[0],
              items: items.map(item => ({
                ...item,
                image: item.image ? `http://localhost:5000${item.image}` : null
              }))
            }
          });
        })
        .catch(err => {
          res.status(500).json({
            success: false,
            message: '数据库错误'
          });
        });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    });
});

// 获取用户信息
router.get('/user/:openid', (req, res) => {
  const { openid } = req.params;

  supabase
    .from('users')
    .select('*')
    .eq('openid', openid)
    .then(({ data: user, error }) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: '数据库错误'
        });
      }

      if (!user || user.length === 0) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        data: user[0]
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    });
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

  supabase
    .from('users')
    .upsert([
      { openid, nickname, avatar_url, phone, updated_at: supabase.from('now').select('now') }
    ])
    .then(({ data: updatedUsers, error }) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: '用户创建失败'
        });
      }

      res.json({
        success: true,
        message: '用户信息保存成功',
        data: { id: updatedUsers[0].id }
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    });
});

// 获取用户积分记录
router.get('/user/:user_id/points', (req, res) => {
  const { user_id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  supabase
    .from('point_records')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
    .then(({ data: records, error }) => {
      if (error) {
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
          total: records.length,
          pages: Math.ceil(records.length / limit)
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: '数据库错误'
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

  supabase
    .from('parking_records')
    .insert([
      { user_id, plate_number, entry_time: supabase.from('now').select('now'), status: 'parking' }
    ])
    .then(({ data: parkingData, error }) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: '停车记录创建失败'
        });
      }

      res.json({
        success: true,
        message: '停车记录创建成功',
        data: { id: parkingData[0].id }
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    });
});

router.post('/parking/exit', (req, res) => {
  const { record_id } = req.body;

  if (!record_id) {
    return res.status(400).json({
      success: false,
      message: '记录ID不能为空'
    });
  }

  supabase
    .from('parking_records')
    .update({
      exit_time: supabase.from('now').select('now'),
      duration_minutes: supabase.from('julianday').select('julianday').eq('now', 'now').mul(24).mul(60),
      fee: supabase.from('julianday').select('julianday').eq('now', 'now').mul(24).mul(60).mul(2),
      status: 'completed'
    })
    .eq('id', record_id)
    .eq('status', 'parking')
    .then(({ data: updatedRecords, error }) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: '停车记录更新失败'
        });
      }

      if (!updatedRecords || updatedRecords.length === 0) {
        return res.status(404).json({
          success: false,
          message: '停车记录不存在或已结束'
        });
      }

      res.json({
        success: true,
        message: '停车记录更新成功'
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    });
});

router.get('/parking/records/:user_id', (req, res) => {
  const { user_id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  supabase
    .from('parking_records')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
    .then(({ data: records, error }) => {
      if (error) {
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
          total: records.length,
          pages: Math.ceil(records.length / limit)
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    });
});

// 取消订单
router.post('/orders/:id/cancel', (req, res) => {
  const { id } = req.params;

  supabase
    .from('orders')
    .update({
      status: 'cancelled',
      updated_at: supabase.from('now').select('now')
    })
    .eq('id', id)
    .eq('status', 'pending')
    .then(({ data: updatedOrders, error }) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: '取消订单失败'
        });
      }

      if (!updatedOrders || updatedOrders.length === 0) {
        return res.status(404).json({
          success: false,
          message: '订单不存在或无法取消'
        });
      }

      res.json({
        success: true,
        message: '订单已取消'
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    });
});

// 获取订单状态
router.get('/orders/:id/status', (req, res) => {
  const { id } = req.params;

  supabase
    .from('orders')
    .select('status, created_at, payment_time')
    .eq('id', id)
    .then(({ data: order, error }) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: '数据库错误'
        });
      }

      if (!order || order.length === 0) {
        return res.status(404).json({
          success: false,
          message: '订单不存在'
        });
      }

      // 检查订单是否超时
      const now = new Date();
      const created = new Date(order[0].created_at);
      const timeDiff = now - created;
      const isTimeout = timeDiff > 15 * 60 * 1000 && order[0].status === 'pending';

      res.json({
        success: true,
        data: {
          status: isTimeout ? 'timeout' : order[0].status,
          created_at: order[0].created_at,
          payment_time: order[0].payment_time,
          is_timeout: isTimeout
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    });
});

// 获取首页数据
router.get('/home', async (req, res) => {
  try {
    // 获取热门商品
    const { data: hotProducts, error: hotError } = await supabase
      .from('products')
      .select('*')
      .eq('status', 1)
      .order('sales', { ascending: false })
      .limit(8);

    if (hotError) {
      console.error('Supabase热门商品查询错误:', hotError);
      return res.status(500).json({
        success: false,
        message: '获取首页数据失败'
      });
    }

    // 获取最新商品
    const { data: newProducts, error: newError } = await supabase
      .from('products')
      .select('*')
      .eq('status', 1)
      .order('created_at', { ascending: false })
      .limit(8);

    if (newError) {
      console.error('Supabase最新商品查询错误:', newError);
      return res.status(500).json({
        success: false,
        message: '获取首页数据失败'
      });
    }

    // 获取分类
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('status', 1)
      .order('sort_order', { ascending: true })
      .limit(6);

    if (categoryError) {
      console.error('Supabase分类查询错误:', categoryError);
      return res.status(500).json({
        success: false,
        message: '获取首页数据失败'
      });
    }

    res.json({
      success: true,
      data: {
        hotProducts: hotProducts || [],
        newProducts: newProducts || [],
        categories: categories || []
      }
    });
  } catch (error) {
    console.error('获取首页数据错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 公告列表接口
router.get('/notices', (req, res) => {
  const { mallId, limit = 5 } = req.query;
  // 如果没有公告表，直接返回空数组
  res.json({ success: true, data: [] });
});

module.exports = router; 