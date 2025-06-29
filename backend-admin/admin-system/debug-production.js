const axios = require('axios');

// 云端API地址
const PRODUCTION_URL = 'https://wechat-mall-demo.vercel.app';

// 详细诊断云端部署
async function debugProduction() {
  try {
    console.log('🔍 开始详细诊断云端部署...\n');
    
    // 1. 测试基本连接
    console.log('1️⃣ 测试基本连接...');
    try {
      const response = await axios.get(`${PRODUCTION_URL}/`, {
        timeout: 10000,
        validateStatus: function (status) {
          return status < 500; // 接受所有非500错误
        }
      });
      console.log('✅ 连接成功');
      console.log('📊 状态码:', response.status);
      console.log('📊 响应数据:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('❌ 连接失败');
      if (error.code === 'ECONNREFUSED') {
        console.error('   原因: 连接被拒绝 - 服务可能未启动');
      } else if (error.code === 'ENOTFOUND') {
        console.error('   原因: 域名未找到 - 检查域名是否正确');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('   原因: 连接超时 - 网络问题或服务响应慢');
      } else {
        console.error('   原因:', error.message);
      }
      
      if (error.response) {
        console.error('   响应状态:', error.response.status);
        console.error('   响应数据:', error.response.data);
      }
    }
    
    // 2. 测试公告接口
    console.log('\n2️⃣ 测试公告接口...');
    try {
      const response = await axios.get(`${PRODUCTION_URL}/api/announcements`, {
        timeout: 10000,
        validateStatus: function (status) {
          return status < 500;
        }
      });
      console.log('✅ 公告接口响应');
      console.log('📊 状态码:', response.status);
      console.log('📊 响应数据:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('❌ 公告接口失败');
      console.error('   原因:', error.message);
      if (error.response) {
        console.error('   响应状态:', error.response.status);
        console.error('   响应数据:', error.response.data);
      }
    }
    
    // 3. 测试首页接口
    console.log('\n3️⃣ 测试首页接口...');
    try {
      const response = await axios.get(`${PRODUCTION_URL}/api/mall/home`, {
        timeout: 10000,
        validateStatus: function (status) {
          return status < 500;
        }
      });
      console.log('✅ 首页接口响应');
      console.log('📊 状态码:', response.status);
      console.log('📊 响应数据:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('❌ 首页接口失败');
      console.error('   原因:', error.message);
      if (error.response) {
        console.error('   响应状态:', error.response.status);
        console.error('   响应数据:', error.response.data);
      }
    }
    
    // 4. 分析问题
    console.log('\n🔍 问题分析...');
    console.log('💡 可能的原因:');
    console.log('   1. 云端部署失败或未完成');
    console.log('   2. 环境变量未正确配置');
    console.log('   3. 数据库连接失败');
    console.log('   4. 代码部署版本有问题');
    console.log('   5. Vercel配置错误');
    
    console.log('\n🛠️ 解决方案:');
    console.log('   1. 检查Vercel部署日志');
    console.log('   2. 确认环境变量配置');
    console.log('   3. 重新部署代码');
    console.log('   4. 检查数据库连接');
    
    console.log('\n📋 检查清单:');
    console.log('   □ Vercel项目是否正常部署');
    console.log('   □ 环境变量是否配置正确');
    console.log('   □ Supabase连接是否正常');
    console.log('   □ 代码是否有语法错误');
    console.log('   □ 依赖包是否正确安装');
    
  } catch (error) {
    console.error('❌ 诊断过程中发生错误:', error.message);
  }
}

// 运行诊断
debugProduction(); 