// 基础配置
const baseConfig = {
  baseUrl: 'https://wxmall.shop',
  timeout: 15000,
  maxRetries: 2
};

// 开发环境检测
const isDevelopment = () => {
  try {
    // 使用新的API替代已弃用的wx.getSystemInfoSync
    const systemInfo = wx.getAppBaseInfo()
    return systemInfo.platform === 'devtools'
  } catch (error) {
    return false
  }
}

// 带重试的请求方法
const requestWithRetry = (options, retryCount = 0) => {
  return new Promise(async (resolve, reject) => {
    // 显示加载提示
    if (options.showLoading !== false && retryCount === 0) {
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
    }

    const requestUrl = baseConfig.baseUrl + options.url
    console.log(`发起请求 (第${retryCount + 1}次):`, requestUrl, options.data)

    // 开发环境提示
    if (isDevelopment()) {
      console.log('⚠️ 开发环境提示：请确保已在微信公众平台配置域名白名单')
      console.log('域名：https://wxmall.shop')
    }

    // 发起请求
    wx.request({
      url: requestUrl,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      timeout: baseConfig.timeout,
      enableHttp2: true,
      enableQuic: true,
      success: (res) => {
        console.log('请求成功:', res)
        if (retryCount === 0) {
          wx.hideLoading()
        }
        
        if (res.statusCode === 200) {
          if (res.data && res.data.success !== undefined) {
            resolve(res.data);
          } else {
            resolve(res.data);
          }
        } else {
          reject(new Error(`HTTP错误: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        console.error(`请求失败 (第${retryCount + 1}次):`, err)
        
        if (retryCount === baseConfig.maxRetries) {
          wx.hideLoading()
        }
        
        let errorMsg = '网络请求失败'
        if (err.errMsg) {
          if (err.errMsg.includes('timeout')) {
            errorMsg = '请求超时，请检查网络'
          } else if (err.errMsg.includes('fail')) {
            errorMsg = '网络连接失败'
          } else {
            errorMsg = err.errMsg
          }
        }
        
        if (retryCount < baseConfig.maxRetries) {
          console.log(`准备重试请求 (${retryCount + 1}/${baseConfig.maxRetries})`)
          setTimeout(() => {
            requestWithRetry(options, retryCount + 1)
              .then(resolve)
              .catch(reject)
          }, 1000 * (retryCount + 1))
        } else {
          if (isDevelopment()) {
            wx.showModal({
              title: '网络请求失败',
              content: `请检查网络连接和域名配置\n错误: ${errorMsg}`,
              showCancel: false
            })
          } else {
            wx.showToast({
              title: errorMsg,
              icon: 'none',
              duration: 3000
            })
          }
          reject(new Error(errorMsg))
        }
      }
    });
  });
};

// 简化的请求方法
const request = (options) => {
  return requestWithRetry(options, 0);
};

// API方法
const getHomeData = () => request({ url: '/api/mall/home' })
const getProducts = (params) => request({ url: '/api/mall/products', data: params })
const getProductDetail = (id) => request({ url: `/api/mall/products/${id}` })
const getCategories = () => request({ url: '/api/mall/categories' })
const getOrders = (params) => request({ url: '/api/orders', data: params })
const getOrderDetail = (id) => request({ url: `/api/orders/${id}` })
const createOrder = (data) => request({ url: '/api/orders', method: 'POST', data })
const updateOrder = (id, data) => request({ url: `/api/orders/${id}`, method: 'PUT', data })
const deleteOrder = (id) => request({ url: `/api/orders/${id}`, method: 'DELETE' })
const getUserInfo = (id) => request({ url: `/api/users/${id}` })
const updateUserInfo = (id, data) => request({ url: `/api/users/${id}`, method: 'PUT', data })
const getPoints = (userId) => request({ url: `/api/points/${userId}` })
const addPoints = (userId, data) => request({ url: `/api/points/${userId}/add`, method: 'POST', data })
const usePoints = (userId, data) => request({ url: `/api/points/${userId}/use`, method: 'POST', data })
const getParkingInfo = (userId) => request({ url: `/api/parking/${userId}` })
const startParking = (data) => request({ url: '/api/parking/start', method: 'POST', data })
const endParking = (id) => request({ url: `/api/parking/${id}/end`, method: 'POST' })
const payParking = (id, data) => request({ url: `/api/parking/${id}/pay`, method: 'POST', data })
const getParkingHistory = (userId, params) => request({ url: `/api/parking/${userId}/history`, data: params })

// 公告相关API
const getAnnouncements = (params) => request({ url: '/api/announcements', data: params })
const getAnnouncementDetail = (id) => request({ url: `/api/announcements/${id}` })
const getHomeAnnouncements = (params) => request({ url: '/api/announcements/home/list', data: params })

module.exports = {
  request,
  getHomeData,
  getProducts,
  getProductDetail,
  getCategories,
  getOrders,
  getOrderDetail,
  createOrder,
  updateOrder,
  deleteOrder,
  getUserInfo,
  updateUserInfo,
  getPoints,
  addPoints,
  usePoints,
  getParkingInfo,
  startParking,
  endParking,
  payParking,
  getParkingHistory,
  getAnnouncements,
  getAnnouncementDetail,
  getHomeAnnouncements
}; 