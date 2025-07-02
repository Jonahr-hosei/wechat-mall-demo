const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// 获取所有会员权益（可筛选status）
router.get('/', async (req, res) => {
  const { status } = req.query;
  let query = supabase.from('member_benefits').select('*').order('min_level');
  if (status !== undefined) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, data });
});

// 新增
router.post('/', async (req, res) => {
  const { name, description, min_level, icon, tag, status } = req.body;
  const { data, error } = await supabase.from('member_benefits').insert([{ name, description, min_level, icon, tag, status }]);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, data });
});

// 编辑
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, min_level, icon, tag, status } = req.body;
  const { data, error } = await supabase.from('member_benefits').update({ name, description, min_level, icon, tag, status, updated_at: new Date() }).eq('id', id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, data });
});

// 删除
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('member_benefits').delete().eq('id', id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

module.exports = router; 