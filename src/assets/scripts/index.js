import Swiper from 'swiper';
import 'swiper/scss';
import Router from './router';
import {canonicalPath, devicePath, homePath, isDevicePath, makePath, splitPath} from './paths';
import commonData from '../../data/common.json';
import workspaces from '../../data/workspaces.json';

const router = new Router();

const updateUi = (location, delay = 300) => {
  setTimeout(()=>{
    updateNav(location.hash.substring(1));
    updateRoomsSelector(location.hash.substring(1));
  }, delay)
}

commonData.orderedWorkspaceIds.forEach((workspaceId) => {
  router.add('/' + workspaceId, () => {
    toSelectedWorkSpace(workspaceId);
    updateUi(window.location);
  })

  workspaces[workspaceId].rooms.forEach((room) => {
    router.add('/' + workspaceId + '/' + room.slug, () => {
      toSelectedWorkSpace(workspaceId, room.slug);
      updateUi(window.location)
    })
  })
});

router.add(homePath, () => {
    backToHome();
})

window.addEventListener('hashchange', (ev) => {
  router.route(canonicalPath(window.location));
});

window.addEventListener('resize', () => {
  updateUi(window.location);
});

window.addEventListener('load', function() {
  router.route(canonicalPath(window.location));
});


const backToHome = function () {

    let initview = document.getElementsByClassName("ws-initial-view")[0];
    let spacesview = document.getElementsByClassName("ws-room-view")[0];

    if (!initview.classList.contains('ws-displayNone')) {
        return;
    }

    //let spacescontentview = document.getElementsByClassName("ws-room-content")[0];
    //let roomSelector = document.querySelector(".ws-workspace#homeSpaceContainer");
    let roomSelectorWrap = document.getElementsByClassName("ws-workspaces-rooms")[0];

    if (roomSelectorWrap && roomSelectorWrap.classList.contains('slide-in')) {
        roomSelectorWrap.classList.remove('slide-in');
    }

    initview.style['zIndex'] = 1;
    initview.classList.remove('ws-displayNone');

    let listener = () => {
        initview.classList.remove('explored');
        initview.classList.remove('reversed');
        spacesview.classList.add('ws-displayNone');
        initview.style['zIndex'] = 0;
        initview.removeEventListener('animationend', listener);
    }

    initview.addEventListener('animationend', listener);
    initview.classList.add('reversed');
}

const updateNav = function (path) {
    const splitPaths = splitPath(path);
    const mypath = splitPaths !== null ? splitPaths[0] : path;

    let navLinks = document.querySelectorAll(".ws-workspace-nav a");
    let navSelector = document.getElementById("ws-nav-underline");

    let selectedIndex = -1;

    commonData.orderedWorkspaceIds.forEach((workspaceId, index) => {
        if (workspaceId === mypath) {
            selectedIndex = index;
        }
    });

    if (selectedIndex === -1) {
        if (!navSelector.classList.contains("ws-displayNone")) {
            navSelector.classList.add("ws-displayNone");
        }

        navSelector.style.left = "50%";
        navSelector.style.width = "0px";
        return
    } else {
        navSelector.classList.remove("ws-displayNone");
    }

    let left = navLinks[selectedIndex].offsetLeft;
    let width = navLinks[selectedIndex].offsetWidth;

    setTimeout(()=>{
        navSelector.style.left = left + "px";
        navSelector.style.width = width + "px";
    }, 1)

}

const toSelectedWorkSpace = function(space, room) {
  console.log(space, room);
    let initview = document.getElementsByClassName("ws-initial-view")[0];
    let spacesview = document.getElementsByClassName("ws-room-view")[0];
    let spacescontentview = document.getElementsByClassName("ws-room-content")[0];
    let roomSelector = document.querySelector(".ws-workspace#" + space + "Container");
    let otherRoomSelectors = Array.from(document.querySelectorAll(".ws-workspace:not(#" + space + "Container):not(.ws-displayNone)"));
    let roomSelectorWrap = document.getElementsByClassName("ws-workspaces-rooms")[0];

    let bgToDisplayCSSSelector =  room ? ".ws-room-bg." + space + "-" + room + "-room-bg" : ".ws-default-room-bg." + space + "-room-bg";
    let bgsToDisplay = Array.from(document.querySelectorAll(bgToDisplayCSSSelector));
    let bgToHideCSSSelector = ".ws-room-bg:not(.ws-displayNone), .ws-default-room-bg:not(.ws-displayNone)"
    let bgsToHide = Array.from(document.querySelectorAll(bgToHideCSSSelector));

    //let selectedRoom = room ? document.querySelector("#" + space + "-" + room + " .ws-room-image") : document.querySelector(".ws-workspace#" + space + "Container .ws-room-image");

    let allRooms = Array.from(document.querySelectorAll(".ws-workspace#" + space + "Container .ws-room-image"));
    allRooms.forEach((element) => {
        if (element.classList.contains("selected")){
            element.classList.remove("selected")
        }
    })
/*
    if (selectedRoom && !selectedRoom.classList.contains("selected")) {
        selectedRoom.classList.add("selected")
    }
*/
    if (roomSelector && roomSelector.classList.contains('ws-displayNone') && otherRoomSelectors.length === 0) {
        roomSelector.classList.remove('ws-displayNone');
    }

    if (initview && !initview.classList.contains('explored') && !initview.classList.contains('ws-displayNone')) {

        let listener = () => {
            initview.classList.add('ws-displayNone');
            initview.style['zIndex'] = 0;
            if(spacescontentview) {
                spacescontentview.classList.remove('ws-displayNone');

                setTimeout(()=>{
                    if (roomSelectorWrap) {
                        roomSelectorWrap.classList.add('slide-in');
                    }
                }, 500);
            }

            initview.removeEventListener('animationend', listener);
          }

        if(spacescontentview) {
            spacescontentview.classList.add('ws-displayNone');
        }

        initview.addEventListener('animationend', listener);
        initview.classList.add('explored');
    }

    if(otherRoomSelectors.length > 0) {

        if (roomSelectorWrap) {
            let roomSelectorWrapListener = ()=>{
                console.log("roomSelectorWrapListener")
                otherRoomSelectors.forEach((element) => {
                    element.classList.add("ws-displayNone");
                });
                roomSelector.classList.remove('ws-displayNone');
                roomSelectorWrap.removeEventListener('animationend', roomSelectorWrapListener);
                roomSelectorWrap.classList.remove('fadeOut');
                roomSelectorWrap.classList.remove('slide-in');
                setTimeout(()=>{
                    console.log("adding slide-in class to SelectorWrap")
                    roomSelectorWrap.classList.add('slide-in');
                }, 500);
            }

            console.log("roomSelectorWrap.addEventListener");
            roomSelectorWrap.addEventListener('animationend', roomSelectorWrapListener);
            roomSelectorWrap.classList.add('fadeOut');
        }
    }

    if (spacesview && spacesview.classList.contains('ws-displayNone')) {
        spacesview.classList.remove('ws-displayNone');

        spacesview.style['zIndex'] = 0;
        initview.style['zIndex'] = 1;
    }

    bgsToHide.forEach((element) => {
        element.style['zIndex'] = 1;
        let listener = () => {
            element.removeEventListener("animationend", listener);
            element.classList.add("ws-displayNone");
            element.classList.remove("fadeOut");
        }

        element.addEventListener("animationend", listener);
        element.classList.add("fadeOut");
    })

    bgsToDisplay.forEach((element) => {
        element.style['zIndex'] = 0;
        element.classList.remove("fadeOut");
        element.classList.remove("ws-displayNone");
    })
}


let swipingRoomSelector;

const updateRoomsSelector = function (path){
    const splitPaths = splitPath(path);
    const mypath = splitPaths !== null ? splitPaths[0] : path;

    if (swipingRoomSelector && swipingRoomSelector.el && swipingRoomSelector.el.parentNode && swipingRoomSelector.el.parentNode.getAttribute("id") === mypath + "Container") {
        console.log('swiper already exists for ' + mypath + 'Container')
        return;
    } else if (swipingRoomSelector) {
        swipingRoomSelector.destroy();
    }

    let spacesview = document.getElementsByClassName("ws-room-view")[0];
    if (spacesview.classList.contains('ws-displayNone')) {
        console.log("spacesview.classList.contains('ws-displayNone')" , spacesview.classList.contains('ws-displayNone'))
        return;
    }

    setTimeout(()=>{
        let slides = Array.from(document.querySelectorAll("#" + mypath + "Container .swiper .swiper-slide.ws-room"));
        let slideCount = slides.length;

        if (slideCount === 0) {
            return
        }
        let slideWidth = slides[0].offsetWidth;

        let totalSlideWidth = (slideWidth * slideCount) + (10 * (slideCount - 1));

        let options = {
            speed: 400,
            slidesPerView: "auto",
            centeredSlides: true,
            centeredSlidesBounds: true,
            grabCursor: true,
            slideToClickedSlide: true,
            centerInsufficientSlides: true,
        }

        if (totalSlideWidth < (window.innerWidth - 98) ) {
            options = {...options, ...{enabled: false}}
        }

        swipingRoomSelector = new Swiper("#" + mypath + "Container .swiper", options);

    }, 500)
}
