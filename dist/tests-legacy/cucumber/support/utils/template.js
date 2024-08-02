"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderJinjaTemplate = renderJinjaTemplate;
var _swig = _interopRequireDefault(require("swig"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// eslint-disable-next-line import/no-unresolved

/**
 * @summary Renders a template with given context.
 * @param content {String} template string.
 * @param context {Object} context to render template with.
 * @returns {String}
 */
function renderJinjaTemplate(content) {
  let context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return _swig.default.compile(content)(context);
}