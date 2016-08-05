'use strict';

module.exports = function createGraphDiv(_document) {
    _document = _document || window.document;

    var gd = _document.createElement('div');
    gd.id = 'graph';
    _document.body.appendChild(gd);

    // force the graph to be at position 0,0 no matter what
    gd.style.position = 'fixed';
    gd.style.left = 0;
    gd.style.top = 0;

    return gd;
};
