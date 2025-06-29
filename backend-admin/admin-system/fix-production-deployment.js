// 快速修复云端部署问题
const fs = require('fs');
const path = require('path');

console.log('🔧 开始修复云端部署问题...\n');

// 1. 检查关键文件
console.log('1️⃣ 检查关键文件...');

const requiredFiles = [
  'server.js',
  'package.json',
  'vercel.json',
  'routes/announcements.js',
  'config/database.js'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - 存在`);
  } else {
    console.log(`❌ ${file} - 缺失`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ 关键文件缺失，请检查代码完整性');
  process.exit(1);
}

// 2. 检查package.json
console.log('\n2️⃣ 检查package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('✅ package.json 格式正确');
  console.log(`📦 项目名称: ${packageJson.name}`);
  console.log(`📦 版本: ${packageJson.version}`);
  console.log(`📦 主文件: ${packageJson.main || 'server.js'}`);
  
  // 检查关键依赖
  const requiredDeps = ['express', '@supabase/supabase-js', 'cors', 'dotenv'];
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length > 0) {
    console.log(`⚠️ 缺少依赖: ${missingDeps.join(', ')}`);
    console.log('💡 运行: npm install');
  } else {
    console.log('✅ 关键依赖已安装');
  }
} catch (error) {
  console.error('❌ package.json 解析失败:', error.message);
}

// 3. 检查vercel.json
console.log('\n3️⃣ 检查vercel.json...');
try {
  const vercelJson = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  console.log('✅ vercel.json 格式正确');
  console.log(`📦 版本: ${vercelJson.version}`);
  console.log(`📦 构建配置: ${vercelJson.builds?.length || 0} 个`);
  console.log(`📦 路由配置: ${vercelJson.routes?.length || 0} 个`);
  
  // 检查API路由配置
  const hasApiRoute = vercelJson.routes?.some(route => 
    route.src === '/api/(.*)' && route.dest === '/server.js'
  );
  
  if (hasApiRoute) {
    console.log('✅ API路由配置正确');
  } else {
    console.log('❌ API路由配置有问题');
  }
} catch (error) {
  console.error('❌ vercel.json 解析失败:', error.message);
}

// 4. 检查环境变量配置
console.log('\n4️⃣ 检查环境变量配置...');
const envExamplePath = path.join(__dirname, 'env.example');
const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envExamplePath)) {
  console.log('✅ env.example 存在');
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missingVars = requiredVars.filter(varName => !envExample.includes(varName));
  
  if (missingVars.length > 0) {
    console.log(`⚠️ env.example 缺少变量: ${missingVars.join(', ')}`);
  } else {
    console.log('✅ env.example 包含必要变量');
  }
} else {
  console.log('❌ env.example 不存在');
}

if (fs.existsSync(envPath)) {
  console.log('✅ .env 文件存在');
} else {
  console.log('⚠️ .env 文件不存在，需要创建');
}

// 5. 生成修复建议
console.log('\n🔍 生成修复建议...');

console.log('\n📋 修复步骤:');
console.log('1. 确保所有代码已提交到GitHub');
console.log('2. 在Vercel Dashboard中配置环境变量:');
console.log('   - SUPABASE_URL');
console.log('   - SUPABASE_ANON_KEY');
console.log('   - SUPABASE_SERVICE_ROLE_KEY');
console.log('   - JWT_SECRET');
console.log('3. 在Vercel Dashboard中重新部署项目');
console.log('4. 检查部署日志是否有错误');

console.log('\n🛠️ 快速修复命令:');
console.log('# 1. 安装依赖');
console.log('npm install');
console.log('');
console.log('# 2. 本地测试');
console.log('npm start');
console.log('');
console.log('# 3. 测试接口');
console.log('node test-announcements-api.js');
console.log('');
console.log('# 4. 提交代码');
console.log('git add .');
console.log('git commit -m "Fix announcements API"');
console.log('git push');

console.log('\n📞 如果问题仍然存在:');
console.log('1. 检查Vercel部署日志');
console.log('2. 确认Supabase项目配置');
console.log('3. 验证环境变量设置');
console.log('4. 联系技术支持');

console.log('\n🎉 修复建议生成完成！'); 