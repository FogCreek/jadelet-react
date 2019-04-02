import React from 'react';
import { JadeletWrapper } from '../';
import mainTemplate from '../templates-out/main';
import MainPresenter from '../presenters/main';

export function Top() {
  const mainPresenterInstance = React.useRef(MainPresenter());
  const Main = React.useMemo(() => mainTemplate(mainPresenterInstance.current), [mainPresenterInstance.current]);
  return (
    <React.Fragment>
      <h1>Hello, world!</h1>
      <Main />
    </React.Fragment>
  );
}

// const inc = (x) => x + 1;

// export function Top() {
//   const [nums, setNums] = React.useState([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
//   React.useEffect(() => {
//     const timeout = setTimeout(() => {
//       setNums(nums.map(inc));
//     }, 1);
//     return () => clearTimeout(timeout);
//   });
//   return (
//     <React.Fragment>
//       <h1>Hello, world!</h1>
//       <div>
//         <ul>
//           {nums.map((num, idx) => <li key={`item-${idx}`}>{num}</li>)}
//         </ul>
//       </div>
//     </React.Fragment>
//   )
// }