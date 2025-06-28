// parking.js
const app = getApp()

Page({
  data: {
    parkingInfo: null,
    plateList: [],
    parkingHistory: [],
    showAddPlateModal: false,
    newPlateNumber: '',
    vehicleTypes: ['小型车', '中型车', '大型车'],
    selectedVehicleType: 0
  },

  onLoad() {
    this.loadParkingStatus()
    this.loadPlateList()
    this.loadParkingHistory()
  },

  onShow() {
    // 每次显示页面时刷新停车状态
    this.loadParkingStatus()
  },

  // 加载停车状态
  loadParkingStatus() {
    const openId = wx.getStorageSync('openId')
    if (!openId) return

    wx.request({
      url: `${app.globalData.baseUrl}/parking/status`,
      method: 'GET',
      data: {
        openId: openId,
        parkingLotId: app.globalData.parkingLotId
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            parkingInfo: res.data.data
          })
        }
      },
      fail: (err) => {
        console.error('加载停车状态失败', err)
        // 使用模拟数据
        this.setData({
          parkingInfo: {
            plateNumber: '京A12345',
            entryTime: '2024-01-15 10:30:00',
            duration: '2小时30分钟',
            fee: 15.00
          }
        })
      }
    })
  },

  // 加载车牌列表
  loadPlateList() {
    const openId = wx.getStorageSync('openId')
    if (!openId) return

    wx.request({
      url: `${app.globalData.baseUrl}/parking/plates`,
      method: 'GET',
      data: { openId: openId },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            plateList: res.data.data
          })
        }
      },
      fail: (err) => {
        console.error('加载车牌列表失败', err)
        // 使用模拟数据
        this.setData({
          plateList: [
            {
              id: 1,
              plateNumber: '京A12345',
              type: '小型车',
              isDefault: true
            },
            {
              id: 2,
              plateNumber: '京B67890',
              type: '小型车',
              isDefault: false
            }
          ]
        })
      }
    })
  },

  // 加载停车记录
  loadParkingHistory() {
    const openId = wx.getStorageSync('openId')
    if (!openId) return

    wx.request({
      url: `${app.globalData.baseUrl}/parking/history`,
      method: 'GET',
      data: {
        openId: openId,
        limit: 5
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            parkingHistory: res.data.data
          })
        }
      },
      fail: (err) => {
        console.error('加载停车记录失败', err)
        // 使用模拟数据
        this.setData({
          parkingHistory: [
            {
              id: 1,
              plateNumber: '京A12345',
              entryTime: '2024-01-15 10:30:00',
              exitTime: '2024-01-15 13:00:00',
              duration: '2小时30分钟',
              fee: 15.00,
              status: 'paid'
            },
            {
              id: 2,
              plateNumber: '京A12345',
              entryTime: '2024-01-14 14:20:00',
              exitTime: '2024-01-14 16:50:00',
              duration: '2小时30分钟',
              fee: 15.00,
              status: 'paid'
            }
          ]
        })
      }
    })
  },

  // 支付停车费
  payParkingFee() {
    if (!this.data.parkingInfo) {
      wx.showToast({
        title: '暂无停车信息',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '确认支付',
      content: `停车费用：¥${this.data.parkingInfo.fee}`,
      success: (res) => {
        if (res.confirm) {
          this.processPayment()
        }
      }
    })
  },

  // 处理支付
  processPayment() {
    wx.showLoading({
      title: '支付中...'
    })

    const openId = wx.getStorageSync('openId')
    const paymentData = {
      openId: openId,
      parkingLotId: app.globalData.parkingLotId,
      plateNumber: this.data.parkingInfo.plateNumber,
      amount: this.data.parkingInfo.fee,
      type: 'parking'
    }

    wx.request({
      url: `${app.globalData.baseUrl}/payment/create`,
      method: 'POST',
      data: paymentData,
      success: (res) => {
        if (res.data.success) {
          // 调用微信支付
          wx.requestPayment({
            timeStamp: res.data.data.timeStamp,
            nonceStr: res.data.data.nonceStr,
            package: res.data.data.package,
            signType: res.data.data.signType,
            paySign: res.data.data.paySign,
            success: () => {
              wx.showToast({
                title: '支付成功',
                icon: 'success'
              })
              this.loadParkingStatus()
              this.loadParkingHistory()
            },
            fail: () => {
              wx.showToast({
                title: '支付失败',
                icon: 'none'
              })
            }
          })
        }
      },
      fail: (err) => {
        console.error('创建支付订单失败', err)
        wx.showToast({
          title: '支付失败',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  // 显示添加车牌弹窗
  showAddPlateModal() {
    this.setData({
      showAddPlateModal: true,
      newPlateNumber: '',
      selectedVehicleType: 0
    })
  },

  // 隐藏添加车牌弹窗
  hideAddPlateModal() {
    this.setData({
      showAddPlateModal: false
    })
  },

  // 车牌号输入
  onPlateNumberInput(e) {
    this.setData({
      newPlateNumber: e.detail.value
    })
  },

  // 车辆类型选择
  onVehicleTypeChange(e) {
    this.setData({
      selectedVehicleType: e.detail.value
    })
  },

  // 添加车牌
  addPlate() {
    if (!this.data.newPlateNumber.trim()) {
      wx.showToast({
        title: '请输入车牌号码',
        icon: 'none'
      })
      return
    }

    const openId = wx.getStorageSync('openId')
    const plateData = {
      openId: openId,
      plateNumber: this.data.newPlateNumber,
      type: this.data.vehicleTypes[this.data.selectedVehicleType]
    }

    wx.request({
      url: `${app.globalData.baseUrl}/parking/plates`,
      method: 'POST',
      data: plateData,
      success: (res) => {
        if (res.data.success) {
          wx.showToast({
            title: '添加成功',
            icon: 'success'
          })
          this.hideAddPlateModal()
          this.loadPlateList()
        }
      },
      fail: (err) => {
        console.error('添加车牌失败', err)
        wx.showToast({
          title: '添加失败',
          icon: 'none'
        })
      }
    })
  },

  // 设置默认车牌
  setDefaultPlate(e) {
    const id = e.currentTarget.dataset.id
    const openId = wx.getStorageSync('openId')

    wx.request({
      url: `${app.globalData.baseUrl}/parking/plates/default`,
      method: 'PUT',
      data: {
        openId: openId,
        plateId: id
      },
      success: (res) => {
        if (res.data.success) {
          this.loadPlateList()
        }
      },
      fail: (err) => {
        console.error('设置默认车牌失败', err)
      }
    })
  },

  // 删除车牌
  deletePlate(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个车牌吗？',
      success: (res) => {
        if (res.confirm) {
          const openId = wx.getStorageSync('openId')
          
          wx.request({
            url: `${app.globalData.baseUrl}/parking/plates/${id}`,
            method: 'DELETE',
            data: { openId: openId },
            success: (res) => {
              if (res.data.success) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                this.loadPlateList()
              }
            },
            fail: (err) => {
              console.error('删除车牌失败', err)
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },

  // 查看全部历史记录
  viewAllHistory() {
    wx.navigateTo({
      url: '/pages/parking-history/parking-history'
    })
  }
}) 