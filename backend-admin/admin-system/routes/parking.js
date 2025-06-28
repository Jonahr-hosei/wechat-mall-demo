const express = require('express');
const supabase = require('../config/database');

const router = express.Router();

// 获取停车记录列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, user_id, status } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('parking_records')
      .select(`
        *,
        users(username, phone)
      `);

    // 添加过滤条件
    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    if (status) {
      query = query.eq('status', status);
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
      .from('parking_records')
      .select('*', { count: 'exact', head: true });

    if (user_id) {
      countQuery = countQuery.eq('user_id', user_id);
    }

    if (status) {
      countQuery = countQuery.eq('status', status);
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
    console.error('获取停车记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 创建停车记录
router.post('/', async (req, res) => {
  try {
    const { user_id, plate_number } = req.body;

    if (!user_id || !plate_number) {
      return res.status(400).json({
        success: false,
        message: '用户ID和车牌号不能为空'
      });
    }

    const { data, error } = await supabase
      .from('parking_records')
      .insert([{
        user_id: parseInt(user_id),
        plate_number,
        entry_time: new Date().toISOString(),
        status: 'parking'
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase插入错误:', error);
      return res.status(500).json({
        success: false,
        message: '停车记录创建失败'
      });
    }

    res.json({
      success: true,
      message: '停车记录创建成功',
      data: { id: data.id }
    });
  } catch (error) {
    console.error('创建停车记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 更新停车记录（出场）
router.put('/:id/exit', async (req, res) => {
  try {
    const { id } = req.params;

    // 获取入场时间
    const { data: record, error: fetchError } = await supabase
      .from('parking_records')
      .select('entry_time')
      .eq('id', id)
      .eq('status', 'parking')
      .single();

    if (fetchError || !record) {
      return res.status(404).json({
        success: false,
        message: '停车记录不存在或已完成'
      });
    }

    const exitTime = new Date();
    const entryTime = new Date(record.entry_time);
    const durationMinutes = Math.floor((exitTime - entryTime) / (1000 * 60));
    const fee = Math.max(1, durationMinutes * 2); // 每小时2元，最少1元

    const { data: updatedRecord, error } = await supabase
      .from('parking_records')
      .update({
        exit_time: exitTime.toISOString(),
        duration_minutes: durationMinutes,
        fee: fee,
        status: 'completed'
      })
      .eq('id', id)
      .eq('status', 'parking')
      .select()
      .single();

    if (error) {
      console.error('Supabase更新错误:', error);
      return res.status(500).json({
        success: false,
        message: '停车记录更新失败'
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

// 获取停车统计
router.get('/statistics', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 获取总停车记录数
    const { count: total, error: totalError } = await supabase
      .from('parking_records')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('Supabase总记录数查询错误:', totalError);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    // 获取今日停车记录数
    const { count: todayCount, error: todayError } = await supabase
      .from('parking_records')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    if (todayError) {
      console.error('Supabase今日记录数查询错误:', todayError);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    // 获取当前停车中的车辆数
    const { count: parkingCount, error: parkingError } = await supabase
      .from('parking_records')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'parking');

    if (parkingError) {
      console.error('Supabase停车中车辆数查询错误:', parkingError);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    // 获取总收入
    const { data: completedRecords, error: incomeError } = await supabase
      .from('parking_records')
      .select('fee')
      .eq('status', 'completed');

    if (incomeError) {
      console.error('Supabase收入查询错误:', incomeError);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    const totalIncome = completedRecords.reduce((sum, record) => sum + (record.fee || 0), 0);

    res.json({
      success: true,
      data: {
        total: total || 0,
        today: todayCount || 0,
        parking: parkingCount || 0,
        totalIncome: totalIncome
      }
    });
  } catch (error) {
    console.error('获取停车统计错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router; 