// mall.js
const app = getApp()

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

  onLoad() {
    this.loadCategories()
    this.loadProducts()
    this.updateCartCount()
  },

  onShow() {
    this.updateCartCount()
    this.tryFillScreen()
  },

  // 加载商品分类
  loadCategories() {
    wx.request({
      url: `${app.globalData.baseUrl}/categories`,
      method: 'GET',
      success: (res) => {
        if (res.data.success) {
          // 对分类进行去重处理
          const uniqueCategories = [];
          const seenNames = new Set();
          res.data.data.forEach(category => {
            if (!seenNames.has(category.name)) {
              uniqueCategories.push(category);
              seenNames.add(category.name);
            }
          });
          // 在最前面插入"全部"
          uniqueCategories.unshift({ id: 'all', name: '全部' });
          this.setData({ categories: uniqueCategories });
        }
      },
      fail: (err) => {
        console.error('加载分类失败', err);
        // 不再使用本地分类，分类加载失败时categories保持为空
      }
    });
  },

  // 加载商品列表
  loadProducts(refresh = false) {
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
    if (this.data.selectedCategory && this.data.selectedCategory !== 'all') {
      params.category_id = this.data.selectedCategory
    }

    // 添加搜索关键词
    if (this.data.searchKeyword) {
      params.search = this.data.searchKeyword
    }

    wx.request({
      url: `${app.globalData.baseUrl}/products`,
      method: 'GET',
      data: params,
      success: (res) => {
        console.log('商品数据:', res.data) // 调试日志
        if (res.data.success) {
          // 修正分类字段为字符串，若无category_name则通过category_id查找
          const categoriesMap = {};
          (this.data.categories || []).forEach(cat => {
            categoriesMap[cat.id] = cat.name;
          });
          const newProducts = res.data.data.map(item => {
            let categoryName = item.category_name;
            if (!categoryName && item.category_id && categoriesMap[item.category_id]) {
              categoryName = categoriesMap[item.category_id];
            }
            return { ...item, category_name: categoryName || '' };
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
          console.error('加载商品失败:', res.data.message)
          wx.showToast({
            title: res.data.message || '加载失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('加载商品失败', err)
        wx.showToast({
          title: '网络错误，请检查网络连接',
          icon: 'none'
        })
        // 使用模拟数据作为备用
        const mockProducts = this.getMockProducts()
        this.setData({
          products: refresh ? mockProducts : [...this.data.products, ...mockProducts],
          page: this.data.page + 1,
          noMore: true
        })
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },

  // 获取模拟商品数据
  getMockProducts() {
    const mockData = [
      {
        id: 1,
        name: '时尚女装连衣裙',
        description: '春季新款，舒适面料，时尚设计',
        price: 299,
        original_price: 399,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lhpvmlrDlubPml7bml6DlsIHpnaI8L3RleHQ+Cjwvc3ZnPgo=',
        sales: 128,
        points: 30
      },
      {
        id: 2,
        name: '男士休闲运动鞋',
        description: '轻便舒适，适合日常运动',
        price: 399,
        original_price: 499,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lubPmnI3mnInmnInlubPml7bml6DlsIHpnaI8L3RleHQ+Cjwvc3ZnPgo=',
        sales: 89,
        points: 40
      },
      {
        id: 3,
        name: '儿童益智玩具套装',
        description: '开发智力，寓教于乐',
        price: 99,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lubPmnI3lubPml7bml6DlsIHpnaI+WtOeJueS7tuWKoOi9veWbvueJhzwvdGV4dD4KPC9zdmc+Cg==',
        sales: 256,
        points: 10
      },
      {
        id: 4,
        name: '女士手提包',
        description: '简约时尚，实用百搭',
        price: 199,
        original_price: 299,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lhpvmlrDlubPml7bml6DlsIHpnaI+WtOeJueS7tuWKoOi9veWbvueJhzwvdGV4dD4KPC9zdmc+Cg==',
        sales: 67,
        points: 20
      }
    ]
    return mockData
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

  // 选择分类
  selectCategory(e) {
    const { category } = e.currentTarget.dataset;
    this.setData({
      selectedCategory: category,
      products: [],
      page: 1,
      hasMore: true
    });
    // 重新加载商品，传递分类参数
    this.loadProducts(true);
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
  }
}) 