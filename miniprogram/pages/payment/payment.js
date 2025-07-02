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
    orderNo: '',
    amount: 0,
    remainingTime: 15 * 60, // 15分钟倒计时
    timer: null,
    paymentMethod: 'wechat',
    loading: false
  },

  onLoad(options) {
    const { orderId, orderNo, amount } = options
    this.setData({
      orderId,
      orderNo,
      amount: parseFloat(amount)
    })
    
    this.startTimer()
  },

  onUnload() {
    if (this.data.timer) {
      clearInterval(this.data.timer)
    }
  },

  // 开始倒计时
  startTimer() {
    const timer = setInterval(() => {
      const remaining = this.data.remainingTime - 1
      
      if (remaining <= 0) {
        clearInterval(timer)
        this.orderTimeout()
      } else {
        this.setData({ remainingTime: remaining })
      }
    }, 1000)

    this.setData({ timer })
  },

  // 格式化时间
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  },

  // 订单超时
  orderTimeout() {
    wx.showModal({
      title: '订单超时',
      content: '您的订单已超时，请重新下单',
      showCancel: false,
      success: () => {
        wx.navigateBack()
      }
    })
  },

  // 选择支付方式
  selectPaymentMethod(e) {
    const method = e.currentTarget.dataset.method
    this.setData({ paymentMethod: method })
  },

  // 确认支付
  confirmPayment() {
    if (this.data.loading) return

    this.setData({ loading: true })

    // 调用微信支付
    this.callWechatPay()
  },

  // 调用微信支付
  callWechatPay() {
    const { orderId, orderNo, amount } = this.data

    // 首先调用后端创建支付订单
    wx.request({
      url: `${getBaseUrl()}/orders/${orderId}/pay`,
      method: 'POST',
      data: {
        payment_method: 'wechat',
        amount: amount
      },
      success: (res) => {
        if (res.data.success) {
          // 模拟微信支付参数（实际项目中需要后端返回真实的支付参数）
          const payParams = {
            timeStamp: Math.floor(Date.now() / 1000).toString(),
            nonceStr: Math.random().toString(36).substr(2, 15),
            package: `prepay_id=${res.data.data.prepay_id || 'mock_prepay_id'}`,
            signType: 'MD5',
            paySign: 'mock_pay_sign'
          }

          // 调用微信支付
          wx.requestPayment({
            ...payParams,
            success: (payRes) => {
              this.paymentSuccess()
            },
            fail: (payErr) => {
              console.error('支付失败', payErr)
              if (payErr.errMsg !== 'requestPayment:fail cancel') {
                wx.showToast({
                  title: '支付失败',
                  icon: 'none'
                })
              }
            }
          })
        } else {
          wx.showToast({
            title: res.data.message || '支付失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('创建支付订单失败', err)
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },

  // 支付成功
  paymentSuccess() {
    wx.showToast({
      title: '支付成功',
      icon: 'success'
    })

    // 跳转到支付成功页面
    setTimeout(() => {
      wx.redirectTo({
        url: `/pages/payment-success/payment-success?orderId=${this.data.orderId}&orderNo=${this.data.orderNo}`
      })
    }, 1500)
  },

  // 取消支付
  cancelPayment() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消支付吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack()
        }
      }
    })
  },

  // 联系客服
  contactService() {
    wx.showToast({
      title: '客服功能开发中',
      icon: 'none'
    })
  }
}) 