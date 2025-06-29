// 测试公告数据库连接和数据
const supabase = require('./config/database');

async function testAnnouncementsData() {
  try {
    console.log('🔍 开始测试公告数据库...');
    
    // 测试连接
    console.log('📡 测试数据库连接...');
    const { data: testData, error: testError } = await supabase
      .from('announcements')
      .select('count', { count: 'exact', head: true });
    
    if (testError) {
      console.error('❌ 数据库连接失败:', testError);
      return;
    }
    
    console.log('✅ 数据库连接成功');
    
    // 查询所有公告
    console.log('\n📊 查询所有公告...');
    const { data: allAnnouncements, error: allError } = await supabase
      .from('announcements')
      .select('*');
    
    if (allError) {
      console.error('❌ 查询所有公告失败:', allError);
      return;
    }
    
    console.log(`📈 公告表总共有 ${allAnnouncements?.length || 0} 条记录`);
    
    if (allAnnouncements && allAnnouncements.length > 0) {
      console.log('\n📋 所有公告:');
      allAnnouncements.forEach((announcement, index) => {
        console.log(`   ${index + 1}. ID: ${announcement.id}, 标题: ${announcement.title}, 状态: ${announcement.status}, 类型: ${announcement.type}`);
      });
    }
    
    // 查询启用的公告
    console.log('\n✅ 查询启用的公告...');
    const { data: enabledAnnouncements, error: enabledError } = await supabase
      .from('announcements')
      .select('*')
      .eq('status', 1);
    
    if (enabledError) {
      console.error('❌ 查询启用公告失败:', enabledError);
      return;
    }
    
    console.log(`📈 启用的公告有 ${enabledAnnouncements?.length || 0} 条`);
    
    if (enabledAnnouncements && enabledAnnouncements.length > 0) {
      console.log('\n📋 启用的公告:');
      enabledAnnouncements.forEach((announcement, index) => {
        console.log(`   ${index + 1}. ID: ${announcement.id}, 标题: ${announcement.title}, 类型: ${announcement.type}`);
      });
    } else {
      console.log('⚠️ 没有启用的公告，这可能是问题所在！');
    }
    
    // 查询首页公告（按优先级和创建时间排序）
    console.log('\n🏠 查询首页公告...');
    const { data: homeAnnouncements, error: homeError } = await supabase
      .from('announcements')
      .select('id, title, type, created_at, priority')
      .eq('status', 1)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (homeError) {
      console.error('❌ 查询首页公告失败:', homeError);
      return;
    }
    
    console.log(`📈 首页公告有 ${homeAnnouncements?.length || 0} 条`);
    
    if (homeAnnouncements && homeAnnouncements.length > 0) {
      console.log('\n📋 首页公告:');
      homeAnnouncements.forEach((announcement, index) => {
        console.log(`   ${index + 1}. ID: ${announcement.id}, 标题: ${announcement.title}, 优先级: ${announcement.priority}, 创建时间: ${announcement.created_at}`);
      });
    }
    
    console.log('\n🎉 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testAnnouncementsData(); 