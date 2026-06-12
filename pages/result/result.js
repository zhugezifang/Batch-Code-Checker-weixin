const { summarize } = require('../../utils/checker')

Page({
  data: {
    results: [],
    summary: {
      total: 0,
      pass: 0,
      fail: 0
    }
  },

  onShow() {
    const results = wx.getStorageSync('lastCheckResults') || []
    this.setData({
      results,
      summary: summarize(results)
    })
  },

  copyFailed() {
    const failedCodes = this.data.results
      .filter((item) => item.status === 'fail')
      .map((item) => item.code)
      .join('\n')

    if (!failedCodes) {
      wx.showToast({
        title: '没有异常码',
        icon: 'none'
      })
      return
    }

    wx.setClipboardData({
      data: failedCodes
    })
  }
})
