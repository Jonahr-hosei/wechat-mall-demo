const axios = require('axios');

const BASE_URL = 'https://wechat-mall-demo.vercel.app';

async function testAPI() {
  console.log('🧪 开始测试 API 端点...\n');

  const endpoints = [
    '/',
    '/health',
    '/test-routes',
    '/api/statistics/overview',
    '/api/statistics/sales-trend?days=7',
    '/api/statistics/product-ranking?limit=5',
    '/api/statistics/user-activity?days=30',
    '/api/statistics/parking-usage?days=7',
    '/api/products/categories/list'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 测试: ${endpoint}`);
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        timeout: 10000
      });
      console.log(`✅ 成功 (${response.status}): ${response.data.success ? 'API正常' : 'API返回错误'}`);
      if (response.data.message) {
        console.log(`   📝 消息: ${response.data.message}`);
      }
    } catch (error) {
      console.log(`❌ 失败 (${error.response?.status || '网络错误'}): ${error.message}`);
      if (error.response?.data) {
        console.log(`   📝 错误详情: ${JSON.stringify(error.response.data)}`);
      }
    }
    console.log('');
  }

  console.log('🏁 API 测试完成');
}

testAPI().catch(console.error); 