# Swipe 2
Swipe is a responsive, lightweight slider with accurate **1:1** touch movement. Read more and check out the demo at [swipejs.com](http://swipejs.com).

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

Above is the initial required structure– a series of elements wrapped in two containers. Place any content you want within the items. The containing div will need to be passed to a new Swipe object like so:

``` js
window.mySwipe = new Swipe(document.getElementById('slider'));
```

I always place this at the bottom of the page, externally, to verify the page is ready.

Also Swipe needs just a few styles added to your stylesheet:

``` css
.swipe {
  overflow: hidden;
  visibility: hidden;
}
.swipe-wrap {
  overflow: hidden;
  position: relative;
}
.swipe-wrap div {
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
 
-	**callback** Function - runs at slide change.

- **transitionEnd** Function - runs at the end slide transition.

### Example

``` js

window.mySwipe = new Swipe(document.getElementById('slider'), {
  startSlide: 2,
  speed: 400,
  auto: 3000,
  continuous: true,
  disableScroll: false,
  callback: function(index, elem) {},
  transitionEnd: function(index, elem) {}
});

```


## Swipe API

Swipe exposes a few functions that can be useful for script control of your slider.

`prev()` slide to prev

`next()` slide to next

`getPos()` returns current slide index position

`slide(index, duration)` slide to set index position (duration: speed of transition in milliseconds)

## Browser Support
Swipe is now compatable with all browsers, including IE6. Swipe works best on devices that supports CSS transforms and touch, but can be used without these as well. A few helper methods determine touch and CSS transition support and choose the proper animation methods accordingly.


## Let's Make It Better
I would love to hear more about how to improve Swipe. Play with it and let me know how you use and please fork away. If you have any questions, contact me on [Twitter](http://twitter.com/bradbirdsall) or [GitHub](http://github.com/bradbirdsall).


## License
Swipe mobile slider is &copy; 2012 [Brad Birdsall](http://bradbirdsall.com) and is licensed under the terms of GPL &amp; MIT licenses. 