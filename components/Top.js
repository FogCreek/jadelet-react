import React from 'react';
import { JadeletWrapper } from '../';
import MainTemplate from '../templates-out/main';
import MainPresenter from '../presenters/main';

const mainPresenter = MainPresenter();
const Main = MainTemplate(mainPresenter);

export function Top() {
  const [show, setShow] = React.useState(true);
  return (
    <React.Fragment>
      <h1>Hello, world!</h1>
      <button onClick={() => setShow(!show)}>Swap!</button>
      <Main />
    </React.Fragment>
  );
}