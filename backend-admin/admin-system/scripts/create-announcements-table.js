const fs = require('fs');
const path = require('path');
const supabase = require('../config/database');

async function createAnnouncementsTable() {
  try {
    console.log('🚀 开始创建公告表...');
    
    // 读取SQL文件
    const sqlPath = path.join(__dirname, '../database/create_announcements_table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 SQL文件读取成功');
    
    // 执行SQL语句
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ 执行SQL失败:', error);
      return;
    }
    
    console.log('✅ 公告表创建成功！');
    
    // 验证表是否创建成功
    const { data: announcements, error: queryError } = await supabase
      .from('announcements')
      .select('*')
      .limit(1);
    
    if (queryError) {
      console.error('❌ 验证表创建失败:', queryError);
      return;
    }
    
    console.log('✅ 公告表验证成功，示例数据已插入');
    console.log('📊 公告表结构：');
    console.log('- id: 主键');
    console.log('- title: 公告标题');
    console.log('- content: 公告内容');
    console.log('- type: 公告类型 (general/important/promotion)');
    console.log('- status: 状态 (1:启用/0:禁用)');
    console.log('- priority: 优先级');
    console.log('- start_time: 开始时间');
    console.log('- end_time: 结束时间');
    console.log('- created_at: 创建时间');
    console.log('- updated_at: 更新时间');
    
  } catch (error) {
    console.error('❌ 创建公告表失败:', error);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  createAnnouncementsTable();
}

module.exports = createAnnouncementsTable; 