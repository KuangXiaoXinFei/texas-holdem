const { call, toast } = require('../../utils/cloud');

Page({
  data: {
    user: null,
    tournaments: [],
    leaderboard: []
  },

  onShow() {
    this.bootstrap();
  },

  async bootstrap() {
    const data = await call('bootstrap');
    this.setData({ user: data.user, tournaments: data.tournaments || [], leaderboard: data.leaderboard || [] });
  },

  async register(event) {
    const tournamentId = event.currentTarget.dataset.id;
    try {
      const data = await call('registerTournament', { userId: this.data.user._id, tournamentId });
      this.setData({
        user: data.user,
        tournaments: this.data.tournaments.map(item => item._id === tournamentId ? data.tournament : item)
      });
      toast('报名成功', 'success');
    } catch (err) {
      toast(err.message);
    }
  }
});
