const app = getApp()

Page({
  data: {
    product: null,
    loading: true,
    cartCount: 0,
    selectedQuantity: 1,
    showShareMenu: false,
    // 评价相关
    reviews: [],
    reviewStats: {
      total: 0,
      average: 0,
      distribution: {}
    },
    // 支付相关
    orderTimer: null,
    paymentDeadline: null,
    showSpecModal: false,
    selectedSpec: {},
    reviewTotal: 0,
    user_id: null
  },

  onLoad(options) {
    const { id } = options
    if (id) {
      this.loadProductDetail(id)
      this.loadReviews()
    }
    this.updateCartCount()
  },

  onShow() {
    this.updateCartCount()
  },

  onUnload() {
    // 清除定时器
    if (this.data.orderTimer) {
      clearInterval(this.data.orderTimer)
    }
  },

  // 加载商品详情
  loadProductDetail(id) {
    this.setData({ loading: true })
    
    wx.request({
      url: `${app.globalData.baseUrl}/products/${id}`,
      method: 'GET',
      success: (res) => {
        if (res.data.success) {
          this.setData({ 
            product: res.data.data,
            loading: false 
          })
        } else {
          wx.showToast({
            title: res.data.message || '商品不存在',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('加载商品详情失败', err)
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
        this.setData({ loading: false })
      }
    })
  },

  // 加载商品评价
  loadReviews() {
    // 获取用户ID
    const user_id = wx.getStorageSync('userId') || null
    this.setData({ user_id })
  },

  // 更新购物车数量
  updateCartCount() {
    const cart = wx.getStorageSync('cart') || []
    this.setData({
      cartCount: cart.length
    })
  },

  // 数量变化
  onQuantityChange(e) {
    const type = e.currentTarget.dataset.type
    let quantity = this.data.selectedQuantity
    
    if (type === 'minus') {
      quantity = Math.max(1, quantity - 1)
    } else if (type === 'plus') {
      quantity = Math.min(this.data.product.stock, quantity + 1)
    } else {
      // 直接输入
      quantity = parseInt(e.detail.value) || 1
      quantity = Math.max(1, Math.min(this.data.product.stock, quantity))
    }
    
    this.setData({
      selectedQuantity: quantity
    })
  },

  // 加入购物车
  addToCart() {
    const { product, selectedQuantity } = this.data
    let cart = wx.getStorageSync('cart') || []
    
    // 检查是否已在购物车中
    const existingIndex = cart.findIndex(item => item.id === product.id)
    
    if (existingIndex >= 0) {
      // 更新数量
      cart[existingIndex].quantity += selectedQuantity
    } else {
      // 添加新商品
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: selectedQuantity
      })
    }
    
    wx.setStorageSync('cart', cart)
    this.updateCartCount()
    
    wx.showToast({
      title: '已加入购物车',
      icon: 'success'
    })
  },

  // 立即购买
  buyNow() {
    const { product, selectedQuantity } = this.data
    
    // 创建订单
    this.createOrder([{
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      quantity: selectedQuantity,
      subtotal: product.price * selectedQuantity
    }])
  },

  // 创建订单
  createOrder(items) {
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0)
    const user_id = wx.getStorageSync('userId') || 1 // 模拟用户ID
    
    wx.request({
      url: `${app.globalData.baseUrl}/orders`,
      method: 'POST',
      data: {
        user_id,
        items,
        total_amount: totalAmount,
        payment_method: 'wechat'
      },
      success: (res) => {
        if (res.data.success) {
          const orderId = res.data.data.order_id
          const orderNo = res.data.data.order_no
          
          // 设置支付倒计时
          this.startPaymentTimer(orderId, orderNo)
          
          // 跳转到支付页面
          wx.navigateTo({
            url: `/pages/payment/payment?orderId=${orderId}&orderNo=${orderNo}&amount=${totalAmount}`
          })
        } else {
          wx.showToast({
            title: res.data.message || '创建订单失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('创建订单失败', err)
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  },

  // 开始支付倒计时
  startPaymentTimer(orderId, orderNo) {
    const deadline = new Date(Date.now() + 15 * 60 * 1000) // 15分钟后
    this.setData({
      paymentDeadline: deadline
    })

    const timer = setInterval(() => {
      const now = new Date()
      const remaining = deadline - now
      
      if (remaining <= 0) {
        // 时间到，取消订单
        this.cancelOrder(orderId, orderNo)
        clearInterval(timer)
      }
    }, 1000)

    this.setData({ orderTimer: timer })
  },

  // 取消订单
  cancelOrder(orderId, orderNo) {
    wx.request({
      url: `${app.globalData.baseUrl}/orders/${orderId}/cancel`,
      method: 'POST',
      success: (res) => {
        if (res.data.success) {
          wx.showToast({
            title: '订单已超时取消',
            icon: 'none'
          })
        }
      }
    })
  },

  // 分享商品
  onShareAppMessage() {
    const { product } = this.data
    return {
      title: product ? product.name : '发现好商品',
      path: `/pages/product-detail/product-detail?id=${product.id}`,
      imageUrl: product ? product.image : ''
    }
  },

  // 预览图片
  previewImage(e) {
    const { current } = e.currentTarget.dataset
    const { product } = this.data
    
    if (product && product.image) {
      wx.previewImage({
        current,
        urls: [product.image]
      })
    }
  },

  // 导航到购物车
  navigateToCart() {
    wx.navigateTo({
      url: '/pages/cart2/cart'
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