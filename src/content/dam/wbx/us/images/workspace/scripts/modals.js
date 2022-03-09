import Swiper, {Navigation} from 'swiper';
import 'swiper/scss';
import 'swiper/scss/navigation';
import classnames from './classnames';
import {removeModalPaths, splitPath} from './paths';

const slideInDelayMillis = 300;
const deviceModalSubstring = '/hardware/';
const roomInfoModalSuffix = '/info';

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

    document.getElementById(classnames.modalLayerId).classList.add(classnames.hidden);

    const roomModalsContainers = document.getElementsByClassName(classnames.roomModalsContainer);
    const roomInfoModalRoots = document.getElementsByClassName(classnames.roomInfoModalRoot);
    const deviceModalRoots = document.getElementsByClassName(classnames.deviceModalRoot);
    const deviceContainers = document.getElementsByClassName(classnames.deviceContainer);

    // Hide all the things
    [roomModalsContainers, roomInfoModalRoots, deviceModalRoots, deviceContainers].forEach(elementCollection => {
        Array.from(elementCollection).forEach(element => {
            element.classList.add(classnames.hidden);
        });
    });

    // Remove any "slide-in" classes from room-info-modal or device-modal roots
    [roomInfoModalRoots, deviceModalRoots].forEach(elementCollection => {
        Array.from(elementCollection).forEach(element => {
            element.classList.remove(classnames.slideIn);
        });
    });

    if (carouselSwiper) {
        carouselSwiper.destroy();
    }
};

const showModalContainerForRoom = (workspaceId, roomId) => {
    // Show modals layer
    document.getElementById(classnames.modalLayerId).classList.remove(classnames.hidden);

    // Show modals-container for room
    const modalsContainer = document.getElementById(`${workspaceId}-${roomId}-modals`);
    modalsContainer.classList.remove(classnames.hidden);

    return modalsContainer;
};

const showDevice = path => {
    hideAll();

    const [workspaceId, roomId, , deviceId] = splitPath(path);

    const modalsContainer = showModalContainerForRoom(workspaceId, roomId);

    // Show device-modal root in container.  Always one per room.
    const deviceModalRoot = modalsContainer.getElementsByClassName(classnames.deviceModalRoot)[0];
    deviceModalRoot.classList.remove(classnames.hidden);

    // Show the single device container. Always only one match per device-modal root.
    const deviceContainer = deviceModalRoot.getElementsByClassName(`${classnames.deviceContainer} ${classnames.deviceIdPrefix}${deviceId}`)[0]
    deviceContainer.classList.remove(classnames.hidden);

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


    // Finally, slide in the device-modal root
    setTimeout(() => {
        deviceModalRoot.classList.add(classnames.slideIn);
    }, slideInDelayMillis);
};

const showRoomInfo = path => {
    hideAll();

    const [workspaceId, roomId,] = splitPath(path);

    const modalsContainer = showModalContainerForRoom(workspaceId, roomId);

    // Show room-info-modal root in container.  Always one per room.
    const roomInfoModalRoot = modalsContainer.getElementsByClassName(classnames.roomInfoModalRoot)[0];
    roomInfoModalRoot.classList.remove(classnames.hidden);

    // And slide it in
    setTimeout(() => {
        roomInfoModalRoot.classList.add(classnames.slideIn);
    }, slideInDelayMillis);
};

export default {
    closeIfClickedOutsideOpenModal: closeIfClickedOutsideOpenModal,
    enableCloseButtons: enableCloseButtons,
    hideAll: hideAll,
    showDevice: showDevice,
    showRoomInfo: showRoomInfo
}
