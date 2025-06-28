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

    // 获取用户积分
    this.getUserPoints()
    
    // 获取订单数量
    this.getOrderCount()
    
    // 获取优惠券数量
    this.getCouponCount()
    
    // 获取收藏数量
    this.getFavoriteCount()
  },

  // 获取用户积分
  getUserPoints() {
    const app = getApp()
    wx.request({
      url: `${app.globalData.baseUrl}/mall/user/${wx.getStorageSync('openId')}`,
      method: 'GET',
      success: (res) => {
        if (res.data.success) {
          this.setData({
            points: res.data.data.points || 0
          })
        }
      },
      fail: () => {
        this.setData({ points: 0 })
      }
    })
  },

  // 获取订单数量
  getOrderCount() {
    const app = getApp()
    wx.request({
      url: `${app.globalData.baseUrl}/mall/orders`,
      method: 'GET',
      data: { user_id: wx.getStorageSync('userId') },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            orderCount: res.data.data.length || 0
          })
        }
      },
      fail: () => {
        this.setData({ orderCount: 0 })
      }
    })
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