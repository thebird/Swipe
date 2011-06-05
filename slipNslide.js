/*
 * slipNslide Mobile Slider
 *
 * Brad Birdsall, Prime
 * Copyright 2011, Licensed GPL & MIT
 *
*/

window.slipNslide = function(element, options) {

  // retreive options
  this.options = options || {};
  this.index = this.options.startSlide || 0;
  this.speed = this.options.speed || 300;
  this.callback = this.options.callback || function() {};

  // reference dom elements
  this.container = element;
  this.element = this.container.getElementsByTagName('ul')[0]; // the slide pane
  this.slides = this.element.getElementsByTagName('li');
  this.length = this.slides.length;

  // static css
  this.container.style.overflow = 'hidden';
  this.element.style.listStyle = 'none';

  this.setup();

  this.element.addEventListener('touchstart', this, false);
  this.element.addEventListener('touchmove', this, false);
  this.element.addEventListener('touchend', this, false);
  this.element.addEventListener('webkitTransitionEnd', this, false);
  window.addEventListener('resize', this, false);

}

slipNslide.prototype = {

  setup: function() {

    this.container.style.visibility = 'hidden';

    this.width = this.container.getBoundingClientRect().width;

    this.slideWidth = this.slidesPer > 1 ? this.width/this.slidesPer : this.width;

    // dynamic css
    this.element.style.width = (this.slides.length * this.slideWidth) + 'px';
    var index = this.slides.length;
    while (index--) {
      var el = this.slides[index];
      el.style.width = this.slideWidth + 'px';
      el.style.display = 'inline-block';
    }

    this.slide(this.index, 0); // set start position and force translate to remove initial flickering

    this.container.style.visibility = 'visible';

  },

  slide: function(index,duration) {

    this.element.style.webkitTransitionDuration = duration + 'ms';
    this.element.style.webkitTransform = 'translate3d(' + -(index * this.width) + 'px,0,0)';

    this.index = index; // set new index to allow for expression arguments

  },

  prev: function() {

    if (this.index) this.slide(this.index-1, this.speed);

  },

  next: function() {

    if (this.index < this.length - 1) this.slide(this.index+1, this.speed);

  },

  handleEvent: function(e) {
    switch (e.type) {
      case 'touchstart': this.onTouchStart(e); break;
      case 'touchmove': this.onTouchMove(e); break;
      case 'touchend': this.onTouchEnd(e); break;
      case 'webkitTransitionEnd': this.callback(e, this.slides[this.index]); break;
      case 'resize': this.setup(); break;
    }
  },

  onTouchStart: function(e) {
    
    // get touch coordinates for delta calculations in onTouchMove
    this.startX = e.touches[0].pageX;
    this.startY = e.touches[0].pageY;

    this.time = Number(new Date()); // set start time of touch sequence
    this.isScrolling = undefined; // used for testing first onTouchMove event
    this.deltaX = 0; // reset deltaX
    this.element.style.webkitTransitionDuration = 0; // set transition time to 0 for 1-to-1 touch movement

  },

  onTouchMove: function(e) {

    this.deltaX = e.touches[0].pageX - this.startX;

    // determine if scrolling test has run - one time test
    if ( typeof this.isScrolling == 'undefined') {
      this.isScrolling = !!( this.isScrolling || Math.abs(this.deltaX) < Math.abs(e.touches[0].pageY - this.startY) );
    }

    // if user is not trying to scroll vertically
    if (!this.isScrolling) {
      e.preventDefault();
      this.deltaX = this.deltaX / ( (!this.index && this.deltaX > 0 || this.index == this.length - 1 && this.deltaX < 0) ? ( Math.abs(this.deltaX) / this.width + 1 ) : 1 );
      this.element.style.webkitTransform = 'translate3d(' + (this.deltaX - this.index * this.width) + 'px,0,0)';
    }

  },

  onTouchEnd: function(e) {

    var isValidSlide = Number(new Date()) - this.time < 250 && Math.abs(this.deltaX) > 20 || Math.abs(this.deltaX) > this.width/2,
        isPastBounds = !this.index && this.deltaX > 0 || this.index == this.length - 1 && this.deltaX < 0;

    if (!this.isScrolling) this.slide(this.index + ( isValidSlide && !isPastBounds ? (this.deltaX < 0 ? 1 : -1) : 0 ), this.speed);

  }

}