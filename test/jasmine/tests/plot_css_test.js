var Plotly = require('@lib/index');

var cssModule = require('@src/lib/plotcss_utils');
var plotcss = require('@build/plotcss');

var createGraphDiv = require('../assets/create_graph_div');
var destroyGraphDiv = require('../assets/destroy_graph_div');

describe('css injection', function() {

    function plot(target) {
        return Plotly.plot(target, [{
            x: [1, 2, 3, 4, 5],
            y: [1, 2, 4, 8, 16],
        }], {
            margin: { t: 0 }
        });
    }

    function loopOverRules(_document, assertion) {
        var allSelectors = getAllRuleSelectors(_document);

        for(var selector in plotcss) {
            var fullSelector = cssModule.buildFullSelector(selector),
                firstIndex = allSelectors.indexOf(fullSelector);

            assertion(allSelectors, fullSelector, firstIndex);
        }
    }

    function assertClearence(allSelectors, fullSelector) {
        expect(allSelectors.indexOf(fullSelector)).toEqual(-1);
    }

    function assertPresence(allSelectors, fullSelector) {
        expect(allSelectors.indexOf(fullSelector)).not.toEqual(-1);
    }

    function assertUniqueness(allSelectors, fullSelector, firstIndex) {
        expect(allSelectors.indexOf(fullSelector, firstIndex + 1)).toEqual(-1);
    }

    it('inserts styles on initial plot', function(done) {
        loopOverRules(document, assertClearence);

        var gd = createGraphDiv();

        plot(gd).then(function() {
            expect(gd._document).toBe(window.document);
            loopOverRules(gd._document, assertPresence);

            deletePlotCSSRules(gd._document);
            destroyGraphDiv();
            done();
        });
    });

    it('inserts styles in a child window document', function(done) {
        loopOverRules(document, assertClearence);

        var childWindow = window.open('about:blank', 'popoutWindow', '');
        var gd = createGraphDiv(childWindow.document);

        plot(gd).then(function() {
            expect(gd._document).toBe(childWindow.document);
            loopOverRules(gd._document, assertPresence);

            deletePlotCSSRules(gd._document);
            childWindow.document.body.removeChild(gd);
            childWindow.close();
            done();
        });
    });

    it('does not insert duplicate styles', function(done) {
        loopOverRules(document, assertClearence);

        var gd = createGraphDiv();

        plot(gd).then(function() {

            // plot again so injectStyles gets called again
            return plot(gd);
        }).then(function() {
            expect(gd._document).toBe(window.document);
            loopOverRules(gd._document, assertUniqueness);

            deletePlotCSSRules(gd._document);
            destroyGraphDiv();
            done();
        });
    });
});

// Gets all the rules currently attached to the document
// inspired by http://stackoverflow.com/a/23613052/4068492
function getAllRuleSelectors(_document) {
    var allSelectors = [];

    for(var i = 0; i < _document.styleSheets.length; i++) {
        var styleSheet = _document.styleSheets[i];

        try {
            if(!styleSheet.cssRules) continue;
        }
        catch(e) {
            if(e.name !== 'SecurityError') throw e;
            continue;
        }

        for(var j = 0; j < styleSheet.cssRules.length; j++) {
            var cssRule = styleSheet.cssRules[j];

            allSelectors.push(cssRule.selectorText);
        }
    }

    return allSelectors;
}

// Deletes all rules defined in plotcss
// inspired by http://stackoverflow.com/a/23613052/4068492
function deletePlotCSSRules(_document) {
    for(var selector in plotcss) {
        var fullSelector = cssModule.buildFullSelector(selector);

        for(var i = 0; i < _document.styleSheets.length; i++) {
            var styleSheet = _document.styleSheets[i];
            var selectors = [];

            try {
                if(!styleSheet.cssRules) continue;
            }
            catch(e) {
                if(e.name !== 'SecurityError') throw e;
                continue;
            }

            for(var j = 0; j < styleSheet.cssRules.length; j++) {
                var cssRule = styleSheet.cssRules[j];

                selectors.push(cssRule.selectorText);
            }

            var selectorIndex = selectors.indexOf(fullSelector);

            if(selectorIndex !== -1) {
                styleSheet.deleteRule(selectorIndex);
                break;
            }
        }
    }
}
