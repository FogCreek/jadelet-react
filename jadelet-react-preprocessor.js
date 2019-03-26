import { parse } from '@babel/parser';
import * as t from '@babel/types';

export default function JadeletReactPreprocessor() {
  return {
    visitor: {
      Program(path, { file }) {
        path.node.body.unshift(
          t.importDeclaration(
            [
              t.importSpecifier(
                t.identifier('runtime'),
                t.identifier('runtime')
              ),
              t.importSpecifier(
                t.identifier('useForceUpdate'),
                t.identifier('useForceUpdate')
              )
            ],
            t.stringLiteral('../')
          )
        );
      },
      ExpressionStatement(path) {
        if (!t.isAssignmentExpression(path.node.expression)) return;
        const { left, right } = path.node.expression;
        if (
          t.isMemberExpression(left) &&
          left.object.name === "module" &&
          left.property.name === "exports" &&
          t.isFunctionExpression(right)
        ) {
          path.replaceWith(
            t.exportDefaultDeclaration(
              t.functionDeclaration(
                t.identifier('template'),
                right.params,
                right.body,
                right.generator,
                right.async
              )
            )
          );
          path.insertAfter(parse(`
            export function ReactWrapper(props) {
              const presenter = Presenter();
              const root = template({ ...presenter, ...props });
              const forceUpdate = useForceUpdate();
              React.useEffect(() => {
                root.observed.forEach(observable => observable.observe(forceUpdate));
                return () => {
                  root.observed.forEach(observable => observable.stopObserving(forceUpdate));
                };
              });
              return root.root;
            }
          `, { sourceType: 'module', plugins: [] }).program.body);
        }
      }
    }
  };
}