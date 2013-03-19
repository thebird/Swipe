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

- **events** EventEmitter (https://github.com/Wolfy87/EventEmitter) - An optional EventEmitter which will receive the following events:
  - begin - arguments: swipeInstance
  - stop - arguments: swipeInstance
  - prev - arguments: swipeInstance
  - next - arguments: swipeInstance
  - slide - arguments: swipeInstance, index, slide
  - transitionEnd - arguments: swipeInstance, index, slide
  
  Eg:
  
``` js

var carouselEvents = new EventEmitter();

var carousel = new Swipe( document.getElementById( 'carousel' ), {
    events: carouselEvents
});

carouselEvents.on( 'begin', function( theCarousel ) {
    console.log( 'begin event' );
});

carouselEvents.on( 'slide', function( theCarousel, index, slide ) {
    console.log( 'slide event: index: ' + index );
});

```

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
  transitionEnd: function(index, elem) {}
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
Swipe is now compatable with all browsers, including IE7+. Swipe works best on devices that supports CSS transforms and touch, but can be used without these as well. A few helper methods determine touch and CSS transition support and choose the proper animation methods accordingly.

## Who's using Swipe
<img src='http://swipejs.com/assets/swipe-cnn.png' width='170'>
<img src='http://swipejs.com/assets/swipe-airbnb.png' width='170'>
<img src='http://swipejs.com/assets/swipe-nhl.png' width='170'>
<img src='http://swipejs.com/assets/swipe-thinkgeek.png' width='170'>  
<img src='http://swipejs.com/assets/swipe-snapguide.png' width='170'>

Shoot me a [note](mailto:brad@birdsall.co) if you want you're logo here
