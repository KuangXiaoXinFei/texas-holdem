const { call, toast } = require('../../utils/cloud');

Page({
  data: {
    loading: true,
    user: null,
    reservations: [],
    leaderboard: [],
    actions: ['签到', '存/提积分', '存/取酒', '点单', '预约', '候桌', '排行榜', '充值中心', '订单', '联系客服', '门店导航', '邀请好友']
  },

  onShow() {
    this.bootstrap();
  },

  async bootstrap() {
    wx.showLoading({ title: '连接云开发' });
    try {
      const data = await call('bootstrap');
      getApp().globalData.user = data.user;
      this.setData({
        loading: false,
        user: data.user,
        reservations: data.reservations || [],
        leaderboard: data.leaderboard || []
      });
    } catch (err) {
      toast(err.message);
    } finally {
      wx.hideLoading();
    }
  },

  async tapAction(event) {
    const label = event.currentTarget.dataset.label;
    const user = this.data.user;
    if (label === '签到') {
      try {
        const data = await call('checkin', { userId: user._id });
        this.setData({ user: data.user });
        getApp().globalData.user = data.user;
        toast(`签到成功 +${data.reward}`, 'success');
      } catch (err) {
        toast('今天已签到');
      }
      return;
    }
    if (['点单'].includes(label)) wx.switchTab({ url: '/pages/store/index' });
    else if (['预约', '候桌', '充值中心', '订单', '存/提积分', '存/取酒'].includes(label)) wx.switchTab({ url: '/pages/profile/index' });
    else if (['排行榜'].includes(label)) wx.switchTab({ url: '/pages/tournament/index' });
    else if (label === '联系客服') toast('客服微信：RiverAceClub');
    else if (label === '门店导航') toast('请接入 wx.openLocation');
    else if (label === '邀请好友') {
      const data = await call('invite', { userId: user._id });
      this.setData({ user: data.user });
      toast('邀请奖励已发放', 'success');
    }
  }
});
