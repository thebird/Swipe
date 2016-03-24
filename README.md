##Fixed Issues(By Jinlong)
已修复问题

After touchend event, resuming Swipe's auto slide.
touchend 触发以后，恢复 Swipe 组件的自动轮播。

1. Compatible with api.setRefreshHeaderInfo (APICloud's method)，兼容 APICloud 的 api.setRefreshHeaderInfo（下拉刷新组件），处理 JS 交互事件与 Native 事件的冲突
2. Compatible with api.openSlidLayout (APICloud's method)，兼容 APICloud 的 api.openSlidLayout（侧滑布局模块），处理 JS 交互事件与 Native 事件的冲突
3. Compatible with api.openFrameGroup (APICloud's method)，兼容 APICloud 的 api.openFrameGroup（子窗口组模块），处理 JS 交互事件与 Native 事件的冲突


## Usage
Swipe only needs to follow a simple pattern. Here is an example:

``` html
<div id='slider' class='swipe'>
  <div class='swipe-wrap'>
    <div></div>
    <div></div>
    <div></div>
  </div>
</div>
```

Above is the initial required structure– a series of elements wrapped in two containers. Place any content you want within the items. The containing div will need to be passed to the Swipe function like so:

``` js
window.mySwipe = Swipe(document.getElementById('slider'));
```

I always place this at the bottom of the page, externally, to verify the page is ready.

Also Swipe needs just a few styles added to your stylesheet:

``` css
.swipe {
  overflow: hidden;
  visibility: hidden;
  position: relative;
}
.swipe-wrap {
  overflow: hidden;
  position: relative;
}
.swipe-wrap > div {
  float:left;
  width:100%;
  position: relative;
}
```

## Config Options

Swipe can take an optional second parameter– an object of key/value settings:

- **startSlide** Integer *(default:0)* - index position Swipe should start at

-	**speed** Integer *(default:300)* - speed of prev and next transitions in milliseconds.

- **auto** Integer - begin with auto slideshow (time in milliseconds between slides)

- **continuous** Boolean *(default:true)* - create an infinite feel with no endpoints

- **disableScroll** Boolean *(default:false)* - stop any touches on this container from scrolling the page

- **stopPropagation** Boolean *(default:false)* - stop event propagation
 
-	**callback** Function - runs at slide change.

- **transitionEnd** Function - runs at the end slide transition.

- **compatWithPullToRefresh** 布尔型 - 是否兼容 APICloud 的 api.setRefreshHeaderInfo，默认为 false

- **frameName** 字符串 - 带有下拉刷新组件的 frame 的名字，当 compatWithPullToRefresh 为 true 时，需要传此参数

- **compatWithSlidLayout** 布尔型 - 是否兼容 APICloud 的 api.openSlidLayout，默认为 false

- **compatWithFrameGroup** 布尔型 - 是否兼容 APICloud 的 api.openFrameGroup，默认为 false

- **frameGroupName** 字符串 - frameGroup 组件的名字，当 compatWithFrameGroup 为 true 时，需要传此参数

### Example

``` js

window.mySwipe = new Swipe(document.getElementById('slider'), {
  startSlide: 2,
  speed: 400,
  auto: 3000,
  continuous: true,
  disableScroll: false,
  stopPropagation: false,
  callback: function(index, elem) {},
  transitionEnd: function(index, elem) {},
  compatWithPullToRefresh: true,
  frameName: 'frameName',
  compatWithSlidLayout: true,
  compatWithFrameGroup: true,
  frameGroupName: 'frameGroupName'
});

```

## Swipe API

Swipe exposes a few functions that can be useful for script control of your slider.

`prev()` slide to prev

`next()` slide to next

`getPos()` returns current slide index position

`getNumSlides()` returns the total amount of slides

`slide(index, duration)` slide to set index position (duration: speed of transition in milliseconds)

## Browser Support
Swipe is now compatible with all browsers, including IE7+. Swipe works best on devices that support CSS transforms and touch, but can be used without these as well. A few helper methods determine touch and CSS transition support and choose the proper animation methods accordingly.

## License
Copyright (c) 2013 Brad Birdsall Licensed under the [The MIT License (MIT)](http://opensource.org/licenses/MIT).
