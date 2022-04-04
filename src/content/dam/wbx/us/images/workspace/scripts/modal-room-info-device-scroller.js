import classnames from "./classnames";

let deviceScroller;
let deviceScrollContent;
let deviceFakeScrollbar;
let deviceFakeThumb;
function setUpDeviceScroller(workspaceId, roomId){
  destroyRoomInfoDeviceScroller();
  deviceScroller = document.querySelector(`.ws-room-device-scroller.ws-room-device-scroller-${workspaceId}-${roomId}`);
  deviceScrollContent = deviceScroller.querySelector(`.swiper-wrapper`);
  deviceScrollContent.style["left"] = 0;
  deviceFakeScrollbar = document.querySelector(`.ws-scroll-track-container-devices`);
  deviceFakeThumb = deviceFakeScrollbar.querySelector(`.ws-scroll-track-container-devices .ws-scroll-thumb`);
  deviceFakeThumb.style["left"] = 0;
  updateRoomInfoDeviceScroller();

  window.addEventListener('resize', updateRoomInfoDeviceScroller);

  deviceScroller.addEventListener('mousedown', mouseDownHandler);
  deviceScroller.addEventListener('touchstart', mouseDownHandler);
}

const getScrollContentWidth = () => {
    if (!deviceScrollContent){
        return 0
    }

    const slides = Array.from(deviceScrollContent.querySelectorAll(`.swiper-slide`));
    let w = 0;
    slides.forEach(element => {
        w += element.offsetWidth
    });

    return w
}

let pos = { left: 0, x: 0, };
const mouseDownHandler = function (e) {
  if (deviceScroller.classList.contains('ws-no-scroll')){
    return
  }

  deviceScroller.style.cursor = 'grabbing';
  deviceScroller.style.userSelect = 'none';
  
  pos = {
      left: -(parseInt(deviceScrollContent.style["left"])),
      x: e.clientX,
  };
  
  const mouseMoveHandler = function (e) {
    const dx = e.clientX - pos.x;

    let w = getScrollContentWidth();

    let newLeft = pos.left - dx;
    let maxLeft = w - deviceScroller.offsetWidth
    let minLeft = 0
    let left = Math.min(Math.max(newLeft, minLeft) , maxLeft);

    deviceScrollContent.style["left"] = -(left) + "px";
    setThumbPosition();
  };

  const mouseUpHandler = function () {
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
    document.removeEventListener('touchmove', mouseMoveHandler);
    document.removeEventListener('touchend', mouseUpHandler);

    deviceScroller.style.cursor = 'grab';
    deviceScroller.style.removeProperty('user-select');
  };

  document.addEventListener('mousemove', mouseMoveHandler);
  document.addEventListener('mouseup', mouseUpHandler);
};

const destroyRoomInfoDeviceScroller = ()=>{
  if (deviceScroller) {
    pos = { left: 0, x: 0 };
    deviceScroller.removeEventListener('mousedown',mouseDownHandler)
    deviceScroller.removeEventListener('touchstart',mouseDownHandler)
    deviceScroller = null;
  }
}

const updateRoomInfoDeviceScroller = (e)=>{
  if (!deviceScroller){
    return
  }

  setTimeout(()=>{
    const w = getScrollContentWidth();

    if(w <= deviceScroller.offsetWidth || Math.abs(w - deviceScroller.offsetWidth) < 10) {
      deviceScroller.classList.add('ws-no-scroll');
      deviceFakeThumb.classList.add(classnames.hidden);
    } else {
      deviceScroller.classList.remove('ws-no-scroll');
      deviceFakeThumb.style["width"] = `calc(100% * (${deviceScroller.offsetWidth} / ${w}))`;
      setThumbPosition();
      deviceFakeThumb.classList.remove(classnames.hidden);
    }

  }, e ? 200 : 0)

}

const setThumbPosition = ()=>{
    let trackWidth = deviceFakeScrollbar.offsetWidth;
    let thunbWidth = deviceFakeThumb.offsetWidth;
    let availableDistance = trackWidth - thunbWidth;
    let scrollLeft = Math.abs(parseInt(deviceScrollContent.style["left"]))
    let thumbLeft =  availableDistance * (scrollLeft / (getScrollContentWidth() - deviceScroller.offsetWidth));
    deviceFakeThumb.style["left"] = thumbLeft + 'px';
}


export default {
    setUpDeviceScroller: setUpDeviceScroller,
    destroyRoomInfoDeviceScroller: destroyRoomInfoDeviceScroller
}