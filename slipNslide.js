/*
 * slipNslide Mobile Slider
 * http://m.alt8242.com/slipNslide/
 *
 * Brad Birdsall, Prime
 * Copyright 2011, Licensed GPL & MIT
 *
*/

window.slipNslide = function(element, options) {

  this.options = options || {};

  this.position = this.options.startPosition || 0;
  this.callback = this.options.callback || function() {};

  this.container = element;
  this.element = this.container.getElementsByTagName('ul')[0]; // the slide pane
  this.slides = this.element.getElementsByTagName('li');

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

    var lastWidth = this.width; // cache for change calc

    this.width = this.container.getBoundingClientRect().width;

    this.container.style.visibility = 'hidden';

    // dynamic css
    this.element.style.width = (this.slides.length * this.width) + 'px';

    var index = this.slides.length;
    while (index--) {
      var el = this.slides[index];
      el.style.width = this.width + 'px';
      el.style.display = 'inline-block';
    }

    this.end = ( this.slides.length - 1 ) * this.width;

    // reset position if already at a slide other than 0 
    this.position = this.position ? ( this.position / lastWidth ) * this.width : this.position;
    this.slide( this.position, 0 ); // stops initial flickering on first move

    this.container.style.visibility = 'visible';

  },

  slide: function(pos,duration) {
    this.element.style.webkitTransitionDuration = duration + 'ms';
    this.element.style.webkitTransform = 'translate3d(' + pos + 'px,0,0)';
  },

  atBounds: function() {
    return this.deltaX + this.position > 0 || Math.abs(this.position) == this.end && this.end + this.deltaX < this.end;
  },

  prev: function() {
    this.position += (this.position) ? this.width : 0;
    this.slide(this.position, 300);
  },

  next: function() {
    this.position += (-this.position != this.end) ? -this.width : 0;
    this.slide(this.position, 300);
  },

  handleEvent: function(e) {

    switch (e.type) {
      case 'touchstart': this.onTouchStart(e); break;
      case 'touchmove': this.onTouchMove(e); break;
      case 'touchend': this.onTouchEnd(e); break;
      case 'webkitTransitionEnd': this.callback(e, this.slides[-this.position/this.width]); break;
      case 'resize': this.setup(); break;
    }

  },

  onTouchStart: function(e) {

    this.startX = e.touches[0].pageX;
    this.startY = e.touches[0].pageY;

    this.time = Number(new Date());

    this.isScrolling = undefined;

    this.deltaX = 0;

    this.element.style.webkitTransitionDuration = 0; // set transition time to 0 for 1-to-1 touch movement

  },

  onTouchMove: function(e) {

    this.deltaX = e.touches[0].pageX - this.startX;

    if ( typeof this.isScrolling == 'undefined') { // determine if test has run
      this.isScrolling = !!( this.isScrolling || Math.abs(this.deltaX) < Math.abs(e.touches[0].pageY - this.startY) ); 
    }

    if (!this.isScrolling) {
      e.preventDefault();
      this.deltaX = this.atBounds() ? this.deltaX / ( Math.abs(this.deltaX) / this.width + 1 ) : this.deltaX;
      this.slide( this.deltaX + this.position );
    }

  },

  onTouchEnd: function(e) {

    if (this.isScrolling) return;

    this.position +=
      ( Number(new Date()) - this.time < 250 && Math.abs(this.deltaX) > 20 ||
        Math.abs(this.deltaX) > this.width / 2  ) // check amt of time elap and if swipe was half of screen width
      ?
      this.atBounds() ? 0 : // snap back from bounds
        ( this.deltaX > 0 ) ? this.width: -this.width
      : 0;

    this.slide(this.position, 300);

  }

}