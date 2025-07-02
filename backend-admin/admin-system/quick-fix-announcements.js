const supabase = require('./config/database');

async function quickFixAnnouncements() {
  console.log('🔧 开始快速修复公告功能...\n');

  try {
    // 1. 检查数据库连接
    console.log('1️⃣ 检查数据库连接...');
    const { data: testData, error: testError } = await supabase
      .from('announcements')
      .select('count', { count: 'exact', head: true });

    if (testError) {
      console.error('❌ 数据库连接失败:', testError.message);
      console.log('💡 解决方案: 请检查环境变量配置');
      return;
    }
    console.log('✅ 数据库连接成功\n');

    // 2. 检查公告表是否存在数据
    console.log('2️⃣ 检查公告数据...');
    const { data: announcements, error: dataError } = await supabase
      .from('announcements')
      .select('*');

    if (dataError) {
      console.error('❌ 查询公告数据失败:', dataError.message);
      console.log('💡 解决方案: 请执行SQL脚本创建表');
      return;
    }

    if (!announcements || announcements.length === 0) {
      console.log('⚠️  公告表为空，正在插入示例数据...');
      
      // 插入示例数据
      const { data: insertData, error: insertError } = await supabase
        .from('announcements')
        .insert([
          {
            title: '欢迎光临我们的商场',
            content: '感谢您选择我们的商场，我们致力于为您提供最优质的服务和商品。',
            type: 'general',
            priority: 1,
            status: 1
          },
          {
            title: '商场营业时间调整',
            content: '为了更好地服务顾客，我们的营业时间调整为：周一至周日 9:00-22:00。',
            type: 'important',
            priority: 2,
            status: 1
          },
          {
            title: '新春特惠活动',
            content: '新春佳节即将到来，全场商品8折起，更有精美礼品相送！',
            type: 'promotion',
            priority: 3,
            status: 1
          }
        ]);

      if (insertError) {
        console.error('❌ 插入示例数据失败:', insertError.message);
        return;
      }
      console.log('✅ 示例数据插入成功\n');
    } else {
      console.log(`✅ 公告数据正常，共 ${announcements.length} 条记录\n`);
    }

    // 3. 测试首页API查询
    console.log('3️⃣ 测试首页API查询...');
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

    console.log(`✅ 首页API查询成功，返回 ${homeAnnouncements.length} 条公告`);
    homeAnnouncements.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.title} (${item.type})`);
    });
    console.log('');

    // 4. 测试时间格式化
    console.log('4️⃣ 测试时间格式化...');
    const formattedAnnouncements = homeAnnouncements.map(item => ({
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

    // 5. 生成测试响应
    console.log('5️⃣ 生成测试响应...');
    const testResponse = {
      success: true,
      data: {
        hotProducts: [],
        newProducts: [],
        announcements: formattedAnnouncements
      }
    };

    console.log('✅ 测试响应生成成功');
    console.log('📋 响应数据结构:');
    console.log(JSON.stringify(testResponse, null, 2));
    console.log('');

    // 6. 检查小程序配置
    console.log('6️⃣ 检查小程序配置...');
    console.log('📱 小程序端检查清单:');
    console.log('   - 确保 request.js 中的 baseUrl 配置正确');
    console.log('   - 确保微信开发者工具中已配置域名白名单');
    console.log('   - 检查小程序控制台是否有错误信息');
    console.log('   - 清除小程序缓存并重新编译');
    console.log('');

    console.log('🎉 快速修复完成！');
    console.log('');
    console.log('📋 下一步操作:');
    console.log('1. 启动后端服务器: npm start');
    console.log('2. 在微信开发者工具中刷新小程序');
    console.log('3. 查看首页是否显示公告');
    console.log('4. 如果仍有问题，请查看调试指南');

  } catch (error) {
    console.error('❌ 快速修复失败:', error.message);
    console.log('');
    console.log('💡 建议操作:');
    console.log('1. 检查环境变量配置');
    console.log('2. 确认Supabase项目设置');
    console.log('3. 查看详细错误信息');
  }
}

// 如果直接运行此文件
if (require.main === module) {
  quickFixAnnouncements();
}

module.exports = quickFixAnnouncements; 