import React from 'react';

const PresenterContext = React.createContext();

const isJadeletReactComponent = Symbol();

const componentCache = new Map();

function mapAttrs(attrs) {
  const ret = {};
  if (attrs.class) {
    ret.className = attrs.class.join(' ');
    delete attrs.class;
  }
  Object.entries(attrs).forEach(([k, v]) => {
    ret[k] = v[v.length - 1];
  });
  console.log(attrs);
  return attrs;
}

function createRoot() {
  const children = [];
  return {
    buffer(o) {
      children.push(o);
    },
    element(tag, attrFn, childrenFn) {
      return React.createElement(getJadeletComponent(tag), { attrFn, childrenFn });
    },
    get children() {
      return children;
    }
  };
}

function callOn(prop, ...args) {
  return (obj) => obj[prop](...args);
}

function isObservable(o) {
  return typeof o === "function" && typeof o.observe === "function";
}

function incOrWrap(n) {
  return n === Number.MAX_SAFE_INTEGER ? Number.MIN_SAFE_INTEGER : n + 1;
}

function useForceUpdate() {
  const [, update] = React.useState(Number.MIN_SAFE_INTEGER);
  const cb = React.useCallback(() => update(incOrWrap), [update]);
  return cb;
}

function hookGet(obj, fn) {
  return new Proxy(obj, {
    get(_, attr) {
      const value = obj[attr];
      fn(value);
      return value;
    }
  });
}

function getJadeletComponent(tagName) {
  const cached = componentCache.get(tagName);
  if (cached) {
    return cached;
  }
  function Component({ attrFn, childrenFn, ...rest }) {
    const presenter = React.useContext(PresenterContext);
    const observed = React.useMemo(() => new Set(), []);
    const forceUpdate = useForceUpdate();
    React.useEffect(() => {
      observed.forEach(callOn("observe", forceUpdate));
      return () => {
        observed.forEach(callOn("stopObserving", forceUpdate));
      };
    });
    const hookedPresenter = hookGet({ ...presenter, ...rest }, (maybeObservable) => {
      if (isObservable(maybeObservable) && !observed.has(maybeObservable)) {
        observed.add(maybeObservable);
      }
    });
    const attrs = mapAttrs(attrFn.call(hookedPresenter));
    const root = createRoot();
    childrenFn.call(hookedPresenter, root);
    return React.createElement(tagName, attrs, ...root.children.map(child => child[isJadeletReactComponent] ? React.createElement(child) : child));
  }
  Object.defineProperty(Component, "name", {
    value: `Jadelet[${tagName}]`
  });
  componentCache.set(tagName, Component);
  return Component;
}

export function runtime(presenter, fileName) {
  let rootElement;
  return {
    buffer(o) {
      if (rootElement) {
        throw 'Multiple root elements';
      }
      rootElement = o;
    },
    element(tag, attrFn, childrenFn) {
      return { tag, attrFn, childrenFn };
    },
    get root() {
      const { tag, attrFn, childrenFn } = rootElement;
      const JadeletComponent = getJadeletComponent(tag);
      function Component(props) {
        return (
          React.createElement(PresenterContext.Provider, { value: presenter }, 
            React.createElement(JadeletComponent, { attrFn, childrenFn, ...props })
          )
        );
      }
      Object.defineProperties(Component, {
        name: {
          value: `JadeletTemplate[${fileName}]`
        },
        [isJadeletReactComponent]: {
          value: true
        }
      });
      return Component;
    }
  };
}
