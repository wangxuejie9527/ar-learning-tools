// pages/Daily/index.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "每日一句",
    content: "Hi, My name is Ming.",
    showExplain: false,
    explainContent: "你好， 我的名字叫明。",
    canExplain: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // 获取每日一句
    const db = wx.cloud.database();
    let that = this
    db.collection('ar-tracker').where({
      type:"daily"
    }).limit(1).get({
      success: function (res) {
        const data = res.data;
        console.log(data);
        if (data.length > 0) {
          that.setData({
            content: data[0].text,
            explainContent: data[0].explain
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  explainFunc() {
    this.setData({
      showExplain: true,
      canExplain: false
    })
  }
})