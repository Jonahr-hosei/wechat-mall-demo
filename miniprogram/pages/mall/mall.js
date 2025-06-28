// mall.js
const app = getApp()
const { getCategories, getProducts } = require('../../utils/request.js')

Page({
  data: {
    searchKeyword: '',
    currentCategory: 'all',
    categories: [],
    products: [],
    page: 1,
    pageSize: 10,
    loading: false,
    noMore: false,
    cartCount: 0
  },

  onLoad(options) {
    // 接收URL参数，支持从首页跳转时自动选中分类
    if (options.categoryId && options.categoryName) {
      this.setData({
        currentCategory: options.categoryId
      })
      console.log('从首页跳转，选中分类:', options.categoryName)
    }
    
    this.loadCategories()
    this.updateCartCount()
  },

  onShow() {
    this.updateCartCount()
    this.tryFillScreen()
  },

  // 加载商品分类
  async loadCategories() {
    try {
      wx.showLoading({
        title: '加载分类...',
        mask: true
      })
      
      const categoriesData = await getCategories()
      if (categoriesData.success) {
        // 对分类进行去重处理
        const uniqueCategories = [];
        const seenNames = new Set();
        categoriesData.data.forEach(category => {
          if (!seenNames.has(category.name)) {
            uniqueCategories.push(category);
            seenNames.add(category.name);
          }
        });
        // 在最前面插入"全部"
        uniqueCategories.unshift({ id: 'all', name: '全部' });
        this.setData({ categories: uniqueCategories });
        
        // 分类加载完成后，重新加载商品（确保分类筛选生效）
        this.loadProducts(true)
      }
    } catch (error) {
      console.error('加载分类失败', error);
      wx.showToast({
        title: '分类加载失败',
        icon: 'none',
        duration: 2000
      })
      // 分类加载失败时，仍然尝试加载商品
      this.loadProducts(true)
    } finally {
      wx.hideLoading()
    }
  },

  // 加载商品列表
  async loadProducts(refresh = false) {
    if (this.data.loading) return

    this.setData({ loading: true })

    if (refresh) {
      this.setData({ 
        page: 1, 
        products: [], 
        noMore: false 
      })
    }

    const params = {
      page: this.data.page,
      limit: this.data.pageSize
    }

    // 添加分类筛选
    if (this.data.currentCategory && this.data.currentCategory !== 'all') {
      params.category_id = this.data.currentCategory
    }

    // 添加搜索关键词
    if (this.data.searchKeyword) {
      params.search = this.data.searchKeyword
    }

    try {
      const productsData = await getProducts(params)
      if (productsData.success) {
        console.log('商品数据:', productsData.data) // 调试日志
        // 修正分类字段为字符串，若无category_name则通过category_id查找
        const categoriesMap = {};
        (this.data.categories || []).forEach(cat => {
          categoriesMap[cat.id] = cat.name;
        });
        const newProducts = productsData.data.map(item => {
          let categoryName = item.category_name;
          if (!categoryName && item.category_id && categoriesMap[item.category_id]) {
            categoryName = categoriesMap[item.category_id];
          }
          
          // 修复图片路径
          let imageUrl = item.image;
          if (imageUrl && imageUrl.startsWith('/uploads/')) {
            // 如果是本地路径，转换为完整的Vercel URL
            imageUrl = `https://wechat-mall-demo.vercel.app${imageUrl}`;
          }
          
          return { 
            ...item, 
            category_name: categoryName || '',
            image: imageUrl
          };
        });
        const allProducts = refresh ? newProducts : [...this.data.products, ...newProducts];
        this.setData({
          products: allProducts,
          page: this.data.page + 1,
          noMore: newProducts.length < this.data.pageSize
        }, () => {
          // 加载后再次尝试填满一屏
          this.tryFillScreen();
        });
      } else {
        console.error('加载商品失败:', productsData.message)
        wx.showToast({
          title: productsData.message || '加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载商品失败', error)
      wx.showToast({
        title: '网络错误，请检查网络连接',
        icon: 'none'
      })
      // 移除模拟数据，只显示错误提示
      this.setData({
        loading: false,
        noMore: true
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
  },

  // 搜索确认
  onSearch() {
    this.loadProducts(true)
  },

  // 分类切换
  onCategoryTap(e) {
    const categoryId = e.currentTarget.dataset.id
    this.setData({
      currentCategory: categoryId
    })
    this.loadProducts(true)
  },

  // 懒加载：页面滚动到底部自动加载更多
  onReachBottom() {
    console.log('触发懒加载');
    if (!this.data.noMore && !this.data.loading) {
      this.loadProducts();
    }
  },

  // 页面初次渲染后，自动补充商品直到填满一屏
  onReady() {
    this.tryFillScreen();
  },

  // 更新购物车数量
  updateCartCount() {
    const cart = wx.getStorageSync('cart') || []
    this.setData({
      cartCount: cart.length
    })
  },

  // 导航到商品详情
  navigateToProduct(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    })
  },

  // 跳转到商品详情页面
  goToProductDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    })
  },

  // 导航到购物车
  navigateToCart() {
    wx.navigateTo({
      url: '/pages/cart/cart'
    })
  },

  tryFillScreen() {
    // 延迟执行，等待商品渲染
    setTimeout(() => {
      wx.createSelectorQuery().select('.product-list').boundingClientRect(rect => {
        wx.getSystemInfo({
          success: (sys) => {
            if (rect && rect.height < sys.windowHeight && !this.data.noMore && !this.data.loading) {
              this.loadProducts();
            }
          }
        });
      }).exec();
    }, 300);
  },

  // 图片加载错误处理
  onImageError(e) {
    const index = e.currentTarget.dataset.index;
    const products = this.data.products;
    if (products[index]) {
      products[index].image = '/images/default-category.svg'; // 使用默认图片
      this.setData({
        products: products
      });
    }
  },
}) 