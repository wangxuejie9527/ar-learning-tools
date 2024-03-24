/**
 * 每日一句页面
 */

// 导入函数
var sceneReadyBehavior = require('../../components/behavior-scene/scene-ready');
var util = require('../../utils/util');

/**
 * tabs 初始定义
 * 开始于
 * skip
 * 结束于
 */
const ScrollState = {
  scrollStart: 0,
  scrollUpdate: 1,
  scrollEnd: 2,
};

// 初始化音频播放器
const audioCtx = wx.createInnerAudioContext({})

Page({
  behaviors: [sceneReadyBehavior],
  data: {
    // 起始被选中tab
    selectedTab: 0,
    // tab 初始定义
    tabs: [{
        title: '每日一句',
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
    // tab 切换动画 对x轴平移
    translateX: 0,
    isEnglishCategory: true
  },
  /**
   * 页面加载中需要处理内容
   */
  onLoad() {
    // 创建共享变量 SharedValue，用于跨线程共享数据和驱动动画。
    const shared = wx.worklet.shared
    // 音频播放器静音
    audioCtx.obeyMuteSwitch = false
    // 获取手机屏幕宽度
    const {
      windowWidth
    } = wx.getSystemInfoSync()
    // 计算每个tab大小 和 tab切换动画
    const innerWindowWidth = windowWidth - 48 // 左右 padding 各 24
    this._tabWidth = shared(innerWindowWidth / 2)
    this._translateX = shared(0)
    this._lastTranslateX = shared(0)
    this._scaleX = shared(0.7)
    this._windowWidth = shared(windowWidth)

    this.refreshData();
  },
  onUnload() {
    // 初始化动画类型为worklet
    this.applyAnimatedStyle('.tab-border', () => {
      'worklet'
      return {
        transform: `translateX(${this._translateX.value}px) scaleX(${this._scaleX.value})`,
      }
    })
  },
  // tab 点击触发事件
  onTapTab(evt) {
    const {
      tab
    } = evt.currentTarget.dataset || {}
    this.setData({
      selectedTab: tab,
    })
  },
  // tab 切换事件
  onTabChanged(evt) {
    const index = evt.detail.current
    this.setData({
      selectedTab: index,
    })
    // 设置动画平移多少
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
  refreshData() {
    const date = util.formatTimeYYMMDD(new Date)
    console.log('date', date);
    // 数据库加载每日一句内容
    let that = this
    const db = wx.cloud.database();

    db.collection('ar-tracker').where({
      type: 'daily',
      date: date,
      category: this.data.isEnglishCategory ? 'English' : 'Math'
    }).limit(1).get({
      success: function (res) {
        console.log(res)
        if (res.length < 1) {
          return;
        }
        var dbRes = res.data[0]
        var newTabs = [{
            title: dbRes.tab1Title,
            title2: dbRes.tab1Title2,
            img: dbRes.coverImg,
            desc: dbRes.text.replace(/\\n/g, '\n').replace(/\\'/g, '\''),
          },
          {
            title: dbRes.tab2Title,
            title2: dbRes.tab2Title2,
            img: dbRes.explainImg,
            desc: dbRes.explain.replace(/\\n/g, '\n').replace(/\\'/g, '\''),
          }
        ];
        audioCtx.src = dbRes.tts
        that.setData({
          tabs: newTabs
        })
      }
    })
  },
  bindNavTab() {
    this.setData({
      isEnglishCategory: !this.data.isEnglishCategory
    })
    this.refreshData();
  },
  // 播放翻译语音
  audioPlay: function () {
    console.log('audioPlay')
    audioCtx.play()
  }
})