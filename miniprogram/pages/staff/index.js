const { call, toast } = require('../../utils/cloud');

Page({
  data: {
    staffTasks: []
  },

  onShow() {
    this.bootstrap();
  },

  async bootstrap() {
    const data = await call('bootstrap');
    this.setData({ staffTasks: data.staffTasks || [] });
  },

  async complete(event) {
    const taskId = event.currentTarget.dataset.id;
    try {
      const data = await call('completeStaffTask', { taskId });
      this.setData({ staffTasks: this.data.staffTasks.map(item => item._id === taskId ? data.task : item) });
      toast('核销完成', 'success');
    } catch (err) {
      toast(err.message);
    }
  }
});
