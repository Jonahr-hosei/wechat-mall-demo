const express = require('express');
const supabase = require('../config/database');

const router = express.Router();

// 获取订单列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, sortField, sortOrder } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('orders')
      .select(`
        *,
        users(username, phone)
      `);

    // 添加过滤条件
    if (status !== undefined && status !== '') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`order_no.ilike.%${search}%,users.username.ilike.%${search}%,users.phone.ilike.%${search}%`);
    }

    // 添加排序
    if (sortField && sortOrder) {
      const order = sortOrder === 'descend' ? 'desc' : 'asc';
      query = query.order(sortField, { ascending: order === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // 添加分页
    query = query.range(offset, offset + limit - 1);

    const { data: orders, error } = await query;

    if (error) {
      console.error('Supabase查询错误:', error);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    // 获取总数
    let countQuery = supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (status !== undefined && status !== '') {
      countQuery = countQuery.eq('status', status);
    }

    if (search) {
      countQuery = countQuery.or(`order_no.ilike.%${search}%`);
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
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        users(username, phone),
        order_items(
          *,
          products(name, price, image)
        )
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

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('获取订单详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 创建订单
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      total_amount,
      items,
      address,
      phone,
      remark
    } = req.body;

    if (!user_id || !total_amount || !items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: '订单信息不完整'
      });
    }

    // 生成订单号
    const orderNo = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();

    // 创建订单
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        order_no: orderNo,
        user_id: parseInt(user_id),
        total_amount: parseFloat(total_amount),
        status: 0, // 待支付
        address,
        phone,
        remark
      }])
      .select()
      .single();

    if (orderError) {
      console.error('Supabase订单创建错误:', orderError);
      return res.status(500).json({
        success: false,
        message: '订单创建失败'
      });
    }

    // 创建订单项
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: parseInt(item.product_id),
      quantity: parseInt(item.quantity),
      price: parseFloat(item.price)
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

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
      data: { id: order.id, order_no: order.order_no }
    });
  } catch (error) {
    console.error('创建订单错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 更新订单状态
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('orders')
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
    console.error('更新订单状态错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 取消订单
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    // 检查订单状态
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('status, total_amount')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '只能取消待支付的订单'
      });
    }

    // 更新订单状态
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) {
      console.error('Supabase取消订单错误:', error);
      return res.status(500).json({
        success: false,
        message: '订单取消失败'
      });
    }

    res.json({
      success: true,
      message: '订单取消成功'
    });
  } catch (error) {
    console.error('取消订单错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 删除订单
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 先删除订单项
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', id);

    if (itemsError) {
      console.error('Supabase订单项删除错误:', itemsError);
      return res.status(500).json({
        success: false,
        message: '订单项删除失败'
      });
    }

    // 再删除订单
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase订单删除错误:', error);
      return res.status(500).json({
        success: false,
        message: '订单删除失败'
      });
    }

    res.json({
      success: true,
      message: '订单删除成功'
    });
  } catch (error) {
    console.error('删除订单错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取订单统计
router.get('/statistics/summary', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 获取总订单数
    const { count: total, error: totalError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('Supabase总订单数查询错误:', totalError);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    // 获取今日订单数
    const { count: todayCount, error: todayError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    if (todayError) {
      console.error('Supabase今日订单数查询错误:', todayError);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    // 获取总金额
    const { data: totalAmount, error: amountError } = await supabase
      .from('orders')
      .select('total_amount');

    if (amountError) {
      console.error('Supabase总金额查询错误:', amountError);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    const totalAmountSum = totalAmount.reduce((sum, order) => sum + (order.total_amount || 0), 0);

    res.json({
      success: true,
      data: {
        total: total || 0,
        today: todayCount || 0,
        totalAmount: totalAmountSum
      }
    });
  } catch (error) {
    console.error('获取订单统计错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router; 