const Observable = require('o_0');

function inc(n) {
  return n + 1;
}

module.exports = function MainPresenter() {
  const items = Observable([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
  setInterval(() => {
    items(items.map(inc));
  }, 1);
  return {
    items
  };
};