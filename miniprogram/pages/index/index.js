const app = getApp()
const { getHomeData, getProducts, getCategories, getParkingInfo } = require('../../utils/request.js')

Page({
  data: {
    banners: [
      {
        id: 1,
        image: '/images/banner1.svg',
        title: '新品上市'
      },
      {
        id: 2,
        image: '/images/banner2.svg',
        title: '限时优惠'
      },
      {
        id: 3,
        image: '/images/banner3.svg',
        title: '热销商品'
      }
    ],
    hotProducts: [],
    newProducts: [],
    categories: [],
    notices: [],
    parkingInfo: null,
    loading: true,
    error: false,
    isRequesting: false
  },

  onLoad() {
    console.log('首页加载')
    this.loadHomeData()
    this.checkParkingStatus()
  },

  onShow() {
    if (!this.data.isRequesting && 
        this.data.hotProducts.length === 0 && 
        this.data.newProducts.length === 0) {
      this.loadHomeData()
    }
    this.checkParkingStatus()
  },

  // 加载首页数据
  async loadHomeData() {
    // 防止重复请求
    if (this.data.isRequesting) {
      console.log('请求正在进行中，跳过重复请求')
      return
    }

    try {
      this.setData({
        loading: true,
        error: false,
        isRequesting: true
      })

      console.log('开始加载首页数据...')
      
      const result = await getHomeData()
      console.log('首页数据加载成功:', result)

      if (result.success && result.data) {
        // 对分类进行去重处理
        const categories = result.data.categories || []
        const uniqueCategories = []
        const seenNames = new Set()
        
        categories.forEach(category => {
          if (!seenNames.has(category.name)) {
            uniqueCategories.push(category)
            seenNames.add(category.name)
          }
        })
        
        // 修复商品图片路径
        const fixImageUrl = (products) => {
          return products.map(item => {
            let imageUrl = item.image;
            if (imageUrl && imageUrl.startsWith('/uploads/')) {
              // 如果是本地路径，设为null，避免404错误
              imageUrl = null;
            }
            return { ...item, image: imageUrl };
          });
        };
        
        const hotProducts = fixImageUrl(result.data.hotProducts || []);
        const newProducts = fixImageUrl(result.data.newProducts || []);
        
        // 保存到本地缓存
        wx.setStorageSync('homeDataCache', {
          hotProducts: hotProducts,
          newProducts: newProducts,
          categories: uniqueCategories,
          timestamp: Date.now()
        })
        
        this.setData({
          hotProducts: hotProducts,
          newProducts: newProducts,
          categories: uniqueCategories,
          loading: false,
          isRequesting: false
        })
      } else {
        throw new Error(result.message || '数据加载失败')
      }
    } catch (error) {
      console.error('加载首页数据失败:', error)
      
      // 检查是否有缓存数据
      const cachedData = wx.getStorageSync('homeDataCache')
      if (cachedData) {
        console.log('使用本地缓存数据')
        
        // 修复缓存数据的图片路径
        const fixImageUrl = (products) => {
          return products.map(item => {
            let imageUrl = item.image;
            if (imageUrl && imageUrl.startsWith('/uploads/')) {
              // 如果是本地路径，设为null，避免404错误
              imageUrl = null;
            }
            return { ...item, image: imageUrl };
          });
        };
        
        this.setData({
          hotProducts: fixImageUrl(cachedData.hotProducts || []),
          newProducts: fixImageUrl(cachedData.newProducts || []),
          categories: cachedData.categories || [],
          loading: false,
          isRequesting: false
        })
        
        wx.showToast({
          title: '使用离线数据',
          icon: 'none',
          duration: 2000
        })
        return
      }
      
      this.setData({
        loading: false,
        error: true,
        isRequesting: false
      })

      // 显示错误提示
      wx.showToast({
        title: error.message || '加载失败，请重试',
        icon: 'none',
        duration: 2000
      })

      // 20秒后自动重试一次，避免频繁重试
      setTimeout(() => {
        if (this.data.error && !this.data.isRequesting) {
          console.log('自动重试加载首页数据...')
          this.loadHomeData()
        }
      }, 20000)
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadHomeData().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 检查停车状态
  async checkParkingStatus() {
    const openId = wx.getStorageSync('openId')
    if (!openId) return

    try {
      const parkingData = await getParkingInfo(openId)
      if (parkingData.success && parkingData.data) {
        this.setData({
          parkingInfo: parkingData.data
        })
      }
    } catch (error) {
      console.error('检查停车状态失败', error)
    }
  },

  // 轮播图点击
  onBannerTap(e) {
    const id = e.currentTarget.dataset.id
    const banner = this.data.banners.find(item => item.id === id)
    if (banner && banner.link) {
      wx.navigateTo({
        url: banner.link
      })
    }
  },

  // 点击分类
  onCategoryTap(e) {
    const { id, name } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/mall/mall?categoryId=${id}&categoryName=${encodeURIComponent(name)}`
    })
  },

  // 点击商品
  onProductTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    })
  },

  // 点击购物车
  onCartTap() {
    wx.switchTab({
      url: '/pages/cart/cart'
    })
  },

  // 点击用户中心
  onUserTap() {
    wx.switchTab({
      url: '/pages/user/user'
    })
  },

  // 点击商城
  onMallTap() {
    wx.switchTab({
      url: '/pages/mall/mall'
    })
  },

  // 点击停车
  onParkingTap() {
    wx.navigateTo({
      url: '/pages/parking/parking'
    })
  },

  // 点击积分
  onPointsTap() {
    wx.navigateTo({
      url: '/pages/points/points'
    })
  },

  // 重新加载
  onRetry() {
    this.loadHomeData()
  },

  // 公告点击
  onNoticeTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/notice-detail/notice-detail?id=${id}`
    })
  },

  // 图片加载错误处理
  onImageError(e) {
    const { type, index } = e.currentTarget.dataset;
    const defaultImage = '/images/default-category.svg';
    
    if (type === 'hot' && this.data.hotProducts[index]) {
      const hotProducts = this.data.hotProducts;
      hotProducts[index].image = defaultImage;
      this.setData({ hotProducts });
    } else if (type === 'new' && this.data.newProducts[index]) {
      const newProducts = this.data.newProducts;
      newProducts[index].image = defaultImage;
      this.setData({ newProducts });
    }
  }
}) 