Component({
  options: {
      multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
      extClass: {
          type: String,
          value: ''
      },
      title: {
          type: String,
          value: ''
      },
      background: {
          type: String,
          value: ''
      },
      color: {
          type: String,
          value: ''
      },
      back: {
          type: Boolean,
          value: true
      },
      loading: {
          type: Boolean,
          value: false
      },
      animated: {
          // 显示隐藏的时候opacity动画效果
          type: Boolean,
          value: true
      },
      show: {
          // 显示隐藏导航，隐藏的时候navigation-bar的高度占位还在
          type: Boolean,
          value: true,
          observer: '_showChange'
      },
      // back为true的时候，返回的页面深度
      delta: {
          type: Number,
          value: 1
      }
  },
  /**
   * 组件的初始数据
   */
  data: {
      displayStyle: ''
  },
  attached() {
    const isSupport = !!wx.getMenuButtonBoundingClientRect
    const rect = wx.getMenuButtonBoundingClientRect
        ? wx.getMenuButtonBoundingClientRect()
        : null
    console.log('rect', rect);
    wx.getSystemInfo({
        success: (res) => {
            const ios = !!(res.system.toLowerCase().search('ios') + 1)
            console.log('res', res)
            this.setData({
                ios,
                statusBarHeight: res.statusBarHeight,
                navBarHeight: rect.bottom - rect.top + 10,
                innerWidth: isSupport ? `width:${rect.left}px` : '',
                innerPaddingRight: isSupport
                    ? `padding-right:${res.windowWidth - rect.left}px`
                    : '',
                leftWidth: isSupport ? `width:${res.windowWidth - rect.left}px` : '',
            })
        }
    })

  },
  detached() {
  },
  /**
   * 组件的方法列表
   */
  methods: {
      _showChange(show) {
          const animated = this.data.animated
          let displayStyle = ''
          if (animated) {
              displayStyle = `opacity: ${
                  show ? '1' : '0'
              };-webkit-transition:opacity 0.5s;transition:opacity 0.5s;`
          } else {
              displayStyle = `display: ${show ? '' : 'none'}`
          }
          this.setData({
              displayStyle
          })
      },
  }
})
