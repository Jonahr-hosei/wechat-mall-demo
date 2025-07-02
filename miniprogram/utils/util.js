// utils/util.js

// 安全的getApp函数包装器
const safeGetApp = () => {
  try {
    if (typeof getApp === 'function') {
      return getApp()
    }
    return null
  } catch (error) {
    console.warn('getApp调用失败:', error)
    return null
  }
}

// 安全的Page函数包装器
const safePage = (config) => {
  if (typeof Page === 'function') {
    return Page(config)
  } else {
    console.warn('Page函数未定义，延迟注册页面')
    // 延迟注册，等待Page函数可用
    setTimeout(() => {
      if (typeof Page === 'function') {
        Page(config)
      }
    }, 100)
  }
}

// 安全的获取baseUrl函数
const getBaseUrl = () => {
  const app = getApp ? getApp() : null
  return app && app.globalData && app.globalData.baseUrl ? app.globalData.baseUrl : 'https://wxmall.shop'
}

// 基础配置
const baseConfig = {
  baseUrl: getBaseUrl(),
  timeout: 30000,
  maxRetries: 3
};

// 格式化时间
const formatTime = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 格式化日期
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${[year, month, day].map(formatNumber).join('-')}`
}

// 计算时间差
const timeDiff = (startTime, endTime) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const diff = end - start
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}

// 格式化金额
const formatMoney = (amount) => {
  return parseFloat(amount).toFixed(2)
}

// 生成随机字符串
const randomString = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 防抖函数
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 节流函数
const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 深拷贝
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

// 验证手机号
const validatePhone = (phone) => {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
}

// 验证车牌号
const validatePlate = (plate) => {
  const reg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{4}[A-Z0-9挂学警港澳]$/
  return reg.test(plate)
}

// 获取页面参数
const getPageParams = (options) => {
  const params = {}
  if (options) {
    Object.keys(options).forEach(key => {
      params[key] = decodeURIComponent(options[key])
    })
  }
  return params
}

// 设置页面标题
const setPageTitle = (title) => {
  wx.setNavigationBarTitle({
    title: title
  })
}

// 显示加载提示
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title: title,
    mask: true
  })
}

// 隐藏加载提示
const hideLoading = () => {
  wx.hideLoading()
}

// 显示成功提示
const showSuccess = (title, duration = 2000) => {
  wx.showToast({
    title: title,
    icon: 'success',
    duration: duration
  })
}

// 显示错误提示
const showError = (title, duration = 2000) => {
  wx.showToast({
    title: title,
    icon: 'none',
    duration: duration
  })
}

// 显示确认对话框
const showConfirm = (title, content) => {
  return new Promise((resolve) => {
    wx.showModal({
      title: title,
      content: content,
      success: (res) => {
        resolve(res.confirm)
      }
    })
  })
}

// 获取系统信息
const getSystemInfo = () => {
  return new Promise((resolve) => {
    wx.getSystemInfo({
      success: (res) => {
        resolve(res)
      }
    })
  })
}

// 检查网络状态
const checkNetwork = () => {
  return new Promise((resolve) => {
    wx.getNetworkType({
      success: (res) => {
        resolve(res.networkType)
      },
      fail: () => {
        resolve('unknown')
      }
    })
  })
}

// 网络诊断功能
const diagnoseNetwork = () => {
  return new Promise(async (resolve) => {
    const networkType = await checkNetwork()
    console.log('当前网络类型:', networkType)
    
    // 测试网络连接
    wx.request({
      url: 'https://www.baidu.com',
      method: 'GET',
      timeout: 5000,
      success: () => {
        console.log('网络连接正常')
        resolve({
          networkType,
          isConnected: true,
          message: '网络连接正常'
        })
      },
      fail: (err) => {
        console.log('网络连接异常:', err)
        resolve({
          networkType,
          isConnected: false,
          message: '网络连接异常',
          error: err
        })
      }
    })
  })
}

// 显示网络诊断结果
const showNetworkDiagnosis = async () => {
  const result = await diagnoseNetwork()
  
  let content = `网络类型: ${result.networkType}\n连接状态: ${result.isConnected ? '正常' : '异常'}`
  
  if (!result.isConnected) {
    content += '\n\n建议:\n1. 检查网络连接\n2. 尝试切换网络\n3. 重启小程序'
  }
  
  wx.showModal({
    title: '网络诊断',
    content: content,
    showCancel: false
  })
}

// 保存图片到相册
const saveImageToPhotosAlbum = (filePath) => {
  return new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      filePath: filePath,
      success: () => {
        resolve()
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

// 选择图片
const chooseImage = (count = 1, sizeType = ['compressed'], sourceType = ['album', 'camera']) => {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count: count,
      sizeType: sizeType,
      sourceType: sourceType,
      success: (res) => {
        resolve(res.tempFilePaths)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

// 上传文件
const uploadFile = (filePath, name = 'file') => {
  return new Promise((resolve, reject) => {
    const app = getApp ? getApp() : null
    const baseUrl = app && app.globalData && app.globalData.baseUrl ? app.globalData.baseUrl : 'https://wxmall.shop'
    
    wx.uploadFile({
      url: baseUrl + '/upload',
      filePath: filePath,
      name: name,
      success: (res) => {
        const data = JSON.parse(res.data)
        resolve(data)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

// 检查域名配置
const checkDomainConfig = () => {
  const domains = [
    'https://wxmall.shop',
    'https://www.baidu.com' // 用于测试网络连接
  ]
  
  return new Promise((resolve) => {
    let checkedCount = 0
    const results = []
    
    domains.forEach(domain => {
      wx.request({
        url: domain,
        method: 'GET',
        timeout: 5000,
        success: () => {
          results.push({
            domain,
            status: 'success',
            message: '连接成功'
          })
          checkedCount++
          if (checkedCount === domains.length) {
            resolve(results)
          }
        },
        fail: (err) => {
          results.push({
            domain,
            status: 'fail',
            message: err.errMsg || '连接失败',
            error: err
          })
          checkedCount++
          if (checkedCount === domains.length) {
            resolve(results)
          }
        }
      })
    })
  })
}

// 显示域名配置检查结果
const showDomainConfigCheck = async () => {
  wx.showLoading({
    title: '检查中...',
    mask: true
  })
  
  const results = await checkDomainConfig()
  wx.hideLoading()
  
  let content = '域名连接测试结果:\n\n'
  results.forEach(result => {
    const status = result.status === 'success' ? '✅' : '❌'
    content += `${status} ${result.domain}\n${result.message}\n\n`
  })
  
  if (results.some(r => r.status === 'fail')) {
    content += '建议:\n1. 检查微信公众平台域名白名单配置\n2. 确认域名已备案且支持HTTPS\n3. 检查网络连接'
  }
  
  wx.showModal({
    title: '域名配置检查',
    content: content,
    showCancel: false
  })
}

module.exports = {
  safeGetApp,
  safePage,
  getBaseUrl,
  formatTime,
  formatDate,
  timeDiff,
  formatMoney,
  randomString,
  debounce,
  throttle,
  deepClone,
  validatePhone,
  validatePlate,
  getPageParams,
  setPageTitle,
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  showConfirm,
  getSystemInfo,
  checkNetwork,
  showNetworkDiagnosis,
  saveImageToPhotosAlbum,
  chooseImage,
  uploadFile,
  checkDomainConfig,
  showDomainConfigCheck
} 