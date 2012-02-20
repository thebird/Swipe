/*
 * Swipe 2.0
 *
 * Brad Birdsall, Prime
 * Copyright 2012, Licensed GPL & MIT
 *
*/

window.Swipe = function(element, options) {

  var _this = this;

  // return immediately if element doesn't exist
  if (!element) return null;

  // reference dom elements
  this.element = element;

  // add swipe-active class
  this._addClass(element, ['swipe-active']);

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

  // trigger slider initialization
  this.setup();

  // begin auto slideshow
  this.begin();

  // debounce resize events
  var debounce = function(fn) {
    var timeout;
    return function debounced() {
      var obj = this, args = arguments;
      function delayed() {
        fn.apply(obj, args);
        timeout = null;
      };
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(delayed, 400); 
    };
  }
  this.resize = debounce(function() { _this.setup(); });

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
    window.addEventListener('resize', this.resize, false);
  }

  // to play nice with old IE
  else {
    window.onresize = this.resize;
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

    // store array of slides before, current, and after
    var refArray = [[],[],[]];

    // stack elements
    for (var index = this.length - 1; index > -1; index--) {

      var elem = this.slides[index];
      elem.setAttribute('data-index', index);

      // add this index to the reference array
      refArray[this.index > index ? 0 : (this.index < index ? 2 : 1)].push(index); // 0:before 1:equal 2:after

    }

    // stack left, current, and right slides
    this._slide(refArray[0],-1,0);
    this._slide(refArray[1],0,0);
    this._slide(refArray[2],1,0);

    // make sure the container is visible
    this.element.style.visibility = 'visible';

  },

  kill: function() {

    // cancel slideshow
    this.delay = 0;
    clearTimeout(this.interval);

    var elem = this.element;
    elem.style.webkitTransitionDuration = '0';
    this._removeClass(elem, ['swipe-active']);

    // remove event listeners
    if (this.element.removeEventListener) {
      if (!!this.browser.touch) {
        this.element.removeEventListener('touchstart', this, false);
        this.element.removeEventListener('touchmove', this, false);
        this.element.removeEventListener('touchend', this, false);
      }
      if (!!this.browser.transitions) {
        this.element.removeEventListener('webkitTransitionEnd', this, false);
        this.element.removeEventListener('msTransitionEnd', this, false);
        this.element.removeEventListener('oTransitionEnd', this, false);
        this.element.removeEventListener('transitionend', this, false);
      }
      window.removeEventListener('resize', this.resize, false);
    }

    // kill old IE! you can quote me on that ;)
    else {
      window.onresize = null;
    }

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

    var _this = this;
    
    _this.start = {

      // get touch coordinates for delta calculations in onTouchMove
      pageX: e.touches[0].pageX,
      pageY: e.touches[0].pageY,

      // set initial timestamp of touch sequence
      time: Number( new Date() )

    };

    // used for testing first onTouchMove event
    _this.isScrolling = undefined;
    
    // reset deltaX
    _this.deltaX = 0;

  },

  onTouchMove: function(e) {

    var _this = this;

    // ensure swiping with one touch and not pinching
    if(e.touches.length > 1 || e.scale && e.scale !== 1) return;

    _this.deltaX = e.touches[0].pageX - _this.start.pageX;

    // determine if scrolling test has run - one time test
    if ( typeof _this.isScrolling == 'undefined') {
      _this.isScrolling = !!( _this.isScrolling || Math.abs(_this.deltaX) < Math.abs(e.touches[0].pageY - _this.start.pageY) );
    }

    // if user is not trying to scroll vertically
    if (!_this.isScrolling) {

      // prevent native scrolling 
      e.preventDefault();

      // cancel slideshow
      _this.delay = 0;
      clearTimeout(_this.interval);

      // increase resistance if first or last slide
      _this.deltaX = 
        _this.deltaX / 
          ( (!_this.index && _this.deltaX > 0               // if first slide and sliding left
            || _this.index == _this.length - 1              // or if last slide and sliding right
            && _this.deltaX < 0                            // and if sliding at all
          ) ?                      
          ( Math.abs(_this.deltaX) / _this.width + 1 )      // determine resistance level
          : 1 );                                          // no resistance if false
      
      // translate immediately 1:1
      _this._slide([_this.index-1,_this.index,_this.index+1],_this.deltaX,-1);

    }

  },

  onTouchEnd: function(e) {

    var _this = this;

    // determine if slide attempt triggers next/prev slide
    var isValidSlide = 
          Number(new Date()) - _this.start.time < 250      // if slide duration is less than 250ms
          && Math.abs(_this.deltaX) > 20                   // and if slide amt is greater than 20px
          || Math.abs(_this.deltaX) > _this.width/2,        // or if slide amt is greater than half the width

    // determine if slide attempt is past start and end
        isPastBounds = 
          !_this.index && _this.deltaX > 0                          // if first slide and slide amt is greater than 0
          || _this.index == _this.length - 1 && _this.deltaX < 0,    // or if last slide and slide amt is less than 0
        
        direction = _this.deltaX < 0 ? 1 : -1; // 1:right -1:left

    // if not scrolling vertically
    if (!_this.isScrolling) {

      if (isValidSlide && !isPastBounds) { // if proper slide

        _this._slide([_this.index-direction],-direction,0);
        _this._slide([_this.index+direction],0,_this.speed);
        _this._slide([_this.index],direction*-1,_this.speed);
        
        _this.index += direction;
        _this.callback(_this.index, _this.slides[_this.index]);

      } else { // reset to original position before last slide

        _this._slide([_this.index-1],-1,_this.speed);
        _this._slide([_this.index],0,_this.speed);
        _this._slide([_this.index+1],1,_this.speed);

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
        pos = Math.abs(from-to) / (from-to), // 1:right -1:left
        inBetween = [];

    while (toStack--) inBetween.push( (to > from ? to : from) - toStack - 1 );

    // stack em
    this._slide(inBetween,pos,0);

    // now slide from and to in the proper direction
    this._slide([from],this.cache[from]+pos,this.speed);
    this._slide([to],0,this.speed);

    this.index = to;

    this.callback(this.index, this.slides[this.index]);

  },

  _slide: function(nums, pos, speed) {
    
    var _slides = this.slides,
        l = nums.length;

    while(l--) {

      var elem = _slides[nums[l]];

      if (elem) { // if the element at slide number exists

        if (this.browser.transitions) {
          
          var style = elem.style;

          // set duration speed (0 represents 1-to-1 scrolling)
          style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration = style.OTransitionDuration = style.transitionDuration = ( speed > 0 ? speed : 0 ) + 'ms';

          if (speed == -1) { // on touchmove sliding

            var xval = (this.cache[nums[l]] * this.width + pos);

            // translate to given index position
            style.webkitTransform = 'translate3d(' + xval + 'px,0,0)';
            style.msTransform = style.MozTransform = style.OTransform = 'translateX(' + xval + 'px)';
            
          } else {
            
            style.webkitTransform = '';
            style.msTransform = style.MozTransform = style.OTransform = '';

            this._removeClass(elem, ['swipe-left','swipe-current','swipe-right'])
            this._addClass(elem, ['swipe-' + (pos > 0 ? 'right' : pos < 0 ? 'left' : 'current') ])

          }

        } else {

          this.cache[nums[l]] = this.cache[nums[l]] || 0;
          this._animate(elem, this.cache[nums[l]] * this.width, pos * this.width, speed ? speed : 0);

        }

        if (speed != -1) this.cache[nums[l]] = pos; // set cache to new position

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

  _getElemIndex: function(elem) {
    
    return parseInt(elem.getAttribute('data-index'),10);

  },

  _addClass: function(elem, classes) {
    
    var l = classes.length;
    while(l--) {
      elem.className =  (elem.className.length ? elem.className + ' ' : '') + classes[l];
    }

  },

  _removeClass: function(elem, classes) {
    
    var l = classes.length;
    while(l--) {
      var reg = new RegExp('(\\s|^)' + classes[l] + '(\\s|$)');
      elem.className = elem.className.replace(reg,'').replace(/^\s+|\s+$/g,"");
    }

  }

};