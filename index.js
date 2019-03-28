import React from 'react';

function isObservable(o) {
  return typeof o === "function" && typeof o.observe === "function";
}

export function isJadeletRoot(o) {
  return (
    typeof o === "object" &&
    typeof o.children === "object" &&
    o.observed instanceof Set
  );
}

function incOrWrap(n) {
  return n === Number.MAX_SAFE_INTEGER ? Number.MIN_SAFE_INTEGER : n + 1;
}

function useForceUpdate() {
  const [, update] = React.useState(Number.MIN_SAFE_INTEGER);
  const cb = React.useCallback(() => update(incOrWrap), [update]);
  return cb;
}

export function JadeletWrapper({ template, presenter, ...rest }) {
  const root = template({ ...presenter, ...rest });
  const forceUpdate = useForceUpdate();
  React.useEffect(() => {
    root.observed.forEach(observable => observable.observe(forceUpdate));
    return () => {
      root.observed.forEach(observable => observable.stopObserving(forceUpdate));
    };
  });
  return React.createElement(React.Fragment, {}, ...root.children);
}

function createSubRoot(rootProto, self) {
  const root = Object.create(rootProto, {
    children: {
      value: []
    }
  });
  return {
    buffer(o) {
      if (isJadeletRoot(o)) {
        Array.from(o.observed).forEach((observable) => {
          root.observed.add(observable);
        });
        o = o.children[0];
      }
      root.children.push(o);
    },
    element(tag, _, attrs, childFn) {
      const subRoot = createSubRoot(rootProto, self);
      childFn.call(self, subRoot);
      return React.createElement(tag, attrs, ...subRoot.root.children);
    },
    get root() {
      return root;
    }
  };
}

export function runtime(self) {
  const rootProto = {
    observed: new Set()
  };
  const selfProxy = new Proxy(self, {
    get(target, prop) {
      const v = target[prop];
      if (isObservable(v)) {
        rootProto.observed.add(v);
      }
      return v;
    }
  });
  let component;
  return {
    buffer(o) {
      if (rootElement) {
        throw "Multiple root elements";
      }
      rootElement = o;
    },
    element(tag, _, attrs, childFn) {
      return { tag, attrs, childFn };
    }
  };
  return createSubRoot(rootProto, selfProxy);
}
