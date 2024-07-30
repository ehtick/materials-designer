"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _path = _interopRequireDefault(require("path"));
var _utils = require("../utils");
var _file = require("../utils/file");
var _table = require("../utils/table");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _default() {
  this.Then(/^material with following data does not exist in state$/, function (table) {
    const config = (0, _table.parseTable)(table, this)[0];
    // eslint-disable-next-line no-unused-vars
    const material = JSON.parse((0, _file.readFileSync)(_path.default.resolve(__dirname, "../../fixtures", config.path)));
    (0, _utils.retry)(() => {
      const materials = exabrowser.execute(() => {
        return window.MDContainer.store.getState().present.materials.map(m => m.toJSON());
      }).value;
      (0, _utils.shallowDeepAlmostEqual)(undefined, materials[config.index - 1]);
    }, {
      retries: 5
    });
  });
}