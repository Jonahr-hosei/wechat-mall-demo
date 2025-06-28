const express = require('express');
const supabase = require('../config/database');

const router = express.Router();

// 获取用户列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sortField, sortOrder } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select('*');

    // 添加搜索条件
    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
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

    const { data: users, error } = await query;

    if (error) {
      console.error('Supabase查询错误:', error);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    // 获取总数
    let countQuery = supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (search) {
      countQuery = countQuery.or(`username.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
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
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取用户详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
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
    console.error('获取用户详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 创建用户
router.post('/', async (req, res) => {
  try {
    const {
      username,
      email,
      phone,
      password,
      role,
      status
    } = req.body;

    if (!username || !email) {
      return res.status(400).json({
        success: false,
        message: '用户名和邮箱不能为空'
      });
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{
        username,
        email,
        phone,
        password: password || '123456', // 默认密码
        role: role || 'user',
        status: status !== undefined ? parseInt(status) : 1
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase插入错误:', error);
      return res.status(500).json({
        success: false,
        message: '用户创建失败'
      });
    }

    res.json({
      success: true,
      message: '用户创建成功',
      data: { id: data.id }
    });
  } catch (error) {
    console.error('创建用户错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 更新用户
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      phone,
      password,
      role,
      status
    } = req.body;

    const updateData = {
      username,
      email,
      phone,
      role,
      status: status !== undefined ? parseInt(status) : undefined
    };

    if (password) {
      updateData.password = password;
    }

    // 移除undefined的字段
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase更新错误:', error);
      return res.status(500).json({
        success: false,
        message: '用户更新失败'
      });
    }

    res.json({
      success: true,
      message: '用户更新成功',
      data
    });
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 删除用户
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase删除错误:', error);
      return res.status(500).json({
        success: false,
        message: '用户删除失败'
      });
    }

    res.json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 更新用户状态
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('users')
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
    console.error('更新用户状态错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router; 