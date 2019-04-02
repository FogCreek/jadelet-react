import path from 'path';
import * as t from '@babel/types';

function isRootAccess(prop) {
  return (node) => t.isMemberExpression(node) && node.object.name === "__root" && node.property.name === prop;
}

const isRootBuffer = isRootAccess("buffer");
const isRootElement = isRootAccess("element");

function isRuntime(node) {
  return t.isMemberExpression(node) && node.property.name === "runtime";
}

export default function JadeletReactPreprocessor() {
  return {
    visitor: {
      CallExpression(path, state) {
        const { node } = path;
        const { arguments: args, callee } = node;
        if (isRuntime(callee)) {
          args[1] = t.stringLiteral(state.filename.substring(state.cwd.length + 1));
        } else if (isRootElement(callee)) {
          node.arguments = [args[0], args[2], args[3]];
          node.arguments[1] = t.functionExpression(null, [], t.blockStatement([t.returnStatement(node.arguments[1])]));
        }
      }
    }
  };
}