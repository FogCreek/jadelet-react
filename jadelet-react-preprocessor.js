import * as t from '@babel/types';

function isRootAccess(prop) {
  return (node) => t.isMemberExpression(node) && node.object.name === "__root" && node.property.name === prop;
}

const isRootBuffer = isRootAccess("buffer");
const isRootElement = isRootAccess("element");

function isModuleExports(node) {
  return t.isMemberExpression(node) && node.object.name === "module" && node.property.name === "exports";
}

export default function JadeletReactPreprocessor() {
  return {
    visitor: {
      CallExpression(path) {
        const { node } = path;
        const { arguments: args, callee } = node;
        if (isRootElement(callee)) {
          const props = args[2];
          args[2] = t.functionExpression(null, [], t.blockStatement([t.returnStatement(props)]));
        } else if (isRootBuffer(callee) && (!t.isCallExpression(args[0]) || !isRootElement(args[0].callee))) {
          args[0] = t.functionExpression(null, [], t.blockStatement([t.returnStatement(args[0])]));
        }
      },
      AssignmentExpression(path) {
        if (isModuleExports(path.node.left)) {
          path.node.right.params.push(t.identifier('props'));
        }
      }
    }
  };
}