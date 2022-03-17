import Swiper, {Navigation} from 'swiper';
import 'swiper/scss';
import 'swiper/scss/navigation';
import classnames from './classnames';
import {removeModalPaths, splitPath} from './paths';

const slideInDelayMillis = 300;
const deviceModalSubstring = '/hardware/';
const roomInfoModalSuffix = '/info';
const mainModalLayer = document.getElementById(classnames.modalLayerId)

let carouselSwiper;

const closeIfClickedOutsideOpenModal = event => {
    const openModal = document.querySelector(`.${classnames.anyModalRoot}:not(.${classnames.hidden})`);
    if (openModal) {
        if (!openModal.contains(event.target)) {
            if (document.URL.indexOf(deviceModalSubstring) >= 0 || document.URL.endsWith(roomInfoModalSuffix)) {
                const roomPath = removeModalPaths(location.hash);
                history.pushState({}, '', roomPath);
            }
            hideAll();
        }
    }
};

const enableCloseButtons = () => {
    const deviceModalCloseButtons = document.getElementsByClassName(classnames.deviceModalClose);
    const roomInfoModalCloseButtons = document.getElementsByClassName(classnames.roomInfoModalClose);
    [deviceModalCloseButtons, roomInfoModalCloseButtons].forEach(collection => {
        Array.from(collection).forEach(element => {
            element.onclick = (event) => {
                event.preventDefault();
                history.pushState({}, '', event.target.hash);
                hideAll();
            }
        });
    });
};

const hideAll = () => {

    if(!mainModalLayer.classList.contains("incoming")){
        setTimeout(() => {
            mainModalLayer.classList.add(classnames.fadeOut);
        }, 300);
        
        setTimeout(()=>{
            mainModalLayer.classList.add(classnames.hidden);
            mainModalLayer.classList.remove(classnames.fadeOut);
            mainModalLayer.classList.remove(classnames.fadeIn);
        }, 650)

        inactiveModalsContainers = Array.from(document.querySelectorAll(`.${classnames.roomInfoModalRoot}, .${classnames.deviceModalRoot}`));

    } else{
        mainModalLayer.classList.remove("incoming");
    }

    const roomModalsContainers = inactiveModalsContainers;
    const modalRoots = inactiveModalRoots;
    const roomInfoModalRoots = document.getElementsByClassName(classnames.roomInfoModalRoot);
    const deviceModalRoots = document.getElementsByClassName(classnames.deviceModalRoot);
    const deviceContainers = document.getElementsByClassName(classnames.deviceContainer);

    // Hide all the things
    
    [roomModalsContainers, modalRoots, deviceContainers].forEach(elementCollection => {
        setTimeout(()=>{
            Array.from(elementCollection).forEach(element => {
                if(!element.classList.contains("incoming")){
                    element.classList.add(classnames.hidden);
                } else {
                    element.classList.remove("incoming")
                }
            });
        }, 350)
    });

    // Remove any "slide-in" classes from room-info-modal or device-modal roots
    [roomInfoModalRoots, deviceModalRoots].forEach(elementCollection => {
        Array.from(elementCollection).forEach(element => {
            if(!element.classList.contains("incoming")){
                element.classList.remove(classnames.slideIn);
            } else {
                element.classList.remove("incoming")
            }
        });
    });
    
    if (carouselSwiper) {
        carouselSwiper.destroy();
    }
};


let inactiveModalRoots = Array.from(document.querySelectorAll(`.${classnames.roomInfoModalRoot}, .${classnames.deviceModalRoot}`)); 
let inactiveModalsContainers = Array.from(document.getElementsByClassName(classnames.roomModalsContainer));

const showModalContainerForRoom = (workspaceId, roomId) => {
    // Show modals layer
    mainModalLayer.classList.remove(classnames.hidden);
    mainModalLayer.classList.add("incoming");
    mainModalLayer.classList.add(classnames.fadeIn);

    // Show modals-container for room
    const containerId = `${workspaceId}-${roomId}-modals`
    let activeModalsContainer = document.getElementById(containerId);
    activeModalsContainer.classList.remove(classnames.hidden);
    activeModalsContainer.scrollTop = 0;
    inactiveModalsContainers = Array.from(document.querySelectorAll(`.${classnames.roomModalsContainer}:not(#${containerId})`))

    return activeModalsContainer;
};

const showDevice = path => {
    
    const [workspaceId, roomId, , deviceId] = splitPath(path);

    const modalsContainer = showModalContainerForRoom(workspaceId, roomId);

    // Show device-modal root in container.  Always one per room.
    let activeModalRoot = modalsContainer.getElementsByClassName(classnames.deviceModalRoot)[0];
    activeModalRoot.classList.remove(classnames.hidden);
    activeModalRoot.classList.add("incoming");

    inactiveModalRoots = Array.from(document.querySelectorAll(`.${classnames.roomInfoModalRoot}, .${classnames.deviceModalRoot}`)).filter((node)=> {
        return node != activeModalRoot
    }); 

    // Show the single device container. Always only one match per device-modal root.
    const deviceContainer = activeModalRoot.getElementsByClassName(`${classnames.deviceContainer} ${classnames.deviceIdPrefix}${deviceId}`)[0]
    deviceContainer.classList.remove(classnames.hidden);
    deviceContainer.classList.add("incoming");

    // Find the active slide number element for updating
    const activeSlideNumber = deviceContainer.querySelector(`#swiper-${roomId}-${deviceId}-carousel .ws-carousel-active-slide`);

    // Initialize the Swiper container
    carouselSwiper = new Swiper(`#swiper-${roomId}-${deviceId}-carousel .swiper`, {
        modules: [Navigation],
        speed: 500,
        navigation: {
            nextEl: `#swiper-${roomId}-${deviceId}-carousel .ws-carousel-button-next`,
            prevEl: `#swiper-${roomId}-${deviceId}-carousel .ws-carousel-button-prev`,
        },
    });
    carouselSwiper.on('slideChange', function () {
        activeSlideNumber.innerHTML = String(this.activeIndex + 1);
    });

    hideAll();

    // Finally, slide in the device-modal root
    setTimeout(() => {
        activeModalRoot.classList.add(classnames.slideIn);
    }, slideInDelayMillis);
};

const showRoomInfo = path => {
    
    const [workspaceId, roomId,] = splitPath(path);

    const modalsContainer = showModalContainerForRoom(workspaceId, roomId);

    // Show room-info-modal root in container.  Always one per room.
    let activeModalRoot = modalsContainer.getElementsByClassName(classnames.roomInfoModalRoot)[0];
    activeModalRoot.classList.remove(classnames.hidden);
    activeModalRoot.classList.add("incoming");

    inactiveModalRoots = Array.from(document.querySelectorAll(`.${classnames.roomInfoModalRoot}, .${classnames.deviceModalRoot}`)).filter((node)=> {
        return node != activeModalRoot
    }); 

    hideAll();

    // And slide it in
    setTimeout(() => {
        activeModalRoot.classList.add(classnames.slideIn);
    }, slideInDelayMillis);
};

export default {
    closeIfClickedOutsideOpenModal: closeIfClickedOutsideOpenModal,
    enableCloseButtons: enableCloseButtons,
    hideAll: hideAll,
    showDevice: showDevice,
    showRoomInfo: showRoomInfo
}
