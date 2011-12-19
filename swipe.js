/*
 * Swipe 1.0
 *
 * Brad Birdsall, Prime
 * Copyright 2011, Licensed GPL & MIT
 *
*/

window.Swipe = function(element, options) {

  // return immediately if element doesn't exist
  if (!element) return null;

  // retreive options
  this.options = options || {};
  this.index = this.options.startSlide || 0;
  this.speed = this.options.speed || 300;
  this.callback = this.options.callback || function() {};
  this.delay = this.options.auto || 0;

  // reference dom elements
  this.element = element;

  // static css
  //this.element.style.overflow = 'hidden';
  this.element.style.listStyle = 'none';
  this.element.style.position = 'relative';

  // trigger slider initialization
  this.setup();

  // begin auto slideshow
  this.begin();

  // add event listeners
  if (this.element.addEventListener) {
    this.element.addEventListener('touchstart', this, false);
    this.element.addEventListener('touchmove', this, false);
    this.element.addEventListener('touchend', this, false);
    this.element.addEventListener('webkitTransitionEnd', this, false);
    this.element.addEventListener('msTransitionEnd', this, false);
    this.element.addEventListener('oTransitionEnd', this, false);
    this.element.addEventListener('transitionend', this, false);
    window.addEventListener('resize', this, false);
  }

};

Swipe.prototype = {

  setup: function() {

    // get and measure amt of slides
    this.slides = this.element.children;
    this.length = this.slides.length;
    this.pos = new Array(length);

    // return immediately if their are less than two slides
    if (this.length < 2) return null;

    // determine width of each slide
    this.width = this.element.getBoundingClientRect().width;

    // return immediately if measurement fails
    if (!this.width) return null;

    // hide slider element but keep positioning during setup
    this.element.style.visibility = 'hidden';


    // stack elements
    for (var index = this.length - 1; index > -1; index--) {

      var style = this.slides[index].style;

      style.width = this.width + 'px';

      if (!index) { // if first element

        style.position = 'relative';
        style.webkitTransform = 'translate3d(0,0,0)';
        this.pos[index] = 0;

      } else {

        style.position = 'absolute';
        style.top = '0';
        style.webkitTransform = 'translate3d(' + this.width + 'px,0,0)';
        this.pos[index] = this.width;

      }

    }


    // show slider element
    this.element.style.visibility = 'visible';

  },

  getPos: function() {
    
    // return current index position
    return this.index;

  },

  prev: function(delay) {

    // cancel slideshow
    this.delay = delay || 0;
    clearTimeout(this.interval);

    // if not at first slide
    if (this.index) this.slide(this.index-1, this.speed);

  },

  next: function(delay) {

    // cancel slideshow
    this.delay = delay || 0;
    clearTimeout(this.interval);

    if (this.index < this.length - 1) this.slide(this.index+1, this.speed); // if not last slide
    else this.slide(0, this.speed); //if last slide return to start

  },

  begin: function() {

    var _this = this;

    this.interval = (this.delay)
      ? setTimeout(function() { 
        _this.next(_this.delay);
      }, this.delay)
      : 0;
  
  },

  handleEvent: function(e) {
    switch (e.type) {
      case 'touchstart': this.onTouchStart(e); break;
      case 'touchmove': this.onTouchMove(e); break;
      case 'touchend': this.onTouchEnd(e); break;
      case 'webkitTransitionEnd':
      case 'msTransitionEnd':
      case 'oTransitionEnd':
      case 'transitionend': this.transitionEnd(e); break;
      case 'resize': this.setup(); break;
    }
  },

  transitionEnd: function(e) {
    
    if (this.delay) this.begin();

    this.callback(e, this.index, this.slides[this.index]);

  },

  onTouchStart: function(e) {
    
    this.start = {

      // get touch coordinates for delta calculations in onTouchMove
      pageX: e.touches[0].pageX,
      pageY: e.touches[0].pageY,

      // set initial timestamp of touch sequence
      time: Number( new Date() )

    };

    // used for testing first onTouchMove event
    this.isScrolling = undefined;
    
    // reset deltaX
    this.deltaX = 0;

  },

  onTouchMove: function(e) {

    // ensure swiping with one touch and not pinching
    if(e.touches.length > 1 || e.scale && e.scale !== 1) return;

    this.deltaX = e.touches[0].pageX - this.start.pageX;

    // determine if scrolling test has run - one time test
    if ( typeof this.isScrolling == 'undefined') {
      this.isScrolling = !!( this.isScrolling || Math.abs(this.deltaX) < Math.abs(e.touches[0].pageY - this.start.pageY) );
    }

    // if user is not trying to scroll vertically
    if (!this.isScrolling) {

      // prevent native scrolling 
      e.preventDefault();

      // cancel slideshow
      clearTimeout(this.interval);

      // increase resistance if first or last slide
      this.deltaX = 
        this.deltaX / 
          ( (!this.index && this.deltaX > 0               // if first slide and sliding left
            || this.index == this.length - 1              // or if last slide and sliding right
            && this.deltaX < 0                            // and if sliding at all
          ) ?                      
          ( Math.abs(this.deltaX) / this.width + 1 )      // determine resistance level
          : 1 );                                          // no resistance if false
      
      // translate immediately 1:1
      this.slide(this.deltaX, 0, true);
    }

  },

  onTouchEnd: function(e) {

    // determine if slide attempt triggers next/prev slide
    var isValidSlide = 
          Number(new Date()) - this.start.time < 250      // if slide duration is less than 250ms
          && Math.abs(this.deltaX) > 20                   // and if slide amt is greater than 20px
          || Math.abs(this.deltaX) > this.width/2,        // or if slide amt is greater than half the width

    // determine if slide attempt is past start and end
        isPastBounds = 
          !this.index && this.deltaX > 0                          // if first slide and slide amt is greater than 0
          || this.index == this.length - 1 && this.deltaX < 0;    // or if last slide and slide amt is less than 0

    // if not scrolling vertically
    if (!this.isScrolling) {

      // call slide function with slide end value based on isValidSlide and isPastBounds tests
      this.slide( isValidSlide && !isPastBounds ? (this.deltaX < 0 ? -this.width : this.width) : 0, this.speed );

    }

  },

  slide: function(amt, duration, isTemp) {

    for(var i = -1; i < 2; i++) {

      var index = this.index + i,
          el = this.slides[index],
          delta = this.pos[index] + amt;
      
      if (el) {

        if (!isTemp) { // if not temporary sliding
          this.pos[index] += amt;
          if (this.pos[index] < 0) this.pos[index] = -this.width;
          else if (this.pos[index] > this.width) this.pos[index] = this.width;
          delta = this.pos[index];
        }

        el.style.webkitTransitionDuration = duration + 'ms';
        el.style.webkitTransform = 'translate3d(' + delta + 'px,0,0)';

      }

    }

    if (!isTemp) this.index -= this.pos[this.index]/this.width;

  }

};


function print(msg) {
  document.getElementById('console').innerHTML = msg + '<br>' + document.getElementById('console').innerHTML;
}
