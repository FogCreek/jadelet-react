const Observable = require('o_0');

function inc(n) {
  return n + 1;
}

module.exports = function MainPresenter() {
  const items = Observable([1, 2, 3, 4]);
  setInterval(() => {
    items(items.map(inc));
  }, 1000);
  return {
    items
  };
};