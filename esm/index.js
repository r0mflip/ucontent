import umap from 'umap';
import {CSS, HTML, JS, Raw, SVG} from './ucontent.js';
import {parse} from './utils.js';

const {isArray} = Array;

const cache = umap(new WeakMap);

const content = (template, values, svg, minified) => {
  const {length} = values;
  const updates = cache.get(template) ||
                  cache.set(template, parse(template, length, svg, minified));
  return length ? values.map(update, updates).join('') : updates[0]();
};

const join = (template, values) => (
  template[0] + values.map(chunks, template).join('')
);

const stringify = (template, values) =>
                    isArray(template) ? join(template, values) : template;

const uhtmlParity = fn => {
  // both `.node` and `.for` are for feature parity with uhtml
  // but don't do anything different from regular function call
  fn.node = fn;
  fn.for = () => fn;
  fn.minified = false;
  return fn;
};

/**
 * A tag to represent CSS content.
 * @param {string|string[]|CSS} template The template array passed as tag,
 * or an instance of CSS content, or just some CSS string.
 * @param {any[]} [values] Optional spread arguments passed when used as tag.
 * @returns {CSS} An instance of CSS content.
 */
export const css = (template, ...values) => new CSS(
  stringify(template, values)
);

/**
 * A tag to represent JS content.
 * @param {string|string[]|JS} template The template array passed as tag,
 * or an instance of JS content, or just some JS string.
 * @param {any[]} [values] Optional spread arguments passed when used as tag.
 * @returns {JS} An instance of JS content.
 */
export const js = (template, ...values) => new JS(
  stringify(template, values)
);

/**
 * A tag to represent Raw content.
 * @param {string|string[]|Raw} template The template array passed as tag,
 * or an instance of Raw content, or just some Raw string.
 * @param {any[]} [values] Optional spread arguments passed when used as tag.
 * @returns {Raw} An instance of Raw content.
 */
export const raw = (template, ...values) => new Raw(
  stringify(template, values)
);

/**
 * A tag to represent HTML content.
 * @param {string[]} template The template array passed as tag.
 * The `html` tag can be used only as template literal tag.
 * @param {any[]} values The spread arguments passed when used as tag.
 * @returns {HTML} An instance of HTML content.
 */
export const html = uhtmlParity((template, ...values) => new HTML(
  content(template, values, false, html.minified)
));

/**
 * A tag to represent SVG content.
 * @param {string[]} template The template array passed as tag.
 * The `svg` tag can be used only as template literal tag.
 * @param {any[]} values The spread arguments passed when used as tag.
 * @returns {SVG} An instance of SVG content.
 */
export const svg = uhtmlParity((template, ...values) => new SVG(
  content(template, values, true, svg.minified)
));

/**
 * Render some content via a response.write(content) or via callback(content).
 * @param {object|function} where Where to render the content.
 * If it's an object, it assumes it has a `.write(content)` method.
 * If it's a callback, it will receive the content as string.
 * @param {CSS|HTML|JS|Raw|function} what What to render as content.
 * If it's an instance of CSS, HTML, JS, or Raw, it will be stringified.
 * If it's a callback, it will be invoked and its result will be rendered.
 * The returned value can be an instance of CSS, HTML, JS, Raw, or string.
 * @return {function|object} It returns the result of `callback(content)`
 * invoke, or the the passed first parameter as is (i.e. the `response`)
 */
export const render = (where, what) => {
  const content = (typeof what === 'function' ? what() : what).toString();
  return typeof where === 'function' ?
          where(content) :
          (where.write(content), where);
};

function chunks(value, i) {
  return value + this[i + 1];
}

function update(value, i) {
  return this[i](value);
}
