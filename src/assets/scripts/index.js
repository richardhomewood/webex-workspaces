import Router from "./router";
console.log('Hello world');

const router = new Router();
router.add('home', () => { console.log('home'); })
router.add('frag1', () => { console.log('frag1'); })
router.add('frag2', () => { console.log('frag2'); })

router.add('homeSpace-homeOffice', () => {
    let initview = document.getElementsByClassName("ws-initial-view")[0];
    if (initview && !initview.classList.contains('explored') && !initview.classList.contains('displayNone')) {

        let listener = () => {
            initview.classList.toggle('displayNone');
            initview.removeEventListener('animationend', listener);
          }
        initview.addEventListener('animationend', listener);
        initview.classList.toggle('explored');
    }

    let spacesview = document.getElementsByClassName("ws-room-view")[0];
    if (spacesview && spacesview.classList.contains('displayNone')) {
        spacesview.classList.toggle('displayNone');
    }
    if (spacesview && !spacesview.classList.contains('displayBlock')) {
        spacesview.classList.toggle('displayBlock');
    }
})

window.addEventListener('hashchange', (ev) => {
  let path = location.hash === '' ? 'home' : location.hash.substring(1);
  router.route(path);
});

