/*
 * Swipe 2.0
 *
 * Brad Birdsall, Prime
 * Copyright 2011, Licensed GPL & MIT
 *
*/

window.Swipe = function(element, options) {

  // return immediately if element doesn't exist
  if (!element) return null;

  // reference dom elements
  this.element = element;

  // simple feature detection
  this.browser = {
    touch: (function() {
      return ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
    })(),
    transitions: (function() {
      var temp = document.createElement('swipe'),
          props = ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
      for ( var i in props ) {
        if (temp.style[ props[i] ] !== undefined) return true;
      }
      return false;
    })()
  };

  // retreive options
  options = options || {};
  this.index = options.startSlide || 0;
  this.speed = options.speed || 300;
  this.callback = options.callback || function() {};
  this.transitionEnd = options.transitionEnd || function() {};
  this.delay = options.auto || 0;
  this.cont = options.continuous || true;

  // static css
  this.element.style.overflow = 'hidden';
  this.element.style.listStyle = 'none';
  this.element.style.position = 'relative';

  // trigger slider initialization
  this.setup();

  // begin auto slideshow
  this.begin();

  if (this.delay) log('slideshow started, ' + this.delay + 'ms delay'); //debug

  // add event listeners
  if (this.element.addEventListener) {
    if (!!this.browser.touch) {
      this.element.addEventListener('touchstart', this, false);
      this.element.addEventListener('touchmove', this, false);
      this.element.addEventListener('touchend', this, false);
    }
    if (!!this.browser.transitions) {
      this.element.addEventListener('webkitTransitionEnd', this, false);
      this.element.addEventListener('msTransitionEnd', this, false);
      this.element.addEventListener('oTransitionEnd', this, false);
      this.element.addEventListener('transitionend', this, false);
    }
    window.addEventListener('resize', this, false);
  }

  // to play nice with old IE
  else {
    var _this = this;
    window.onresize = function() { _this.setup(); };
  }

};

Swipe.prototype = {

  setup: function() {

    // get and measure amt of slides
    this.slides = this.element.children;
    this.length = this.slides.length;
    this.cache = new Array(this.length);

    // return immediately if their are less than two slides
    if (this.length < 2) return null;

    // determine width of each slide
    this.width = this.element.getBoundingClientRect().width || this.element.offsetWidth;

    // return immediately if measurement fails
    if (!this.width) return null;

    // hide slider element but keep positioning during setup
    this.element.style.visibility = 'hidden';

    log('setting up Swipe'); //debug

    // create variable to find tallest slide
    var tempHeight = 0,
        refArray = [[],[],[]]; // determine slides before, current, and after

    // stack elements
    for (var index = this.length - 1; index > -1; index--) {

      var elem = this.slides[index],
          height = elem.getBoundingClientRect().height || elem.offsetHeight;

      elem.style.display = 'block';
      elem.style.position = 'absolute';
      elem.style.width = this.width + 'px';
      elem.style.top = elem.style.left ='0';
      elem.setAttribute('data-index', index);

      // replace tempHeight if this slides height is greater
      tempHeight = tempHeight < height ? height : tempHeight;

      // add this index to the reference array
      refArray[this.index > index ? 0 : (this.index < index ? 2 : 1)].push(index); // 0:before 1:equal 2:after

    }

    // set height of container based on tallest slide (required with absolute positioning)
    this.element.style.height = tempHeight + 'px';

    // stack left, current, and right slides
    this._slide(refArray[0],-this.width,0,1);
    this._slide(refArray[1],0,0,1);
    this._slide(refArray[2],this.width,0,1);

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
    else if (this.cont) this.slide(this.length-1, this.speed);

  },

  next: function(delay) {

    // cancel slideshow
    this.delay = delay || 0;
    clearTimeout(this.interval);

    if (this.index < this.length - 1) this.slide(this.index+1, this.speed); // if not last slide
    else if (this.cont) this.slide(0, this.speed); //if last slide return to start

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
      case 'transitionend': this.onTransitionEnd(e); break;
      case 'resize': this.setup(); break;
    }
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
      this._slide([this.index-1,this.index,this.index+1],this.deltaX,0,-1);

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
          || this.index == this.length - 1 && this.deltaX < 0,    // or if last slide and slide amt is less than 0
        
        direction = this.deltaX < 0; // true:right false:left

    // if not scrolling vertically
    if (!this.isScrolling) {

      if (isValidSlide && !isPastBounds) {
        if (direction) {
          this._slide([this.index-1],-this.width,0,1);
          this._slide([this.index,this.index+1],-this.width,this.speed,0);
          this.index += 1;
        } else {
          this._slide([this.index+1],this.width,0,1);
          this._slide([this.index-1,this.index],this.width,this.speed,0);
          this.index += -1;
        }
        this.callback(this.index, this.slides[this.index]);
      } else {
        this._slide([this.index-1,this.index,this.index+1],0,this.speed,0);
      }

    }

  },

  onTransitionEnd: function(e) {

    if (this._getElemIndex(e.target) == this.index) { // only call transition end on the main slide item

      if (this.delay) this.begin();

      this.transitionEnd(this.index, this.slides[this.index]);

    }

  },

  slide: function(to, speed) {
    
    var from = this.index;

    if (from == to) return; // do nothing if already on requested slide

    var toStack = Math.abs(from-to) - 1,
        direction = Math.abs(from-to) / (from-to), // 1:right -1:left
        inBetween = [];

    while (toStack--) inBetween.push( (to > from ? to : from) - toStack - 1 );

    // stack em
    this._slide(inBetween,this.width * direction,0,1);

    // now slide from and to in the proper direction
    this._slide([from,to],this.width * direction,this.speed,0);

    this.index = to;

    this.callback(this.index, this.slides[this.index]);

  },

  _slide: function(nums, dist, speed, _setting) { // _setting => -1:temp, 0:full, 1:absolute
    
    var _slides = this.slides,
        l = nums.length;

    while(l--) {

      var elem = _slides[nums[l]];

      if (elem) { // if the element at slide number exists

        if (this.browser.transitions) {
          
          var style = elem.style,
              xval = (dist + ( _setting != 1 ? this.cache[nums[l]] : 0) );

          // set duration speed (0 represents 1-to-1 scrolling)
          style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration = style.OTransitionDuration = style.transitionDuration = (speed ? speed : 0) + 'ms';

          // translate to given index position
          style.webkitTransform = 'translate3d(' + xval + 'px,0,0)';
          style.msTransform = style.MozTransform = style.OTransform = 'translateX(' + xval + 'px)';

        } else {
          this._animate(elem, this.cache[nums[l]], dist + ( _setting != 1 ? this.cache[nums[l]] : 0), speed ? speed : 0);
        }

        if (_setting == 1) this.cache[nums[l]] = dist;
        else if (_setting == 0) this.cache[nums[l]] += dist;

      }

    }

  },

  _animate: function(elem, from, to, speed) {


    if (!speed) { // if not an animation, just reposition
      
      elem.style.left = to + 'px';

      return;

    }
    
    var _this = this,
        start = new Date(),
        timer = setInterval(function() {

          var timeElap = new Date() - start;

          if (timeElap > speed) {

            elem.style.left = to + 'px';  // callback after this line

            if (_this._getElemIndex(elem) == _this.index) { // only call transition end on the main slide item

              if (_this.delay) _this.begin();
            
              _this.transitionEnd(_this.index, _this.slides[_this.index]);

            }

            clearInterval(timer);

            return;

          }

          elem.style.left = (( (to - from) * (Math.floor((timeElap / speed) * 100) / 100) ) + from) + 'px';

        }, 4);

  },

  _getElemIndex : function(elem) {
    
    return parseInt(elem.getAttribute('data-index'),10);

  }

};