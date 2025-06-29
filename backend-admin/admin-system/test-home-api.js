const express = require('express');
const supabase = require('./config/database');

const app = express();
const PORT = 3002;

app.use(express.json());

// 测试首页API
app.get('/test-home', async (req, res) => {
  try {
    console.log('🔍 测试首页API...');
    
    // 获取热门商品
    const { data: hotProducts, error: hotError } = await supabase
      .from('products')
      .select('*')
      .eq('status', 1)
      .order('sales', { ascending: false })
      .limit(8);

    if (hotError) {
      console.error('Supabase热门商品查询错误:', hotError);
      return res.status(500).json({
        success: false,
        message: '获取首页数据失败'
      });
    }

    // 获取最新商品
    const { data: newProducts, error: newError } = await supabase
      .from('products')
      .select('*')
      .eq('status', 1)
      .order('created_at', { ascending: false })
      .limit(8);

    if (newError) {
      console.error('Supabase最新商品查询错误:', newError);
      return res.status(500).json({
        success: false,
        message: '获取首页数据失败'
      });
    }

    // 获取公告
    console.log('📢 查询公告数据...');
    const { data: announcements, error: announcementError } = await supabase
      .from('announcements')
      .select('id, title, type, created_at')
      .eq('status', 1)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);

    if (announcementError) {
      console.error('Supabase公告查询错误:', announcementError);
      return res.status(500).json({
        success: false,
        message: '获取首页数据失败'
      });
    }

    console.log(`✅ 公告查询成功，返回 ${announcements?.length || 0} 条`);

    // 修复商品图片路径
    const fixImageUrl = (products) => {
      return products.map(product => {
        let imageUrl = product.image;
        if (imageUrl && imageUrl.startsWith('/uploads/')) {
          imageUrl = null;
        }
        return { ...product, image: imageUrl };
      });
    };

    // 格式化公告时间
    const formattedAnnouncements = (announcements || []).map(item => ({
      ...item,
      time: new Date(item.created_at).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }));

    const responseData = {
      hotProducts: fixImageUrl(hotProducts || []),
      newProducts: fixImageUrl(newProducts || []),
      announcements: formattedAnnouncements
    };

    console.log('📊 响应数据统计:');
    console.log(`   - 热门商品: ${responseData.hotProducts.length} 条`);
    console.log(`   - 最新商品: ${responseData.newProducts.length} 条`);
    console.log(`   - 公告: ${responseData.announcements.length} 条`);

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('获取首页数据错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 测试公告API
app.get('/test-announcements', async (req, res) => {
  try {
    console.log('🔍 测试公告API...');
    
    // 查询所有公告
    const { data: allAnnouncements, error: allError } = await supabase
      .from('announcements')
      .select('*');

    if (allError) {
      console.error('❌ 查询所有公告失败:', allError);
      return res.status(500).json({
        success: false,
        message: '查询失败',
        error: allError.message
      });
    }

    // 查询启用的公告
    const { data: activeAnnouncements, error: activeError } = await supabase
      .from('announcements')
      .select('id, title, type, created_at')
      .eq('status', 1)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);

    if (activeError) {
      console.error('❌ 查询启用公告失败:', activeError);
      return res.status(500).json({
        success: false,
        message: '查询失败',
        error: activeError.message
      });
    }

    // 格式化时间
    const formattedAnnouncements = (activeAnnouncements || []).map(item => ({
      ...item,
      time: new Date(item.created_at).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }));

    res.json({
      success: true,
      data: {
        allAnnouncements: allAnnouncements || [],
        activeAnnouncements: formattedAnnouncements,
        totalCount: allAnnouncements.length,
        activeCount: activeAnnouncements.length
      }
    });

  } catch (error) {
    console.error('❌ API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 测试服务器运行在 http://localhost:${PORT}`);
  console.log('📋 可用端点:');
  console.log('  - GET /test-home - 测试首页数据');
  console.log('  - GET /test-announcements - 测试公告数据');
}); 