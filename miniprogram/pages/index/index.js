const { safeGetApp, safePage } = require('../../utils/util.js')
const { getHomeData, getProducts, getAnnouncementDetail, getParkingInfo, getUserInfo, getPoints } = require('../../utils/request.js')
const util = require('../../utils/util.js')
const networkFix = require('../../utils/network-fix.js')

const app = safeGetApp()

safePage({
  data: {
    banners: [
      {
        id: 1,
        image: '/images/banner1.svg',
        title: '新品上市'
      },
      {
        id: 2,
        image: '/images/banner2.svg',
        title: '限时优惠'
      },
      {
        id: 3,
        image: '/images/banner3.svg',
        title: '热销商品'
      }
    ],
    hotProducts: [],
    newProducts: [],
    announcements: [],
    notices: [],
    parkingInfo: null,
    loading: true,
    error: false,
    isRequesting: false,
    userInfo: null,
    userLevel: 0,
    userPoints: 0,
    pointsToNextLevel: 0,
    levelTitle: '',
    benefitList: [
      {
        level: 2,
        name: '停车券·6元抵金券',
        tag: '专属',
        desc: '凭此券可享受停车优惠，限V2及以上会员使用',
        minLevel: 2,
        icon: '/images/parking.svg'
      },
      {
        level: 1,
        name: '爸爸糖全单9折',
        tag: '专属',
        desc: '凭此券到店可享爸爸糖9折优惠',
        minLevel: 1,
        icon: '/images/benefit-babatang.png'
      },
      {
        level: 1,
        name: '遛梦园专享9折',
        tag: '专属',
        desc: '凭此券到店可享遛梦园全单9折优惠',
        minLevel: 1,
        icon: '/images/benefit-liumengyuan.png'
      }
    ]
  },

  onLoad() {
    console.log('首页加载')
    this.loadHomeData()
    this.checkParkingStatus()
    this.loadUserLevelInfo()
    this.loadMemberBenefits()
  },

  onShow() {
    if (!this.data.isRequesting && 
        this.data.hotProducts.length === 0 && 
        this.data.newProducts.length === 0) {
      this.loadHomeData()
    }
    this.checkParkingStatus()
    this.loadUserLevelInfo()
  },

  // 加载首页数据
  async loadHomeData() {
    // 防止重复请求
    if (this.data.isRequesting) {
      console.log('请求正在进行中，跳过重复请求')
      return
    }

    try {
      this.setData({
        loading: true,
        error: false,
        isRequesting: true
      })

      console.log('开始加载首页数据...')
      
      const result = await getHomeData()
      console.log('首页数据加载成功:', result)

      if (result.success && result.data) {
        // 修复商品图片路径
        const fixImageUrl = (products) => {
          return products.map(item => {
            let imageUrl = item.image;
            if (imageUrl && imageUrl.startsWith('/uploads/')) {
              // 如果是本地路径，设为null，避免404错误
              imageUrl = null;
            }
            return { ...item, image: imageUrl };
          });
        };
        
        const hotProducts = fixImageUrl(result.data.hotProducts || []);
        const newProducts = fixImageUrl(result.data.newProducts || []);
        const announcements = result.data.announcements || [];
        
        // 保存到本地缓存
        wx.setStorageSync('homeDataCache', {
          hotProducts: hotProducts,
          newProducts: newProducts,
          announcements: announcements,
          timestamp: Date.now()
        })
        
        this.setData({
          hotProducts: hotProducts,
          newProducts: newProducts,
          announcements: announcements,
          loading: false,
          isRequesting: false
        })
      } else {
        throw new Error(result.message || '数据加载失败')
      }
    } catch (error) {
      console.error('加载首页数据失败:', error)
      
      // 检查是否有缓存数据
      const cachedData = wx.getStorageSync('homeDataCache')
      if (cachedData) {
        console.log('使用本地缓存数据')
        
        // 修复缓存数据的图片路径
        const fixImageUrl = (products) => {
          return products.map(item => {
            let imageUrl = item.image;
            if (imageUrl && imageUrl.startsWith('/uploads/')) {
              // 如果是本地路径，设为null，避免404错误
              imageUrl = null;
            }
            return { ...item, image: imageUrl };
          });
        };
        
        this.setData({
          hotProducts: fixImageUrl(cachedData.hotProducts || []),
          newProducts: fixImageUrl(cachedData.newProducts || []),
          announcements: cachedData.announcements || [],
          loading: false,
          isRequesting: false
        })
        
        wx.showToast({
          title: '使用离线数据',
          icon: 'none',
          duration: 2000
        })
        return
      }
      
      this.setData({
        loading: false,
        error: true,
        isRequesting: false
      })

      // 显示错误提示和诊断选项
      wx.showModal({
        title: '加载失败',
        content: error.message || '网络连接失败，是否进行网络诊断？',
        confirmText: '网络诊断',
        cancelText: '重试',
        success: (res) => {
          if (res.confirm) {
            // 进行网络诊断
            this.onNetworkDiagnose()
          } else {
            // 重试加载
            this.loadHomeData()
          }
        }
      })

      // 20秒后自动重试一次，避免频繁重试
      setTimeout(() => {
        if (this.data.error && !this.data.isRequesting) {
          console.log('自动重试加载首页数据...')
          this.loadHomeData()
        }
      }, 20000)
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadHomeData().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 检查停车状态
  async checkParkingStatus() {
    const openId = wx.getStorageSync('openId')
    if (!openId) return

    try {
      const parkingData = await getParkingInfo(openId)
      if (parkingData.success && parkingData.data) {
        this.setData({
          parkingInfo: parkingData.data
        })
      }
    } catch (error) {
      console.error('检查停车状态失败', error)
    }
  },

  // 轮播图点击
  onBannerTap(e) {
    const id = e.currentTarget.dataset.id
    const banner = this.data.banners.find(item => item.id === id)
    if (banner) {
      wx.showToast({
        title: `点击了${banner.title}`,
        icon: 'none'
      })
    }
  },

  // 公告点击
  onAnnouncementTap(e) {
    const id = e.currentTarget.dataset.id
    console.log('点击公告:', id)
    
    // 跳转到公告详情页
    wx.navigateTo({
      url: `/pages/announcement-detail/announcement-detail?id=${id}`
    })
  },

  // 公告列表点击
  onAnnouncementsTap() {
    console.log('点击更多公告')
    wx.navigateTo({
      url: '/pages/announcements/announcements'
    })
  },

  // 商品点击
  onProductTap(e) {
    const id = e.currentTarget.dataset.id
    console.log('点击商品:', id)
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    })
  },

  // 购物车点击
  onCartTap() {
    wx.switchTab({
      url: '/pages/cart/cart'
    })
  },

  // 用户中心点击
  onUserTap() {
    wx.switchTab({
      url: '/pages/user/user'
    })
  },

  // 商城点击
  onMallTap() {
    wx.switchTab({
      url: '/pages/mall/mall'
    })
  },

  // 停车按钮点击
  onParkingTap() {
    wx.navigateTo({
      url: '/pages/parking/parking'
    })
  },

  // 积分点击
  onPointsTap() {
    wx.switchTab({
      url: '/pages/points/points'
    })
  },

  // 重试加载
  onRetry() {
    this.loadHomeData()
  },

  // 网络诊断
  onNetworkDiagnose() {
    networkFix.fullDiagnosis().catch(error => {
      console.error('网络诊断失败:', error)
      wx.showToast({
        title: '诊断失败',
        icon: 'none'
      })
    })
  },

  // 快速修复
  onQuickFix() {
    networkFix.showQuickFix()
  },

  // 公告点击（原有的）
  onNoticeTap(e) {
    const id = e.currentTarget.dataset.id
    console.log('点击公告:', id)
    wx.navigateTo({
      url: `/pages/announcement-detail/announcement-detail?id=${id}`
    })
  },

  // 图片加载错误处理
  onImageError(e) {
    const { type, index } = e.currentTarget.dataset
    console.log(`图片加载失败: ${type} ${index}`)
    
    // 可以在这里设置默认图片
    if (type === 'hot') {
      const hotProducts = [...this.data.hotProducts]
      hotProducts[index].image = null
      this.setData({ hotProducts })
    } else if (type === 'new') {
      const newProducts = [...this.data.newProducts]
      newProducts[index].image = null
      this.setData({ newProducts })
    }
  },

  // 新增：加载用户等级、积分、升级进度
  async loadUserLevelInfo() {
    const openId = wx.getStorageSync('openId')
    // 会员称号列表
    const levelTitles = ['粉丝','新客','体验官','探索者','常客','达人','贵宾','元老','至尊','王者']
    if (!openId) {
      this.setData({
        userPoints: 0,
        userLevel: 0,
        pointsToNextLevel: 200,
        levelTitle: levelTitles[0]
      })
      return
    }
    try {
      // 获取用户基本信息
      const userRes = await getUserInfo(openId)
      if (userRes.success) {
        this.setData({ userInfo: userRes.data })
      }
      // 获取积分
      const pointsRes = await getPoints(openId)
      if (pointsRes.success) {
        const points = pointsRes.data.points || 0
        // 每200积分升一级
        const level = Math.floor(points / 200)
        const pointsToNextLevel = 200 - (points % 200)
        const levelTitle = levelTitles[level] || levelTitles[0]
        this.setData({
          userPoints: points,
          userLevel: level,
          pointsToNextLevel: pointsToNextLevel,
          levelTitle: levelTitle
        })
      }
    } catch (e) {
      console.error('加载用户等级信息失败', e)
    }
  },

  // 新增：跳转到任务页面
  onTaskTap() {
    wx.navigateTo({
      url: '/pages/tasks/tasks'
    })
  },

  // 新增：跳转到等级说明页面
  onLevelInfoTap() {
    wx.navigateTo({
      url: '/pages/level-desc/level-desc'
    })
  },

  // 签到按钮点击
  onSignTap() {
    const openId = wx.getStorageSync('openId')
    if (!openId) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    wx.request({
      url: '你的后端签到API地址',
      method: 'POST',
      data: { openId },
      success: (res) => {
        if (res.data.success) {
          wx.showToast({ title: '签到成功，积分+' + (res.data.points || 0), icon: 'success' })
          this.loadUserLevelInfo && this.loadUserLevelInfo()
        } else {
          wx.showToast({ title: res.data.message || '签到失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '签到失败', icon: 'none' })
      }
    })
  },

  // 客服按钮点击
  onServiceTap() {
    wx.showToast({ title: '客服功能还未开发', icon: 'none' })
  },

  // 拉取会员权益
  async loadMemberBenefits() {
    try {
      const res = await wx.request({
        url: '你的后端接口地址/api/member-benefits?status=1',
        method: 'GET',
      })
      if (res.data && res.data.success) {
        // 将desc字段同步为description
        const benefitList = (res.data.data || []).map(item => ({
          ...item,
          desc: item.description // 兼容前端渲染
        }))
        this.setData({ benefitList })
      }
    } catch (e) {
      // 可选：降级为本地静态数据
    }
  },
}) 