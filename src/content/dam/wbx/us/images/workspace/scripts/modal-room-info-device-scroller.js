
let deviceScroller;
function setUpDeviceScroller(workspaceId, roomId){
  destroyRoomInfoDeviceScroller();
  deviceScroller = document.querySelector(`.ws-room-device-scroller.ws-room-device-scroller-${workspaceId}-${roomId}`);
  deviceScroller.scrollLeft = 0;
  updateRoomInfoDeviceScroller();

  window.addEventListener('resize', updateRoomInfoDeviceScroller);

  deviceScroller.addEventListener('mousedown', mouseDownHandler);
  deviceScroller.addEventListener('touchstart', mouseDownHandler);
}

let pos = { top: 0, left: 0, x: 0, y: 0 };
const mouseDownHandler = function (e) {
  if (deviceScroller.classList.contains('ws-no-scroll')){
    return
  }

  deviceScroller.style.cursor = 'grabbing';
  deviceScroller.style.userSelect = 'none';
  
  pos = {
      left: deviceScroller.scrollLeft,
      x: e.clientX,
  };
  
  const mouseMoveHandler = function (e) {
    const dx = e.clientX - pos.x;
    deviceScroller.scrollLeft = pos.left - dx;
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
    pos = { top: 0, left: 0, x: 0, y: 0 };
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
    if(deviceScroller.scrollWidth <= deviceScroller.offsetWidth || Math.abs(deviceScroller.scrollWidth - deviceScroller.offsetWidth) < 10) {
      deviceScroller.classList.add('ws-no-scroll')
    } else {
      deviceScroller.classList.remove('ws-no-scroll')
    }
  }, e ? 200 : 0)
}


export default {
    setUpDeviceScroller: setUpDeviceScroller,
    destroyRoomInfoDeviceScroller: destroyRoomInfoDeviceScroller
}