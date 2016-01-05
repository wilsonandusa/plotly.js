'use strict';

var Plotly = require('../../plotly');
var Color = require('../../components/color');

module.exports = function hoverPoints(pointData, xval, yval, hovermode) {
    // closest mode: handicap box plots a little relative to others
    var cd = pointData.cd,
        trace = cd[0].trace,
        t = cd[0].t,
        xa = pointData.xa,
        ya = pointData.ya,
        closeData = [],
        dx, dy, distfn, boxDelta,
        posLetter, posAxis, posText,
        val, valLetter, valAxis;

    // adjust inbox w.r.t. to calculate box size
    boxDelta = (hovermode==='closest') ? 2.5*t.bdPos : t.bdPos;

    if (trace.orientation==='h') {
        dx = function(di){
            return Plotly.Fx.inbox(di.min - xval, di.max - xval);
        };
        dy = function(di){
            var pos = di.pos + t.bPos - yval;
            return Plotly.Fx.inbox(pos - boxDelta, pos + boxDelta);
        };
        posLetter = 'y';
        posAxis = ya;
        valLetter = 'x';
        valAxis = xa;
    } else {
        dx = function(di){
            var pos = di.pos + t.bPos - xval;
            return Plotly.Fx.inbox(pos - boxDelta, pos + boxDelta);
        };
        dy = function(di){
            return Plotly.Fx.inbox(di.min - yval, di.max - yval);
        };
        posLetter = 'x';
        posAxis = xa;
        valLetter = 'y';
        valAxis = ya;
    }

    distfn = Plotly.Fx.getDistanceFunction(hovermode, dx, dy);
    Plotly.Fx.getClosest(cd, distfn, pointData);

    // skip the rest (for this trace) if we didn't find a close point
    if(pointData.index===false) return;

    // create the item(s) in closedata for this point

    // the closest data point
    var di = cd[pointData.index],
        lc = trace.line.color,
        mc = (trace.marker||{}).color;
    if(Color.opacity(lc) && trace.line.width) pointData.color = lc;
    else if(Color.opacity(mc) && trace.boxpoints) pointData.color = mc;
    else pointData.color = trace.fillcolor;

    pointData[posLetter+'0'] = posAxis.c2p(di.pos + t.bPos - t.bdPos, true);
    pointData[posLetter+'1'] = posAxis.c2p(di.pos + t.bPos + t.bdPos, true);

    posText = Plotly.Axes.tickText(posAxis, posAxis.c2l(di.pos), 'hover').text;
    pointData[posLetter+'LabelVal'] = di.pos;

    // box plots: each "point" gets many labels
    var usedVals = {},
        attrs = ['med','min','q1','q3','max'],
        attr,
        pointData2;
    if(trace.boxmean) attrs.push('mean');
    if(trace.boxpoints) [].push.apply(attrs,['lf', 'uf']);

    for (var i=0; i<attrs.length; i++) {
        attr = attrs[i];

        if(!(attr in di) || (di[attr] in usedVals)) continue;
        usedVals[di[attr]] = true;

        // copy out to a new object for each value to label
        val = valAxis.c2p(di[attr], true);
        pointData2 = Plotly.Lib.extendFlat({}, pointData);
        pointData2[valLetter+'0'] = pointData2[valLetter+'1'] = val;
        pointData2[valLetter+'LabelVal'] = di[attr];
        pointData2.attr = attr;

        if(attr==='mean' && ('sd' in di) && trace.boxmean==='sd') {
            pointData2[valLetter+'err'] = di.sd;
        }
        pointData.name = ''; // only keep name on the first item (median)
        closeData.push(pointData2);
    }
    return closeData;
};
