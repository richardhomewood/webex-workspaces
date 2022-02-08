class Router {
  constructor(options = {}) {
    this.routes = {};
  }

  add(path, fn) {
    this.routes[path] = fn;
  }

  remove(path) {
    delete this.routes[path];
  }

  route(path) {
    console.log(`route to: ${path}`);
    (this.routes[path])();
  }
}
export default Router;
