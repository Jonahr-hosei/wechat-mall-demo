const app = getApp()

// 请求基础配置
const baseConfig = {
  baseUrl: app.globalData.baseUrl,
  timeout: 10000,
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

// 基础配置
const BASE_URL = 'http://localhost:5000/api/mall'; // 后台管理系统API地址

// 请求封装
const request = (options) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.success) {
            resolve(res.data);
          } else {
            reject(new Error(res.data.message || '请求失败'));
          }
        } else {
          reject(new Error(`HTTP错误: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(new Error('网络请求失败'));
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
    url: `/users/${userId}/orders`,
    data: params
  }),

  // 用户相关
  getUserInfo: (userId) => request({
    url: `/users/${userId}`
  }),

  updateUserInfo: (userId, userData) => request({
    url: `/users/${userId}`,
    method: 'PUT',
    data: userData
  }),

  // 积分相关
  getUserPoints: (userId) => request({
    url: `/users/${userId}/points`
  }),

  getPointRecords: (userId, params) => request({
    url: `/users/${userId}/point-records`,
    data: params
  }),

  // 停车相关
  getParkingStatus: (userId) => request({
    url: `/users/${userId}/parking/status`
  }),

  startParking: (parkingData) => request({
    url: '/parking/start',
    method: 'POST',
    data: parkingData
  }),

  endParking: (parkingId) => request({
    url: `/parking/${parkingId}/end`,
    method: 'POST'
  }),

  payParking: (parkingId, paymentData) => request({
    url: `/parking/${parkingId}/pay`,
    method: 'POST',
    data: paymentData
  }),

  getParkingHistory: (userId, params) => request({
    url: `/users/${userId}/parking/history`,
    data: params
  })
};

module.exports = {
  request,
  api
}; 