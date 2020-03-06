'use strict';
const {CSS, JS, HTML, Raw} = require('./classes.js');
const {join, parse} = require('./utils.js');

const cache = new WeakMap;

const css = (template, ...values) => new CSS(join(template, values));
exports.css = css;

const js = (template, ...values) => new JS(join(template, values));
exports.js = js;

const html = (template, ...values) => {
  const {length} = values;
  const updates = cache.get(template) || parse(cache, template, length);
  return new HTML(
    length ?
      values.map(update, updates).join('') :
      updates[0]()
  );
};
exports.html = html;

const raw = (template, ...values) => new Raw(join(template, values));
exports.raw = raw;

// this has no meaning here, but it's a "nice to have" in case a library uses
// html, and svg functions passed along so that it works with µhtml or others
const svg = (template, ...values) => html(template, ...values);
exports.svg = svg;

function update(value, i) {
  return this[i](value);
}
