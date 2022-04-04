import classnames from "./classnames";

let softwareScroller;
let softwareScrollContent;
let softwareFakeScrollbar;
let softwareFakeThumb;
function setUpsoftwareScroller(workspaceId, roomId){
  destroyRoomInfosoftwareScroller();
  softwareScroller = document.querySelector(`.ws-room-software-scroller.ws-room-software-scroller-${workspaceId}-${roomId}`);
  softwareScrollContent = softwareScroller.querySelector(`.swiper-wrapper`);
  softwareScrollContent.style["left"] = 0;
  softwareFakeScrollbar = document.querySelector(`.ws-scroll-track-container-software`);
  softwareFakeThumb = softwareFakeScrollbar.querySelector(`.ws-scroll-track-container-software .ws-scroll-thumb`);
  softwareFakeThumb.style["left"] = 0;
  updateRoomInfosoftwareScroller();

  window.addEventListener('resize', updateRoomInfosoftwareScroller);

  softwareScroller.addEventListener('mousedown', mouseDownHandler);
  softwareScroller.addEventListener('touchstart', mouseDownHandler);
}

const getScrollContentWidth = () => {
    if (!softwareScrollContent){
        return 0
    }

    const slides = Array.from(softwareScrollContent.querySelectorAll(`.swiper-slide`));
    let w = 0;
    slides.forEach(element => {
        w += element.offsetWidth
    });

    return w
}

let pos = { left: 0, x: 0, };
const mouseDownHandler = function (e) {
  if (softwareScroller.classList.contains('ws-no-scroll')){
    return
  }

  softwareScroller.style.cursor = 'grabbing';
  softwareScroller.style.userSelect = 'none';
  
  pos = {
      left: -(parseInt(softwareScrollContent.style["left"])),
      x: e.clientX,
  };
  
  const mouseMoveHandler = function (e) {
    const dx = e.clientX - pos.x;

    let w = getScrollContentWidth();

    let newLeft = pos.left - dx;
    let maxLeft = w - softwareScroller.offsetWidth
    let minLeft = 0
    let left = Math.min(Math.max(newLeft, minLeft) , maxLeft);

    softwareScrollContent.style["left"] = -(left) + "px";
    setThumbPosition();
  };

  const mouseUpHandler = function () {
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
    document.removeEventListener('touchmove', mouseMoveHandler);
    document.removeEventListener('touchend', mouseUpHandler);

    softwareScroller.style.cursor = 'grab';
    softwareScroller.style.removeProperty('user-select');
  };

  document.addEventListener('mousemove', mouseMoveHandler);
  document.addEventListener('mouseup', mouseUpHandler);
};

const destroyRoomInfosoftwareScroller = ()=>{
  if (softwareScroller) {
    pos = { left: 0, x: 0 };
    softwareScroller.removeEventListener('mousedown',mouseDownHandler)
    softwareScroller.removeEventListener('touchstart',mouseDownHandler)
    softwareScroller = null;
  }
}

const updateRoomInfosoftwareScroller = (e)=>{
    if (!softwareScroller){
      return
    }
  
    setTimeout(()=>{
      const w = getScrollContentWidth();
  
      if(w <= softwareScroller.offsetWidth || Math.abs(w - softwareScroller.offsetWidth) < 10) {
        softwareScroller.classList.add('ws-no-scroll');
        softwareFakeThumb.classList.add(classnames.hidden);
      } else {
        softwareScroller.classList.remove('ws-no-scroll');
        softwareFakeThumb.style["width"] = `calc(100% * (${softwareScroller.offsetWidth} / ${w})) !important;`;
        setThumbPosition();
        softwareFakeThumb.classList.remove(classnames.hidden);
      }
  
    }, e ? 200 : 0)
  
  }
  
  const setThumbPosition = ()=>{
      let trackWidth = softwareFakeScrollbar.offsetWidth;
      let thunbWidth = softwareFakeThumb.offsetWidth;
      let availableDistance = trackWidth - thunbWidth;
      let scrollLeft = Math.abs(parseInt(softwareScrollContent.style["left"]));
      let thumbLeft =  availableDistance * (scrollLeft / (getScrollContentWidth() - softwareScroller.offsetWidth));
      softwareFakeThumb.style["left"] = thumbLeft + 'px';      
  }

export default {
    setUpsoftwareScroller: setUpsoftwareScroller,
    destroyRoomInfosoftwareScroller: destroyRoomInfosoftwareScroller
}