const express = require('express');
const supabase = require('../config/database');

const router = express.Router();

// 获取公告列表（小程序端）
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('announcements')
      .select('*')
      .eq('status', 1)
      .lte('start_time', new Date().toISOString())
      .or(`end_time.is.null,end_time.gte.${new Date().toISOString()}`);

    // 添加类型过滤
    if (type && type !== '') {
      query = query.eq('type', type);
    }

    // 添加排序和分页
    query = query.order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: announcements, error } = await query;

    if (error) {
      console.error('Supabase查询错误:', error);
      return res.status(500).json({
        success: false,
        message: '获取公告列表失败'
      });
    }

    // 获取总数
    let countQuery = supabase
      .from('announcements')
      .select('*', { count: 'exact', head: true })
      .eq('status', 1)
      .lte('start_time', new Date().toISOString())
      .or(`end_time.is.null,end_time.gte.${new Date().toISOString()}`);

    if (type && type !== '') {
      countQuery = countQuery.eq('type', type);
    }

    const { count: total, error: countError } = await countQuery;

    if (countError) {
      console.error('Supabase计数错误:', countError);
      return res.status(500).json({
        success: false,
        message: '获取公告列表失败'
      });
    }

    res.json({
      success: true,
      data: announcements || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('获取公告列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取公告详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: announcement, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', id)
      .eq('status', 1)
      .single();

    if (error) {
      console.error('Supabase查询错误:', error);
      return res.status(500).json({
        success: false,
        message: '获取公告详情失败'
      });
    }

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: '公告不存在或已禁用'
      });
    }

    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('获取公告详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取首页公告（小程序端）
router.get('/home/list', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const { data: announcements, error } = await supabase
      .from('announcements')
      .select('id, title, type, created_at')
      .eq('status', 1)
      .lte('start_time', new Date().toISOString())
      .or(`end_time.is.null,end_time.gte.${new Date().toISOString()}`)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error('Supabase查询错误:', error);
      return res.status(500).json({
        success: false,
        message: '获取首页公告失败'
      });
    }

    // 格式化时间
    const formattedAnnouncements = (announcements || []).map(item => ({
      ...item,
      time: new Date(item.created_at).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }));

    res.json({
      success: true,
      data: formattedAnnouncements
    });
  } catch (error) {
    console.error('获取首页公告错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 管理员：创建公告
router.post('/', async (req, res) => {
  try {
    const { title, content, type = 'general', priority = 0, start_time, end_time } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: '标题和内容不能为空'
      });
    }

    const { data: announcement, error } = await supabase
      .from('announcements')
      .insert([
        {
          title,
          content,
          type,
          priority,
          start_time: start_time || new Date().toISOString(),
          end_time: end_time || null
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase插入错误:', error);
      return res.status(500).json({
        success: false,
        message: '创建公告失败'
      });
    }

    res.json({
      success: true,
      message: '公告创建成功',
      data: announcement
    });
  } catch (error) {
    console.error('创建公告错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 管理员：更新公告
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, priority, status, start_time, end_time } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (type !== undefined) updateData.type = type;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (start_time !== undefined) updateData.start_time = start_time;
    if (end_time !== undefined) updateData.end_time = end_time;

    const { data: announcement, error } = await supabase
      .from('announcements')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase更新错误:', error);
      return res.status(500).json({
        success: false,
        message: '更新公告失败'
      });
    }

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: '公告不存在'
      });
    }

    res.json({
      success: true,
      message: '公告更新成功',
      data: announcement
    });
  } catch (error) {
    console.error('更新公告错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 管理员：删除公告
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase删除错误:', error);
      return res.status(500).json({
        success: false,
        message: '删除公告失败'
      });
    }

    res.json({
      success: true,
      message: '公告删除成功'
    });
  } catch (error) {
    console.error('删除公告错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 管理员：获取所有公告（管理端）
router.get('/admin/all', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('announcements')
      .select('*');

    // 添加类型过滤
    if (type && type !== '') {
      query = query.eq('type', type);
    }

    // 添加状态过滤
    if (status !== undefined && status !== '') {
      query = query.eq('status', parseInt(status));
    }

    // 添加排序和分页
    query = query.order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: announcements, error } = await query;

    if (error) {
      console.error('Supabase查询错误:', error);
      return res.status(500).json({
        success: false,
        message: '获取公告列表失败'
      });
    }

    // 获取总数
    let countQuery = supabase
      .from('announcements')
      .select('*', { count: 'exact', head: true });

    if (type && type !== '') {
      countQuery = countQuery.eq('type', type);
    }

    if (status !== undefined && status !== '') {
      countQuery = countQuery.eq('status', parseInt(status));
    }

    const { count: total, error: countError } = await countQuery;

    if (countError) {
      console.error('Supabase计数错误:', countError);
      return res.status(500).json({
        success: false,
        message: '获取公告列表失败'
      });
    }

    res.json({
      success: true,
      data: announcements || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('获取公告列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router; 