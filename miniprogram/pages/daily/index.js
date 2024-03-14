const ScrollState = {
  scrollStart: 0,
  scrollUpdate: 1,
  scrollEnd: 2,
};

const tabs = [{
    title: '每日精选',
    title2: '打招呼常用语句',
    img: 'http://mmbiz.qpic.cn/mmbiz_jpg/PxLPibq1ibyh0U4e0qLqNrULAUzW5UbWbicUN5GyJqd24GR0Ricg5q14VGGBWlicNca8x4xelvDrM1r0ibwAjAsR0bOA/0?wx_fmt=jpeg',
    desc: 'Hi, My name is LiLei.',
  },
  {
    title: '释义',
    title2: '',
    img: 'http://mmbiz.qpic.cn/sz_mmbiz_png/GEWVeJPFkSH05EZMIBafqzpoZVSXtCE47V7icf0gru4KPUzMjIcIibJPUlXqbZib4VNmTecxef987XEWib2vhwuqbQ/0?wx_fmt=png',
    desc: 'Hi, My name is LiLei. \n /haɪ/, /maɪ/ /neɪm/ /ɪz/ LiLei. \n 你好，我的名字是李雷。',
  }
];

Page({
  data: {
    selectedTab: 0,
    tabs,
    translateX: 0
  },
  onLoad() {
    const shared = wx.worklet.shared
    const {
      windowWidth
    } = wx.getSystemInfoSync()
    const innerWindowWidth = windowWidth - 48 // 左右 padding 各 24
    this._tabWidth = shared(innerWindowWidth / 2) // 通过 boundingClientRect 算也行
    this._translateX = shared(0)
    this._lastTranslateX = shared(0)
    this._scaleX = shared(0.7)
    this._windowWidth = shared(windowWidth)
  },
  onUnload() {
    this.applyAnimatedStyle('.tab-border', () => {
      'worklet'
      return {
        transform: `translateX(${this._translateX.value}px) scaleX(${this._scaleX.value})`,
      }
    })
  },
  onTapTab(evt) {
    const {
      tab
    } = evt.currentTarget.dataset || {}
    this.setData({
      selectedTab: tab,
    })
  },

  onTabChanged(evt) {
    const index = evt.detail.current
    this.setData({
      selectedTab: index,
    })
    if (this.renderer !== 'skyline') {
      this.setData({
        translateX: this._tabWidth.value * index
      })
    }
  },

  // swiper 切换过程中每帧回调，声明为 worklet 函数使其跑在 UI 线程
  onTabTransition(evt) {
    'worklet'
    // 这里 swiper item 是占满了整个屏幕宽度，算出拖动比例，换算成相对 tab width 的偏移
    const translateRatio = evt.detail.dx / this._windowWidth.value
    this._translateX.value = this._lastTranslateX.value + translateRatio * this._tabWidth.value

    // 控制 scale 值，拖到中间时 scale 处于最大值 1，两端递减
    const scaleRatio = (this._translateX.value / this._tabWidth.value) % 1
    const changedScale = scaleRatio <= 0.5 ? scaleRatio : (1 - scaleRatio) // 最大值 0.5
    this._scaleX.value = Math.abs(changedScale) * 0.6 + 0.7

    if (evt.detail.state === ScrollState.scrollEnd) {
      this._lastTranslateX.value = this._translateX.value
    }
  },
  onTabTransitionEnd(evt) {
    'worklet'
    this.onTabTransition(evt)

    // end
    this._lastTranslateX.value = this._translateX.value
  }
})