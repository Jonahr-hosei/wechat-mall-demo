const express = require('express');
const supabase = require('../config/database');

const router = express.Router();

// 获取积分记录列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, user_id, type } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('point_records')
      .select(`
        *,
        users(username)
      `);

    // 添加过滤条件
    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    if (type) {
      query = query.eq('type', type);
    }

    // 添加排序和分页
    query = query.order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: records, error } = await query;

    if (error) {
      console.error('Supabase查询错误:', error);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    // 获取总数
    let countQuery = supabase
      .from('point_records')
      .select('*', { count: 'exact', head: true });

    if (user_id) {
      countQuery = countQuery.eq('user_id', user_id);
    }

    if (type) {
      countQuery = countQuery.eq('type', type);
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

// 创建积分记录
router.post('/', async (req, res) => {
  try {
    const { user_id, type, points, description } = req.body;

    if (!user_id || !type || !points) {
      return res.status(400).json({
        success: false,
        message: '用户ID、类型和积分不能为空'
      });
    }

    const { data, error } = await supabase
      .from('point_records')
      .insert([{
        user_id: parseInt(user_id),
        type,
        points: parseInt(points),
        description: description || ''
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase插入错误:', error);
      return res.status(500).json({
        success: false,
        message: '积分记录创建失败'
      });
    }

    res.json({
      success: true,
      message: '积分记录创建成功',
      data: { id: data.id }
    });
  } catch (error) {
    console.error('创建积分记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取积分统计
router.get('/statistics', async (req, res) => {
  try {
    const { user_id } = req.query;

    let query = supabase
      .from('point_records')
      .select('*');

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const { data: records, error } = await query;

    if (error) {
      console.error('Supabase查询错误:', error);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    // 计算统计数据
    const totalPoints = records.reduce((sum, record) => sum + (record.points || 0), 0);
    const earnPoints = records
      .filter(record => record.points > 0)
      .reduce((sum, record) => sum + record.points, 0);
    const spendPoints = records
      .filter(record => record.points < 0)
      .reduce((sum, record) => sum + Math.abs(record.points), 0);

    res.json({
      success: true,
      data: {
        totalPoints,
        earnPoints,
        spendPoints,
        recordCount: records.length
      }
    });
  } catch (error) {
    console.error('获取积分统计错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router; 