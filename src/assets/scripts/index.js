import Swiper from 'swiper';
import 'swiper/scss';
import Router from './router';
import {canonicalPath, devicePath, homePath, isDevicePath, makePath, splitPath} from './paths';
import classnames from './classnames';
import deviceModal from './device-modal'
import commonData from '../../data/common.json';
import workspaces from '../../data/workspaces.json';
import devicesByRoom from '../../data/devicesByRoom.json';

const router = new Router();

const updateUi = (location, delay = 300) => {
    const path = location.hash.substring(1);
    setTimeout(() => {
        updateNav(path);
        updateRoomsSelector(path);
    }, delay)
}

// Routing for the initial view
router.add(homePath, () => {
    backToHome();
})

// Handle workspace and workspace/room routing
commonData.orderedWorkspaceIds.forEach((workspaceId) => {
    router.add(makePath([workspaceId]), () => {
        deviceModal.hideAll();
        toSelectedWorkSpace(workspaceId);
        updateUi(window.location);
    })

    workspaces[workspaceId].rooms.forEach((room) => {
        router.add(makePath([workspaceId, room.slug]), () => {
            deviceModal.hideAll();
            toSelectedWorkSpace(workspaceId, room.slug);
            updateUi(window.location)
        });

        const devicesForRoom = devicesByRoom[workspaceId][room.slug]
        devicesForRoom.forEach(deviceId => {
            const devicePath = makePath([workspaceId, room.slug, devicePath, deviceId]);
            router.add(devicePath, () => {
                toSelectedWorkSpace(workspaceId);
                updateUi(window.location);
                if (isDevicePath(devicePath)) {
                    deviceModal.showDevice(devicePath);
                }
            })
        })
    })
});

window.addEventListener('hashchange', (ev) => {
    router.route(canonicalPath(window.location));
});

window.addEventListener('resize', () => {
    updateUi(window.location);
});

window.addEventListener('load', function () {
    router.route(canonicalPath(window.location));
});


const backToHome = function () {

    const initview = document.getElementsByClassName(classnames.initialView)[0];
    const spacesview = document.getElementsByClassName(classnames.roomView)[0];

    if (!initview.classList.contains(classnames.hidden)) {
        return;
    }

    //const spacescontentview = document.getElementsByClassName(classnames.roomContentView)[0];
    //const roomSelector = document.querySelector(`.${classnames.workspaceContainer}#homeSpaceContainer`);
    const roomSelectorWrap = document.getElementsByClassName(classnames.selectorWrapper)[0];

    if (roomSelectorWrap && roomSelectorWrap.classList.contains(classnames.slideIn)) {
        roomSelectorWrap.classList.remove(classnames.slideIn);
    }

    initview.style['zIndex'] = 1;
    initview.classList.remove(classnames.hidden);

    const listener = () => {
        initview.classList.remove(classnames.explored);
        initview.classList.remove(classnames.reversed);
        spacesview.classList.add(classnames.hidden);
        initview.style['zIndex'] = 0;
        initview.removeEventListener('animationend', listener);
    }

    initview.addEventListener('animationend', listener);
    initview.classList.add(classnames.reversed);
}

const updateNav = function (path) {
    const splitPaths = splitPath(path);
    const mypath = splitPaths !== null ? splitPaths[0] : path;

    const navLinks = document.querySelectorAll(`.${classnames.workspaceNavigation} a`);
    const navSelector = document.getElementById("ws-nav-underline");

    let selectedIndex = -1;

    commonData.orderedWorkspaceIds.forEach((workspaceId, index) => {
        if (workspaceId === mypath) {
            selectedIndex = index;
        }
    });

    if (selectedIndex === -1) {
        if (!navSelector.classList.contains(classnames.hidden)) {
            navSelector.classList.add(classnames.hidden);
        }

        navSelector.style.left = "50%";
        navSelector.style.width = "0px";
        return
    } else {
        navSelector.classList.remove(classnames.hidden);
    }

    const left = navLinks[selectedIndex].offsetLeft;
    const width = navLinks[selectedIndex].offsetWidth;

    setTimeout(() => {
        navSelector.style.left = `${left}px`;
        navSelector.style.width = `${width}px`;
    }, 1)

}

const toSelectedWorkSpace = function (space, room) {
    console.log(space, room);
    const initview = document.getElementsByClassName(classnames.initialView)[0];
    const spacesview = document.getElementsByClassName(classnames.roomView)[0];
    const spacescontentview = document.getElementsByClassName(classnames.roomContentView)[0];
    const roomSelector = document.querySelector(`.${classnames.workspaceContainer}#${space}Container`);
    const otherRoomSelectors = Array.from(document.querySelectorAll(`.${classnames.workspaceContainer}:not(#${space}Container):not(.${classnames.hidden})`));
    const roomSelectorWrap = document.getElementsByClassName(classnames.selectorWrapper)[0];

    const bgToDisplayCSSSelector = room ? `.${classnames.roomBackground}.${space}-${room}${classnames.roomBackgroundSuffix}` : `.${classnames.defaultRoomBackground}.${space}${classnames.roomBackgroundSuffix}`;
    const bgsToDisplay = Array.from(document.querySelectorAll(bgToDisplayCSSSelector));
    const bgToHideCSSSelector = `.${classnames.roomBackground}:not(.${classnames.hidden}), .${classnames.defaultRoomBackground}:not(.${classnames.hidden})`
    const bgsToHide = Array.from(document.querySelectorAll(bgToHideCSSSelector));

    const allRooms = Array.from(document.querySelectorAll(`.${classnames.workspaceContainer}#${space}Container .${classnames.roomImage}`));
    allRooms.forEach((element) => {
        if (element.classList.contains(classnames.selected)) {
            element.classList.remove(classnames.selected)
        }
    })
    /*
        if (selectedRoom && !selectedRoom.classList.contains(classnames.selected)) {
            selectedRoom.classList.add(classnames.selected)
        }
    */
    if (roomSelector && roomSelector.classList.contains(classnames.hidden) && otherRoomSelectors.length === 0) {
        roomSelector.classList.remove(classnames.hidden);
    }

    if (initview && !initview.classList.contains(classnames.explored) && !initview.classList.contains(classnames.hidden)) {

        const listener = () => {
            initview.classList.add(classnames.hidden);
            initview.style['zIndex'] = 0;
            if (spacescontentview) {
                spacescontentview.classList.remove(classnames.hidden);

                setTimeout(() => {
                    if (roomSelectorWrap) {
                        roomSelectorWrap.classList.add(classnames.slideIn);
                    }
                }, 500);
            }

            initview.removeEventListener('animationend', listener);
        }

        if (spacescontentview) {
            spacescontentview.classList.add(classnames.hidden);
        }

        initview.addEventListener('animationend', listener);
        initview.classList.add(classnames.explored);
    }

    if (otherRoomSelectors.length > 0) {

        if (roomSelectorWrap) {
            const roomSelectorWrapListener = () => {
                console.log("roomSelectorWrapListener")
                otherRoomSelectors.forEach((element) => {
                    element.classList.add(classnames.hidden);
                });
                roomSelector.classList.remove(classnames.hidden);
                roomSelectorWrap.removeEventListener('animationend', roomSelectorWrapListener);
                roomSelectorWrap.classList.remove(classnames.fadeOut);
                roomSelectorWrap.classList.remove(classnames.slideIn);
                setTimeout(() => {
                    console.log("adding slide-in class to SelectorWrap")
                    roomSelectorWrap.classList.add(classnames.slideIn);
                }, 500);
            }

            console.log("roomSelectorWrap.addEventListener");
            roomSelectorWrap.addEventListener('animationend', roomSelectorWrapListener);
            roomSelectorWrap.classList.add(classnames.fadeOut);
        }
    }

    if (spacesview && spacesview.classList.contains(classnames.hidden)) {
        spacesview.classList.remove(classnames.hidden);

        spacesview.style['zIndex'] = 0;
        initview.style['zIndex'] = 1;
    }

    bgsToHide.forEach((element) => {
        element.style['zIndex'] = 1;
        const listener = () => {
            element.removeEventListener("animationend", listener);
            element.classList.add(classnames.hidden);
            element.classList.remove(classnames.fadeOut);
        }

        element.addEventListener("animationend", listener);
        element.classList.add(classnames.fadeOut);
    })

    bgsToDisplay.forEach((element) => {
        element.style['zIndex'] = 0;
        element.classList.remove(classnames.fadeOut);
        element.classList.remove(classnames.hidden);
    })

    // Hide the device-modal
    document.getElementsByClassName(classnames.deviceModalRoot)
}


let swipingRoomSelector;

const updateRoomsSelector = function (path) {
    const splitPaths = splitPath(path);
    const mypath = splitPaths !== null ? splitPaths[0] : path;

    if (swipingRoomSelector && swipingRoomSelector.el && swipingRoomSelector.el.parentNode && swipingRoomSelector.el.parentNode.getAttribute("id") === `${mypath}Container`) {
        console.log(`swiper already exists for ${mypath}Container`)
        return;
    } else if (swipingRoomSelector) {
        swipingRoomSelector.destroy();
    }

    const spacesview = document.getElementsByClassName(classnames.roomView)[0];
    if (spacesview.classList.contains(classnames.hidden)) {
        console.log(`spacesview.classList.contains(${classnames.hidden})`, spacesview.classList.contains(classnames.hidden))
        return;
    }

    setTimeout(() => {
        const slides = Array.from(document.querySelectorAll(`#${mypath}Container .swiper .swiper-slide.${classnames.roomSlide}`));
        const slideCount = slides.length;

        if (slideCount === 0) {
            return
        }
        const slideWidth = slides[0].offsetWidth;

        const totalSlideWidth = (slideWidth * slideCount) + (10 * (slideCount - 1));

        let options = {
            speed: 400,
            slidesPerView: "auto",
            centeredSlides: true,
            centeredSlidesBounds: true,
            grabCursor: true,
            slideToClickedSlide: true,
            centerInsufficientSlides: true,
        }

        if (totalSlideWidth < (window.innerWidth - 98)) {
            options = {...options, ...{enabled: false}}
        }

        swipingRoomSelector = new Swiper(`#${mypath}Container .swiper`, options);

    }, 500)
}
