import Swiper from 'swiper';
import Hammer from 'hammerjs';
import 'swiper/scss';
import Router from './router';
import {canonicalPath, hardwarePathPart, homePath, isDevicePath, makePath, splitPath} from './paths';
import classnames from './classnames';
import deviceModal from './device-modal'
import commonData from '../../../../../../../data/common.json';
import workspaces from '../../../../../../../data/workspaces.json';
import devicesByRoom from '../../../../../../../data/devicesByRoom.json';
import { setTimeout } from 'core-js';

const router = new Router();
var hammertime;

window.addEventListener('hashchange', (ev) => {
    router.route(canonicalPath(window.location));
});

window.addEventListener('resize', () => {
    updateUi(window.location);
});

window.addEventListener('load', function () {
    const bgContainer = document.querySelector(".homeSpace-homeOffice-room-bg img");
    hammertime = new Hammer(bgContainer);
    hammertime.get('pan').set({ direction: Hammer.DIRECTION_ALL });
    hammertime.on("panleft panright panup pandown tap press", function(ev) {
        console.log(ev);
    });

    router.route(canonicalPath(window.location));
});

const updateUi = (location, delay = 200) => {
    const path = location.hash.substring(1);
    setTimeout(() => {
        updateNav(path);
        updateRoomsSelector(path);
        updateBGSizes();
    }, delay)
}

const updateBGSizes = () => {
    let sizeClass = currentSizeClass();

    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    const initview = document.getElementsByClassName(classnames.initialView)[0];
    if (!initview.classList.contains(classnames.hidden)) {
        //update animating imgs on initial view
        let rotatingImgsClass = ".ws-initial-rotating-background-image .ws-rotating-background-image img";
        let rotatingImgs = Array.from(document.querySelectorAll(rotatingImgsClass));
        let rImgWidth = rotatingImgs[0].clientWidth;
        let rImgHeight = rotatingImgs[0].clientHeight;
        let projectedRImgWidth = (windowHeight * 108) / 192;

        console.log(rotatingImgs)
        console.log("rImgWidth", rImgWidth)
        console.log("rImgHeight", rImgHeight)

        if (projectedRImgWidth < windowWidth) {
            let newImageHeight = (windowWidth * rImgHeight) / rImgWidth;
            newImageHeight = newImageHeight < windowHeight ? windowHeight : newImageHeight;
            rotatingImgs.forEach((element) => {
                element.style["height"] = newImageHeight + "px";
            })
            
        } else{
            rotatingImgs.forEach((element) => {
                element.style["height"] = "";
            })
        }
    }

    //updating selected room bgs
    commonData.orderedWorkspaceIds.forEach((workspaceId) => {
        let rooms = workspaces[workspaceId].rooms;
        rooms.forEach((room) => {
            let bgContainerClass = "." + workspaceId + "-" + room.slug + "-room-bg";
            let bgClass = bgContainerClass + " img";
            let bgImg = document.querySelector(bgClass);
            if (bgImg) {
                let backgroundPos = room.backgroundPosition[sizeClass];

                let imgWidth = bgImg.clientWidth;
                let imgHeight = bgImg.clientHeight;

                let projectedImgWidth = (windowHeight * 108) / 192;
                var initialOffset = (imgWidth * backgroundPos.x)

                if (projectedImgWidth + (initialOffset * 2) < windowWidth) {
                    let newImageHeight = (windowWidth * imgHeight) / imgWidth;
                    newImageHeight = newImageHeight < windowHeight ? windowHeight : newImageHeight;
                    bgImg.style["height"] = newImageHeight + "px";
                } else{
                    bgImg.style["height"] = ""
                }

                bgImg.style["transform"] = 'translate(calc(-50% + ' + initialOffset + 'px), -50%)';

                placeHotSpots(initialOffset, bgImg, room, bgContainerClass);
            }
        })
    })

    //updating default room bgs
    let defaultBgsClass = ".ws-room-background-image.ws-default-room-bg img";
    let defaultBgImgs = Array.from(document.querySelectorAll(defaultBgsClass));
    let dImgWidth = defaultBgImgs[0].clientWidth;
    let dImgHeight = defaultBgImgs[0].clientHeight;

    defaultBgImgs.forEach((element) => {
        if(element.clientWidth > 0 && element.clientHeight > 0){
            dImgWidth = element.clientWidth;
            dImgHeight = element.clientHeight;
        }
    })

    let projectedDImgWidth = (windowHeight * 108) / 192;

    if (projectedDImgWidth < windowWidth) {
        let newImageHeight = (windowWidth * dImgHeight) / dImgWidth;
        newImageHeight = newImageHeight < windowHeight ? windowHeight : newImageHeight;
        defaultBgImgs.forEach((element) => {
            element.style["height"] = newImageHeight + "px";
        })
        
    } else{
        defaultBgImgs.forEach((element) => {
            element.style["height"] = "";
        })
    }
}

const placeHotSpots = (initialOffset, bgImg, room, bgContainerClass) => {
    let imgWidth = bgImg.clientWidth;
    let imgHeight = bgImg.clientHeight;

    let hotspotsQuery = bgContainerClass + " .ws-hotSpot"
    let hotspots = Array.from(document.querySelectorAll(hotspotsQuery));

    room.hotSpots.forEach((element, index)=>{
        let hotspot = hotspots[index];
        let hOffset = imgWidth * element.x;
        let yOffset = imgHeight * element.y;
        hotspot.style["transform"] = 'translate(calc(-50% + ' + (initialOffset + hOffset) + 'px), calc(-50% + ' + yOffset + 'px))';
    })
}

const currentSizeClass = () => {
    let width = window.innerWidth
    let aSizeClass = ""
    commonData.sizeClasses.forEach((sizeClass) => {
        if (width <= sizeClass[2]) {
            aSizeClass = sizeClass[0]
        }
    })
    return aSizeClass;
}

// Routing for the initial view
router.add(homePath, () => {
    backToHome();
    updateUi(window.location);
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
            updateUi(window.location);
        });

        const devicesForRoom = devicesByRoom[workspaceId][room.slug]
        devicesForRoom.forEach(deviceId => {
            const devicePath = makePath([workspaceId, room.slug, hardwarePathPart, deviceId]);
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

const backToHome = function () {

    const initview = document.getElementsByClassName(classnames.initialView)[0];
    const spacesview = document.getElementsByClassName(classnames.roomView)[0];

    if (!initview.classList.contains(classnames.hidden)) {
        return;
    }

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

    const initview = document.getElementsByClassName(classnames.initialView)[0];
    const spacesview = document.getElementsByClassName(classnames.roomView)[0];
    const spacescontentview = document.getElementsByClassName(classnames.roomContentView)[0];
    const roomSelector = document.querySelector(`.${classnames.workspaceContainer}#${space}Container`);
    const otherRoomSelectors = Array.from(document.querySelectorAll(`.${classnames.workspaceContainer}:not(#${space}Container):not(.${classnames.hidden})`));
    const roomSelectorWrap = document.getElementsByClassName(classnames.selectorWrapper)[0];

    const bgToDisplayCSSSelector = room ? `.${classnames.roomBackground}.${space}-${room}${classnames.roomBackgroundSuffix}` : `.${classnames.defaultRoomBackground}.${space}${classnames.roomBackgroundSuffix}`;
    const bgsToDisplay = Array.from(document.querySelectorAll(bgToDisplayCSSSelector));
    const bgToHideCSSSelector = `.${classnames.roomBackground}:not(.${classnames.hidden}), .${classnames.defaultRoomBackground}:not(.${classnames.hidden})`;
    const bgsToHide = Array.from(document.querySelectorAll(bgToHideCSSSelector));

    const hotSpotsToHideCSSSelector = `.${classnames.roomBackground}:not(.${classnames.hidden}) .ws-hotSpot, .${classnames.defaultRoomBackground}:not(.${classnames.hidden}) .ws-hotSpot`;
    const hotSpotsToHide = Array.from(document.querySelectorAll(hotSpotsToHideCSSSelector));

    const hotSpotsToShowCSSSelector = room ? `.${classnames.roomBackground}.${space}-${room}${classnames.roomBackgroundSuffix} .ws-hotSpot` : ``;
    const hotSpotsToShow = room ? Array.from(document.querySelectorAll(hotSpotsToShowCSSSelector)) : [];

    // Deselect all rooms
    const allRooms = Array.from(document.querySelectorAll(`.${classnames.workspaceContainer}#${space}Container .${classnames.roomImage}`));
    allRooms.forEach((element) => {
        if (element.classList.contains(classnames.selected)) {
            element.classList.remove(classnames.selected);
        }
    })

    //if there are no roomlelectors to hide then show the relevant room selector
    if (roomSelector && roomSelector.classList.contains(classnames.hidden) && otherRoomSelectors.length === 0) {
        roomSelector.classList.remove(classnames.hidden);
    }

    // if transitioning away from home view
    if (initview && !initview.classList.contains(classnames.explored) && !initview.classList.contains(classnames.hidden)) {

        const listener = () => {
            initview.classList.add(classnames.hidden);
            initview.style['zIndex'] = 0;
            if (spacescontentview) {
                spacescontentview.classList.remove(classnames.hidden);

                setTimeout(() => {
                    if (roomSelectorWrap && !room) {
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

    // if there are room selectors to hide, hide them and animate in relevant room selector
    if (otherRoomSelectors.length > 0) {

        if (roomSelectorWrap) {
            const roomSelectorWrapListener = () => {
                otherRoomSelectors.forEach((element) => {
                    element.classList.add(classnames.hidden);
                });
                roomSelector.classList.remove(classnames.hidden);
                roomSelectorWrap.removeEventListener('animationend', roomSelectorWrapListener);
                roomSelectorWrap.classList.remove(classnames.fadeOut);
                roomSelectorWrap.classList.remove(classnames.slideIn);

                setTimeout(() => {
                    roomSelectorWrap.classList.add(classnames.slideIn);
                }, 500);
            }

            roomSelectorWrap.addEventListener('animationend', roomSelectorWrapListener);
            roomSelectorWrap.classList.add(classnames.fadeOut);
        }
    }

    //if transitioning away from home view then move home view in front of spaces view and show home view
    if (spacesview && spacesview.classList.contains(classnames.hidden)) {
        spacesview.classList.remove(classnames.hidden);
        spacesview.style['zIndex'] = 0;
        initview.style['zIndex'] = 1;
    }

    //fade out backgrounds that are going away
    bgsToHide.forEach((element) => {
        element.style['zIndex'] = 1;
        const listener = () => {
            element.removeEventListener("animationend", listener);
            element.classList.add(classnames.hidden);
            element.classList.remove(classnames.fadeOut);

            //hide hotspots
            hotSpotsToHide.forEach((element)=>{
                element.classList.remove('animate-in')
            })
        }

        element.addEventListener("animationend", listener);
        element.classList.add(classnames.fadeOut);
    });

    //show backgrounnds that are coming in
    bgsToDisplay.forEach((element) => {
        element.style['zIndex'] = 0;
        element.classList.remove(classnames.fadeOut);
        element.classList.remove(classnames.hidden);

        //animate in hotspots
        setTimeout(()=>{
            hotSpotsToShow.forEach((element, index) => {
                setTimeout(()=>{
                    element.classList.add('animate-in');
                }, 300 * index);
            })
        }, 300);
    })

    //if moving from workspace landing to selected room
    let roomContent = document.querySelector('.ws-more-rooms-text')
    if (room) {

        //hide all room labels
        let roomLabels = Array.from(document.getElementsByClassName(classnames.selectedRoomLabel))
        roomLabels.forEach((element) => {
            element.classList.add(classnames.hidden);
        });

        //hide all show more rooms elements
        let showMoreRoomsElements = Array.from(document.querySelectorAll("." + classnames.showMoreRoomsText + ", " + "." + classnames.showMoreRoomsBtn));
        showMoreRoomsElements.forEach((element) => {
            element.classList.add(classnames.hidden);
        });

        //show relevant show more rooms elements
        let relevantShowMoreElements = Array.from(document.querySelectorAll("." + classnames.showMoreRoomsText + "#" + classnames.showMoreRoomsText + "-" + space + ", ." + classnames.showMoreRoomsBtn + "#" + classnames.showMoreRoomsBtn + "-" + space));
        relevantShowMoreElements.forEach((element) => {
            element.classList.remove(classnames.hidden);
        })

        //show relevant label
        let roomlabel = document.querySelector('.ws-room-label#' + space + "-" + room + "-label");
        roomlabel.classList.remove(classnames.hidden);

        // hide room selector
        if (roomSelectorWrap) {
            roomSelectorWrap.classList.remove(classnames.slideIn);
        }

        // show selected room content

        setTimeout(()=>{
            roomContent.classList.add(classnames.slideIn);
        }, 750);

    } else {
        // if there is no room
        roomContent.classList.remove(classnames.slideIn)
        setTimeout(()=>{
            if (roomSelectorWrap && !roomSelectorWrap.classList.contains(classnames.slideIn)) {
                roomSelectorWrap.classList.add(classnames.slideIn);
            }
        }, 750);
    }

    // Hide the device-modal
    document.getElementsByClassName(classnames.deviceModalRoot)
}

let swipingRoomSelector;

const updateRoomsSelector = function (path) {
    const splitPaths = splitPath(path);
    const mypath = splitPaths !== null ? splitPaths[0] : path;

    if (swipingRoomSelector && swipingRoomSelector.el && swipingRoomSelector.el.parentNode && swipingRoomSelector.el.parentNode.getAttribute("id") === `${mypath}Container`) {
        return;
    } else if (swipingRoomSelector) {
        swipingRoomSelector.destroy();
    }

    const spacesview = document.getElementsByClassName(classnames.roomView)[0];
    if (spacesview.classList.contains(classnames.hidden)) {
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

        let windowWidth = window.innerWidth;
        if (totalSlideWidth < (windowWidth - 98)) {
            options = {...options, ...{enabled: false}}
        }

        swipingRoomSelector = new Swiper(`#${mypath}Container .swiper`, options);

    }, 500)
}
