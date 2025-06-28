const express = require('express');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');
const supabase = require('../config/database');

const router = express.Router();

// 配置 Supabase 客户端
const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

// 权限验证中间件
const requireAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未提供认证令牌' });
    }

    // 验证JWT token并获取用户信息
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ success: false, message: '无效的认证令牌' });
    }

    // 检查用户是否为管理员
    const { data: admin, error: adminError } = await supabaseClient
      .from('admins')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminError || !admin || admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: '需要管理员权限' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('权限验证错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

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

// 获取后台管理系统用户列表
router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const offset = (page - 1) * limit;

    let query = supabaseClient
      .from('admins')
      .select('*');

    // 添加搜索条件
    if (search) {
      query = query.or(`username.ilike.%${search}%,name.ilike.%${search}%`);
    }

    // 添加角色过滤
    if (role) {
      query = query.eq('role', role);
    }

    // 添加排序和分页
    query = query.order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: users, error } = await query;

    if (error) {
      console.error('Supabase查询错误:', error);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    // 获取总数
    let countQuery = supabaseClient
      .from('admins')
      .select('*', { count: 'exact', head: true });

    if (search) {
      countQuery = countQuery.or(`username.ilike.%${search}%,name.ilike.%${search}%`);
    }

    if (role) {
      countQuery = countQuery.eq('role', role);
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

// 创建后台管理系统用户
router.post('/admin', requireAdmin, async (req, res) => {
  try {
    const { username, password, name, role = 'user' } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({
        success: false,
        message: '用户名、密码和姓名不能为空'
      });
    }

    // 检查用户名是否已存在
    const { data: existingUser, error: checkError } = await supabaseClient
      .from('admins')
      .select('id')
      .eq('username', username)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('检查用户存在性错误:', checkError);
      return res.status(500).json({
        success: false,
        message: '数据库错误'
      });
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名已存在'
      });
    }

    // 加密密码
    const hashedPassword = bcrypt.hashSync(password, 10);

    // 创建用户
    const { data: newUser, error } = await supabaseClient
      .from('admins')
      .insert([{
        username,
        password: hashedPassword,
        name,
        role
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

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = newUser;

    res.json({
      success: true,
      message: '用户创建成功',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('创建用户错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 更新后台管理系统用户
router.put('/admin/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, name, role } = req.body;

    const updateData = {
      username,
      name,
      role
    };

    // 如果提供了新密码，则加密
    if (password) {
      updateData.password = bcrypt.hashSync(password, 10);
    }

    // 移除undefined的字段
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const { data: updatedUser, error } = await supabaseClient
      .from('admins')
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

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: '用户更新成功',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 删除后台管理系统用户
router.delete('/admin/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // 防止删除自己
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (user && parseInt(id) === user.id) {
      return res.status(400).json({
        success: false,
        message: '不能删除自己的账户'
      });
    }

    const { error } = await supabaseClient
      .from('admins')
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

module.exports = router; 