const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 管理员登录
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: '用户名和密码不能为空'
    });
  }

  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !admin) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const isValidPassword = bcrypt.compareSync(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: admin.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          role: admin.role
        }
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 验证 Token
router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未提供认证令牌'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, username, name, role')
      .eq('id', decoded.id)
      .single();

    if (error || !admin) {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌'
      });
    }

    res.json({
      success: true,
      data: { admin }
    });
  } catch (error) {
    console.error('Token验证错误:', error);
    res.status(401).json({
      success: false,
      message: '无效的认证令牌'
    });
  }
});

// 创建管理员（仅超级管理员）
router.post('/create-admin', async (req, res) => {
  const { username, password, name, role } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({
      success: false,
      message: '用户名、密码和姓名不能为空'
    });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const { data, error } = await supabase
      .from('admins')
      .insert({
        username,
        password: hashedPassword,
        name,
        role: role || 'admin'
      })
      .select();

    if (error) {
      console.error('创建管理员失败:', error);
      return res.status(500).json({
        success: false,
        message: '创建管理员失败'
      });
    }

    res.json({
      success: true,
      message: '管理员创建成功',
      data: {
        id: data[0].id,
        username: data[0].username,
        name: data[0].name,
        role: data[0].role
      }
    });
  } catch (error) {
    console.error('创建管理员错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取管理员列表
router.get('/admins', async (req, res) => {
  try {
    const { data: admins, error } = await supabase
      .from('admins')
      .select('id, username, name, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取管理员列表失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取管理员列表失败'
      });
    }

    res.json({
      success: true,
      data: admins
    });
  } catch (error) {
    console.error('获取管理员列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router; 