const { call, toast } = require('../../utils/cloud');

Page({
  data: {
    user: null,
    products: [],
    cart: [],
    paidBy: 'balance'
  },

  onShow() {
    this.bootstrap();
  },

  async bootstrap() {
    const data = await call('bootstrap');
    this.setData({ user: data.user, products: data.products || [] });
    getApp().globalData.user = data.user;
  },

  addCart(event) {
    const product = event.currentTarget.dataset.product;
    const cart = this.data.cart.slice();
    const existing = cart.find(item => item.product._id === product._id);
    if (existing) existing.quantity += 1;
    else cart.push({ product, quantity: 1 });
    this.setData({ cart });
  },

  removeCart(event) {
    const id = event.currentTarget.dataset.id;
    const cart = this.data.cart.slice();
    const existing = cart.find(item => item.product._id === id);
    if (existing && existing.quantity > 1) existing.quantity -= 1;
    else this.setData({ cart: cart.filter(item => item.product._id !== id) });
    if (existing && existing.quantity > 1) this.setData({ cart });
  },

  setPay(event) {
    this.setData({ paidBy: event.currentTarget.dataset.pay });
  },

  async checkout() {
    if (!this.data.cart.length) return toast('请先选择商品');
    try {
      const data = await call('checkout', {
        userId: this.data.user._id,
        paidBy: this.data.paidBy,
        items: this.data.cart.map(item => ({ productId: item.product._id, quantity: item.quantity }))
      });
      this.setData({ user: data.user, cart: [] });
      toast('支付成功', 'success');
    } catch (err) {
      toast(err.message);
    }
  }
});
