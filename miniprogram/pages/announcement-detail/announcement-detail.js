const { getAnnouncementDetail } = require('../../utils/request.js')
const { safePage } = require('../../utils/util.js')

safePage({
  data: {
    announcement: {},
    typeText: '',
    loading: true,
    error: false
  },

  onLoad(options) {
    const { id } = options
    if (id) {
      this.loadAnnouncementDetail(id)
    } else {
      this.setData({
        loading: false,
        error: true
      })
      wx.showToast({
        title: '公告ID不存在',
        icon: 'none'
      })
    }
  },

  // 加载公告详情
  async loadAnnouncementDetail(id) {
    try {
      this.setData({
        loading: true,
        error: false
      })

      const result = await getAnnouncementDetail(id)
      
      if (result.success && result.data) {
        const announcement = result.data
        
        // 格式化时间
        announcement.created_at = new Date(announcement.created_at).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })

        // 设置类型文本
        let typeText = '一般公告'
        switch (announcement.type) {
          case 'important':
            typeText = '重要公告'
            break
          case 'promotion':
            typeText = '促销公告'
            break
          default:
            typeText = '一般公告'
        }

        this.setData({
          announcement,
          typeText,
          loading: false
        })
      } else {
        throw new Error(result.message || '获取公告详情失败')
      }
    } catch (error) {
      console.error('加载公告详情失败:', error)
      this.setData({
        loading: false,
        error: true
      })
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      })
    }
  },

  // 重试加载
  onRetry() {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const { id } = currentPage.options
    if (id) {
      this.loadAnnouncementDetail(id)
    }
  }
}) 