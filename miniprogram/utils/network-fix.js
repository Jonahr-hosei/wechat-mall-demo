// 网络问题快速修复工具
const networkFix = {
  // 检查网络状态
  async checkNetwork() {
    return new Promise((resolve) => {
      wx.getNetworkType({
        success: (res) => {
          resolve({
            type: res.networkType,
            isConnected: res.networkType !== 'none'
          })
        },
        fail: () => {
          resolve({
            type: 'unknown',
            isConnected: false
          })
        }
      })
    })
  },

  // 测试域名连接
  async testDomain(domain) {
    return new Promise((resolve) => {
      wx.request({
        url: domain,
        method: 'GET',
        timeout: 10000,
        success: () => {
          resolve({
            domain,
            status: 'success',
            message: '连接成功'
          })
        },
        fail: (err) => {
          resolve({
            domain,
            status: 'fail',
            message: err.errMsg || '连接失败',
            error: err
          })
        }
      })
    })
  },

  // 全面网络诊断
  async fullDiagnosis() {
    wx.showLoading({
      title: '诊断中...',
      mask: true
    })

    try {
      // 检查网络状态
      const networkInfo = await this.checkNetwork()
      
      // 测试多个域名
      const domains = [
        'https://wxmall.shop',
        'https://www.baidu.com',
        'https://www.qq.com'
      ]
      
      const domainResults = await Promise.all(
        domains.map(domain => this.testDomain(domain))
      )

      wx.hideLoading()

      // 生成诊断报告
      const report = this.generateReport(networkInfo, domainResults)
      this.showReport(report)

      return report
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: '诊断失败',
        icon: 'none'
      })
      throw error
    }
  },

  // 生成诊断报告
  generateReport(networkInfo, domainResults) {
    const targetDomain = domainResults.find(r => r.domain === 'https://wxmall.shop')
    const otherDomains = domainResults.filter(r => r.domain !== 'https://wxmall.shop')
    
    let status = 'unknown'
    let suggestions = []

    if (!networkInfo.isConnected) {
      status = 'no_network'
      suggestions.push('检查设备网络连接')
      suggestions.push('尝试切换WiFi或移动网络')
    } else if (targetDomain && targetDomain.status === 'fail') {
      if (otherDomains.some(d => d.status === 'success')) {
        status = 'domain_issue'
        suggestions.push('检查微信公众平台域名白名单配置')
        suggestions.push('确认域名 https://wxmall.shop 已添加')
        suggestions.push('检查域名SSL证书是否有效')
      } else {
        status = 'network_issue'
        suggestions.push('网络连接异常，请检查网络设置')
        suggestions.push('尝试重启网络设备')
      }
    } else if (targetDomain && targetDomain.status === 'success') {
      status = 'normal'
      suggestions.push('网络连接正常，问题可能在其他地方')
    }

    return {
      networkInfo,
      domainResults,
      status,
      suggestions,
      timestamp: new Date().toLocaleString()
    }
  },

  // 显示诊断报告
  showReport(report) {
    let content = `网络诊断报告\n\n`
    content += `网络类型: ${report.networkInfo.type}\n`
    content += `连接状态: ${report.networkInfo.isConnected ? '正常' : '异常'}\n\n`
    
    content += `域名测试结果:\n`
    report.domainResults.forEach(result => {
      const icon = result.status === 'success' ? '✅' : '❌'
      content += `${icon} ${result.domain}\n`
    })

    if (report.suggestions.length > 0) {
      content += `\n建议:\n`
      report.suggestions.forEach((suggestion, index) => {
        content += `${index + 1}. ${suggestion}\n`
      })
    }

    wx.showModal({
      title: '网络诊断报告',
      content: content,
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 快速修复建议
  getQuickFix() {
    const fixes = [
      {
        title: '检查域名白名单',
        description: '在微信公众平台添加域名到白名单',
        action: () => {
          wx.showModal({
            title: '域名配置',
            content: '请访问微信公众平台 -> 开发 -> 开发设置 -> 服务器域名，添加：\nhttps://wxmall.shop',
            showCancel: false
          })
        }
      },
      {
        title: '检查网络连接',
        description: '确认设备网络连接正常',
        action: () => {
          wx.showModal({
            title: '网络检查',
            content: '请检查：\n1. WiFi或移动网络是否连接\n2. 网络信号是否良好\n3. 是否在飞行模式下',
            showCancel: false
          })
        }
      },
      {
        title: '重启小程序',
        description: '关闭并重新打开小程序',
        action: () => {
          wx.showModal({
            title: '重启小程序',
            content: '请完全关闭小程序，然后重新打开',
            showCancel: false
          })
        }
      }
    ]

    return fixes
  },

  // 显示快速修复选项
  showQuickFix() {
    const fixes = this.getQuickFix()
    
    wx.showActionSheet({
      itemList: fixes.map(fix => `${fix.title} - ${fix.description}`),
      success: (res) => {
        if (fixes[res.tapIndex]) {
          fixes[res.tapIndex].action()
        }
      }
    })
  }
}

module.exports = networkFix 