const app = getApp()

Page({
  data: {
    orderId: '',
    orderNo: '',
    loading: true,
    orderInfo: null
  },

  onLoad(options) {
    const { orderId, orderNo } = options
    this.setData({
      orderId,
      orderNo
    })
    
    this.loadOrderInfo(orderId)
  },

  // 加载订单信息
  loadOrderInfo(orderId) {
    wx.request({
      url: `${app.globalData.baseUrl}/orders/${orderId}`,
      method: 'GET',
      success: (res) => {
        if (res.data.success) {
          this.setData({
            orderInfo: res.data.data,
            loading: false
          })
        } else {
          wx.showToast({
            title: '获取订单信息失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('获取订单信息失败', err)
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  },

  // 查看订单详情
  viewOrderDetail() {
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?orderId=${this.data.orderId}`
    })
  },

  // 继续购物
  continueShopping() {
    wx.switchTab({
      url: '/pages/mall/mall'
    })
  },

  // 返回首页
  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 分享订单
  onShareAppMessage() {
    return {
      title: '我在微信商城购买了好商品！',
      path: '/pages/index/index'
    }
  }
}) 