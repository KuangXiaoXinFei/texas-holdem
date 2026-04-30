const cloudEnv = 'replace-with-your-cloud-env-id';

App({
  globalData: {
    cloudEnv,
    user: null
  },

  onLaunch() {
    if (!wx.cloud) {
      wx.showModal({
        title: '基础库过低',
        content: '请使用 2.2.3 或以上基础库以支持云开发。',
        showCancel: false
      });
      return;
    }

    wx.cloud.init({
      env: cloudEnv,
      traceUser: true
    });
  }
});
