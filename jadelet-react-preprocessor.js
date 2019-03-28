import * as t from '@babel/types';

export default function JadeletReactPreprocessor() {
  return {
    visitor: {
      CallExpression(path) {
        const { node } = path;
        const { arguments: args, callee } = node;
        if (t.isMemberExpression(callee) && callee.object.name === "__root" && callee.property.name === "element") {
          const props = args[2];
          args[2] = t.functionExpression(null, [], t.blockStatement([t.returnStatement(props)]));
        }
      }
    }
  };
}