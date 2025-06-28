const { createClient } = require('@supabase/supabase-js');

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少Supabase环境变量配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testHomeAPI() {
  console.log('开始测试首页API...');
  
  try {
    // 测试获取分类
    console.log('\n1. 测试获取分类...');
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('status', 1)
      .order('sort_order', { ascending: true })
      .limit(6);

    if (categoryError) {
      console.error('分类查询失败:', categoryError);
    } else {
      console.log('分类数据:', categories);
    }

    // 测试获取热门商品
    console.log('\n2. 测试获取热门商品...');
    const { data: hotProducts, error: hotError } = await supabase
      .from('products')
      .select('*')
      .eq('status', 1)
      .order('sales', { ascending: false })
      .limit(8);

    if (hotError) {
      console.error('热门商品查询失败:', hotError);
    } else {
      console.log('热门商品数据:', hotProducts);
    }

    // 测试获取最新商品
    console.log('\n3. 测试获取最新商品...');
    const { data: newProducts, error: newError } = await supabase
      .from('products')
      .select('*')
      .eq('status', 1)
      .order('created_at', { ascending: false })
      .limit(8);

    if (newError) {
      console.error('最新商品查询失败:', newError);
    } else {
      console.log('最新商品数据:', newProducts);
    }

    // 模拟完整的首页API响应
    console.log('\n4. 模拟首页API响应...');
    const homeData = {
      success: true,
      data: {
        hotProducts: hotProducts || [],
        newProducts: newProducts || [],
        categories: categories || []
      }
    };
    
    console.log('首页API响应:', JSON.stringify(homeData, null, 2));

    // 检查数据是否为空
    if (!categories || categories.length === 0) {
      console.log('\n⚠️  警告: 分类数据为空，可能需要初始化数据');
    }
    
    if (!hotProducts || hotProducts.length === 0) {
      console.log('\n⚠️  警告: 热门商品数据为空，可能需要初始化数据');
    }
    
    if (!newProducts || newProducts.length === 0) {
      console.log('\n⚠️  警告: 最新商品数据为空，可能需要初始化数据');
    }

  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
testHomeAPI(); 