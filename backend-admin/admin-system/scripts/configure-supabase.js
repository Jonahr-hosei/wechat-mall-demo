const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function configureSupabase() {
  console.log('🔧 Supabase 配置向导');
  console.log('====================\n');
  
  console.log('📋 请按照以下步骤获取 Supabase 项目信息：');
  console.log('1. 访问 https://supabase.com');
  console.log('2. 登录您的账号');
  console.log('3. 选择您的项目');
  console.log('4. 点击左侧菜单的 "Settings"');
  console.log('5. 点击 "API"');
  console.log('6. 复制 Project URL 和 anon public key\n');
  
  const supabaseUrl = await question('请输入 Supabase Project URL (例如: https://abcdefghijklmnop.supabase.co): ');
  const supabaseKey = await question('请输入 Supabase anon public key (以 eyJ 开头的长字符串): ');
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ URL 和 API Key 不能为空！');
    rl.close();
    return;
  }
  
  // 验证 URL 格式
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    console.log('❌ Supabase URL 格式不正确！');
    rl.close();
    return;
  }
  
  // 验证 API Key 格式
  if (!supabaseKey.startsWith('eyJ')) {
    console.log('❌ API Key 格式不正确！');
    rl.close();
    return;
  }
  
  // 读取现有的 .env 文件
  const envPath = path.join(__dirname, '../.env');
  let envContent = '';
  
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    console.log('❌ 无法读取 .env 文件');
    rl.close();
    return;
  }
  
  // 更新 Supabase 配置
  let updatedContent = envContent
    .replace(/SUPABASE_URL=.*/g, `SUPABASE_URL=${supabaseUrl}`)
    .replace(/SUPABASE_ANON_KEY=.*/g, `SUPABASE_ANON_KEY=${supabaseKey}`);
  
  // 写入更新后的内容
  try {
    fs.writeFileSync(envPath, updatedContent, 'utf8');
    console.log('✅ Supabase 配置已更新！');
  } catch (error) {
    console.log('❌ 无法写入 .env 文件:', error.message);
    rl.close();
    return;
  }
  
  console.log('\n📋 配置信息：');
  console.log(`URL: ${supabaseUrl}`);
  console.log(`API Key: ${supabaseKey.substring(0, 20)}...`);
  
  console.log('\n🔍 是否要立即测试连接？(y/n)');
  const testConnection = await question('请输入 y 或 n: ');
  
  if (testConnection.toLowerCase() === 'y') {
    console.log('\n🔗 正在测试连接...');
    
    // 动态加载测试脚本
    try {
      const { createClient } = require('@supabase/supabase-js');
      require('dotenv').config();
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data, error } = await supabase
        .from('admins')
        .select('count')
        .limit(1);
      
      if (error) {
        console.log('❌ 连接失败:', error.message);
        console.log('💡 可能的原因：');
        console.log('1. URL 或 API Key 不正确');
        console.log('2. 数据库表尚未创建');
        console.log('3. 网络连接问题');
      } else {
        console.log('✅ 连接成功！');
        console.log('📊 数据库表访问正常');
      }
    } catch (error) {
      console.log('❌ 测试失败:', error.message);
    }
  }
  
  console.log('\n📝 下一步操作：');
  console.log('1. 如果连接测试失败，请检查 Supabase 项目设置');
  console.log('2. 在 Supabase SQL Editor 中创建数据库表');
  console.log('3. 运行数据迁移: npm run migrate');
  console.log('4. 启动服务器: npm start');
  
  rl.close();
}

// 运行配置向导
configureSupabase().catch(console.error); 