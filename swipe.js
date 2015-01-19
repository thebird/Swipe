/*
 * Swipe 2.0
 *
 * Brad Birdsall
 * Copyright 2013, MIT License
 *
*/

function Swipe(container, options) {

  "use strict";

  // utilities
  var noop = function() {}; // simple no operation function
  var offloadFn = function(fn) { setTimeout(fn || noop, 0) }; // offload a functions execution
  var is_swiping = false;

  // quit if no root element
  if (!container) return;
  var element = container.children[0];
  var slides, slidePos, containerWidth, width, height, length;
  options = options || {};
  var index = parseInt(options.startSlide, 10) || 0;
  var speed = options.speed || 300;
  var orientation = options.orientation || 'horizontal';
  var elastic = options.elastic || false;
  var lastElement = false;
  options.continuous = options.continuous !== undefined ? options.continuous : true;

  // check browser capabilities
  var browser = {
    addEventListener: !!window.addEventListener,

    touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
    transitions: (function(temp) {
      if (elastic) return false;
      var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
      for ( var i in props ) if (temp.style[ props[i] ] !== undefined) return true;
      return false;
    })(document.createElement('swipe'))
  };

  function setup() {

    // cache slides
    slides = element.children;
    length = slides.length;

    // set continuous to false if only one slide
    if (slides.length < 2) options.continuous = false;

    //special case if two slides
    if (browser.transitions && options.continuous && slides.length < 3) {
      element.appendChild(slides[0].cloneNode(true));
      element.appendChild(element.children[1].cloneNode(true));
      slides = element.children;
    }

    // create an array to store current positions of each slide
    slidePos = new Array(slides.length);

    if(orientation == 'horizontal') {
      // determine width of each slide
      if(elastic) {
        width = slides[0].getBoundingClientRect().width || slides[0].offsetWidth;
        containerWidth = container.getBoundingClientRect().width || container.offsetWidth;
      }
      else
        containerWidth = width = container.getBoundingClientRect().width || container.offsetWidth;

      element.style.width = (slides.length * width) + 'px';
    }
    else if(orientation == 'vertical') {
      height = container.getBoundingClientRect().height || container.offsetHeight; // determine height of each slide
      element.style.height = (slides.length * height) + 'px';
    }

    // stack elements
    var pos = slides.length;
    while(pos--) {

      var slide = slides[pos];

      if(orientation == 'horizontal' && !elastic) {
        slide.style.width = width + 'px';
      }
      else if(orientation == 'vertical'  && !elastic) {
        slide.style.height = height + 'px';
      }

      slide.setAttribute('data-index', pos);

      if (browser.transitions) {
        if(orientation == 'horizontal') {
          slide.style.left = (pos * -width) + 'px';
          move(pos, index > pos ? -width : (index < pos ? width : 0), 0);
        }
        else if(orientation == 'vertical') {
          slide.style.top = (pos * -height) + 'px';
          move(pos, index > pos ? -height : (index < pos ? height : 0), 0);
        }
      }

    }

    // reposition elements before and after index
    if (options.continuous && browser.transitions) {
      if(orientation == 'horizontal') {
        move(circle(index-1), -width, 0);
        move(circle(index+1), width, 0);
      }
      else if(orientation == 'vertical') {
        move(circle(index-1), -height, 0);
        move(circle(index+1), height, 0);
      }
    }

    if (!browser.transitions) {
      if(orientation == 'horizontal') {
        element.style.left = (index * -width) + 'px';
      }
      else if(orientation == 'vertical') {
        element.style.top = (index * -height) + 'px';
      }
    }

    container.style.visibility = 'visible';

  }

  function prev() {

    if (options.continuous) slide(index-1);
    else if (index) slide(index-1);

  }

  function next() {

    if (options.continuous) slide(index+1);
    else if(options.elastic && lastElement) return;
    else if (index < slides.length - 1) slide(index+1);

  }

  function circle(index) {

    // a simple positive modulo using slides.length
    return (slides.length + (index % slides.length)) % slides.length;

  }

  function slide(to, slideSpeed) {

    // do nothing if already on requested slide
    if (index == to) return;

    // last page logic
    var remainingDistance;
    if(elastic && (containerWidth - ((slides.length * width)-(width*(to))) > 0)) {
      remainingDistance = (containerWidth - ((slides.length * width)-(width*(to))) > 0) - (containerWidth - ((slides.length * width)-(width*(to-1))));
    }
    else if(elastic && (containerWidth - ((slides.length * width)-(width*(to))) == 0)) {
      return;
    }

    if (browser.transitions) {

      var direction = Math.abs(index-to) / (index-to); // 1: backward, -1: forward

      // get the actual position of the slide
      if (options.continuous) {
        var natural_direction = direction;

        if(orientation == 'horizontal')
          direction = -slidePos[circle(to)] / width;
        else if(orientation == 'vertical')
          direction = -slidePos[circle(to)] / height;

        // if going forward but to < index, use to = slides.length + to
        // if going backward but to > index, use to = -slides.length + to
        if (direction !== natural_direction) to =  -direction * slides.length + to;

      }

      var diff = Math.abs(index-to) - 1;

      // move all the slides between index and to in the right direction
      if(orientation == 'horizontal')
        while (diff--) move( circle((to > index ? to : index) - diff - 1), width * direction, 0);
      else if(orientation == 'vertical')
        while (diff--) move( circle((to > index ? to : index) - diff - 1), height * direction, 0);

      to = circle(to);

      if(orientation == 'horizontal')
        move(index, width * direction, slideSpeed || speed);
      else if(orientation == 'vertical')
        move(index, height * direction, slideSpeed || speed);

      move(to, 0, slideSpeed || speed);

      if(orientation == 'horizontal')
        if (options.continuous) move(circle(to - direction), -(width * direction), 0); // we need to get the next in place
      else if(orientation == 'vertical')
        if (options.continuous) move(circle(to - direction), -(height * direction), 0); // we need to get the next in place

    } else {

      to = circle(to);

      if(orientation == 'horizontal')
        if(remainingDistance) {
          animate(index * -width, (index * -width) - remainingDistance, (slideSpeed || speed) / 2);
          lastElement = true;
        }
        else {
          if(lastElement) {
            lastElement = false;
            var moveDistance = (containerWidth - ((slides.length * width)-(width*(to))) > 0) - (containerWidth - ((slides.length * width)-(width*(to-1))));
            animate((to * -width) - moveDistance/8, to * -width, (slideSpeed || speed) / 2);
          }
          else {
            lastElement = false;
            animate(index * -width, to * -width, slideSpeed || speed);
          }
        }
      else if(orientation == 'vertical')
        animate(index * -height, to * -height, slideSpeed || speed);
      //no fallback for a circular continuous if the browser does not accept transitions
    }

    index = to;
    offloadFn(options.callback && options.callback(index, slides[index]));
  }

  function move(index, dist, speed) {

    translate(index, dist, speed);
    slidePos[index] = dist;

  }

  function translate(index, dist, speed) {

    var slide = slides[index];
    var style = slide && slide.style;

    if (!style) return;

    style.webkitTransitionDuration =
    style.MozTransitionDuration =
    style.msTransitionDuration =
    style.OTransitionDuration =
    style.transitionDuration = speed + 'ms';

    if(orientation == 'horizontal') {
      style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
      style.msTransform =
      style.MozTransform =
      style.OTransform = 'translateX(' + dist + 'px)';
    }
    else if(orientation == 'vertical') {
      style.webkitTransform = 'translate(0,' + dist + 'px)' + 'translateZ(0)';
      style.msTransform =
      style.MozTransform =
      style.OTransform = 'translateY(' + dist + 'px)';
    }

  }

  function animate(from, to, speed) {

    // if not an animation, just reposition
    if (!speed) {

      element.style.left = to + 'px';
      return;

    }

    var start = +new Date;

    var timer = setInterval(function() {

      var timeElap = +new Date - start;

      if (timeElap > speed) {

        if(orientation == 'horizontal') {
          element.style.left = to + 'px';
        }
        else if(orientation == 'vertical') {
          element.style.top = to + 'px';
        }

        if (delay) begin();

        options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

        clearInterval(timer);
        return;

      }

      if(orientation == 'horizontal') {
        element.style.left = (( (to - from) * (Math.floor((timeElap / speed) * 100) / 100) ) + from) + 'px';
      }
      else if(orientation == 'vertical') {
        element.style.top = (( (to - from) * (Math.floor((timeElap / speed) * 100) / 100) ) + from) + 'px';
      }

    }, 4);

  }

  // setup auto slideshow
  var delay = options.auto || 0;
  var interval;

  function begin() {

    interval = setTimeout(next, delay);

  }

  function stop() {

    delay = 0;
    clearTimeout(interval);

  }


  // setup initial vars
  var start = {};
  var delta = {};
  var isScrolling;

  // setup event capturing
  var events = {

    handleEvent: function(event) {

      switch (event.type) {
        case 'touchstart': case 'MSPointerDown': this.start(event); break;
        case 'touchmove': case 'MSPointerMove': this.move(event); break;
        case 'touchend': case 'MSPointerUp': offloadFn(this.end(event)); break;
        case 'webkitTransitionEnd':
        case 'msTransitionEnd':
        case 'oTransitionEnd':
        case 'otransitionend':
        case 'transitionend': offloadFn(this.transitionEnd(event)); break;
        case 'resize': offloadFn(setup); break;
      }

      if (options.stopPropagation) event.stopPropagation();

    },
    start: function(event) {

      var touches = event;
      if (!window.navigator.msPointerEnabled) {
        var touches = event.touches[0];
      }

      // measure start values
      start = {

        // get initial touch coords
        x: touches.pageX,
        y: touches.pageY,

        // store time to determine touch duration
        time: +new Date

      };

      // used for testing first move event
      isScrolling = undefined;

      // reset delta and end measurements
      delta = {};

      // attach touchmove and touchend listeners
      if(window.navigator.msPointerEnabled) {
        element.addEventListener('MSPointerMove', this, false);
        element.addEventListener('MSPointerUp', this, false);
      }
      else {
        element.addEventListener('touchmove', this, false);
        element.addEventListener('touchend', this, false);
      }

    },
    move: function(event) {

      is_swiping: true;

      if (window.navigator.msPointerEnabled) {
        if(!event.isPrimary) return;
        var touches = event;
      }
      else {
        // ensure swiping with one touch and not pinching
        if ( event.touches.length > 1 || event.scale && event.scale !== 1) return;
        var touches = event.touches[0];
      }

      if (options.disableScroll || orientation == 'vertical') event.preventDefault();

      // measure change in x and y
      delta = {
        x: touches.pageX - start.x,
        y: touches.pageY - start.y
      }

      // determine if scrolling test has run - one time test
      if ( typeof isScrolling == 'undefined') {
        if(orientation == 'horizontal')
          isScrolling = !!( isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
        else if(orientation == 'vertical')
          isScrolling = !!( isScrolling || Math.abs(delta.y) < Math.abs(delta.x) );
      }

      // if user is not trying to scroll vertically
      if (!isScrolling) {

        // prevent native scrolling
        event.preventDefault();

        // stop slideshow
        stop();

        // increase resistance if first or last slide
        if (options.continuous) { // we don't add resistance at the end

          if(orientation == 'horizontal') {
            translate(circle(index-1), delta.x + slidePos[circle(index-1)], 0);
            translate(index, delta.x + slidePos[index], 0);
            translate(circle(index+1), delta.x + slidePos[circle(index+1)], 0);
          }
          else if(orientation == 'vertical') {
            translate(circle(index-1), delta.y + slidePos[circle(index-1)], 0);
            translate(index, delta.y + slidePos[index], 0);
            translate(circle(index+1), delta.y + slidePos[circle(index+1)], 0);
          }

        } else {

          if(orientation == 'horizontal') {
            delta.x =
              delta.x /
                ( (!index && delta.x > 0               // if first slide and sliding left
                  || index == slides.length - 1        // or if last slide and sliding right
                  && delta.x < 0                       // and if sliding at all
                ) ?
                ( Math.abs(delta.x) / width + 1 )      // determine resistance level
                : 1 );                                 // no resistance if false

            // translate 1:1
            translate(index-1, delta.x + slidePos[index-1], 0);
            translate(index, delta.x + slidePos[index], 0);
            translate(index+1, delta.x + slidePos[index+1], 0);
          }
          else if(orientation == 'vertical') {
            delta.y =
              delta.y /
                ( (!index && delta.y > 0               // if first slide and sliding left
                  || index == slides.length - 1        // or if last slide and sliding right
                  && delta.y < 0                       // and if sliding at all
                ) ?
                ( Math.abs(delta.y) / height + 1 )     // determine resistance level
                : 1 );                                 // no resistance if false

            // translate 1:1
            translate(index-1, delta.y + slidePos[index-1], 0);
            translate(index, delta.y + slidePos[index], 0);
            translate(index+1, delta.y + slidePos[index+1], 0);
          }
        }

      }

    },
    end: function(event) {

      // measure duration
      var duration = +new Date - start.time;

      if(orientation == 'horizontal') {
        // determine if slide attempt triggers next/prev slide
        var isValidSlide =
              Number(duration) < 250               // if slide duration is less than 250ms
              && Math.abs(delta.x) > 20            // and if slide amt is greater than 20px
              || Math.abs(delta.x) > width/2;      // or if slide amt is greater than half the width

        // determine if slide attempt is past start and end
        var isPastBounds =
              !index && delta.x > 0                            // if first slide and slide amt is greater than 0
              || index == slides.length - 1 && delta.x < 0;    // or if last slide and slide amt is less than 0
      }
      else if(orientation == 'vertical') {
        // determine if slide attempt triggers next/prev slide
        var isValidSlide =
              Number(duration) < 250               // if slide duration is less than 250ms
              && Math.abs(delta.y) > 20            // and if slide amt is greater than 20px
              || Math.abs(delta.y) > height/2;     // or if slide amt is greater than half the height

        // determine if slide attempt is past start and end
        var isPastBounds =
              !index && delta.y > 0                            // if first slide and slide amt is greater than 0
              || index == slides.length - 1 && delta.y < 0;    // or if last slide and slide amt is less than 0
      }

      if (options.continuous) isPastBounds = false;

      if(orientation == 'horizontal') {
        // determine direction of swipe (true:right, false:left)
        var direction = delta.x < 0;
      }
      else if(orientation == 'vertical') {
        // determine direction of swipe (true:up, false:down)
        var direction = delta.y < 0;
      }

      // if not scrolling vertically
      if (!isScrolling) {

        if (isValidSlide && !isPastBounds) {

          if (direction) {

            if (options.continuous) { // we need to get the next in this direction in place

              if(orientation == 'horizontal') {
                move(circle(index-1), -width, 0);
                move(circle(index+2), width, 0);
              }
              else if(orientation == 'vertical') {
                move(circle(index-1), -height, 0);
                move(circle(index+2), height, 0);
              }

            } else {
              if(orientation == 'horizontal') {
                move(index-1, -width, 0);
              }
              else if(orientation == 'vertical') {
                move(index-1, -height, 0);
              }
            }

            if(orientation == 'horizontal') {
              move(index, slidePos[index]-width, speed);
              move(circle(index+1), slidePos[circle(index+1)]-width, speed);
            }
            else if(orientation == 'vertical') {
              move(index, slidePos[index]-height, speed);
              move(circle(index+1), slidePos[circle(index+1)]-height, speed);
            }

            index = circle(index+1);

          } else {
            if (options.continuous) { // we need to get the next in this direction in place

              if(orientation == 'horizontal') {
                move(circle(index+1), width, 0);
                move(circle(index-2), -width, 0);
              }
              else if(orientation == 'vertical') {
                move(circle(index+1), height, 0);
                move(circle(index-2), -height, 0);
              }

            } else {
              if(orientation == 'horizontal') {
                move(index+1, width, 0);
              }
              else if(orientation == 'vertical') {
                move(index+1, height, 0);
              }
            }

            if(orientation == 'horizontal') {
              move(index, slidePos[index]+width, speed);
              move(circle(index-1), slidePos[circle(index-1)]+width, speed);
            }
            else if(orientation == 'vertical') {
              move(index, slidePos[index]+height, speed);
              move(circle(index-1), slidePos[circle(index-1)]+height, speed);
            }

            index = circle(index-1);

          }

          options.callback && options.callback(index, slides[index]);

        } else {

          if (options.continuous) {

            if(orientation == 'horizontal') {
              move(circle(index-1), -width, speed);
              move(index, 0, speed);
              move(circle(index+1), width, speed);
            }
            else if(orientation == 'vertical') {
              move(circle(index-1), -height, speed);
              move(index, 0, speed);
              move(circle(index+1), height, speed);
            }

          } else {

            if(orientation == 'horizontal') {
              move(index-1, -width, speed);
              move(index, 0, speed);
              move(index+1, width, speed);
            }
            else if(orientation == 'vertical') {
              move(index-1, -height, speed);
              move(index, 0, speed);
              move(index+1, height, speed);
            }
          }

        }

      }

      // kill touchmove and touchend event listeners until touchstart called again
      element.removeEventListener('touchmove', events, false);
      element.removeEventListener('touchend', events, false);
      element.removeEventListener('MSPointerMove', events, false);
      element.removeEventListener('MSPointerUp', events, false);

    },
    transitionEnd: function(event) {

      if (parseInt(event.target.getAttribute('data-index'), 10) == index) {

        if (delay) begin();
        options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);
      }

      is_swiping = false;
    }
  }

  // trigger setup
  setup();

  // start auto slideshow if applicable
  if (delay) begin();


  // add event listeners
  if (browser.addEventListener && !elastic) {

    // set touchstart event on element
    if (browser.touch) element.addEventListener('touchstart', events, false);
    if (window.navigator.msPointerEnabled) element.addEventListener('MSPointerDown', events, false);

    if (browser.transitions) {
      element.addEventListener('webkitTransitionEnd', events, false);
      element.addEventListener('msTransitionEnd', events, false);
      element.addEventListener('oTransitionEnd', events, false);
      element.addEventListener('otransitionend', events, false);
      element.addEventListener('transitionend', events, false);
    }

    // set resize event on window
    window.addEventListener('resize', events, false);

  } else {

    window.onresize = function () { setup() }; // to play nice with old IE

  }

  // expose the Swipe API
  return {
    setup: function() {

      setup();

    },
    slide: function(to, speed) {

      // cancel slideshow
      stop();

      slide(to, speed);

    },
    prev: function() {

      // cancel slideshow
      stop();

      prev();

    },
    next: function() {

      // cancel slideshow
      stop();

      next();

    },
    getPos: function() {

      // return current index position
      return index;

    },
    getState: function() {
      return is_swiping;
    },
    getNumSlides: function() {

      // return total number of slides
      return length;
    },
    kill: function() {

      // cancel slideshow
      stop();

      // reset element
      element.style.width = '';
      element.style.left = '';

      // reset slides
      var pos = slides.length;
      while(pos--) {

        var slide = slides[pos];
        slide.style.width = '';
        slide.style.left = '';

        if (browser.transitions) translate(pos, 0, 0);

      }

      // removed event listeners
      if (browser.addEventListener) {

        // remove current event listeners
        element.removeEventListener('touchstart', events, false);
        element.removeEventListener('webkitTransitionEnd', events, false);
        element.removeEventListener('msTransitionEnd', events, false);
        element.removeEventListener('oTransitionEnd', events, false);
        element.removeEventListener('otransitionend', events, false);
        element.removeEventListener('transitionend', events, false);
        element.removeEventListener('MSPointerDown', events, false);
        element.removeEventListener('MSPointerMove', events, false);
        element.removeEventListener('MSPointerUp', events, false);
        window.removeEventListener('resize', events, false);

      }
      else {

        window.onresize = null;

      }

    },
    stop: function() {

      // cansel slideshow
      stop();
    },
    begin: function(newDelay) {

      // start slideshow with defined delay
      delay = newDelay;
      begin();
    },
    isFirst: function() {
      return index == 0;
    },
    isLast: function() {
      return lastElement;
    }
  }
}


if ( window.jQuery || window.Zepto ) {
  (function($) {
    $.fn.Swipe = function(params) {
      return this.each(function() {
        $(this).data('Swipe', new Swipe($(this)[0], params));
      });
    }
  })( window.jQuery || window.Zepto )
}
