import Swiper, {Navigation} from 'swiper';
import 'swiper/scss';
import 'swiper/scss/navigation';
import classnames from './classnames';
import {removeModalPaths, splitPath} from './paths';
import {isIOS, isSafari} from "./utils";

const slideInDelayMillis = 300;
const deviceModalSubstring = '/hardware/';
const roomInfoModalSuffix = '/info';
const mainModalLayer = document.getElementById(classnames.modalLayerId)

let carouselSwiper;

let active = false;

const setActive = (v) => {
    active = v

    if (!active && postActive) {
        postActive()
        postActive = null
    }
}

let postActive;
const closeIfClickedOutsideOpenModal = event => {
    const openModal = document.querySelector(`.${classnames.anyModalRoot}:not(.${classnames.hidden})`);
    if (openModal && !active) {
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
    let handleActive = false;
    let handleActiveAfterHide = false;
    if (!active){
        setActive(true);
        handleActive = true
    }
    
    
    if(!mainModalLayer.classList.contains("incoming")){
        setTimeout(() => {
            mainModalLayer.classList.add(classnames.fadeOut);
        }, 300);
        
        setTimeout(()=>{
            mainModalLayer.classList.add(classnames.hidden);
            mainModalLayer.classList.remove(classnames.fadeOut);
            mainModalLayer.classList.remove(classnames.fadeIn);
            if (handleActive){
                setActive(false);
            }
        }, 650)

        inactiveModalsContainers = Array.from(document.querySelectorAll(`.${classnames.roomInfoModalRoot}, .${classnames.deviceModalRoot}`));

    } else{
        handleActiveAfterHide = true
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
            if (handleActiveAfterHide && handleActive) {
                setActive(false);
            }
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

const forceRedraw = function(element, callBeforeRedrawn){
    
    if (!element || !isSafari(navigator.userAgent)) { return; }
    
    if (callBeforeRedrawn) {
        callBeforeRedrawn();
    }

    let scrollH = element.scrollHeight;
    let scrollW = element.scrollWidth
}

const showDevice = path => {

    if (active) {
        postActive = ()=>{showDevice(path)}
        return
    }

    setActive(true);
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

    hideAll();

    // Initialize the Swiper container
    const carouselContainer = document.querySelector(`#swiper-${roomId}-${deviceId}-carousel .swiper`)

    carouselSwiper = new Swiper(carouselContainer, {
        modules: [Navigation],
        speed: 500,
        navigation: {
            nextEl: `#swiper-${roomId}-${deviceId}-carousel .ws-carousel-button-next`,
            prevEl: `#swiper-${roomId}-${deviceId}-carousel .ws-carousel-button-prev`,
        },
        on: {
            'afterInit': (swiper)=> {
                const setCarouselHeight = () => {
                    if (isIOS(navigator.userAgent)) {
                        carouselContainer.style.height = '83vw';
                        carouselContainer.style.width = '100%';
                    }
                };
                forceRedraw(carouselContainer, setCarouselHeight);
                forceRedraw(carouselContainer);
            }

        }
    });

    // Finally, slide in the device-modal root
    setTimeout(() => {
        if (isSafari(navigator.userAgent)) {
            activeModalRoot.style.overflowY = 'hidden'; // TODO - Added here to avoid changing shared forceRedraw function
        }
        let transitionListener = ()=>{
            // forceRedraw(activeModalRoot) // Currently causing flickering
            if (isSafari(navigator.userAgent)) {
                activeModalRoot.style.overflowY = ''; // TODO - Added here to avoid changing shared forceRedraw function
            }
            setActive(false);
            activeModalRoot.removeEventListener("transitionend", transitionListener)
        }
        activeModalRoot.addEventListener("transitionend", transitionListener)
        activeModalRoot.classList.add(classnames.slideIn);

    }, slideInDelayMillis);
};

const showRoomInfo = path => {
    
    if (active) {
        postActive = ()=>{showRoomInfo(path)}
        return
    }

    setActive(true);

    const [workspaceId, roomId,] = splitPath(path);

    const modalsContainer = showModalContainerForRoom(workspaceId, roomId);

    // Show room-info-modal root in container.  Always one per room.
    let activeModalRoot = modalsContainer.getElementsByClassName(classnames.roomInfoModalRoot)[0];
    activeModalRoot.classList.remove(classnames.hidden);
    activeModalRoot.classList.add("incoming");

    inactiveModalRoots = Array.from(document.querySelectorAll(`.${classnames.roomInfoModalRoot}, .${classnames.deviceModalRoot}`)).filter((node)=> {
        return node != activeModalRoot
    }); 


    forceRedraw(modalsContainer)
    forceRedraw(activeModalRoot)

    setTimeout(()=>{
        forceRedraw(modalsContainer)
        forceRedraw(activeModalRoot)

        setTimeout(() => {
            activeModalRoot.classList.add(classnames.slideIn);
        }, slideInDelayMillis);
    },100)
    
    setActive(false);
    hideAll();

    // And slide it in
    
};

export default {
    closeIfClickedOutsideOpenModal: closeIfClickedOutsideOpenModal,
    enableCloseButtons: enableCloseButtons,
    hideAll: hideAll,
    showDevice: showDevice,
    showRoomInfo: showRoomInfo
}
