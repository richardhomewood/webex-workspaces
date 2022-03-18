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

const forceRedraw = function(element, callBeforeRedrawn){
    if (!element || !isSafari(navigator.userAgent)) { return; }
    const tempNode = document.createTextNode(' ');
    const originalDisplayStyle = element.style.display; // don't worry about previous display style

    element.appendChild(tempNode);
    element.style.display = 'none';

    setTimeout(function(){
        if (callBeforeRedrawn) {
            callBeforeRedrawn();
        }
        element.style.display = originalDisplayStyle;
        tempNode.parentNode.removeChild(tempNode);
    },20); // you can play with this timeout to make it as short as possible
}

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
            'slideChange': (swiper)=> {
                activeSlideNumber.innerHTML = String(swiper.activeIndex + 1);
            },
            'afterInit': (swiper)=> {
                const setCarouselHeight = () => {
                    if (isIOS(navigator.userAgent)) {
                        carouselContainer.style.height = '83vw';
                        carouselContainer.style.width = '100%';
                    }
                };
                forceRedraw(carouselContainer, setCarouselHeight);
                forceRedraw(carouselContainer);
                activeSlideNumber.innerHTML = String(swiper.activeIndex + 1);
            }

        }
    });

    // Finally, slide in the device-modal root
    setTimeout(() => {

        let transitionListener = ()=>{
            forceRedraw(activeModalRoot)
            
            activeModalRoot.removeEventListener("transitionend", transitionListener)
        }
        activeModalRoot.addEventListener("transitionend", transitionListener)
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


    forceRedraw(modalsContainer)
    forceRedraw(activeModalRoot)

    setTimeout(()=>{
        forceRedraw(modalsContainer)
        forceRedraw(activeModalRoot)

        setTimeout(() => {
            activeModalRoot.classList.add(classnames.slideIn);
        }, slideInDelayMillis);
    },100)

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
