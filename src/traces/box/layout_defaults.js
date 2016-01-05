'use strict';

var Plots = require('../../plots/plots');
var Lib = require('../../lib');

module.exports = function supplyLayoutDefaults(layoutIn, layoutOut, fullData) {
    function coerce(attr, dflt) {
        return Lib.coerce(layoutIn, layoutOut, boxes.layoutAttributes, attr, dflt);
    }

    var hasBoxes;
    for(var i = 0; i < fullData.length; i++) {
        if(Plots.traceIs(fullData[i], 'box')) {
            hasBoxes = true;
            break;
        }
    }
    if(!hasBoxes) return;

    coerce('boxmode');
    coerce('boxgap');
    coerce('boxgroupgap');
};
