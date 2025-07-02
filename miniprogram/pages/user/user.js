// user.js
const { safeGetApp, safePage } = require('../../utils/util.js')
const { getUserInfo, getPoints, getOrders, getParkingInfo } = require('../../utils/request.js')
const util = require('../../utils/util.js')

const app = safeGetApp()

safePage({
  data: {
    userInfo: null,
    points: 0,
    orderCount: 0,
    couponCount: 0,
    favoriteCount: 0,
    parkingInfo: null,
    loading: true
  },

  onLoad() {
    this.loadUserInfo()
    this.loadUserPoints()
    this.loadOrderCount()
    this.loadParkingInfo()
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadUserInfo()
    this.loadUserPoints()
    this.loadOrderCount()
    this.loadParkingInfo()
  },

  // 加载用户信息
  async loadUserInfo() {
    const openId = wx.getStorageSync('openId')
    if (!openId) {
      this.setData({ loading: false })
      return
    }

    try {
      const userData = await getUserInfo(openId)
      if (userData.success) {
        this.setData({ 
          userInfo: userData.data,
          loading: false 
        })
      }
    } catch (error) {
      console.error('加载用户信息失败', error)
      this.setData({ loading: false })
    }
  },

  // 加载用户积分
  async loadUserPoints() {
    const openId = wx.getStorageSync('openId')
    if (!openId) return

    try {
      const pointsData = await getPoints(openId)
      if (pointsData.success) {
        this.setData({ points: pointsData.data.points || 0 })
      }
    } catch (error) {
      console.error('加载积分失败', error)
    }
  },

  // 加载订单数量
  async loadOrderCount() {
    const openId = wx.getStorageSync('openId')
    if (!openId) return

    try {
      const ordersData = await getOrders(openId, { limit: 1 })
      if (ordersData.success) {
        const total = ordersData.pagination && ordersData.pagination.total ? ordersData.pagination.total : 0
        this.setData({ orderCount: total })
      }
    } catch (error) {
      console.error('加载订单数量失败', error)
    }
  },

  // 加载停车信息
  async loadParkingInfo() {
    const openId = wx.getStorageSync('openId')
    if (!openId) return

    try {
      const parkingData = await getParkingInfo(openId)
      if (parkingData.success) {
        this.setData({ parkingInfo: parkingData.data })
      }
    } catch (error) {
      console.error('加载停车信息失败', error)
    }
  },

  // 获取优惠券数量
  getCouponCount() {
    // 暂时设为0，等优惠券功能实现后再调用API
    this.setData({ couponCount: 0 })
  },

  // 获取收藏数量
  getFavoriteCount() {
    // 暂时设为0，等收藏功能实现后再调用API
    this.setData({ favoriteCount: 0 })
  },

  // 用户登录
  login() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const userInfo = res.userInfo
        wx.setStorageSync('userInfo', userInfo)
        this.setData({ userInfo })
        util.showSuccess('登录成功')
      },
      fail: (err) => {
        console.error('获取用户信息失败', err)
        util.showError('登录失败')
      }
    })
  },

  // 退出登录
  logout() {
    util.showConfirm('确认退出', '确定要退出登录吗？').then(confirm => {
      if (confirm) {
        wx.removeStorageSync('userInfo')
        wx.removeStorageSync('openId')
        wx.removeStorageSync('token')
        this.setData({ 
          userInfo: null,
          points: 0,
          orderCount: 0,
          couponCount: 0,
          favoriteCount: 0
        })
        util.showSuccess('已退出登录')
      }
    })
  },

  // 导航到积分中心
  navigateToPoints() {
    wx.switchTab({
      url: '/pages/points/points'
    })
  },

  // 导航到订单页面
  navigateToOrders() {
    wx.navigateTo({
      url: '/pages/order/order'
    })
  },

  // 导航到购物车
  navigateToCart() {
    wx.navigateTo({
      url: '/pages/cart/cart'
    })
  },

  // 导航到优惠券页面
  navigateToCoupons() {
    wx.navigateTo({
      url: '/pages/coupons/coupons'
    })
  },

  // 导航到收藏页面
  navigateToFavorites() {
    wx.navigateTo({
      url: '/pages/favorites/favorites'
    })
  },

  // 导航到收货地址
  navigateToAddress() {
    wx.navigateTo({
      url: '/pages/address/address'
    })
  },

  // 导航到停车记录
  navigateToParking() {
    wx.switchTab({
      url: '/pages/parking/parking'
    })
  },

  // 导航到客服中心
  navigateToCustomerService() {
    wx.navigateTo({
      url: '/pages/customer-service/customer-service'
    })
  },

  // 导航到设置页面
  navigateToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  }
}) 