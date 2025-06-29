const axios = require('axios');

// 测试首页API
async function testHomeAPI() {
  try {
    console.log('🚀 开始测试首页API...');
    
    const response = await axios.get('https://wechat-mall-demo.vercel.app/api/mall/home');
    
    console.log('✅ API响应状态:', response.status);
    console.log('📊 响应数据:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      const data = response.data.data;
      console.log('\n📈 数据统计:');
      console.log(`   - 热门商品: ${data.hotProducts?.length || 0} 条`);
      console.log(`   - 最新商品: ${data.newProducts?.length || 0} 条`);
      console.log(`   - 公告: ${data.announcements?.length || 0} 条`);
      
      if (data.announcements && data.announcements.length > 0) {
        console.log('\n📢 公告详情:');
        data.announcements.forEach((announcement, index) => {
          console.log(`   ${index + 1}. ${announcement.title} (${announcement.time})`);
        });
      } else {
        console.log('\n❌ 没有找到公告数据');
      }
    } else {
      console.log('❌ API返回失败:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testHomeAPI(); 