// admin.js
const { safeGetApp, safePage } = require('../../utils/util.js')
const http = require('../../utils/request.js')
const util = require('../../utils/util.js')

const app = safeGetApp()

safePage({
  data: {
    isLoggedIn: false,
    username: '',
    password: '',
    stats: {
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      todayOrders: 0
    },
    recentOrders: []
  },

  onLoad() {
    // 检查登录状态
    const adminToken = wx.getStorageSync('adminToken')
    if (adminToken) {
      this.setData({ isLoggedIn: true })
      this.loadStats()
      this.loadRecentOrders()
    }
  },

  // 用户名输入
  onUsernameInput(e) {
    this.setData({
      username: e.detail.value
    })
  },

  // 密码输入
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    })
  },

  // 管理员登录
  login() {
    const { username, password } = this.data
    
    if (!username.trim()) {
      util.showError('请输入用户名')
      return
    }
    
    if (!password.trim()) {
      util.showError('请输入密码')
      return
    }

    util.showLoading('登录中...')

    http.post('/admin/login', {
      username: username,
      password: password
    }).then(res => {
      wx.setStorageSync('adminToken', res.data.token)
      this.setData({ 
        isLoggedIn: true,
        username: '',
        password: ''
      })
      util.showSuccess('登录成功')
      this.loadStats()
      this.loadRecentOrders()
    }).catch(err => {
      console.error('登录失败', err)
      util.showError('登录失败，请检查用户名和密码')
    }).finally(() => {
      util.hideLoading()
    })
  },

  // 退出登录
  logout() {
    util.showConfirm('确认退出', '确定要退出登录吗？').then(confirm => {
      if (confirm) {
        wx.removeStorageSync('adminToken')
        this.setData({ isLoggedIn: false })
        util.showSuccess('已退出登录')
      }
    })
  },

  // 加载统计数据
  loadStats() {
    http.get('/admin/stats').then(res => {
      this.setData({
        stats: res.data
      })
    }).catch(err => {
      console.error('加载统计数据失败', err)
      // 使用模拟数据
      this.setData({
        stats: {
          totalUsers: 1250,
          totalOrders: 3680,
          totalRevenue: 125680.50,
          todayOrders: 45
        }
      })
    })
  },

  // 加载最近订单
  loadRecentOrders() {
    http.get('/admin/orders/recent').then(res => {
      this.setData({
        recentOrders: res.data
      })
    }).catch(err => {
      console.error('加载最近订单失败', err)
      // 使用模拟数据
      this.setData({
        recentOrders: [
          {
            id: 1,
            orderNo: 'ORD20240115001',
            createTime: '2024-01-15 14:30:00',
            amount: 299.00,
            status: 'paid',
            statusText: '已支付'
          },
          {
            id: 2,
            orderNo: 'ORD20240115002',
            createTime: '2024-01-15 13:20:00',
            amount: 199.00,
            status: 'pending',
            statusText: '待支付'
          },
          {
            id: 3,
            orderNo: 'ORD20240115003',
            createTime: '2024-01-15 12:15:00',
            amount: 399.00,
            status: 'shipped',
            statusText: '已发货'
          }
        ]
      })
    })
  },

  // 刷新统计数据
  refreshStats() {
    this.loadStats()
    this.loadRecentOrders()
    util.showSuccess('数据已刷新')
  },

  // 导航到商品管理
  navigateToProductManage() {
    wx.navigateTo({
      url: '/pages/admin/product-manage/product-manage'
    })
  },

  // 导航到订单管理
  navigateToOrderManage() {
    wx.navigateTo({
      url: '/pages/admin/order-manage/order-manage'
    })
  },

  // 导航到用户管理
  navigateToUserManage() {
    wx.navigateTo({
      url: '/pages/admin/user-manage/user-manage'
    })
  },

  // 导航到停车管理
  navigateToParkingManage() {
    wx.navigateTo({
      url: '/pages/admin/parking-manage/parking-manage'
    })
  },

  // 导航到积分管理
  navigateToPointsManage() {
    wx.navigateTo({
      url: '/pages/admin/points-manage/points-manage'
    })
  },

  // 导航到数据统计
  navigateToStatistics() {
    wx.navigateTo({
      url: '/pages/admin/statistics/statistics'
    })
  }
}) 