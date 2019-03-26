import React from 'react';
import { JadeletWrapper } from '../';
import Main from '../templates-out/main';
import MainPresenter from '../presenters/main';

export function Top() {
  const [show, setShow] = React.useState(true);
  const mainPresenterInstance = React.useRef(MainPresenter());
  return (
    <React.Fragment>
      <h1>Hello, world!</h1>
      <button onClick={() => setShow(!show)}>Swap!</button>
      <JadeletWrapper template={Main} presenter={mainPresenterInstance.current} show={show} />
    </React.Fragment>
  );
}