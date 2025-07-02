const { safeGetApp, safePage } = require('../../utils/util.js')
const util = require('../../utils/util.js')

const app = safeGetApp()

// 安全的获取baseUrl函数
const getBaseUrl = () => {
  return app && app.globalData && app.globalData.baseUrl ? app.globalData.baseUrl : 'https://wxmall.shop'
}

safePage({
  data: {
    orderId: '',
    orderInfo: null,
    loading: true
  },

  onLoad(options) {
    const { orderId } = options
    this.setData({ orderId })
    this.loadOrderDetail(orderId)
  },

  // 加载订单详情
  loadOrderDetail(orderId) {
    wx.request({
      url: `${getBaseUrl()}/orders/${orderId}`,
      method: 'GET',
      success: (res) => {
        if (res.data.success) {
          this.setData({
            orderInfo: res.data.data,
            loading: false
          })
        } else {
          wx.showToast({
            title: '获取订单详情失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('获取订单详情失败', err)
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      'pending': '待支付',
      'processing': '处理中',
      'completed': '已完成',
      'cancelled': '已取消',
      'timeout': '已超时'
    }
    return statusMap[status] || status
  },

  // 获取状态描述
  getStatusDesc(status) {
    const descMap = {
      'pending': '请尽快完成支付，订单将在15分钟后自动取消',
      'processing': '订单正在处理中，请耐心等待',
      'completed': '订单已完成，感谢您的购买',
      'cancelled': '订单已取消',
      'timeout': '订单已超时取消'
    }
    return descMap[status] || ''
  },

  // 获取支付方式文本
  getPaymentMethodText(method) {
    const methodMap = {
      'wechat': '微信支付',
      'alipay': '支付宝'
    }
    return methodMap[method] || method || '未支付'
  },

  // 复制订单号
  copyOrderNo() {
    const { orderInfo } = this.data
    if (orderInfo && orderInfo.order_no) {
      wx.setClipboardData({
        data: orderInfo.order_no,
        success: () => {
          wx.showToast({
            title: '订单号已复制',
            icon: 'success'
          })
        }
      })
    }
  },

  // 联系客服
  contactService() {
    wx.showToast({
      title: '客服功能开发中',
      icon: 'none'
    })
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  }
}) 