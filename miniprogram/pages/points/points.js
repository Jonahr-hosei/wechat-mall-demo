// points.js
const app = getApp()

Page({
  data: {
    userPoints: 0,
    dailyTasks: [],
    exchangeItems: [],
    pointsHistory: [],
    showRulesModal: false
  },

  onLoad() {
    this.loadUserPoints()
    this.loadDailyTasks()
    this.loadExchangeItems()
    this.loadPointsHistory()
  },

  onShow() {
    // 每次显示页面时刷新积分
    this.loadUserPoints()
  },

  // 加载用户积分
  loadUserPoints() {
    const openId = wx.getStorageSync('openId')
    if (!openId) return

    wx.request({
      url: `${app.globalData.baseUrl}/points/balance`,
      method: 'GET',
      data: { openId: openId },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            userPoints: res.data.data.points
          })
        }
      },
      fail: (err) => {
        console.error('加载积分失败', err)
        // 使用模拟数据
        this.setData({
          userPoints: 1250
        })
      }
    })
  },

  // 加载每日任务
  loadDailyTasks() {
    const openId = wx.getStorageSync('openId')
    if (!openId) return

    wx.request({
      url: `${app.globalData.baseUrl}/points/tasks`,
      method: 'GET',
      data: { openId: openId },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            dailyTasks: res.data.data
          })
        }
      },
      fail: (err) => {
        console.error('加载任务失败', err)
        // 使用模拟数据
        this.setData({
          dailyTasks: [
            {
              id: 1,
              name: '每日签到',
              description: '连续签到可获得更多积分',
              points: 10,
              icon: '/images/sign-in.png',
              completed: false
            },
            {
              id: 2,
              name: '分享商品',
              description: '分享商品给好友',
              points: 5,
              icon: '/images/share.png',
              completed: true
            },
            {
              id: 3,
              name: '评价商品',
              description: '评价已购买的商品',
              points: 20,
              icon: '/images/review.png',
              completed: false
            },
            {
              id: 4,
              name: '浏览商品',
              description: '浏览5个商品详情',
              points: 15,
              icon: '/images/browse.png',
              completed: false
            }
          ]
        })
      }
    })
  },

  // 加载兑换商品
  loadExchangeItems() {
    wx.request({
      url: `${app.globalData.baseUrl}/points/exchange-items`,
      method: 'GET',
      data: { limit: 10 },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            exchangeItems: res.data.data
          })
        }
      },
      fail: (err) => {
        console.error('加载兑换商品失败', err)
        // 使用模拟数据
        this.setData({
          exchangeItems: [
            {
              id: 1,
              name: '10元购物券',
              points: 1000,
              originalPrice: 10,
              image: '/images/coupon.png'
            },
            {
              id: 2,
              name: '停车券',
              points: 500,
              originalPrice: 5,
              image: '/images/parking-coupon.png'
            },
            {
              id: 3,
              name: '咖啡券',
              points: 300,
              originalPrice: 25,
              image: '/images/coffee.png'
            },
            {
              id: 4,
              name: '电影票',
              points: 800,
              originalPrice: 35,
              image: '/images/movie.png'
            }
          ]
        })
      }
    })
  },

  // 加载积分记录
  loadPointsHistory() {
    const openId = wx.getStorageSync('openId')
    if (!openId) return

    wx.request({
      url: `${app.globalData.baseUrl}/points/history`,
      method: 'GET',
      data: {
        openId: openId,
        limit: 10
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            pointsHistory: res.data.data
          })
        }
      },
      fail: (err) => {
        console.error('加载积分记录失败', err)
        // 使用模拟数据
        this.setData({
          pointsHistory: [
            {
              id: 1,
              title: '购物消费',
              points: 150,
              type: 'earn',
              time: '2024-01-15 14:30'
            },
            {
              id: 2,
              title: '兑换购物券',
              points: 1000,
              type: 'spend',
              time: '2024-01-14 16:20'
            },
            {
              id: 3,
              title: '每日签到',
              points: 10,
              type: 'earn',
              time: '2024-01-14 09:15'
            },
            {
              id: 4,
              title: '分享商品',
              points: 5,
              type: 'earn',
              time: '2024-01-13 20:45'
            }
          ]
        })
      }
    })
  },

  // 完成任务
  completeTask(e) {
    const taskId = e.currentTarget.dataset.id
    const openId = wx.getStorageSync('openId')
    
    wx.request({
      url: `${app.globalData.baseUrl}/points/complete-task`,
      method: 'POST',
      data: {
        openId: openId,
        taskId: taskId
      },
      success: (res) => {
        if (res.data.success) {
          wx.showToast({
            title: `获得${res.data.data.points}积分`,
            icon: 'success'
          })
          this.loadUserPoints()
          this.loadDailyTasks()
        }
      },
      fail: (err) => {
        console.error('完成任务失败', err)
        wx.showToast({
          title: '任务完成失败',
          icon: 'none'
        })
      }
    })
  },

  // 兑换商品
  exchangeItem(e) {
    const itemId = e.currentTarget.dataset.id
    const item = this.data.exchangeItems.find(i => i.id === itemId)
    
    if (!item) return

    if (this.data.userPoints < item.points) {
      wx.showToast({
        title: '积分不足',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '确认兑换',
      content: `确定要使用${item.points}积分兑换"${item.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          this.processExchange(itemId)
        }
      }
    })
  },

  // 处理兑换
  processExchange(itemId) {
    const openId = wx.getStorageSync('openId')
    
    wx.request({
      url: `${app.globalData.baseUrl}/points/exchange`,
      method: 'POST',
      data: {
        openId: openId,
        itemId: itemId
      },
      success: (res) => {
        if (res.data.success) {
          wx.showToast({
            title: '兑换成功',
            icon: 'success'
          })
          this.loadUserPoints()
          this.loadPointsHistory()
        }
      },
      fail: (err) => {
        console.error('兑换失败', err)
        wx.showToast({
          title: '兑换失败',
          icon: 'none'
        })
      }
    })
  },

  // 显示积分规则
  showPointsRules() {
    this.setData({
      showRulesModal: true
    })
  },

  // 隐藏积分规则
  hidePointsRules() {
    this.setData({
      showRulesModal: false
    })
  },

  // 导航到赚积分页面
  navigateToEarn() {
    wx.navigateTo({
      url: '/pages/earn-points/earn-points'
    })
  },

  // 导航到兑换页面
  navigateToExchange() {
    wx.navigateTo({
      url: '/pages/exchange-points/exchange-points'
    })
  },

  // 导航到积分明细页面
  navigateToHistory() {
    wx.navigateTo({
      url: '/pages/points-history/points-history'
    })
  }
}) 