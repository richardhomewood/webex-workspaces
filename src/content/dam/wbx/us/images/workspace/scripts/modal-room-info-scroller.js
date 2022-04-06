import classnames from "./classnames";
import Hammer from "hammerjs"


const types =  {
  'device' : 'device',
  'software' : 'software'
}

class RoomModalScroller {

  static get Type(){return types}

  constructor(workspaceId, roomId, type) {
    this.scroller = document.getElementById(`ws-room-${type}-scroller-${workspaceId}-${roomId}`);
    this.scrollContent = this.scroller.querySelector(`.swiper-wrapper`);
    this.scrollContent.style["left"] = 0;
    this.fakeScrollbar = document.getElementById(`ws-scroll-track-container-${type}-${workspaceId}-${roomId}`);
    this.fakeThumb = this.fakeScrollbar.querySelector('.ws-scroll-thumb');
    this.fakeThumb.style["left"] = 0;
    this.pos = { left: 0, x: 0 }

    this.destroy = this.destroy.bind(this)
    this.getScrollContentWidth = this.getScrollContentWidth.bind(this)
    this.setThumbPosition = this.setThumbPosition.bind(this)
    this.initHammer = this.initHammer.bind(this)
    this.update = this.update.bind(this)
    this.update();

    window.addEventListener('resize', this.update);
  }

  initHammer(){
    const that = this;
    this.hammertime = new Hammer(that.scroller);
    this.hammertime.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL });
    this.hammertime.on("panleft panright panend panstart", function(ev) {

      if(ev.type == 'panstart' ) {
        that.pos = {
          left: -(parseInt(that.scrollContent.style["left"])),
          x: ev.srcEvent.clientX,
        };
      }

      const dx = Math.floor(ev.srcEvent.clientX) - that.pos.x;
      
      let w = that.getScrollContentWidth();

      let newLeft = that.pos.left - dx;
      let maxLeft = w - that.scroller.offsetWidth
      let minLeft = 0
      let left = Math.min(Math.max(newLeft, minLeft) , maxLeft);

      that.scrollContent.style["left"] = -(left) + "px";
      that.setThumbPosition();
    });
    
  }

  update(e){
    if (!this.scroller){
      return
    }
  
    setTimeout(()=>{
      const w = this.getScrollContentWidth();
  
      if(w <=this.scroller.offsetWidth || Math.abs(w - this.scroller.offsetWidth) < 10) {
        this.scroller.classList.add('ws-no-scroll');
        this.fakeThumb.classList.add(classnames.hidden);
      } else {
        this.scroller.classList.remove('ws-no-scroll');
        this.fakeThumb.style["width"] = `calc(100% * (${this.scroller.offsetWidth} / ${w}))`;
        this.setThumbPosition();
        this.fakeThumb.classList.remove(classnames.hidden);
      }

      if (this.scroller.classList.contains('ws-no-scroll')){
        if (this.hammertime){
          this.destroy();
        }
        return
      } else if(!this.hammertime){
        this.initHammer();
      }
  
    }, e ? 200 : 0)
  }

  setThumbPosition(){
    let trackWidth = this.fakeScrollbar.offsetWidth;
    let thunbWidth = this.fakeThumb.offsetWidth;
    let availableDistance = trackWidth - thunbWidth;
    let scrollLeft = Math.abs(parseInt(this.scrollContent.style["left"]))
    let thumbLeft =  availableDistance * (scrollLeft / (this.getScrollContentWidth() - this.scroller.offsetWidth));
    this.fakeThumb.style["left"] = thumbLeft + 'px';
  }

  getScrollContentWidth(){
    if (!this.scrollContent){
        return 0
    }

    const slides = Array.from(this.scrollContent.querySelectorAll(`.swiper-slide`));
    let w = 0;
    slides.forEach(element => {
        w += element.offsetWidth
    });

    return w
  }

  destroy(){
    if (this.hammertime){
      this.hammertime.destroy();
      this.hammertime = null;
    }
    this.pos = { left:0, x:0 };
  }
}

export default RoomModalScroller;
