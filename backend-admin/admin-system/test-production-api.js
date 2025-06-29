const axios = require('axios');

// 云端API地址
const PRODUCTION_URL = 'https://wechat-mall-demo.vercel.app';

// 测试云端API
async function testProductionAPI() {
  try {
    console.log('🌐 开始测试云端API...\n');
    
    // 1. 测试根路径
    console.log('1️⃣ 测试根路径...');
    try {
      const rootResponse = await axios.get(`${PRODUCTION_URL}/`);
      console.log('✅ 根路径响应:', rootResponse.status);
      console.log('📊 可用端点:', rootResponse.data.endpoints);
    } catch (error) {
      console.error('❌ 根路径测试失败:', error.message);
    }
    
    // 2. 测试健康检查
    console.log('\n2️⃣ 测试健康检查...');
    try {
      const healthResponse = await axios.get(`${PRODUCTION_URL}/health`);
      console.log('✅ 健康检查响应:', healthResponse.status);
      console.log('📊 服务状态:', healthResponse.data.message);
    } catch (error) {
      console.error('❌ 健康检查失败:', error.message);
    }
    
    // 3. 测试路由列表
    console.log('\n3️⃣ 测试路由列表...');
    try {
      const routesResponse = await axios.get(`${PRODUCTION_URL}/test-routes`);
      console.log('✅ 路由列表响应:', routesResponse.status);
      console.log('📊 可用路由:', routesResponse.data.availableRoutes);
      if (routesResponse.data.announcementsRoutes) {
        console.log('📢 公告路由:', routesResponse.data.announcementsRoutes);
      }
    } catch (error) {
      console.error('❌ 路由列表测试失败:', error.message);
    }
    
    // 4. 测试公告列表接口
    console.log('\n4️⃣ 测试公告列表接口...');
    try {
      const announcementsResponse = await axios.get(`${PRODUCTION_URL}/api/announcements`);
      console.log('✅ 公告列表响应:', announcementsResponse.status);
      console.log('📊 公告数据:', JSON.stringify(announcementsResponse.data, null, 2));
    } catch (error) {
      console.error('❌ 公告列表接口失败:', error.message);
      if (error.response) {
        console.error('响应状态:', error.response.status);
        console.error('响应数据:', error.response.data);
      }
    }
    
    // 5. 测试首页公告接口
    console.log('\n5️⃣ 测试首页公告接口...');
    try {
      const homeAnnouncementsResponse = await axios.get(`${PRODUCTION_URL}/api/announcements/home/list`);
      console.log('✅ 首页公告响应:', homeAnnouncementsResponse.status);
      console.log('📊 首页公告数据:', JSON.stringify(homeAnnouncementsResponse.data, null, 2));
    } catch (error) {
      console.error('❌ 首页公告接口失败:', error.message);
      if (error.response) {
        console.error('响应状态:', error.response.status);
        console.error('响应数据:', error.response.data);
      }
    }
    
    // 6. 测试首页数据接口
    console.log('\n6️⃣ 测试首页数据接口...');
    try {
      const homeResponse = await axios.get(`${PRODUCTION_URL}/api/mall/home`);
      console.log('✅ 首页数据响应:', homeResponse.status);
      if (homeResponse.data.success) {
        const data = homeResponse.data.data;
        console.log('📊 首页数据统计:');
        console.log(`   - 热门商品: ${data.hotProducts?.length || 0} 条`);
        console.log(`   - 最新商品: ${data.newProducts?.length || 0} 条`);
        console.log(`   - 公告: ${data.announcements?.length || 0} 条`);
        
        if (data.announcements && data.announcements.length > 0) {
          console.log('\n📢 首页公告:');
          data.announcements.forEach((announcement, index) => {
            console.log(`   ${index + 1}. ${announcement.title} (${announcement.time})`);
          });
        } else {
          console.log('\n❌ 首页没有公告数据');
        }
      }
    } catch (error) {
      console.error('❌ 首页数据接口失败:', error.message);
      if (error.response) {
        console.error('响应状态:', error.response.status);
        console.error('响应数据:', error.response.data);
      }
    }
    
    // 7. 测试数据库连接
    console.log('\n7️⃣ 测试数据库连接...');
    try {
      const dbResponse = await axios.get(`${PRODUCTION_URL}/test-db`);
      console.log('✅ 数据库连接响应:', dbResponse.status);
      console.log('📊 数据库状态:', dbResponse.data.message);
    } catch (error) {
      console.error('❌ 数据库连接测试失败:', error.message);
      if (error.response) {
        console.error('响应状态:', error.response.status);
        console.error('响应数据:', error.response.data);
      }
    }
    
    console.log('\n🎉 云端API测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
testProductionAPI(); 