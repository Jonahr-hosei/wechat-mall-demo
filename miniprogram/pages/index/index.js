const app = getApp()

Page({
  data: {
    banners: [
      {
        id: 1,
        title: '商城购物优惠',
        image: '/images/banner1.jpg',
        link: '/pages/mall/mall'
      },
      {
        id: 2,
        title: '停车缴费便捷',
        image: '/images/banner2.jpg',
        link: '/pages/parking/parking'
      },
      {
        id: 3,
        title: '积分兑换好礼',
        image: '/images/banner3.jpg',
        link: '/pages/points/points'
      }
    ],
    hotProducts: [],
    notices: [],
    parkingInfo: null
  },

  onLoad() {
    this.loadHotProducts()
    this.loadNotices()
    this.checkParkingStatus()
  },

  onShow() {
    // 每次显示页面时检查停车状态
    this.checkParkingStatus()
  },

  // 加载热门商品
  loadHotProducts() {
    wx.request({
      url: `${app.globalData.baseUrl}/products/hot`,
      method: 'GET',
      data: {
        mallId: app.globalData.mallId,
        limit: 10
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            hotProducts: res.data.data
          })
        }
      },
      fail: (err) => {
        console.error('加载热门商品失败', err)
        // 使用模拟数据
        this.setData({
          hotProducts: [
            {
              id: 1,
              name: '时尚女装',
              price: 299,
              image: '/images/product1.jpg'
            },
            {
              id: 2,
              name: '男士休闲鞋',
              price: 399,
              image: '/images/product2.jpg'
            },
            {
              id: 3,
              name: '儿童玩具',
              price: 99,
              image: '/images/product3.jpg'
            }
          ]
        })
      }
    })
  },

  // 加载公告
  loadNotices() {
    wx.request({
      url: `${app.globalData.baseUrl}/notices`,
      method: 'GET',
      data: {
        mallId: app.globalData.mallId,
        limit: 5
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            notices: res.data.data
          })
        }
      },
      fail: (err) => {
        console.error('加载公告失败', err)
        // 使用模拟数据
        this.setData({
          notices: [
            {
              id: 1,
              title: '商场营业时间调整通知',
              time: '2024-01-15'
            },
            {
              id: 2,
              title: '停车费优惠活动',
              time: '2024-01-14'
            },
            {
              id: 3,
              title: '积分兑换活动开始',
              time: '2024-01-13'
            }
          ]
        })
      }
    })
  },

  // 检查停车状态
  checkParkingStatus() {
    const openId = wx.getStorageSync('openId')
    if (!openId) return

    wx.request({
      url: `${app.globalData.baseUrl}/parking/status`,
      method: 'GET',
      data: {
        openId: openId,
        parkingLotId: app.globalData.parkingLotId
      },
      success: (res) => {
        if (res.data.success && res.data.data) {
          this.setData({
            parkingInfo: res.data.data
          })
        }
      },
      fail: (err) => {
        console.error('检查停车状态失败', err)
      }
    })
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

  // 导航到商城
  navigateToMall() {
    wx.switchTab({
      url: '/pages/mall/mall'
    })
  },

  // 导航到停车
  navigateToParking() {
    wx.switchTab({
      url: '/pages/parking/parking'
    })
  },

  // 导航到积分
  navigateToPoints() {
    wx.switchTab({
      url: '/pages/points/points'
    })
  },

  // 导航到用户中心
  navigateToUser() {
    wx.switchTab({
      url: '/pages/user/user'
    })
  },

  // 导航到商品详情
  navigateToProduct(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    })
  },

  // 公告点击
  onNoticeTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/notice-detail/notice-detail?id=${id}`
    })
  }
}) 