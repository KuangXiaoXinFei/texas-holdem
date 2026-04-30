function call(action, payload = {}) {
  return wx.cloud.callFunction({
    name: 'barService',
    data: { action, payload }
  }).then(res => {
    const result = res.result || {};
    if (!result.success) {
      throw new Error(result.error || 'CLOUD_FUNCTION_FAILED');
    }
    return result.data;
  });
}

function toast(title, icon = 'none') {
  wx.showToast({ title, icon });
}

module.exports = { call, toast };
