import Router from "./router";
const commonData = require('../../data/common.json');

const router = new Router();

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
});

window.addEventListener('resize', () => {
    updateNav(location.hash.substring(1));
});

document.addEventListener("DOMContentLoaded", function() {
    setTimeout(()=>{
        updateNav(location.hash.substring(1));
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
        initview.classList.toggle('explored');
    }


    if (spacesview && spacesview.classList.contains('ws-displayNone')) {
        spacesview.classList.toggle('ws-displayNone');
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

    commonData.orderedWorkspaces.forEach((element, index) => {
        if (element === mypath) {
            selectedIndex = index;
        }
    });

    console.log(selectedIndex);

    if (selectedIndex === -1 && !navSelector.classList.contains("ws-displayNone")) {
        navSelector.classList.add("ws-displayNone");
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

const updateRoomsSelector = function (path){

}
