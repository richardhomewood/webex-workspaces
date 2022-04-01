
let softwareScroller;
function setUpsoftwareScroller(workspaceId, roomId){
  destroyRoomInfosoftwareScroller();
  softwareScroller = document.querySelector(`.ws-room-software-scroller.ws-room-software-scroller-${workspaceId}-${roomId}`);
  softwareScroller.scrollLeft = 0;
  updateRoomInfosoftwareScroller();

  window.addEventListener('resize', updateRoomInfosoftwareScroller);

  softwareScroller.addEventListener('mousedown', mouseDownHandler);
  softwareScroller.addEventListener('touchstart', mouseDownHandler);
}

let pos = { top: 0, left: 0, x: 0, y: 0 };
const mouseDownHandler = function (e) {
  if (softwareScroller.classList.contains('ws-no-scroll')){
    return
  }

  softwareScroller.style.cursor = 'grabbing';
  softwareScroller.style.userSelect = 'none';
  
  pos = {
      left: softwareScroller.scrollLeft,
      x: e.clientX,
  };
  
  const mouseMoveHandler = function (e) {
    const dx = e.clientX - pos.x;
    softwareScroller.scrollLeft = pos.left - dx;
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
    pos = { top: 0, left: 0, x: 0, y: 0 };
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
    if(softwareScroller.scrollWidth <= softwareScroller.offsetWidth || Math.abs(softwareScroller.scrollWidth - softwareScroller.offsetWidth) < 10) {
      softwareScroller.classList.add('ws-no-scroll')
    } else {
      softwareScroller.classList.remove('ws-no-scroll')
    }
  }, e ? 200 : 0)
}


export default {
    setUpsoftwareScroller: setUpsoftwareScroller,
    destroyRoomInfosoftwareScroller: destroyRoomInfosoftwareScroller
}