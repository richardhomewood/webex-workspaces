import Router from "./router";
console.log('Hello world');

const router = new Router();
router.add('home', () => { console.log('home'); })
router.add('frag1', () => { console.log('frag1'); })
router.add('frag2', () => { console.log('frag2'); })

window.addEventListener('hashchange', (ev) => {
  let path = location.hash === '' ? 'home' : location.hash.substring(1);
  router.route(path);
});

