const supabase = require('./config/database');

async function quickFixAnnouncements() {
  console.log('🔧 开始快速修复公告数据...');
  
  // 检查现有公告
  const { data: existingAnnouncements, error: checkError } = await supabase
    .from('announcements')
    .select('*');
  
  if (checkError) {
    console.error('❌ 检查现有公告失败:', checkError);
    return;
  }
  
  console.log(`📊 现有公告数量: ${existingAnnouncements?.length || 0}`);
  
  // 如果没有公告数据，添加一些测试数据
  if (!existingAnnouncements || existingAnnouncements.length === 0) {
    console.log('📝 没有找到公告数据，正在添加测试数据...');
    
    const testAnnouncements = [
      {
        title: '欢迎来到微信商城',
        content: '感谢您使用我们的微信商城系统，这里有丰富的商品和优质的服务！',
        type: 'general',
        priority: 10,
        status: 1
      },
      {
        title: '新品上市通知',
        content: '最新商品已经上架，快来选购吧！限时优惠，先到先得。',
        type: 'promotion',
        priority: 8,
        status: 1
      },
      {
        title: '系统维护通知',
        content: '为了提供更好的服务，系统将于今晚进行维护升级，请提前做好准备。',
        type: 'maintenance',
        priority: 5,
        status: 1
      },
      {
        title: '积分活动开始',
        content: '购物即可获得积分，积分可以兑换优惠券和礼品，快来参与吧！',
        type: 'activity',
        priority: 7,
        status: 1
      },
      {
        title: '停车服务说明',
        content: '商场提供免费停车服务，购物满100元可免费停车2小时。',
        type: 'service',
        priority: 6,
        status: 1
      }
    ];
    
    const { data: insertedAnnouncements, error: insertError } = await supabase
      .from('announcements')
      .insert(testAnnouncements)
      .select();
    
    if (insertError) {
      console.error('❌ 插入测试公告失败:', insertError);
      return;
    }
    
    console.log(`✅ 成功添加 ${insertedAnnouncements?.length || 0} 条测试公告`);
    
    if (insertedAnnouncements) {
      console.log('\n📋 添加的公告:');
      insertedAnnouncements.forEach((announcement, index) => {
        console.log(`   ${index + 1}. ${announcement.title} (${announcement.type})`);
      });
    }
  } else {
    // 如果有数据但状态不是1，更新状态
    const disabledAnnouncements = existingAnnouncements.filter(a => a.status !== 1);
    
    if (disabledAnnouncements.length > 0) {
      console.log(`⚠️ 发现 ${disabledAnnouncements.length} 条禁用的公告，正在启用...`);
      
      const { error: updateError } = await supabase
        .from('announcements')
        .update({ status: 1 })
        .in('id', disabledAnnouncements.map(a => a.id));
      
      if (updateError) {
        console.error('❌ 更新公告状态失败:', updateError);
        return;
      }
      
      console.log('✅ 成功启用所有公告');
    } else {
      console.log('✅ 所有公告都已启用');
    }
  }
  
  // 验证修复结果
  console.log('\n🔍 验证修复结果...');
  const { data: finalAnnouncements, error: finalError } = await supabase
    .from('announcements')
    .select('*')
    .eq('status', 1)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });
  
  if (finalError) {
    console.error('❌ 验证失败:', finalError);
    return;
  }
  
  console.log(`📈 最终启用公告数量: ${finalAnnouncements?.length || 0}`);
  
  if (finalAnnouncements && finalAnnouncements.length > 0) {
    console.log('\n📋 最终公告列表:');
    finalAnnouncements.forEach((announcement, index) => {
      console.log(`   ${index + 1}. ${announcement.title} (优先级: ${announcement.priority})`);
    });
  }
  
  console.log('\n🎉 快速修复完成！');
  console.log('💡 现在可以运行以下命令测试:');
  console.log('   node test-announcements-data.js');
  console.log('   node test-announcements-api.js');
  
}

// 如果直接运行此文件
if (require.main === module) {
  quickFixAnnouncements();
}

module.exports = quickFixAnnouncements; 