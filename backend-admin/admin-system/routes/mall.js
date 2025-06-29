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

    // 修复商品图片路径
    const fixImageUrl = (products) => {
      return products.map(product => {
        let imageUrl = product.image;
        if (imageUrl && imageUrl.startsWith('/uploads/')) {
          // 如果是本地路径，设为null，避免404错误
          imageUrl = null;
        }
        return { ...product, image: imageUrl };
      });
    };

    res.json({
      success: true,
      data: fixImageUrl(products),
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

    // 修复商品图片路径
    let imageUrl = product.image;
    if (imageUrl && imageUrl.startsWith('/uploads/')) {
      // 如果是本地路径，设为null，避免404错误
      imageUrl = null;
    }
    const fixedProduct = { ...product, image: imageUrl };

    res.json({
      success: true,
      data: fixedProduct
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
router.post('/orders', async (req, res) => {
  try {
    const { user_id, total_amount, items, payment_method } = req.body;

    if (!user_id || !total_amount || !items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: '订单信息不完整'
      });
    }

    const order_no = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();

    // 创建订单
    const { data: orderData, error } = await supabase
      .from('orders')
      .insert([
        { order_no, user_id, total_amount, payment_method, status: 'pending' }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase订单创建错误:', error);
      return res.status(500).json({
        success: false,
        message: '订单创建失败'
      });
    }

    const order_id = orderData.id;

    // 插入订单商品
    const insertItems = items.map(item => ({
      order_id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_price: item.product_price,
      quantity: item.quantity,
      subtotal: item.subtotal
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(insertItems);

    if (itemsError) {
      console.error('Supabase订单项创建错误:', itemsError);
      return res.status(500).json({
        success: false,
        message: '订单项创建失败'
      });
    }

    res.json({
      success: true,
      message: '订单创建成功',
      data: { id: order_id, order_no }
    });
  } catch (error) {
    console.error('创建订单错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 支付订单
router.post('/orders/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method } = req.body;

    // 更新订单状态
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        payment_method,
        payment_time: new Date().toISOString()
      })
      .eq('id', id)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) {
      console.error('Supabase支付更新错误:', error);
      return res.status(500).json({
        success: false,
        message: '支付失败'
      });
    }

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: '订单不存在或已支付'
      });
    }

    // 增加用户积分
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('user_id, total_amount')
        .eq('id', id)
        .single();

      if (!orderError && order) {
        const points = Math.floor(order.total_amount);
        if (points > 0) {
          // 先获取用户当前积分
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('points')
            .eq('id', order.user_id)
            .single();

          if (!userError && user) {
            const newPoints = (user.points || 0) + points;
            
            // 更新用户积分
            await supabase
              .from('users')
              .update({ points: newPoints })
              .eq('id', order.user_id);

            // 记录积分
            await supabase
              .from('point_records')
              .insert([
                { user_id: order.user_id, type: 'purchase', points, description: '购物获得积分' }
              ]);
          }
        }
      }
    } catch (pointsError) {
      console.error('积分更新错误:', pointsError);
      // 积分更新失败不影响支付成功
    }

    res.json({
      success: true,
      message: '支付成功'
    });
  } catch (error) {
    console.error('支付订单错误:', error);
    res.status(500).json({
      success: false,
      message: '支付失败'
    });
  }
});

// 获取用户订单列表
router.get('/orders', async (req, res) => {
  try {
    const { user_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: '用户ID不能为空'
      });
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase查询错误:', error);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    // 获取总数
    const { count: total, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id);

    if (countError) {
      console.error('Supabase计数错误:', countError);
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
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('获取订单列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取订单详情
router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase查询错误:', error);
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
    const { data: items, error: itemError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    if (itemError) {
      console.error('Supabase订单项查询错误:', itemError);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    res.json({
      success: true,
      data: {
        ...order,
        items: items || []
      }
    });
  } catch (error) {
    console.error('获取订单详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取用户信息
router.get('/user/:openid', async (req, res) => {
  try {
    const { openid } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('openid', openid)
      .single();

    if (error) {
      console.error('Supabase查询错误:', error);
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
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 创建或更新用户
router.post('/user', async (req, res) => {
  try {
    const { openid, nickname, avatar_url, phone } = req.body;

    if (!openid) {
      return res.status(400).json({
        success: false,
        message: 'openid不能为空'
      });
    }

    const { data: updatedUsers, error } = await supabase
      .from('users')
      .upsert([
        { openid, nickname, avatar_url, phone, updated_at: new Date().toISOString() }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase用户更新错误:', error);
      return res.status(500).json({
        success: false,
        message: '用户信息保存失败'
      });
    }

    res.json({
      success: true,
      message: '用户信息保存成功',
      data: { id: updatedUsers.id }
    });
  } catch (error) {
    console.error('保存用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取积分记录
router.get('/points/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { data: records, error } = await supabase
      .from('point_records')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase查询错误:', error);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    // 获取总数
    const { count: total, error: countError } = await supabase
      .from('point_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id);

    if (countError) {
      console.error('Supabase计数错误:', countError);
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
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('获取积分记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 停车入场
router.post('/parking/entry', async (req, res) => {
  try {
    const { user_id, plate_number } = req.body;

    if (!user_id || !plate_number) {
      return res.status(400).json({
        success: false,
        message: '用户ID和车牌号不能为空'
      });
    }

    const { data: parkingData, error } = await supabase
      .from('parking_records')
      .insert([
        { user_id, plate_number, entry_time: new Date().toISOString(), status: 'parking' }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase停车记录创建错误:', error);
      return res.status(500).json({
        success: false,
        message: '停车记录创建失败'
      });
    }

    res.json({
      success: true,
      message: '停车记录创建成功',
      data: { id: parkingData.id }
    });
  } catch (error) {
    console.error('创建停车记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 停车出场
router.post('/parking/exit/:record_id', async (req, res) => {
  try {
    const { record_id } = req.params;

    const exitTime = new Date();
    const entryTime = new Date(); // 这里应该从数据库获取入场时间

    // 计算停车时长和费用
    const durationMinutes = Math.floor((exitTime - entryTime) / (1000 * 60));
    const fee = Math.max(1, durationMinutes * 2); // 每小时2元，最少1元

    const { data: updatedRecords, error } = await supabase
      .from('parking_records')
      .update({
        exit_time: exitTime.toISOString(),
        duration_minutes: durationMinutes,
        fee: fee,
        status: 'completed'
      })
      .eq('id', record_id)
      .eq('status', 'parking')
      .select()
      .single();

    if (error) {
      console.error('Supabase停车记录更新错误:', error);
      return res.status(500).json({
        success: false,
        message: '停车记录更新失败'
      });
    }

    if (!updatedRecords) {
      return res.status(404).json({
        success: false,
        message: '停车记录不存在或已完成'
      });
    }

    res.json({
      success: true,
      message: '停车记录更新成功',
      data: {
        duration_minutes: durationMinutes,
        fee: fee
      }
    });
  } catch (error) {
    console.error('更新停车记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取停车记录
router.get('/parking/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { data: records, error } = await supabase
      .from('parking_records')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase查询错误:', error);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    // 获取总数
    const { count: total, error: countError } = await supabase
      .from('parking_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id);

    if (countError) {
      console.error('Supabase计数错误:', countError);
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
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('获取停车记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 取消订单
router.post('/orders/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: updatedOrders, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) {
      console.error('Supabase订单取消错误:', error);
      return res.status(500).json({
        success: false,
        message: '订单取消失败'
      });
    }

    if (!updatedOrders) {
      return res.status(404).json({
        success: false,
        message: '订单不存在或无法取消'
      });
    }

    res.json({
      success: true,
      message: '订单已取消'
    });
  } catch (error) {
    console.error('取消订单错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 检查订单状态
router.get('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('status, created_at, payment_time')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase查询错误:', error);
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
  } catch (error) {
    console.error('检查订单状态错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取首页数据
router.get('/home', async (req, res) => {
  try {
    console.log('🏠 开始获取首页数据...');

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

    console.log(`✅ 热门商品查询成功，共 ${hotProducts?.length || 0} 条`);

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

    console.log(`✅ 最新商品查询成功，共 ${newProducts?.length || 0} 条`);

    // 获取公告 - 添加详细日志
    console.log('📢 开始查询公告数据...');
    
    // 先查询所有公告，看看表是否有数据
    const { data: allAnnouncements, error: allAnnouncementError } = await supabase
      .from('announcements')
      .select('*');

    if (allAnnouncementError) {
      console.error('❌ 查询所有公告失败:', allAnnouncementError);
      return res.status(500).json({
        success: false,
        message: '获取首页数据失败'
      });
    }

    console.log(`📊 公告表总共有 ${allAnnouncements?.length || 0} 条记录`);

    // 查询启用的公告
    const { data: announcements, error: announcementError } = await supabase
      .from('announcements')
      .select('id, title, type, created_at')
      .eq('status', 1)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);

    if (announcementError) {
      console.error('❌ Supabase公告查询错误:', announcementError);
      return res.status(500).json({
        success: false,
        message: '获取首页数据失败'
      });
    }

    console.log(`✅ 启用公告查询成功，共 ${announcements?.length || 0} 条`);

    // 修复商品图片路径
    const fixImageUrl = (products) => {
      return products.map(product => {
        let imageUrl = product.image;
        if (imageUrl && imageUrl.startsWith('/uploads/')) {
          // 如果是本地路径，设为null，避免404错误
          imageUrl = null;
        }
        return { ...product, image: imageUrl };
      });
    };

    // 格式化公告时间
    const formattedAnnouncements = (announcements || []).map(item => ({
      ...item,
      time: new Date(item.created_at).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }));

    console.log(`📅 公告时间格式化完成，共 ${formattedAnnouncements.length} 条`);

    const responseData = {
      hotProducts: fixImageUrl(hotProducts || []),
      newProducts: fixImageUrl(newProducts || []),
      announcements: formattedAnnouncements
    };

    console.log('🎉 首页数据准备完成，准备发送响应...');
    console.log(`📊 响应数据统计:`);
    console.log(`   - 热门商品: ${responseData.hotProducts.length} 条`);
    console.log(`   - 最新商品: ${responseData.newProducts.length} 条`);
    console.log(`   - 公告: ${responseData.announcements.length} 条`);

    res.json({
      success: true,
      data: responseData
    });

    console.log('✅ 首页数据响应发送成功');

  } catch (error) {
    console.error('❌ 获取首页数据错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router; 