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

// 验证token中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '访问令牌缺失'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: '访问令牌无效'
      });
    }
    req.user = user;
    next();
  });
};

// 获取当前管理员信息
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, username, name, role, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !admin) {
      return res.status(404).json({
        success: false,
        message: '管理员不存在'
      });
    }

    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('获取管理员信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 修改密码
router.put('/change-password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: '旧密码和新密码不能为空'
    });
  }

  try {
    // 获取当前管理员信息
    const { data: admin, error } = await supabase
      .from('admins')
      .select('password')
      .eq('id', req.user.id)
      .single();

    if (error || !admin) {
      return res.status(404).json({
        success: false,
        message: '管理员不存在'
      });
    }

    const isValidOldPassword = bcrypt.compareSync(oldPassword, admin.password);
    if (!isValidOldPassword) {
      return res.status(400).json({
        success: false,
        message: '旧密码错误'
      });
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    
    const { error: updateError } = await supabase
      .from('admins')
      .update({ 
        password: hashedNewPassword, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', req.user.id);

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: '密码更新失败'
      });
    }

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router; 