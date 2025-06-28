const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 测试 Supabase 连接...');
  
  // 检查环境变量
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  console.log('📋 环境变量检查:');
  console.log(`SUPABASE_URL: ${supabaseUrl ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`SUPABASE_ANON_KEY: ${supabaseKey ? '✅ 已配置' : '❌ 未配置'}`);
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 请先配置 Supabase 环境变量！');
    console.log('📝 请编辑 .env 文件，填入您的 Supabase 项目信息：');
    console.log('SUPABASE_URL=https://your-project-id.supabase.co');
    console.log('SUPABASE_ANON_KEY=your_anon_key_here');
    return;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 测试连接 - 尝试查询一个表
    console.log('🔗 正在连接 Supabase...');
    
    const { data, error } = await supabase
      .from('admins')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ 连接失败:', error.message);
      console.log('💡 可能的原因：');
      console.log('1. Supabase URL 或 API Key 不正确');
      console.log('2. 数据库表尚未创建');
      console.log('3. 网络连接问题');
      return;
    }
    
    console.log('✅ Supabase 连接成功！');
    console.log('📊 数据库表访问正常');
    
    // 检查表是否存在
    console.log('🔍 检查数据库表...');
    
    const tables = ['admins', 'users', 'categories', 'products', 'orders', 'order_items', 'point_records', 'parking_records', 'coupons', 'user_coupons'];
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (tableError) {
          console.log(`❌ 表 ${table}: 不存在或无法访问`);
        } else {
          console.log(`✅ 表 ${table}: 存在且可访问`);
        }
      } catch (err) {
        console.log(`❌ 表 ${table}: 检查失败`);
      }
    }
    
  } catch (error) {
    console.error('❌ 连接测试失败:', error.message);
  }
}

// 运行测试
testConnection(); 