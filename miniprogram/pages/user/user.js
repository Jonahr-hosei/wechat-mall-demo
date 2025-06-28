// user.js
const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    userInfo: null,
    userPoints: 0,
    orderCount: 0,
    couponCount: 0,
    favoriteCount: 0
  },

  onLoad() {
    this.loadUserInfo()
    this.loadUserStats()
  },

  onShow() {
    this.loadUserInfo()
    this.loadUserStats()
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({ userInfo })
    }
  },

  // 加载用户统计数据
  loadUserStats() {
    const openId = wx.getStorageSync('openId')
    if (!openId) return

    // 加载积分
    this.loadUserPoints()
    
    // 加载订单数量
    this.loadOrderCount()
    
    // 加载优惠券数量
    this.loadCouponCount()
    
    // 加载收藏数量
    this.loadFavoriteCount()
  },

  // 加载用户积分
  loadUserPoints() {
    // 这里应该调用API获取积分，暂时使用模拟数据
    this.setData({
      userPoints: 1250
    })
  },

  // 加载订单数量
  loadOrderCount() {
    // 这里应该调用API获取订单数量，暂时使用模拟数据
    this.setData({
      orderCount: 8
    })
  },

  // 加载优惠券数量
  loadCouponCount() {
    // 这里应该调用API获取优惠券数量，暂时使用模拟数据
    this.setData({
      couponCount: 3
    })
  },

  // 加载收藏数量
  loadFavoriteCount() {
    // 这里应该调用API获取收藏数量，暂时使用模拟数据
    this.setData({
      favoriteCount: 12
    })
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
          userPoints: 0,
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