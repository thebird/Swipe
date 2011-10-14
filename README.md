# Swipe 1.0
Swipe is a lightweight mobile slider with **1-to-1** touch movement. For more info read the [blog post](http://pr-i.me/AQL2).

## Demo
### Visit here on a touch-enabled mobile device [swipejs.com](http://swipejs.com)

## Usage
Swipe only needs to follow a simple pattern. Here is an example:

``` html
<div id='slider'>
  <ul>
  	<li style='display:block'></li>
  	<li style='display:none'></li>
  	<li style='display:none'></li>
  	<li style='display:none'></li>
  	<li style='display:none'></li>
  </ul>
</div>
```

Above is the initial required structure– a series of elements wrapped in two containers. An unordered list makes sense here, but this can be any combination of elements that has the same structure.  *(more on the `display:block/none` reasoning below)*.Place any content you want within the items. The containing div will need to be passed to a new Swipe object like so:

``` js

window.mySwipe = new Swipe(document.getElementById('slider'));

```
I always place this at the bottom of the page, externally, to verify the page is ready.


## Config Options

Swipe can take an optional second parameter– an object of key/value settings:

- 	**startSlide** Integer *(default:0)* - index position Swipe should start at

-	**speed** Integer *(default:300)* - speed of prev and next transitions in milliseconds.

- **auto** Integer - begin with auto slideshow (time in milliseconds between slides)

-	**callback** Function - runs at the end of any slide change. *(effective for updating position indicators/counters)*

### Example

``` js

window.mySwipe = new Swipe(document.getElementById('slider'), {
	startSlide: 2,
	speed: 400,
    auto: 3000,
	callback: function(event, index, elem) {

	  // do something cool

	}
});

```


## Swipe API

Swipe exposes a few functions that can be useful for script control of your slider.

`prev()` slide to prev

`next()` slide to next

`getPos()` returns current slide index position

`slide(index, duration)` slide to set index position (duration: speed of transition in milliseconds)


## Requirements
Swipe requires a device that supports CSS transforms and works best with devices that support touch. Both of these are not required for the code to run since Swipe does not include any feature detection in the core code. This decision was made due to the fact that all mobile web development should already have some sort of feature detection built into the page. I recommend using a custom build of [Modernizr](http://modernizr.com), don't recreate the wheel.

Sample use with Modernizr:

``` js
if ( Modernizr.csstransforms ) {
  window.mySwipe = new Swipe(document.getElementById('slider'));
}
```

This is why I set all elements but the first list item to `display:none`– if the device doesn't pass the feature tests then it will fallback to displaying only the first item.


## Let's Make It Better
I would love to hear more about how to improve Swipe. Play with it and let me know how you use and please fork away. If you have any questions, contact me on [Twitter](http://twitter.com/bradbirdsall) or [GitHub](http://github.com/bradbirdsall).


## License
Swipe mobile slider is &copy; 2011 [Brad Birdsall](http://bradbirdsall.com) and is licensed under the terms of GPL &amp; MIT licenses. 