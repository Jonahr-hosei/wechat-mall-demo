// parking.js
const app = getApp()
const { api } = require('../../utils/request.js')

Page({
  data: {
    parkingInfo: null,
    plateList: [],
    parkingHistory: [],
    showAddPlateModal: false,
    newPlateNumber: '',
    vehicleTypes: ['小型车', '中型车', '大型车'],
    selectedVehicleType: 0,
    loading: false,
    currentParking: null,
    showStartModal: false,
    showEndModal: false,
    plateNumber: '',
    startTime: '',
    endTime: '',
    duration: 0,
    fee: 0
  },

  onLoad() {
    this.loadParkingInfo()
    this.loadPlateList()
    this.loadParkingHistory()
  },

  onShow() {
    // 每次显示页面时刷新停车状态
    this.loadParkingInfo()
  },

  // 加载停车信息
  async loadParkingInfo() {
    const openId = wx.getStorageSync('openId')
    if (!openId) return

    try {
      const parkingData = await api.getParkingStatus(openId)
      if (parkingData.success) {
        this.setData({ parkingInfo: parkingData.data })
      }
    } catch (error) {
      console.error('加载停车信息失败', error)
    }
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

  // 加载停车历史
  async loadParkingHistory() {
    const openId = wx.getStorageSync('openId')
    if (!openId) return

    try {
      const historyData = await api.getParkingHistory(openId, { limit: 10 })
      if (historyData.success) {
        this.setData({ parkingHistory: historyData.data })
      }
    } catch (error) {
      console.error('加载停车历史失败', error)
    }
  },

  // 开始停车
  async startParking() {
    const { plateNumber } = this.data
    if (!plateNumber.trim()) {
      wx.showToast({
        title: '请输入车牌号',
        icon: 'none'
      })
      return
    }

    const openId = wx.getStorageSync('openId')
    if (!openId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })

    try {
      const parkingData = await api.startParking({
        user_id: openId,
        plate_number: plateNumber
      })

      if (parkingData.success) {
        wx.showToast({
          title: '停车开始',
          icon: 'success'
        })
        this.setData({ 
          showStartModal: false,
          plateNumber: '',
          currentParking: parkingData.data
        })
        this.loadParkingInfo()
      } else {
        wx.showToast({
          title: parkingData.message || '开始停车失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('开始停车失败', error)
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 结束停车
  async endParking() {
    const { currentParking } = this.data
    if (!currentParking) return

    this.setData({ loading: true })

    try {
      const endData = await api.endParking(currentParking.id)
      if (endData.success) {
        this.setData({
          endTime: endData.data.exit_time,
          duration: endData.data.duration_minutes,
          fee: endData.data.fee,
          showEndModal: true
        })
      } else {
        wx.showToast({
          title: endData.message || '结束停车失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('结束停车失败', error)
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 支付停车费
  async payParkingFee() {
    const { currentParking, fee } = this.data
    if (!currentParking) return

    this.setData({ loading: true })

    try {
      const paymentData = await api.payParking(currentParking.id, {
        payment_method: 'wechat',
        amount: fee
      })

      if (paymentData.success) {
        wx.showToast({
          title: '支付成功',
          icon: 'success'
        })
        this.setData({ 
          showEndModal: false,
          currentParking: null
        })
        this.loadParkingInfo()
        this.loadParkingHistory()
      } else {
        wx.showToast({
          title: paymentData.message || '支付失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('支付失败', error)
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
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