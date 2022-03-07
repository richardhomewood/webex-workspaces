import {splitPath} from './paths';
import classnames from './classnames';
import commonData from '../../../../../../../data/common.json';
import workspaces from '../../../../../../../data/workspaces.json';
import { setTimeout } from 'core-js';
import Swiper from 'swiper';
import Hammer from 'hammerjs';
import 'swiper/scss';

let hasUpdatedBGs = false
let maxXPanOffset = 0
let minXPanOffset = 0
let maxYPanOffset = 0
let minYPanOffset = 0

let panOffset = {
    x:0,
    previousX:0,
    y:0,
    previousY:0
}
let hammertime;

let selectedRoomIndex = 0

export function updateUi(location, delay = 200) {
    const path = location.hash.substring(1);
    setTimeout(() => {
        updateWorkspaceCta(path);
        updateNav(path);
        updateRoomsSelector(path);
        updateBGSizes();
    }, delay)
}

export function backToHome() {

    if (hammertime){
        hammertime.destroy();
        hammertime = null;
    }

    const initview = document.getElementsByClassName(classnames.initialView)[0];
    const spacesview = document.getElementsByClassName(classnames.roomView)[0];

    if (!initview.classList.contains(classnames.hidden)) {
        return;
    }

    const roomSelectorWrap = document.getElementsByClassName(classnames.selectorWrapper)[0];

    if (roomSelectorWrap && roomSelectorWrap.classList.contains(classnames.slideIn)) {
        roomSelectorWrap.classList.remove(classnames.slideIn);
        setTimeout(()=>{
            roomSelectorWrap.style["opacity"] = 0;
            roomSelectorWrap.classList.add(classnames.hidden);
        }, 500)
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

export function toSelectedWorkSpace(space, room) {

    const initview = document.getElementsByClassName(classnames.initialView)[0];
    const spacesview = document.getElementsByClassName(classnames.roomView)[0];
    const spacescontentview = document.getElementsByClassName(classnames.roomContentView)[0];
    const roomSelector = document.querySelector(`.${classnames.workspaceContainer}#${space}Container`);
    const otherRoomSelectors = Array.from(document.querySelectorAll(`.${classnames.workspaceContainer}:not(#${space}Container):not(.${classnames.hidden})`));
    const roomSelectorWrap = document.getElementsByClassName(classnames.selectorWrapper)[0];

    let roomSlug = !room ? workspaces[space].rooms[(workspaces[space].rooms.length < selectedRoomIndex + 1 ? 0 : selectedRoomIndex)].slug : "";
    
    const bgToDisplayCSSSelector = room ? 
    `.${space}-${room}${classnames.roomBackgroundSuffix}` :
    `.${space}-${roomSlug}${classnames.roomBackgroundSuffix}`;

    const bgsToDisplay = Array.from(document.querySelectorAll(`.${classnames.roomBackground}` + bgToDisplayCSSSelector));

    if (hammertime){
        hammertime.destroy();
        hammertime = null;
        panOffset = {
            x:0,
            previousX:0,
            y:0,
            previousY:0
        };
    }

    if (room) {

        let roomIndex = -1;
        workspaces[space].rooms.forEach((element, indx) => {
            if (element.slug == room){
                roomIndex = indx;
            }
        });

        selectedRoomIndex = roomIndex < 0 ? 0 : roomIndex;
        if (swipingRoomSelector){
            swipingRoomSelector.slideTo(selectedRoomIndex + 1)
            swipingRoomSelector.slides.forEach((element, index) => {
                if (index === selectedRoomIndex){
                    element.classList.add("swiper-slide-active")
                } else {
                    element.classList.remove("swiper-slide-active")
                }
            })
        }

        const bgToHammer = document.querySelector(classnames.spacesBgContainer);
        hammertime = new Hammer(bgToHammer);
        hammertime.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        hammertime.on("panleft panright panup pandown panend panstart", function(ev) {

            let tempxOffset = panOffset.previousX + ev.deltaX;

            if (tempxOffset > maxXPanOffset){
                tempxOffset = maxXPanOffset
            } else if(tempxOffset < minXPanOffset){
                tempxOffset = minXPanOffset
            }

            let tempyOffset = panOffset.previousY + ev.deltaY;

            if (tempyOffset > maxYPanOffset){
                tempyOffset = maxYPanOffset
            } else if(tempyOffset < minYPanOffset){
                tempyOffset = minYPanOffset
            }

            if (ev.type === "panend") {
                panOffset.previousX = tempxOffset;
                panOffset.previousY = tempyOffset;
            }

            panOffset.x = tempxOffset;
            panOffset.y = tempyOffset;
            updateBGSizes();
        });
    }

    const bgToHideCSSSelector = `.${classnames.roomBackground}:not(.${classnames.hidden}):not(`+ bgToDisplayCSSSelector + `)`;
    const bgsToHide = Array.from(document.querySelectorAll(bgToHideCSSSelector));

    const hotSpotsToHideCSSSelector = `.${classnames.roomBackground}:not(.${classnames.hidden}) ` + classnames.hotSpot + `, .${classnames.defaultRoomBackground}:not(.${classnames.hidden}) ` + classnames.hotSpot;
    const hotSpotsToHide = Array.from(document.querySelectorAll(hotSpotsToHideCSSSelector));

    const hotSpotsToShowCSSSelector = room ? `.${classnames.roomBackground}.${space}-${room}${classnames.roomBackgroundSuffix} ` + classnames.hotSpot : ``;
    const hotSpotsToShow = room ? Array.from(document.querySelectorAll(hotSpotsToShowCSSSelector)) : [];

    // Deselect all rooms
    const allRooms = Array.from(document.querySelectorAll(`.${classnames.workspaceContainer}#${space}Container .${classnames.roomImage}`));
    allRooms.forEach((element) => {
        if (element.classList.contains(classnames.selected)) {
            element.classList.remove(classnames.selected);
        }
    })

    //if there are no roomSelectors to hide then show the relevant room selector
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
                        roomSelectorWrap.classList.remove(classnames.hidden);
                        roomSelectorWrap.style["opacity"] = "";
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
                roomSelector.classList.remove(classnames.hidden);
                roomSelectorWrap.removeEventListener('animationend', roomSelectorWrapListener);
                roomSelectorWrap.style["opacity"] = 0;
                roomSelectorWrap.classList.remove(classnames.fadeOut);
                roomSelectorWrap.classList.remove(classnames.slideIn);

                setTimeout(() => {
                    roomSelectorWrap.style["opacity"] = "";
                    roomSelectorWrap.classList.add(classnames.slideIn);
                }, 100);
            }

            roomSelectorWrap.addEventListener('animationend', roomSelectorWrapListener);
            otherRoomSelectors.forEach((element) => {
                element.classList.add(classnames.hidden);
            });
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

    if (bgsToHide.length == 0) {
        hotSpotsToHide.forEach((element)=>{
            element.classList.remove('animate-in')
        })
    }

    //show backgrounnds that are coming in
    bgsToDisplay.forEach((element) => {
        element.style['zIndex'] = 0;
        element.classList.remove(classnames.fadeOut);
        element.classList.remove(classnames.hidden);

        //animate in hotspots
        setTimeout(()=>{
            hotSpotsToShow.forEach((element, index) => {
                setTimeout(()=>{
                    element.classList.add(classnames.animateIn);
                }, 300 * index);
            })
        }, 300);
    })

    //if moving from workspace landing to selected room
    const roomContent = document.querySelector('.' + classnames.selectedRoomContent)
    if (room) {
        panOffset = {
            x:0,
            previousX:0,
            y:0,
            previousY:0
        };
        //hide all room labels
        
        const roomLabels = Array.from(document.querySelectorAll("." + classnames.selectedRoomLabel + ":not(.ws-room-selector-label)"))
        roomLabels.forEach((element) => {
            element.classList.add(classnames.hidden);
        });

        //hide all show more rooms elements
        const showMoreRoomsElements = Array.from(document.querySelectorAll("." + classnames.showMoreRoomsText + ", " + "." + classnames.showMoreRoomsBtn));
        showMoreRoomsElements.forEach((element) => {
            element.classList.add(classnames.hidden);
        });

        //show relevant show more rooms elements
        const relevantShowMoreElements = Array.from(document.querySelectorAll("." + classnames.showMoreRoomsText + "#" + classnames.showMoreRoomsText + "-" + space + ", ." + classnames.showMoreRoomsBtn + "#" + classnames.showMoreRoomsBtn + "-" + space));
        relevantShowMoreElements.forEach((element) => {
            element.classList.remove(classnames.hidden);
        })

        //show relevant label
        const roomlabel = document.querySelector('.' + classnames.selectedRoomLabel + '#' + space + "-" + room + "-label");
        roomlabel.classList.remove(classnames.hidden);

        // Set room-info button link
        const roomInfoButton = document.querySelector(`.${classnames.roomInfoButton}`)
        roomInfoButton.href = `#/${space}/${room}/info`;

        // hide room selector
        if (roomSelectorWrap) {
            roomSelectorWrap.classList.remove(classnames.slideIn);
            setTimeout(()=>{
                roomSelectorWrap.style['opacity'] = 0;
                roomSelectorWrap.classList.add(classnames.hidden);
            },500)
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
                roomSelectorWrap.style['opacity'] = 0;
                roomSelectorWrap.classList.remove(classnames.hidden);
                setTimeout(()=>{
                    roomSelectorWrap.style['opacity'] = "";
                    roomSelectorWrap.classList.add(classnames.slideIn);
                }, 100);
            }
        }, 750);
    }

    // Hide the device-modal
    document.getElementsByClassName(classnames.deviceModalRoot)
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

const updateWorkspaceCta = function (path) {
    const aboutCtaElements = document.getElementsByClassName(classnames.aboutWorkspaceCta);
    if (path){
        const [workspaceId, roomId] = splitPath(path);
        let href = `./workspaces/${workspaceId}.html`;
        if (roomId !== undefined) {
            href = `${href}#/${roomId}`;
        }

        Array.from(aboutCtaElements).forEach(anchor => anchor.href = href);
        Array.from(aboutCtaElements).forEach(anchor => anchor.enabled = true);
    } else {
        Array.from(aboutCtaElements).forEach(anchor => anchor.enabled = false);
    }
    
};

let swipingRoomSelector;

const updateRoomsSelector = function (path) {
    const splitPaths = splitPath(path);
    const mypath = splitPaths !== null ? splitPaths[0] : path;

    if (swipingRoomSelector && swipingRoomSelector.el && swipingRoomSelector.el.parentNode && swipingRoomSelector.el.parentNode.getAttribute("id") === `${mypath}Container`) {
        return;
    } else if (swipingRoomSelector) {
        swipingRoomSelector.destroy();
        selectedRoomIndex = 0
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

        const options = {
            speed: 400,
            slidesPerView: "auto",
            centeredSlides: true,
            centeredSlidesBounds: true,
            grabCursor: true,
            slideToClickedSlide: true,
            centerInsufficientSlides: true,
            enabled: totalSlideWidth >= (window.innerWidth - 98),
            on:{
                afterInit: function(){
                    let wouldBeSwiper = document.querySelector(`#${mypath}Container .swiper`)
                    setTimeout(function(){
                        wouldBeSwiper.style["opacity"] = 1
                    },300)
                },
            }
        }
        
        swipingRoomSelector = new Swiper(`#${mypath}Container .swiper`, options);
    }, 500)
}

const updateBGSizes = () => {
    const sizeClass = currentSizeClass();

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const initview = document.getElementsByClassName(classnames.initialView)[0];
    if (!initview.classList.contains(classnames.hidden)) {
        //update animating imgs on initial view
        const rotatingImgs = Array.from(document.querySelectorAll(classnames.rotatingImgs));
        const rImgWidth = rotatingImgs[0].clientWidth;
        const rImgHeight = rotatingImgs[0].clientHeight;
        const projectedRImgWidth = (windowHeight * 108) / 192;

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
        const {rooms} = workspaces[workspaceId];
        rooms.forEach((room) => {

            const defaultBgImgClass = classnames.defaultRoomBg + "." + workspaceId + classnames.roomBackgroundSuffix + " img";
            const defaultBgImg = document.querySelector(defaultBgImgClass);
            const bgContainerClass = "." + workspaceId + "-" + room.slug + classnames.roomBackgroundSuffix + ":not(.ws-displayNone)";
            const bgClass = bgContainerClass + " img";
            const bgImg = document.querySelector(bgClass);
            if (bgImg) {
                const backgroundPos = room.backgroundPosition[sizeClass];
                const imgWidth = bgImg.clientWidth;
                const imgHeight = bgImg.clientHeight;

                const projectedImgWidth = (windowHeight * 192) / 108;
                const initialOffset = (imgWidth * backgroundPos.x);

                let setImageHeight, setImageWidth;

                if (projectedImgWidth + (initialOffset * 2) < windowWidth) {
                    setImageWidth = windowWidth + (initialOffset * 2);
                    let newImageHeight = (setImageWidth * imgHeight) / imgWidth;
                    newImageHeight = newImageHeight < windowHeight ? windowHeight : newImageHeight;
                    bgImg.style["height"] = newImageHeight + "px";
                    setImageHeight = newImageHeight;
                } else{
                    bgImg.style["height"] = ""
                    setImageHeight = windowHeight;
                    setImageWidth = projectedImgWidth;
                }

                maxXPanOffset = (-(windowWidth - setImageWidth) / 2) - Math.abs(initialOffset);
                minXPanOffset = ((windowWidth - setImageWidth) / 2) - Math.abs(initialOffset);

                maxYPanOffset = (-(setImageHeight - windowHeight) / 2);
                minYPanOffset = ((setImageHeight - windowHeight) / 2);

                const scaledPanOffsetX = (panOffset.x * setImageWidth)/windowWidth;
                const panOffsetX = scaledPanOffsetX > maxXPanOffset ? maxXPanOffset : scaledPanOffsetX < minXPanOffset ? minXPanOffset : scaledPanOffsetX;
                const scaledPanOffsetY = (panOffset.y * setImageHeight)/windowHeight;
                const panOffsetY = panOffset.y === 0 ? 0 : scaledPanOffsetY > maxYPanOffset ? maxYPanOffset : scaledPanOffsetY < minYPanOffset ? minYPanOffset : scaledPanOffsetY ;

                const xOffset = Math.abs(initialOffset) === 0 ? initialOffset : initialOffset + panOffsetX;
                const yOffset = panOffsetY;

                const newTransform = 'translate(calc(-50% + ' + xOffset + 'px), calc(-50% + ' + yOffset + 'px))';

                bgImg.style["transform"] = newTransform;
                defaultBgImg.style["transform"] = newTransform;

                setTimeout(() => {
                    placeHotSpots({clientWidth: setImageWidth, clientHeight: setImageHeight}, room, bgContainerClass, {x: xOffset, y: yOffset});
                    hasUpdatedBGs = true
                }, !hasUpdatedBGs ? 500 : 0);
            }
        })
    })

    //updating default room bgs
    const defaultBgImgs = Array.from(document.querySelectorAll(classnames.defaultRoomBgImg));
    let dImgWidth = defaultBgImgs[0].clientWidth;
    let dImgHeight = defaultBgImgs[0].clientHeight;

    defaultBgImgs.forEach((element) => {
        if(element.clientWidth > 0 && element.clientHeight > 0){
            dImgWidth = element.clientWidth;
            dImgHeight = element.clientHeight;
        }
    })

    const projectedDImgWidth = (windowHeight * 108) / 192;

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

const placeHotSpots = (bgImg, room, bgContainerClass, offset) => {
    const imgWidth = bgImg.clientWidth;
    const imgHeight = bgImg.clientHeight;

    const hotspotsQuery = bgContainerClass + " " + classnames.hotSpot;
    const hotspots = Array.from(document.querySelectorAll(hotspotsQuery));

    const imgBaseWidth = 1920;
    const imgHalfWidth = 960;
    const imgBaseHeight = 1080;
    const imgHalfHeight = 540;

    room.hotSpots.forEach((element, index)=>{

        const fullDeltaX = imgHalfWidth - (element.x + 16);
        const xDelta = (fullDeltaX / imgBaseWidth) * -1;

        const fullDeltaY = imgHalfHeight - (element.y + 16);
        const yDelta = (fullDeltaY / imgBaseHeight) * -1;

        const hotspot = hotspots[index];
        const hOffset = imgWidth * xDelta;
        const yOffset = imgHeight * yDelta;

        hotspot.style["opacity"] = 1;
        hotspot.style["transform"] = 'translate(calc(-50% + ' + (hOffset + offset.x) + 'px), calc(-50% + ' + (yOffset + offset.y) + 'px))';
    })
}

const currentSizeClass = () => {
    const width = window.innerWidth
    let aSizeClass = ""
    commonData.sizeClasses.forEach((sizeClass) => {
        if (width <= sizeClass[2]) {
            aSizeClass = sizeClass[0]
        }
    })
    return aSizeClass;
}
