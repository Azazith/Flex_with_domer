class Domer { // v 2.32 ironboy, nodehill, mit, oct 2019

  constructor(props) {
    Object.assign(this, props);
    Domer.ranOnce || Domer.runOnce();
    this._id = Domer.instances.length;
    Domer.instances.push(this);
    Domer.propertyMap.set(this, {});
    this._render = () => this.render(
      Domer.templateEngine, Domer.route
    ).replace('>', ` _id="${this._id}">`);
    !this._id && setTimeout(() => this.update());
    location.pathname.includes("index.html") && history.replaceState(null, null, "/");
  }

  update(noBindSet) {
    let root = document.querySelector(`[_id="${this._id}"]`);
    if(!root && Domer.rawMountDone){ return; }
    root = root || document.createElement('div');
      !root.closest('[_id]') && document.body.append(root);
    Domer.update(root, this._render(), noBindSet);
    Domer.rawMountDone = true;
  }

  render(t) {
    return t`${this}`;
  }

  sleep(ms) {
    Domer.sleep(ms);
    this.update();
  }

  get route(){
    return Domer.route;
  }

  static runOnce() {
    this.instances = [];
    this.propertyMap = new WeakMap();
    Object.fromEntries = Object.fromEntries
      || (a => a.reduce((a, v) => ((a[v[0]] = v[1]) && 0) || a, {}));
    Object.keys(window)
      .filter(x => x.startsWith('on')).map(x => x.slice(2))
      .forEach((type) => this.addEventListener(type));
    this.ranOnce = true;
    this.route.get = () => location.pathname; 
    this.route.set = path => {
      history.pushState(null, null, encodeURI(path));
      window.scrollTo(0, 0);
      Domer.instances[0].update();
    };
  }

  static async addEventListener(type) {
    window.addEventListener(type, e => this.pathEach(type, e, async el => {
      let instance = this.instanceFromElement(el);
      this.router(type, el, e);
      if (!instance) { return; }
      let changed = type.endsWith('up') && this.doubleBind('set');
      changed && await this.sleep(1); // because Edge input reset button is broken
      changed && (type = 'keyup');
      let method = instance[el.getAttribute(type)];
      method && await method.call(instance, e);
      let shouldUpdate = changed || (type !== 'keyup' && method);
      shouldUpdate && this.instances[0].update();
    }));
  }

  static update(root, html, noBindSet) {
    let before = this.mounted;
    let focused = Domer.inputFocus();
    !noBindSet && this.doubleBind('set');
    this.routed = false;
    root.outerHTML = html;
    this.doubleBind('get');
    this.inputFocus(focused);
    this.arrayDiffCall(before, this.mounted, 'willUnmount');
    this.arrayDiffCall(this.mounted, before, 'didMount');
  }

  static get mounted() {
    let roots = [...document.querySelectorAll('[_id]')];
    return roots.map(x => this.instanceFromElement(x));
  }

  static arrayDiffCall(array1, array2, method) {
    let diff = array1.filter(x => !array2.includes(x));
    diff.forEach(async x => {
      if (x[method]) { (await x[method]()); x.update(); }
    });
  }

  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static templateEngine(strings, ...expressions) {
    return strings.map((string, i) => {
      let v = expressions[i];
      !v && v !== 0 && (v = '');
      v.render && v.render !== Domer.prototype.render && (v = v._render());
      v.map && (v = v.map(x => x.render ? x._render() : x));
      v.join && (v = v.join(''));
      v instanceof Promise && (v = '');
      typeof v === 'object' && (v = Domer.showRawObject(v));
      return string + v;
    }).join('');
  }

  static showRawObject(object) {
    try {
      return `<pre>${JSON.stringify(object, '', '  ')}</pre><hr>`
    }
    catch (e) {
      return `<pre>${e}</pre>`;
    }
  }

  static instanceFromElement(el) {
    let root = el.closest && el.closest('[_id]') || {};
    let id = root.getAttribute && root.getAttribute('_id');
    return this.instances[id];
  }

  static pathEach(type, e, func) {
    let path = [], node = e.target;
    while (node) { path.push(node); node = node.parentNode; }
    path.push(window);
    path.forEach(func);
  }

  static doubleBind(action) {
    let changed = false;
    document.querySelectorAll('[bind]').forEach(el => {
      let instance = this.instanceFromElement(el);
      let property = el.getAttribute('bind');
      let pmap = this.propertyMap.get(instance);
      if (!pmap.hasOwnProperty(property)) {
        pmap[property] = instance[property];
        Object.defineProperty(instance, property, {
          get() { return pmap[property]; },
          set(val) {
            if(val === pmap[property]){ return; }
            pmap[property] = val;
            instance.update(true);
          }
        });
      }
      changed = changed || instance[property] !== el.value;
      action === 'get' && (el.value = instance[property] || '');
      action === 'set' && (instance[property] = el.value);
    });
    return changed;
  }

  static inputFocus([set, start, end] = []) {
    let toFocus = document.querySelector(set || ':focus');
    if (!toFocus) { return; }
    start = start || toFocus.selectionStart;
    end = end || toFocus.selectionEnd;
    set && toFocus.focus();
    set && (toFocus.selectionStart = start);
    set && (toFocus.selectionEnd = end);
    let _id = toFocus.closest('[_id]').getAttribute('_id');
    let bind = toFocus.getAttribute('bind');
    return [`[_id="${_id}"] [bind="${bind}"]`, start, end];
  }

  static router(type, el, e) {
    type === 'popstate' && this.instances[0].update();
    let isRoute = el.closest && el.closest('a[href^="/"]')
    if (!isRoute || type !== 'click') { return; }
    history.pushState(null, null, el.getAttribute('href'));
    e.preventDefault();
    window.scrollTo(0, 0);
    this.instances[0].update();
  }

  static route(path) {
    if (Domer.routed) { return null; }
    if (!Domer.routed && path == 404) { return true; }
    let match = Domer.routeMatch(path);
    Domer.routed = match;
    return match;
  }

  static routeMatch(path) {
    let toMatch = new RegExp(`^${path.replace(/\/:[^\/]*/g, '/([^\/]*)')}\\/*$`);
    let keys = path.split('/:').splice(1);
    let loc = location.pathname;
    loc = loc.substr(-1) !== '/' ? loc + '/' : loc;
    let match = loc.match(toMatch);
    if(!match){ return; }
    let values = (match || []).splice(1).map(x => decodeURIComponent(x));
    let params = keys.map((key, i) => [key, values[i]]);
    Object.keys(this.route).filter(x => !['get', 'set'].includes(x))
      .forEach(key => delete this.route[key]);
    Object.assign(this.route, Object.fromEntries(params));
    return match;
  }

}