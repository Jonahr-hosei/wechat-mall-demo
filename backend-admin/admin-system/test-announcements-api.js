const axios = require('axios');

// 基础配置
const baseUrl = 'http://localhost:5000'; // 本地测试
// const baseUrl = 'https://wechat-mall-demo.vercel.app'; // 线上测试

// 测试公告列表接口
async function testAnnouncementsList() {
  try {
    console.log('📢 测试公告列表接口...');
    
    const response = await axios.get(`${baseUrl}/api/announcements`);
    
    console.log('✅ 公告列表接口响应状态:', response.status);
    console.log('📊 响应数据:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      const data = response.data.data;
      console.log(`📈 公告列表统计: ${data.length} 条`);
      
      if (data.length > 0) {
        console.log('\n📋 公告列表:');
        data.forEach((announcement, index) => {
          console.log(`   ${index + 1}. ${announcement.title} (${announcement.type})`);
        });
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ 公告列表接口测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    return null;
  }
}

// 测试首页公告接口
async function testHomeAnnouncements() {
  try {
    console.log('\n🏠 测试首页公告接口...');
    
    const response = await axios.get(`${baseUrl}/api/announcements/home/list`);
    
    console.log('✅ 首页公告接口响应状态:', response.status);
    console.log('📊 响应数据:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      const data = response.data.data;
      console.log(`📈 首页公告统计: ${data.length} 条`);
      
      if (data.length > 0) {
        console.log('\n📋 首页公告:');
        data.forEach((announcement, index) => {
          console.log(`   ${index + 1}. ${announcement.title} (${announcement.time})`);
        });
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ 首页公告接口测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    return null;
  }
}

// 测试公告详情接口
async function testAnnouncementDetail(announcementId = 1) {
  try {
    console.log(`\n📄 测试公告详情接口 (ID: ${announcementId})...`);
    
    const response = await axios.get(`${baseUrl}/api/announcements/${announcementId}`);
    
    console.log('✅ 公告详情接口响应状态:', response.status);
    console.log('📊 响应数据:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      const data = response.data.data;
      console.log(`📄 公告详情: ${data.title}`);
      console.log(`📝 内容: ${data.content.substring(0, 100)}...`);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ 公告详情接口测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    return null;
  }
}

// 测试首页数据接口（包含公告）
async function testHomeData() {
  try {
    console.log('\n🏠 测试首页数据接口...');
    
    const response = await axios.get(`${baseUrl}/api/mall/home`);
    
    console.log('✅ 首页数据接口响应状态:', response.status);
    
    if (response.data.success) {
      const data = response.data.data;
      console.log(`📈 首页数据统计:`);
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
    
    return response.data;
  } catch (error) {
    console.error('❌ 首页数据接口测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    return null;
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试公告相关接口...\n');
  
  // 测试公告列表
  const listResult = await testAnnouncementsList();
  
  // 测试首页公告
  const homeResult = await testHomeAnnouncements();
  
  // 如果有公告数据，测试详情接口
  if (listResult && listResult.success && listResult.data.length > 0) {
    await testAnnouncementDetail(listResult.data[0].id);
  }
  
  // 测试首页数据接口
  await testHomeData();
  
  console.log('\n🎉 测试完成！');
}

// 运行测试
runTests().catch(console.error); 