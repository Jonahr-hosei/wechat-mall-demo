const supabase = require('./config/database');

async function testAnnouncements() {
  try {
    console.log('🔍 测试公告数据...');
    
    // 测试数据库连接
    console.log('1. 测试数据库连接...');
    const { data: testData, error: testError } = await supabase
      .from('announcements')
      .select('count', { count: 'exact', head: true });

    if (testError) {
      console.error('❌ 数据库连接失败:', testError);
      return;
    }
    console.log('✅ 数据库连接成功');

    // 查询所有公告
    console.log('2. 查询所有公告...');
    const { data: allAnnouncements, error: allError } = await supabase
      .from('announcements')
      .select('*');

    if (allError) {
      console.error('❌ 查询所有公告失败:', allError);
      return;
    }
    console.log('✅ 查询成功，公告数量:', allAnnouncements.length);
    console.log('📋 公告列表:');
    allAnnouncements.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.title} (${item.type}) - 状态: ${item.status}`);
    });

    // 查询启用的公告
    console.log('3. 查询启用的公告...');
    const { data: activeAnnouncements, error: activeError } = await supabase
      .from('announcements')
      .select('id, title, type, created_at')
      .eq('status', 1)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);

    if (activeError) {
      console.error('❌ 查询启用公告失败:', activeError);
      return;
    }
    console.log('✅ 查询成功，启用公告数量:', activeAnnouncements.length);
    console.log('📋 启用公告列表:');
    activeAnnouncements.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.title} (${item.type}) - 创建时间: ${item.created_at}`);
    });

    // 格式化时间测试
    console.log('4. 测试时间格式化...');
    const formattedAnnouncements = (activeAnnouncements || []).map(item => ({
      ...item,
      time: new Date(item.created_at).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }));
    
    console.log('✅ 时间格式化成功:');
    formattedAnnouncements.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.title} - 时间: ${item.time}`);
    });

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  testAnnouncements();
}

module.exports = testAnnouncements; 