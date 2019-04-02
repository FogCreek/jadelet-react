import React from 'react';
import Observable from 'o_0';

function isObservable(o) {
  return typeof o === "function" && typeof o.observe === "function";
}

function incOrWrap(n) {
  return n === Number.MAX_SAFE_INTEGER ? Number.MIN_SAFE_INTEGER : n + 1;
}

function useForceUpdate() {
  const [, update] = React.useState(Number.MIN_SAFE_INTEGER);
  const cb = React.useCallback(() => update(incOrWrap), []);
  return cb;
}

function createRoot() {
  let children = [];
  return {
    buffer(o) {
      children.push(o);
    },
    element(tag, presenter, attrsFn, childrenFn) {
      return { tag, presenter, attrsFn, childrenFn };
    },
    get children() {
      return children;
    }
  };
}

function unwrapObservable(maybeObservable) {
  if (isObservable) {
    return maybeObservable();
  }
  return maybeObservable;
}

function buildChild(child) {
  if (Array.isArray(child)) {
    return buildChildren(child);
  }
  if (isObservable(child)) {
    return buildChild(child());
  }
  if (typeof child === "function") {
    return React.createElement(child);
  }
  return child;
}

function buildChildren(children) {
  return children.map(buildChild);
}

function mapAttrs(attrs) {
  // Todo
  return attrs;
}

function buildJadeletComponent({ tag, presenter, attrsFn, childrenFn }) {
  const root = createRoot();
  const attrsObservable = Observable(attrsFn.bind(presenter));
  const observed = [attrsObservable];
  childrenFn.call(presenter, root);
  const childrenDescriptors = root.children.map((childDescriptor) => {
    if (typeof childDescriptor === "object") {
      return buildJadeletComponent(childDescriptor);
    }
    const ob = Observable(childDescriptor.bind(presenter));
    observed.push(ob);
    return ob;
  });
  const component = () => {
    const forceUpdate = useForceUpdate();
    React.useEffect(() => {
      const cb = () => {
        forceUpdate();
      };
      observed.forEach((observable) => {
        observable.observe(cb);
      });
      return () => {
        observed.forEach((observable) => {
          observable.stopObserving(cb);
        });
      };
    }, []);
    const children = buildChildren(childrenDescriptors);
    return React.createElement(tag, mapAttrs(attrsObservable()), ...children);
  };
  component.displayName = `Jadelet<${tag}>`;
  return component;
}

export function runtime() {
  let rootComponent;
  return {
    buffer(o) {
      if (rootComponent) {
        throw "Multiple root elements";
      }
      rootComponent = buildJadeletComponent(o);
    },
    element(tag, presenter, attrsFn, childrenFn) {
      return { tag, presenter, attrsFn, childrenFn };
    },
    get root() {
      return rootComponent;
    }
  };
}
