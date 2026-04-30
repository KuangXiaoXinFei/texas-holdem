const { call, toast } = require('../../utils/cloud');

Page({
  data: {
    user: null,
    storedDrinks: [],
    reservations: [],
    orders: [],
    tableType: '标准德州桌',
    guests: 6,
    timeSlot: '今晚 20:00',
    tableTypes: ['标准德州桌', 'VIP 包厢桌', '吧台观赛位'],
    guestOptions: [2, 4, 6, 8, 10],
    timeSlots: ['今晚 20:00', '今晚 21:30', '明晚 19:30'],
    amounts: [200, 500, 1000, 2000]
  },

  onShow() {
    this.bootstrap();
  },

  async bootstrap() {
    const data = await call('bootstrap');
    this.setData({
      user: data.user,
      storedDrinks: data.storedDrinks || [],
      reservations: data.reservations || [],
      orders: data.orders || []
    });
  },

  setField(event) {
    const key = event.currentTarget.dataset.key;
    const source = event.currentTarget.dataset.source;
    this.setData({ [key]: this.data[source][Number(event.detail.value)] });
  },

  async recharge(event) {
    const amount = Number(event.currentTarget.dataset.amount);
    const data = await call('recharge', { userId: this.data.user._id, amount });
    this.setData({ user: data.user, orders: [data.order].concat(this.data.orders) });
    toast('充值成功', 'success');
  },

  async reserve() {
    const data = await call('createReservation', {
      userId: this.data.user._id,
      tableType: this.data.tableType,
      guests: this.data.guests,
      timeSlot: this.data.timeSlot,
      note: '小程序预约'
    });
    this.setData({ reservations: [data.reservation].concat(this.data.reservations) });
    toast('预约成功', 'success');
  },

  async requestDrink(event) {
    const drinkId = event.currentTarget.dataset.id;
    const data = await call('requestDrink', { drinkId });
    this.setData({ storedDrinks: this.data.storedDrinks.map(item => item._id === drinkId ? data.drink : item) });
    toast('已通知员工', 'success');
  }
});
