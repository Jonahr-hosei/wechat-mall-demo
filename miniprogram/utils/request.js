const app = getApp()

// 请求基础配置
const baseConfig = {
  baseUrl: 'https://wechat-mall-demo.vercel.app/api/mall', // 云端后端服务API地址
  timeout: 30000, // 增加超时时间到30秒，适应云端网络
  header: {
    'Content-Type': 'application/json'
  }
}

// 请求拦截器
const requestInterceptor = (config) => {
  // 添加token
  const token = wx.getStorageSync('token')
  if (token) {
    config.header.Authorization = `Bearer ${token}`
  }
  
  // 添加openId
  const openId = wx.getStorageSync('openId')
  if (openId) {
    config.data = config.data || {}
    config.data.openId = openId
  }
  
  return config
}

// 响应拦截器
const responseInterceptor = (response) => {
  const { statusCode, data } = response
  
  if (statusCode === 200) {
    if (data.success) {
      return data
    } else {
      // 业务错误
      wx.showToast({
        title: data.message || '请求失败',
        icon: 'none'
      })
      return Promise.reject(data)
    }
  } else if (statusCode === 401) {
    // 未授权，重新登录
    wx.removeStorageSync('token')
    wx.removeStorageSync('openId')
    wx.showToast({
      title: '请重新登录',
      icon: 'none'
    })
    return Promise.reject(response)
  } else {
    // 网络错误
    wx.showToast({
      title: '网络错误',
      icon: 'none'
    })
    return Promise.reject(response)
  }
}

// 请求封装
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 显示加载提示
    if (options.showLoading !== false) {
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
    }

    console.log('发起请求:', baseConfig.baseUrl + options.url, options.data)

    wx.request({
      url: baseConfig.baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      timeout: baseConfig.timeout,
      success: (res) => {
        wx.hideLoading()
        console.log('请求成功:', res)
        
        if (res.statusCode === 200) {
          if (res.data.success) {
            resolve(res.data);
          } else {
            wx.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            })
            reject(new Error(res.data.message || '请求失败'));
          }
        } else {
          wx.showToast({
            title: `网络错误: ${res.statusCode}`,
            icon: 'none'
          })
          reject(new Error(`HTTP错误: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('请求失败:', err)
        
        // 根据错误类型显示不同提示
        let errorMsg = '网络请求失败'
        if (err.errMsg) {
          if (err.errMsg.includes('timeout')) {
            errorMsg = '请求超时，请检查网络'
          } else if (err.errMsg.includes('fail')) {
            errorMsg = '网络连接失败'
          } else if (err.errMsg.includes('ssl')) {
            errorMsg = 'SSL证书验证失败'
          }
        }
        
        wx.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 3000
        })
        reject(new Error(errorMsg));
      }
    });
  });
};

// API方法
const api = {
  // 商品相关
  getCategories: () => request({ url: '/categories' }),
  
  getProducts: (params) => request({ 
    url: '/products',
    data: params
  }),
  
  getProductDetail: (id) => request({ 
    url: `/products/${id}` 
  }),

  // 订单相关
  createOrder: (orderData) => request({
    url: '/orders',
    method: 'POST',
    data: orderData
  }),

  payOrder: (orderId, paymentData) => request({
    url: `/orders/${orderId}/pay`,
    method: 'POST',
    data: paymentData
  }),

  getUserOrders: (userId, params) => request({
    url: `/orders`,
    data: { user_id: userId, ...params }
  }),

  getOrderDetail: (orderId) => request({
    url: `/orders/${orderId}`
  }),

  cancelOrder: (orderId) => request({
    url: `/orders/${orderId}/cancel`,
    method: 'POST'
  }),

  // 用户相关
  getUserInfo: (openId) => request({
    url: `/user/${openId}`
  }),

  createUser: (userData) => request({
    url: '/user',
    method: 'POST',
    data: userData
  }),

  // 积分相关
  getUserPoints: (userId) => request({
    url: `/points/${userId}`
  }),

  getPointRecords: (userId, params) => request({
    url: `/points/${userId}/records`,
    data: params
  }),

  // 停车相关
  getParkingStatus: (userId) => request({
    url: `/parking/${userId}`
  }),

  startParking: (parkingData) => request({
    url: '/parking/entry',
    method: 'POST',
    data: parkingData
  }),

  endParking: (recordId) => request({
    url: `/parking/exit/${recordId}`,
    method: 'POST'
  }),

  payParking: (recordId, paymentData) => request({
    url: `/parking/exit/${recordId}`,
    method: 'POST',
    data: paymentData
  }),

  getParkingHistory: (userId, params) => request({
    url: `/parking/${userId}`,
    data: params
  }),

  // 首页数据
  getHomeData: () => request({
    url: '/home',
    showLoading: false // 首页不显示loading
  }),

  // 订单状态查询
  getOrderStatus: (orderId) => request({
    url: `/orders/${orderId}/status`
  })
};

module.exports = {
  request,
  api
}; 