import {splitPath} from './paths';
import classnames from './classnames';
import commonData from '../../../../../../../data/common.json';
import workspaces from '../../../../../../../data/workspaces.json';
import { setTimeout } from 'core-js';
import Swiper from 'swiper';
import Hammer from 'hammerjs';
import 'swiper/scss';
import {currentSizeClass, timeout} from './utils';

let hasUpdatedBGs = false
let selectedRoomIndex = 0

// Getters

const getSwiperAnimationViewed = () => {
    const sessionStorage = window.sessionStorage
    let hasViewedAnimation = sessionStorage.getItem('hasViewedSwiperAnimation') ?? "0"
    return hasViewedAnimation == "1"
}

const setSwiperAnimationViewed = () => {
    const sessionStorage = window.sessionStorage
    sessionStorage.setItem('hasViewedSwiperAnimation', '1')
}

let initialView;
const getInitView = () => {
    if (!initialView){
        initialView = document.querySelector(`.${classnames.initialView}`);
    }
    return initialView
}

let spacesView;
const getSpacesView = () => {
    if (!spacesView){
        spacesView = document.querySelector(`.${classnames.roomView}`);
    }
    return spacesView
}

let roomSelectorWrapper;
const getRoomSelectorWrapper = () => {
    if (!roomSelectorWrapper){
        roomSelectorWrapper = document.querySelector(`.${classnames.selectorWrapper}`);
    }
    return roomSelectorWrapper
}

const getSwiperContainerSelector = (space) => {
    return `.${classnames.workspaceContainer}#${space}Container`
}

let roomSelectorContainer;
const getRoomSelectorContainer = (space)=>{

    if (!roomSelectorContainer || roomSelectorContainer.id !== `${space}Container`) {
        roomSelectorContainer = document.querySelector(getSwiperContainerSelector(space));
    }
    return roomSelectorContainer
}

const getSwiperEl = (space) => {
    return document.querySelector(`#${space}Container .swiper`);
}

const getHotSpotsToHide = () => {
    const hotSpotsToHideCSSSelector = `.${classnames.roomBackground}:not(.${classnames.hidden}) ` + classnames.hotSpot + `, .${classnames.defaultRoomBackground}:not(.${classnames.hidden}) ` + classnames.hotSpot;
    const hotSpotsToHide = Array.from(document.querySelectorAll(hotSpotsToHideCSSSelector));
    return hotSpotsToHide;
}

const getBgToDisplaySelector = (space, room) => {
    let roomSlug = !room ? workspaces[space].rooms[(workspaces[space].rooms.length < selectedRoomIndex + 1 ? 0 : selectedRoomIndex)].slug : "";

    return room ?
    `.${space}-${room}${classnames.roomBackgroundSuffix}` :
    `.${space}-${roomSlug}${classnames.roomBackgroundSuffix}`;
}

const getBgsToDisplay = (space, room) => {
    let roomSlug = !room ? workspaces[space].rooms[(workspaces[space].rooms.length < selectedRoomIndex + 1 ? 0 : selectedRoomIndex)].slug : "";

    const bgToDisplayCSSSelector = room ?
    `.${space}-${room}${classnames.roomBackgroundSuffix}` :
    `.${space}-${roomSlug}${classnames.roomBackgroundSuffix}`;
    return Array.from(document.querySelectorAll(`.${classnames.roomBackground}` + bgToDisplayCSSSelector));
}

const getBgsToHide = (space, room) => {
    const bgToHideCSSSelector = `.${classnames.roomBackground}:not(.${classnames.hidden}):not(`+ getBgToDisplaySelector(space,room) + `)`;
    return Array.from(document.querySelectorAll(bgToHideCSSSelector));
}

const getOtherRoomSelectors = (space)=> {
    return Array.from(document.querySelectorAll(`.${classnames.workspaceContainer}:not(#${space}Container):not(.${classnames.hidden})`));
}

const getHotSpotsToShow = (space, room ) =>{
    const hotSpotsToShowCSSSelector = room ? `.${classnames.roomBackground}.${space}-${room}${classnames.roomBackgroundSuffix} ` + classnames.hotSpot : ``;
    return room ? Array.from(document.querySelectorAll(hotSpotsToShowCSSSelector)) : [];
}

let storedSliderWidth = 0;
const getRoomSelectorOptions = async (mypath) => {

    const slides = Array.from(document.querySelectorAll(`#${mypath}Container .swiper .swiper-slide.${classnames.roomSlide}`));
    const slideCount = slides.length;

    if (slideCount === 0) {
        return
    }

    if (slides.length === 0) {
        return
    } else {
        slides.forEach((element) => {
            element.onclick = (e)=>{slideClick(e)};
        })
    }

    await timeout(100);

    storedSliderWidth = Math.max(storedSliderWidth, slides[0].offsetWidth);
    const slideWidth = storedSliderWidth;
    const totalSlideWidth = (slideWidth * slideCount) + (10 * (slideCount - 1));
    const enabled = totalSlideWidth >= (window.innerWidth - 98);

    const options = {
        speed: 400,
        slidesPerView: "auto",
        centeredSlides: true,
        centeredSlidesBounds: true,
        grabCursor: true,
        slideToClickedSlide: true,
        centerInsufficientSlides: true,
        enabled: enabled
    }

    return options;
}

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

    destroyHammer();

    const initview = getInitView();
    const spacesview = getSpacesView();

    if (!initview.classList.contains(classnames.hidden)) {
        return;
    }

    const roomSelectorWrap = getRoomSelectorWrapper();

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

    const initview = getInitView();
    const spacesview = getSpacesView();
    const roomSelector = getRoomSelectorContainer(space);
    const otherRoomSelectors = getOtherRoomSelectors(space);
    const roomSelectorWrap = getRoomSelectorWrapper();

    destroyHammer();

    if (room) {
        let roomIndex = -1;
        workspaces[space].rooms.forEach((element, indx) => {
            if (element.slug == room){
                roomIndex = indx;
            }
        });

        selectedRoomIndex = roomIndex < 0 ? 0 : roomIndex;
        if (swipingRoomSelector) {
            updateSelectedSlideClasses(selectedRoomIndex, swipingRoomSelector.slides)
        }
        setupHammer();
    }

    // Deselect all rooms
    deselectAllRooms(space);

    //if there are no roomSelectors to hide then show the relevant room selector
    if (roomSelector && roomSelector.classList.contains(classnames.hidden) && otherRoomSelectors.length === 0) {
        roomSelector.classList.remove(classnames.hidden);
    }

    // if transitioning away from home view
    transitionAwayFromHomeView(initview, room);

    // if there are room selectors to hide, hide them and animate in relevant room selector
    transitionRoomSelectors(otherRoomSelectors, roomSelectorWrap, roomSelector, space)

    //if transitioning away from home view then move home view in front of spaces view and show home view
    if (spacesview && spacesview.classList.contains(classnames.hidden)) {
        spacesview.classList.remove(classnames.hidden);
        spacesview.style['zIndex'] = 0;
        initview.style['zIndex'] = 1;
    }

    transitionBGsHotSpots(space, room);

    transitionRooms(space, room, roomSelectorWrap);

    // Hide the device-modal
    document.getElementsByClassName(classnames.deviceModalRoot)
}

const transitionBGsHotSpots = (space, room) => {
    const bgsToDisplay = getBgsToDisplay(space, room);
    const bgsToHide = getBgsToHide(space, room);
    const hotSpotsToHide = getHotSpotsToHide()

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
            element.classList.add('animated-out')
        })
    }

    //show backgrounnds that are coming in
    bgsToDisplay.forEach((element) => {
        element.style['zIndex'] = 0;
        element.classList.remove(classnames.fadeOut);
        element.classList.remove(classnames.hidden);

        //animate in hotspots
        if(getSwiperAnimationViewed()){
            animateInHotSpots(space, room)
        }
    })
}

const animateInHotSpots = (space, room) => {
    const hotSpotsToHide = getHotSpotsToHide()
    const hotSpotsToShow = getHotSpotsToShow(space, room)

    setTimeout(()=>{
        hotSpotsToShow.forEach((element, index) => {
            setTimeout(()=>{
                if (!element.classList.contains('animated-out')) {
                    element.classList.add(classnames.animateIn);
                }
            }, 300 * index);

            if (index == hotSpotsToShow.length - 1){
                hotSpotsToHide.forEach((element)=> {
                    element.classList.remove('animated-out')
                })
            }
        })
    }, 300);
}

const transitionRooms = (space, room, roomSelectorWrap)=> {
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
}

const transitionAwayFromHomeView = (initview, room) => {
    if (initview && !initview.classList.contains(classnames.explored) && !initview.classList.contains(classnames.hidden)) {

        const spacescontentview = document.querySelector(`.${classnames.roomContentView}`)[0];
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
}

const transitionRoomSelectors = (otherRoomSelectors, roomSelectorWrap, roomSelector, space)=>{

    if (otherRoomSelectors.length > 0) {

        if (roomSelectorWrap) {
            const roomSelectorWrapListener = () => {
                roomSelector.classList.remove(classnames.hidden);
                roomSelectorWrap.removeEventListener('animationend', roomSelectorWrapListener);
                roomSelectorWrap.style["opacity"] = 0;
                roomSelectorWrap.classList.remove(classnames.fadeOut);
                roomSelectorWrap.classList.remove(classnames.slideIn);

                const wouldBeSwiper = getSwiperEl(space);
                wouldBeSwiper.style["opacity"] = 1

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
}

// Hammer

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

const destroyHammer = ()=>{
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
}

const setupHammer = () => {
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

const updateNav = function (path) {
    const splitPaths = splitPath(path);
    const currentWorkspaceId = splitPaths !== null ? splitPaths[0] : path;

    const navContainer = document.querySelector(`.${classnames.workspaceNavigation}`);
    if (currentWorkspaceId) {
        navContainer.style["opacity"] = 1;
    }

    const navLinks = document.querySelectorAll(`.${classnames.workspaceNavigation} a`);
    const navSelector = document.getElementById("ws-nav-underline");

    let selectedIndex = -1;

    commonData.orderedWorkspaceIds.forEach((workspaceId, index) => {
        if (workspaceId === currentWorkspaceId) {
            selectedIndex = index;
        }
    });

    if (selectedIndex === -1) {

        if (!navSelector.classList.contains(classnames.hidden)) {
            navSelector.classList.add(classnames.hidden);
        }

        navSelector.style.left = "50%";
        navSelector.style.width = "0px";

        navLinks.forEach((element) => {
            element.classList.add("ws-disabled")
        })

        return
    } else {
        navSelector.classList.remove(classnames.hidden);
        navLinks.forEach((element) => {
            element.classList.remove("ws-disabled")
        })
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
        let href = `./${workspaceId}.html`;
        if (roomId !== undefined) {
            href = `${href}#${roomId}`;
        }

        Array.from(aboutCtaElements).forEach((anchor) => {
            anchor.href = href
            anchor.enabled = true
            anchor.style["opacity"] = 1
        });

    } else {
        Array.from(aboutCtaElements).forEach((anchor) => {
            anchor.enabled = false
            anchor.style["opacity"] = 0
        });

    }

};


let swipingRoomSelector;
const updateRoomsSelector = async function (path) {
    const splitPaths = splitPath(path);
    const mypath = splitPaths !== null ? splitPaths[0] : path;
    const wouldBeSwiperSelector = `#${mypath}Container .swiper`;
    const wouldBeSwiper = document.querySelector(wouldBeSwiperSelector)

    if (swipingRoomSelector && swipingRoomSelector.el && swipingRoomSelector.el.parentNode && swipingRoomSelector.el.parentNode.getAttribute("id") === `${mypath}Container`) {

        const previousOptions = swipingRoomSelector.params;
        const {enabled : isEnabled  } = previousOptions;
        const {enabled} = await getRoomSelectorOptions(mypath);
        console.log("updateRoomsSelector" , enabled)
        let updateProgress = (enabled && !isEnabled) || (!enabled && isEnabled);
        const slides = Array.from(document.querySelectorAll(`${wouldBeSwiperSelector} .swiper-slide.${classnames.roomSlide}`));
        let clickedIndex = -1;

        slides.forEach((element, index) => {
            if (element.classList.contains("selected")) {
                clickedIndex = index;
            }
        })

        let progress = 0
        if (clickedIndex >= 0) {
            progress = clickedIndex == clickedIndex == 0 ? 0 : slides.length - 1 ? 1 : (clickedIndex / slides.length) + ((1 / (slides.length * 2)) * clickedIndex)
        }

        if (updateProgress) {
            setTimeout(async () => {
                if (enabled && !isEnabled) {
                    swipingRoomSelector.enable();
                } else if (!enabled && isEnabled) {
                    swipingRoomSelector.disable();
                }

                swipingRoomSelector.setProgress(progress, 0);
                setTimeout(() => {
                    swipingRoomSelector.setProgress(progress, 0);
                    setTimeout(() => {
                        swipingRoomSelector.setProgress(progress, 0);
                    }, 1000)
                }, 200)
            }, 500);
        }
        return;
    } else if (swipingRoomSelector) {
        wouldBeSwiper.style["opacity"] = 0;
        swipingRoomSelector.destroy();
        selectedRoomIndex = 0
    }

    const spacesview = getSpacesView();
    if (spacesview.classList.contains(classnames.hidden)) {
        return;
    }

    setTimeout(async () => {
        const options = await getRoomSelectorOptions(mypath);
        swipingRoomSelector = new Swiper(wouldBeSwiperSelector, options);
    }, 0)
}

const slideClick = (e) => {
    const target = e.target.classList.contains("swiper-slide") ? e.target : e.target.closest(".swiper-slide")
    const slides = getRelevantSlides()
    const clickedIndex = slides.indexOf(target);

    updateSelectedSlideClasses(clickedIndex, slides)
}

const getRelevantSlides = () => {
    const path = location.hash.substring(1);
    const splitPaths = splitPath(path);
    const mypath = splitPaths !== null ? splitPaths[0] : path;
    return Array.from(document.querySelectorAll(`#${mypath}Container .swiper .swiper-slide.${classnames.roomSlide}`));
}

const updateSelectedSlideClasses = (selectedIndex, slides) => {
    slides.forEach((element, index) => {
        if (index === selectedIndex){
            element.classList.add("swiper-slide-active")
            element.classList.add("selected")
        } else {
            element.classList.remove("swiper-slide-active")
            element.classList.remove("selected")
        }
    })
}

const updateBGSizes = () => {
    const sizeClass = currentSizeClass();

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const initview = getInitView();
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

                const path = location.hash.substring(1);
                const [workspaceId, roomId] = splitPath(path);

                if (roomId){
                    if(!getSwiperAnimationViewed() && (setImageWidth > windowWidth || setImageHeight > windowHeight)){
                        const swiperAnimationView = document.getElementById('ws-swiper-indicator-animation');
                        swiperAnimationView.classList.remove(classnames.hidden)
                        swiperAnimationView.onclick = ()=>{

                            swiperAnimationView.classList.add(classnames.hidden)
                            setSwiperAnimationViewed();
                            animateInHotSpots(workspaceId, roomId)
                        }
                    } else{
                        animateInHotSpots(workspaceId, roomId)
                    }
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

const deselectAllRooms = (space) =>{
    const allRooms = Array.from(document.querySelectorAll(`${getSwiperContainerSelector(space)} .${classnames.roomImage}`));
    allRooms.forEach((element) => {
        if (element.classList.contains(classnames.selected)) {
            element.classList.remove(classnames.selected);
        }
    })
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



