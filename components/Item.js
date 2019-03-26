const React = require('react');

module.exports = function Item({ item }) {
  return React.createElement('li', {}, item);
}