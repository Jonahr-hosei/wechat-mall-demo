const { getAnnouncements } = require('../../utils/request.js')
const { safePage } = require('../../utils/util.js')

safePage({
  data: {
    announcements: [],
    currentType: '',
    currentPage: 1,
    hasMore: true,
    loading: true,
    loadingMore: false,
    error: false
  },

  onLoad() {
    this.loadAnnouncements()
  },

  // 加载公告列表
  async loadAnnouncements(isLoadMore = false) {
    if (isLoadMore) {
      this.setData({ loadingMore: true })
    } else {
      this.setData({ loading: true, error: false })
    }

    try {
      const params = {
        page: this.data.currentPage,
        limit: 10
      }

      if (this.data.currentType) {
        params.type = this.data.currentType
      }

      const result = await getAnnouncements(params)
      
      if (result.success && result.data) {
        const newAnnouncements = result.data.map(item => ({
          ...item,
          created_at: new Date(item.created_at).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          typeText: this.getTypeText(item.type)
        }))

        this.setData({
          announcements: isLoadMore ? [...this.data.announcements, ...newAnnouncements] : newAnnouncements,
          hasMore: result.pagination.page < result.pagination.pages,
          loading: false,
          loadingMore: false
        })
      } else {
        throw new Error(result.message || '获取公告列表失败')
      }
    } catch (error) {
      console.error('加载公告列表失败:', error)
      this.setData({
        loading: false,
        loadingMore: false,
        error: true
      })
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      })
    }
  },

  // 获取类型文本
  getTypeText(type) {
    switch (type) {
      case 'important':
        return '重要公告'
      case 'promotion':
        return '促销公告'
      default:
        return '一般公告'
    }
  },

  // 类型筛选
  onTypeFilter(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      currentType: type,
      currentPage: 1,
      hasMore: true
    })
    this.loadAnnouncements()
  },

  // 加载更多
  onLoadMore() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.setData({
        currentPage: this.data.currentPage + 1
      })
      this.loadAnnouncements(true)
    }
  },

  // 点击公告
  onAnnouncementTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/announcement-detail/announcement-detail?id=${id}`
    })
  },

  // 重试加载
  onRetry() {
    this.setData({
      currentPage: 1,
      hasMore: true
    })
    this.loadAnnouncements()
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      currentPage: 1,
      hasMore: true
    })
    this.loadAnnouncements().finally(() => {
      wx.stopPullDownRefresh()
    })
  }
}) 