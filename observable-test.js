const React = require("react");
const Observable = require("o_0");

function isObservable(o) {
  return typeof o === "function" && typeof o.observe === "function";
}

function isJadeletRoot(o) {
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

function JadeletWrapper({ template, presenter }) {
  const root = template(presenter);
  const forceUpdate = useForceUpdate();
  React.useEffect(() => {
    root.observe(forceUpdate);
    return () => {
      root.stopObserving(forceUpdate);
      root.releaseDependencies();
    };
  });
  const children = root();
  return React.createElement(React.Fragment, {}, children);
}

function createSubRoot(self) {
  const children = [];
  return {
    buffer(o) {
      children.push(o);
    },
    element(tag, _, attrs, childFn) {
      return Observable(() => {
        const subRoot = createSubRoot(self);
        childFn.call(self, subRoot);
        const children = subRoot.root;
        return React.createElement(tag, attrs, children);
      });
    },
    get root() {
      return Observable(() => {
        return children.map(child => (isObservable(child) ? child() : child));
      });
    }
  };
}

function createRoot(self) {
  let buffered = null;
  return Object.create(createSubRoot(self), {
    buffer: {
      value(o) {
        if (buffered !== null) throw "Multiple top level elements.";
        buffered = isJadeletRoot(o) ? o.root : o;
      }
    },
    root: {
      get() {
        return buffered;
      }
    }
  });
}

module.exports = {
  isJadeletRoot,
  JadeletWrapper,
  runtime: createRoot
};
