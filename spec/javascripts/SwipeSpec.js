describe('Swipe', function() {

  var swipe;

  beforeEach(function(){
    loadFixtures('../../../index.html');
    swipe = new Swipe($('#slider').get(0));
  });

  it('should have been created without options', function(){
    expect(swipe).not.toBeNull();
  });
  
  it('should slide to index 4 on #slider with duration 0', function(){
    swipe.slide(4, 0);
    expect(swipe.getPos()).toBe(4);
  });
  
  describe('when calling next', function(){
    it('should move to the next index 1 from 0', function(){
      swipe.next();
      expect(swipe.getPos()).toBe(1);
    });
    
    it('should move to the index 0 when calling next on the last index', function(){
      swipe.slide(5, 0);
      swipe.next();
      expect(swipe.getPos()).toBe(0);
    });
  });
  
  describe('when calling prev', function(){
    it('should move to the prev index 1 from 2', function(){
      swipe.next();
      swipe.next();
      expect(swipe.getPos()).toBe(2);
      
      swipe.prev();
      expect(swipe.getPos()).toBe(1);
    });
    
    it('should not move to the prev index when there is none', function(){
      swipe.prev();
      expect(swipe.getPos()).toBe(0);
    });
  });
  
  xdescribe('when invoking touch event', function(){
    //TODO: implement
  });
  
  xdescribe('when handling automatic transition', function(){
    //TODO: implement
  });

});