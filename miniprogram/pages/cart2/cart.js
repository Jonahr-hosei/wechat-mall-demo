// cart2.js
const { safeGetApp, safePage } = require('../../utils/util.js')
const util = require('../../utils/util.js')

const app = safeGetApp()

safePage({
  data: {
    cartItems: [],
    selectAll: false,
    totalPrice: 0,
    selectedCount: 0
  },

  onLoad() {
    this.loadCartItems()
  },

  onShow() {
    this.loadCartItems()
  },

  // 加载购物车商品
  loadCartItems() {
    const cart = wx.getStorageSync('cart') || []
    this.setData({
      cartItems: cart
    })
    this.updateTotal()
  },

  // 切换商品选中状态
  toggleSelect(e) {
    const id = e.currentTarget.dataset.id
    const cartItems = this.data.cartItems.map(item => {
      if (item.id === id) {
        item.selected = !item.selected
      }
      return item
    })
    
    this.setData({ cartItems })
    this.updateTotal()
    this.updateSelectAll()
    this.saveCart()
  },

  // 切换全选状态
  toggleSelectAll() {
    const selectAll = !this.data.selectAll
    const cartItems = this.data.cartItems.map(item => {
      item.selected = selectAll
      return item
    })
    
    this.setData({ 
      selectAll,
      cartItems
    })
    this.updateTotal()
    this.saveCart()
  },

  // 增加商品数量
  increaseQuantity(e) {
    const id = e.currentTarget.dataset.id
    const cartItems = this.data.cartItems.map(item => {
      if (item.id === id) {
        item.quantity += 1
      }
      return item
    })
    
    this.setData({ cartItems })
    this.updateTotal()
    this.saveCart()
  },

  // 减少商品数量
  decreaseQuantity(e) {
    const id = e.currentTarget.dataset.id
    const cartItems = this.data.cartItems.map(item => {
      if (item.id === id && item.quantity > 1) {
        item.quantity -= 1
      }
      return item
    })
    
    this.setData({ cartItems })
    this.updateTotal()
    this.saveCart()
  },

  // 删除商品
  removeItem(e) {
    const id = e.currentTarget.dataset.id
    
    util.showConfirm('确认删除', '确定要删除这个商品吗？').then(confirm => {
      if (confirm) {
        const cartItems = this.data.cartItems.filter(item => item.id !== id)
        this.setData({ cartItems })
        this.updateTotal()
        this.updateSelectAll()
        this.saveCart()
        util.showSuccess('删除成功')
      }
    })
  },

  // 更新总价和选中数量
  updateTotal() {
    let totalPrice = 0
    let selectedCount = 0
    
    this.data.cartItems.forEach(item => {
      if (item.selected) {
        totalPrice += item.price * item.quantity
        selectedCount += item.quantity
      }
    })
    
    this.setData({
      totalPrice: totalPrice.toFixed(2),
      selectedCount
    })
  },

  // 更新全选状态
  updateSelectAll() {
    const selectAll = this.data.cartItems.length > 0 && 
                     this.data.cartItems.every(item => item.selected)
    this.setData({ selectAll })
  },

  // 保存购物车到本地存储
  saveCart() {
    wx.setStorageSync('cart', this.data.cartItems)
  },

  // 结算
  checkout() {
    const selectedItems = this.data.cartItems.filter(item => item.selected)
    
    if (selectedItems.length === 0) {
      util.showError('请选择要结算的商品')
      return
    }

    // 跳转到订单确认页面
    wx.navigateTo({
      url: '/pages/order/order?from=cart2'
    })
  },

  // 导航到商城
  navigateToMall() {
    wx.switchTab({
      url: '/pages/mall/mall'
    })
  }
}) 