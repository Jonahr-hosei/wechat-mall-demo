const express = require('express');
const supabase = require('../config/database');

const router = express.Router();

// 获取总体统计
router.get('/overview', async (req, res) => {
  try {
    // 获取用户统计
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      console.error('Supabase用户统计错误:', usersError);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    // 获取商品统计
    const { count: totalProducts, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (productsError) {
      console.error('Supabase商品统计错误:', productsError);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    // 获取订单统计
    const { count: totalOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (ordersError) {
      console.error('Supabase订单统计错误:', ordersError);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    // 获取总收入
    const { data: orders, error: incomeError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'completed');

    if (incomeError) {
      console.error('Supabase收入统计错误:', incomeError);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    const totalIncome = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

    res.json({
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        totalIncome: totalIncome
      }
    });
  } catch (error) {
    console.error('获取总体统计错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取今日统计
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 获取今日新增用户
    const { count: todayUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    if (usersError) {
      console.error('Supabase今日用户统计错误:', usersError);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    // 获取今日新增商品
    const { count: todayProducts, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    if (productsError) {
      console.error('Supabase今日商品统计错误:', productsError);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    // 获取今日订单
    const { count: todayOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    if (ordersError) {
      console.error('Supabase今日订单统计错误:', ordersError);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    // 获取今日收入
    const { data: todayCompletedOrders, error: incomeError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'completed')
      .gte('created_at', today);

    if (incomeError) {
      console.error('Supabase今日收入统计错误:', incomeError);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    const todayIncome = todayCompletedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

    res.json({
      success: true,
      data: {
        todayUsers: todayUsers || 0,
        todayProducts: todayProducts || 0,
        todayOrders: todayOrders || 0,
        todayIncome: todayIncome
      }
    });
  } catch (error) {
    console.error('获取今日统计错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取订单状态统计
router.get('/orders/status', async (req, res) => {
  try {
    // 获取各状态订单数量
    const statuses = ['pending', 'processing', 'completed', 'cancelled'];
    const statusCounts = {};

    for (const status of statuses) {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);

      if (error) {
        console.error(`Supabase ${status} 订单统计错误:`, error);
        statusCounts[status] = 0;
      } else {
        statusCounts[status] = count || 0;
      }
    }

    res.json({
      success: true,
      data: statusCounts
    });
  } catch (error) {
    console.error('获取订单状态统计错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取商品分类统计
router.get('/products/categories', async (req, res) => {
  try {
    // 获取所有分类
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) {
      console.error('Supabase分类查询错误:', categoriesError);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    // 获取每个分类的商品数量
    const categoryStats = [];
    for (const category of categories || []) {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id);

      if (error) {
        console.error(`Supabase分类 ${category.id} 商品统计错误:`, error);
        categoryStats.push({
          category_id: category.id,
          category_name: category.name,
          product_count: 0
        });
      } else {
        categoryStats.push({
          category_id: category.id,
          category_name: category.name,
          product_count: count || 0
        });
      }
    }

    res.json({
      success: true,
      data: categoryStats
    });
  } catch (error) {
    console.error('获取商品分类统计错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取销售趋势（最近7天）
router.get('/sales/trend', async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 获取最近7天的订单
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .eq('status', 'completed')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase销售趋势查询错误:', error);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    // 按日期分组计算收入
    const dailySales = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailySales[dateStr] = 0;
    }

    // 计算每天的收入
    orders.forEach(order => {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0];
      if (dailySales[orderDate] !== undefined) {
        dailySales[orderDate] += order.total_amount || 0;
      }
    });

    // 转换为数组格式
    const trendData = Object.keys(dailySales).map(date => ({
      date,
      sales: dailySales[date]
    })).reverse();

    res.json({
      success: true,
      data: trendData
    });
  } catch (error) {
    console.error('获取销售趋势错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router; 