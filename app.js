App({
  globalData: {
    appName: '批量码检测',
    version: '1.0.0'
  },

  onLaunch() {
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  }
})
