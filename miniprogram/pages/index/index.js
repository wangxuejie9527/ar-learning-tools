const ScrollState = {
  scrollStart: 0,
  scrollUpdate: 1,
  scrollEnd: 2,
};
const audioCtx = wx.createInnerAudioContext({
  useWebAudioImplement: false 
})

var util = require('../../utils/util');

Page({
  data: {
    selectedTab: 0,
    tabs: [{
        title: '每日精选',
        title2: '打招呼常用语句',
        img: '/assets/image/1.jpg',
        desc: 'dddddd ',
      },
      {
        title: '释义',
        title2: '',
        img: '/assets/image/1.jpg',
        desc: 'ffff',
      }
    ],
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
    const date = util.formatTimeYYMMDD(new Date)
    console.log('date', date);
    let that = this
    const db = wx.cloud.database();
    db.collection('ar-tracker').where({
      type: 'daily',
      date: date,
    }).limit(1).get({
      success: function (res) {
        console.log(res)
        if (res.length < 1) {
          return;
        }
        var dbRes = res.data[0]
        var newTabs = [{
            title: '每日精选',
            title2: '打招呼常用语句',
            img: dbRes.coverImg,
            desc: dbRes.text,
          },
          {
            title: '释义',
            title2: '',
            img: dbRes.explainImg,
            desc: dbRes.explain.replace(/\\n/g, '\n').replace(/\\'/g,'\''),
          }
        ];
        audioCtx.src = dbRes.tts
        that.setData({
          tabs: newTabs
        })
      }
    })
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
  },
  audioPlay: function () {
    audioCtx.play()
  }
})