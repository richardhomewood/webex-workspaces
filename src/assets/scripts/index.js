import Router from "./router";
console.log('Hello world');

const router = new Router();
router.add('home', () => { console.log('home'); })
router.add('frag1', () => { console.log('frag1'); })
router.add('frag2', () => { console.log('frag2'); })

router.add('homeSpace-homeOffice', () => {
    fromHomeToRooms();
})

window.addEventListener('hashchange', (ev) => {
  let path = location.hash === '' ? 'home' : location.hash.substring(1);
  router.route(path);
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
