import { remove } from "cheerio/lib/api/manipulation";
import Router from "./router";
import Swiper from 'swiper';
import 'swiper/scss';

var workspaces = require('../../data/workspaces.json');

const router = new Router();
router.add('home', () => { console.log('home'); })

router.add('/homeSpace', () => {
    fromHomeToRooms();
})

router.add('/officeSpace', () => {
    
})

router.add('/anywhere', () => {
    
})

window.addEventListener('hashchange', (ev) => {
  let path = location.hash === '' ? 'home' : location.hash.substring(1);
  router.route(path);
  updateNav(path);
  updateRoomsSelector(path);
});

window.addEventListener('resize', () => {
    updateNav(location.hash.substring(1));
    updateRoomsSelector(location.hash.substring(1));
});

window.addEventListener('load', function() {
    let path = location.hash === '' ? 'home' : location.hash.substring(1);
    router.route(path);
    setTimeout(()=>{
        updateNav(location.hash.substring(1));
        updateRoomsSelector(location.hash.substring(1));
    }, 300)
});

const fromHomeToRooms = function (){
    let initview = document.getElementsByClassName("ws-initial-view")[0];
    let spacesview = document.getElementsByClassName("ws-room-view")[0];
    let spacescontentview = document.getElementsByClassName("ws-room-content")[0];
    let roomSelector = document.querySelector(".ws-workspace#homeSpaceContainer");
    let roomSelectorWrap = document.getElementsByClassName("ws-workspaces-rooms")[0];

    if (roomSelector && roomSelector.classList.contains('ws-displayNone')) {
        roomSelector.classList.remove('ws-displayNone');
    }

    if (initview && !initview.classList.contains('explored') && !initview.classList.contains('ws-displayNone')) {
        
        let listener = () => {
            initview.classList.toggle('ws-displayNone');
            initview.style['zIndex'] = 0;
            if(spacescontentview) {
                spacescontentview.classList.toggle('ws-displayNone');
                setTimeout(()=>{
                    if (roomSelectorWrap) {
                        roomSelectorWrap.classList.add('slide-in')
                    }
                }, 500);
            } 

            initview.removeEventListener('animationend', listener);
          }
        
        if(spacescontentview) {
            spacescontentview.classList.toggle('ws-displayNone');
        }

        initview.addEventListener('animationend', listener);
        initview.classList.add('explored');
    }

    
    if (spacesview && spacesview.classList.contains('ws-displayNone')) {
        spacesview.classList.remove('ws-displayNone');
        spacesview.style['zIndex'] = 0;
        initview.style['zIndex'] = 1;
    }
}

const updateNav = function (path) {

    let mypath = path;
    if (path.indexOf("/") > -1) {
        let paths = path.split("/");
        paths = paths.filter(word => word.length > 0);
        mypath = paths[0];
    }

    let navLinks = document.querySelectorAll(".ws-workspace-nav a");
    let navSelector = document.getElementById("ws-nav-underline");

    let selectedIndex = -1;
    
    workspaces.forEach((element, index) => {
        if (element.slug == mypath) {
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

let swipingRoomSelector;

const updateRoomsSelector = function (path){

    if (swipingRoomSelector) {
        swipingRoomSelector.destroy();
    }

    let spacesview = document.getElementsByClassName("ws-room-view")[0];
    if (spacesview.classList.contains('ws-displayNone')) {
        return;
    }

    let mypath = path;
    if (path.indexOf("/") > -1) {
        let paths = path.split("/");
        paths = paths.filter(word => word.length > 0);
        mypath = paths[0];
    }

    setTimeout(()=>{
        let slides = Array.from(document.querySelectorAll("#" + mypath + "Container .swiper .swiper-slide.ws-room"));
        let slideCount = slides.length;
        let slideWidth = slides[0].offsetWidth;

        let totalSlideWidth = (slideWidth * slideCount) + (10 * (slideCount - 1));

        let options = {
            speed: 400,
            slidesPerView: "auto",
            spaceBetween: 10,
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
