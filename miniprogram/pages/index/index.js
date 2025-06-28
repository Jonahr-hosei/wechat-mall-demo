const app = getApp()
const { api } = require('../../utils/request.js')

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
    error: false
  },

  onLoad() {
    console.log('首页加载')
    this.loadHomeData()
    this.checkParkingStatus()
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadHomeData()
    // 每次显示页面时检查停车状态
    this.checkParkingStatus()
  },

  // 加载首页数据
  async loadHomeData() {
    try {
      this.setData({
        loading: true,
        error: false
      })

      console.log('开始加载首页数据...')
      
      const result = await api.getHomeData()
      console.log('首页数据加载成功:', result)

      if (result.success && result.data) {
        this.setData({
          hotProducts: result.data.hotProducts || [],
          newProducts: result.data.newProducts || [],
          categories: result.data.categories || [],
          loading: false
        })
      } else {
        throw new Error(result.message || '数据加载失败')
      }
    } catch (error) {
      console.error('加载首页数据失败:', error)
      
      this.setData({
        loading: false,
        error: true
      })

      // 显示错误提示
      wx.showToast({
        title: error.message || '加载失败，请重试',
        icon: 'none',
        duration: 2000
      })

      // 5秒后自动重试一次
      setTimeout(() => {
        if (this.data.error) {
          console.log('自动重试加载首页数据...')
          this.loadHomeData()
        }
      }, 5000)
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
      const parkingData = await api.getParkingStatus(openId)
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
  }
}) 