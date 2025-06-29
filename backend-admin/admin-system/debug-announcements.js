const supabase = require('./config/database');

async function debugAnnouncements() {
  console.log('🔍 开始调试公告数据问题...\n');

  try {
    // 1. 检查数据库连接
    console.log('1️⃣ 检查数据库连接...');
    const { data: testData, error: testError } = await supabase
      .from('announcements')
      .select('count', { count: 'exact', head: true });

    if (testError) {
      console.error('❌ 数据库连接失败:', testError.message);
      console.log('💡 可能原因:');
      console.log('   - 环境变量未配置');
      console.log('   - Supabase项目设置错误');
      console.log('   - 网络连接问题');
      return;
    }
    console.log('✅ 数据库连接成功\n');

    // 2. 检查公告表是否存在数据
    console.log('2️⃣ 检查公告表数据...');
    const { data: allAnnouncements, error: allError } = await supabase
      .from('announcements')
      .select('*');

    if (allError) {
      console.error('❌ 查询公告表失败:', allError.message);
      console.log('💡 可能原因:');
      console.log('   - 公告表不存在');
      console.log('   - 表名拼写错误');
      console.log('   - 权限不足');
      return;
    }

    console.log(`✅ 公告表查询成功，共 ${allAnnouncements.length} 条记录`);
    if (allAnnouncements.length > 0) {
      console.log('📋 所有公告:');
      allAnnouncements.forEach((item, index) => {
        console.log(`   ${index + 1}. ID: ${item.id}, 标题: ${item.title}, 状态: ${item.status}, 类型: ${item.type}`);
      });
    }
    console.log('');

    // 3. 测试首页API的查询逻辑
    console.log('3️⃣ 测试首页API查询逻辑...');
    const { data: homeAnnouncements, error: homeError } = await supabase
      .from('announcements')
      .select('id, title, type, created_at')
      .eq('status', 1)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);

    if (homeError) {
      console.error('❌ 首页API查询失败:', homeError.message);
      return;
    }

    console.log(`✅ 首页API查询成功，返回 ${homeAnnouncements.length} 条启用公告`);
    if (homeAnnouncements.length > 0) {
      console.log('📋 启用公告:');
      homeAnnouncements.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.title} (${item.type}) - 创建时间: ${item.created_at}`);
      });
    } else {
      console.log('⚠️  没有启用的公告（status=1）');
      console.log('💡 解决方案: 检查公告的status字段是否为1');
    }
    console.log('');

    // 4. 测试时间格式化
    console.log('4️⃣ 测试时间格式化...');
    const formattedAnnouncements = (homeAnnouncements || []).map(item => ({
      ...item,
      time: new Date(item.created_at).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }));

    console.log('✅ 时间格式化成功');
    formattedAnnouncements.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.title} - ${item.time}`);
    });
    console.log('');

    // 5. 生成完整的API响应
    console.log('5️⃣ 生成完整API响应...');
    const apiResponse = {
      success: true,
      data: {
        hotProducts: [],
        newProducts: [],
        announcements: formattedAnnouncements
      }
    };

    console.log('✅ API响应生成成功');
    console.log('📋 响应数据:');
    console.log(JSON.stringify(apiResponse, null, 2));
    console.log('');

    // 6. 检查可能的问题
    console.log('6️⃣ 问题诊断...');
    
    if (allAnnouncements.length === 0) {
      console.log('❌ 问题: 公告表为空');
      console.log('💡 解决方案: 执行SQL脚本插入数据');
    } else if (homeAnnouncements.length === 0) {
      console.log('❌ 问题: 没有启用的公告');
      console.log('💡 解决方案: 将公告的status字段设置为1');
    } else {
      console.log('✅ 数据正常，问题可能在前端或网络');
    }

    console.log('');
    console.log('🎯 建议的修复步骤:');
    console.log('1. 如果公告表为空，执行SQL脚本');
    console.log('2. 如果公告未启用，更新status字段');
    console.log('3. 检查前端网络请求');
    console.log('4. 查看服务器日志');

  } catch (error) {
    console.error('❌ 调试失败:', error.message);
    console.log('');
    console.log('💡 建议操作:');
    console.log('1. 检查环境变量配置');
    console.log('2. 确认Supabase项目设置');
    console.log('3. 查看详细错误信息');
  }
}

// 如果直接运行此文件
if (require.main === module) {
  debugAnnouncements();
}

module.exports = debugAnnouncements; 