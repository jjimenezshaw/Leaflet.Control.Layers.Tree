'use strict';

var layerA = L.tileLayer('');
var layerB = L.tileLayer('');

function baseArray1() {
    return [
        {label: 'Leaf one', name: 'Name Leaf one', layer: L.tileLayer('')},
        {label: 'Leaf two', name: 'Name Leaf two', layer: L.tileLayer('', {idx: 'two'})},
        {
            label: 'Node 1',
            children: [
                {label: 'Leaf 11', name: 'Name Leaf 11', layer: layerA},
                {label: 'Leaf 12', layer: L.tileLayer('')}
            ]
        },
        {label: 'Leaf three', name: 'Name Leaf three', layer: layerB}
    ];
}

function baseArray2() {
    return [
        {label: 'Leaf one', name: 'Name Leaf one', layer: layerA},
        {label: 'Leaf two', name: 'Name Leaf two', layer: layerB},
    ];
}

function baseTree1() {
    return {
        noShow: false,
        label: 'Root node',
        children: baseArray1()
    };
}

var markerO = L.marker([0, 0]);
var markerA = L.marker([40, 0]);
var markerB = L.marker([0, 30]);

function overlaysArray1() {
    return [
        {label: 'Over one', name: 'Name Over one', layer: markerO},
        {label: 'Over two', name: 'Name Over two', layer: L.layerGroup([])},
        {
            label: 'O Node 1',
            children: [
                {label: 'Over 11', name: 'Name Over 11', layer: markerA},
                {label: 'Over 12', layer: L.layerGroup([])}
            ]
        },
        {label: 'Over three', name: 'Name Over three', layer: markerB}
    ]
}

function overlaysTree1() {
    return {
        noShow: false,
        label: 'Root O node',
        children: overlaysArray1()
    };
}

function overlaysArray2() {
    return [
        {label: 'Over A', name: 'Name Over A', layer: markerA},
        {label: 'Over B', name: 'Name Over B', layer: markerB},
    ];
}

function isHidden(el) {
    // https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
    return (el.offsetParent === null)
}

function checkHidden(list, value, first) {
    first = first || 0;
    if (!Array.isArray(value)) {
        var v = value;
        value = [];
        for (var i = 0; i < list.length; i++) value.push(v);
    }
    for (var i = first; i < list.length; i++) {
        isHidden(list[i]).should.be.equal(!!value[i], 'position ' + i);
    }
}

describe('L.Control.Layers.Tree', function() {
    chai.should();
    this.timeout(5000);
    var map;

    beforeEach(function() {
        map && map.remove();
        //map = L.map(document.createElement('div'));
        map = L.map('mapA');
        document.body.appendChild(map._container);
    });
    afterEach(function() {
        //map.remove();
    });

    describe('Functions in place', function() {
        beforeEach(function() {
            map.setView([0, 0], 14);
        });

        it('L.Control.Layers.Tree has correct func', function() {
            L.control.layers.tree.should.be.a('function');
        });
        it('L.control.layers.tree object creation', function() {
            var t = L.control.layers.tree();
            t.should.be.a('object');
        });
    });


    describe('Disabled functions', function() {
        var t = L.control.layers.tree();
        var methods = [t.addBaseLayer, t.addOverlay, t.removeLayer];
        methods.forEach(function(method) {
            (function() {
                method();
            }).should.throw(method.name + ' is disabled');
        });
    });

    describe('Simple base tests', function() {
        beforeEach(function() {
            map.setView([0, 0], 14);
        });

        it('they are there', function() {
            var ctl = L.control.layers.tree(baseTree1(), null,
                {collapsed: false}).addTo(map);
            var inputs = map._container.querySelectorAll('.leaflet-control-layers-base input');
            inputs.length.should.be.equal(5);
            var headers = map._container.querySelectorAll('.leaflet-control-layers-base .leaflet-layerstree-header');
            headers.length.should.be.equal(7);
            checkHidden(headers, false, 0);
            ctl.collapseTree();
            checkHidden(headers, true, 1);
        });
        it('they are accesible on mouseover', function() {
            var ctrl = L.control.layers.tree(baseTree1()).addTo(map);
            var inputs = map._container.querySelectorAll('.leaflet-control-layers-base input');
            inputs.length.should.be.equal(5);
            var headers = map._container.querySelectorAll('.leaflet-control-layers-base .leaflet-layerstree-header');
            headers.length.should.be.equal(7);

            // Nothing visible because the contrl is collapsed
            checkHidden(inputs, true, 0);
            checkHidden(headers, true, 0);

            // mouse over the control to show it.
            happen.once(ctrl._container, {type: 'mouseover'});
            checkHidden(inputs, false, 0);
            checkHidden(headers, false, 0);
            // Hi, let it as you found it.
            happen.once(ctrl._container, {type: 'mouseout'});
        });
    });

    describe('Simple base tests with array', function() {
        beforeEach(function() {
            map.setView([0, 0], 14);
        });

        it('they are accesible on mouseover', function() {
            var ctrl = L.control.layers.tree(baseArray1()).addTo(map);
            var inputs = map._container.querySelectorAll('.leaflet-control-layers-base input');
            inputs.length.should.be.equal(5);
            var headers = map._container.querySelectorAll('.leaflet-control-layers-base .leaflet-layerstree-header');
            headers.length.should.be.equal(7); // The root is hidden, but it is there

            // Nothing visible because the contrl is collapsed
            checkHidden(inputs, true, 0);
            checkHidden(headers, true, 0);

            // mouse over the control to show it.
            happen.once(ctrl._container, {type: 'mouseover'});
            checkHidden(inputs, false, 0);
            checkHidden(headers, false, 1);
            checkHidden(headers, [1, 0, 0, 0, 0, 0, 0], 0); // see, root is hidden!
            // Hi, let it as you found it.
            happen.once(ctrl._container, {type: 'mouseout'});
        });
    });

    describe('Simple overlays tests', function() {
        beforeEach(function() {
            map.setView([0, 0], 1);
        });

        it('they are there', function() {
            var ctl = L.control.layers.tree(null, overlaysTree1(),
                {collapsed: false}).addTo(map);
            var inputs = map._container.querySelectorAll('.leaflet-control-layers-overlays input');
            inputs.length.should.be.equal(5);
            var headers = map._container.querySelectorAll('.leaflet-control-layers-overlays .leaflet-layerstree-header');
            headers.length.should.be.equal(7);
            checkHidden(headers, false, 0);
            ctl.collapseTree(true);
            checkHidden(headers, true, 1);
        });
        it('they are accesible on mouseover', function() {
            var ctrl = L.control.layers.tree(null, overlaysTree1()).addTo(map);
            var inputs = map._container.querySelectorAll('.leaflet-control-layers-overlays input');
            inputs.length.should.be.equal(5);
            var headers = map._container.querySelectorAll('.leaflet-control-layers-overlays .leaflet-layerstree-header');
            headers.length.should.be.equal(7);

            // Nothing visible because the contrl is collapsed
            checkHidden(inputs, true, 0);
            checkHidden(headers, true, 0);

            // mouse over the control to show it.
            happen.once(ctrl._container, {type: 'mouseover'});
            checkHidden(inputs, false, 0);
            checkHidden(headers, false, 0);
            // Hi, let it as you found it.
            happen.once(ctrl._container, {type: 'mouseout'});
        });
    });

    describe('Simple overlays array tests', function() {
        beforeEach(function() {
            map.setView([0, 0], 1);
        });

        it('they are accesible on mouseover', function() {
            var ctrl = L.control.layers.tree(null, overlaysArray1()).addTo(map);
            var inputs = map._container.querySelectorAll('.leaflet-control-layers-overlays input');
            inputs.length.should.be.equal(5);
            var headers = map._container.querySelectorAll('.leaflet-control-layers-overlays .leaflet-layerstree-header');
            headers.length.should.be.equal(7);

            // Nothing visible because the contrl is collapsed
            checkHidden(inputs, true, 0);
            checkHidden(headers, true, 0);

            // mouse over the control to show it.
            happen.once(ctrl._container, {type: 'mouseover'});
            checkHidden(inputs, false, 0);
            checkHidden(headers, false, 1);
            checkHidden(headers, [1, 0, 0, 0, 0, 0, 0], 0);
            // Hi, let it as you found it.
            happen.once(ctrl._container, {type: 'mouseout'});
        });
    });

    describe('Select', function() {
        beforeEach(function() {
            map.setView([0, 0], 14);
        });

        it('sel layer B and A', function() {
            var ctl = L.control.layers.tree(baseTree1(), null, {collapsed: false}).addTo(map);
            var headers = map._container.querySelectorAll('.leaflet-control-layers-base .leaflet-layerstree-header');
            headers.length.should.be.equal(7);
            happen.click(headers[6].querySelector('label'));
            map._layers[L.Util.stamp(layerB)].should.be.equal(layerB);
            happen.click(headers[4].querySelector('label'));
            map._layers[L.Util.stamp(layerA)].should.be.equal(layerA);
        });
    });

    describe('Labels', function() {
        beforeEach(function() {
            map.setView([0, 0], 1);
        });
        it('labels base', function() {
            var ctl = L.control.layers.tree(baseTree1(), null, {collapsed: false}).addTo(map);
            var headers = map._container.querySelectorAll('.leaflet-control-layers-base .leaflet-layerstree-header');
            headers[3].querySelector('.leaflet-layerstree-header-name').outerText.should.be.equal('Node 1');
            headers[4].querySelector('.leaflet-layerstree-header-name').outerText.should.be.equal('Leaf 11');
            headers[6].querySelector('.leaflet-layerstree-header-name').outerText.should.be.equal('Leaf three');
        });
    });

    describe('Expand and collapse', function() {
        beforeEach(function() {
            map.setView([0, 0], 1);
        });

        it('Show only selected', function() {
            var ctrl = L.control.layers.tree(baseTree1(), null, {collapsed: false}).addTo(map);
            map.addLayer(layerB);
            var headers = map._container.querySelectorAll('.leaflet-control-layers-base .leaflet-layerstree-header');
            headers.length.should.be.equal(7);
            checkHidden(headers, false, 0);
            ctrl.collapseTree().expandSelected(false);
            checkHidden(headers, [0, 0, 0, 0, 1, 1, 0], 0);
        });

        it('Collapse', function() {
            var ctrl = L.control.layers.tree(baseTree1(), overlaysTree1(), {collapsed: false}).addTo(map);
            map.addLayer(layerB);
            var headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(14);
            checkHidden(headers, false, 0);
            ctrl.collapseTree();
            checkHidden(headers, [0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0], 0);
            ctrl.collapseTree(true);
            checkHidden(headers, [0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1], 0);
        });

        it('Expand', function() {
            var ctrl = L.control.layers.tree(baseTree1(), overlaysTree1(), {collapsed: false}).addTo(map);
            map.addLayer(layerB);
            var headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(14);
            checkHidden(headers, false, 0);
            ctrl.collapseTree().collapseTree(true);
            ctrl.expandTree();
            checkHidden(headers, [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], 0);
            ctrl.expandTree(true);
            checkHidden(headers, 0, 0);
        });
    });

    describe('Names', function() {
        beforeEach(function() {
            map.setView([0, 0], 1);
        });
        it('Named Toogle', function() {
            var ctrl = L.control.layers.tree(baseTree1(), overlaysTree1(), {namedToggle: true}).addTo(map);
            map.addLayer(layerB);
            var toggle = map._container.querySelector('.leaflet-control-layers-toggle');
            toggle.innerHTML.should.be.equal('Name Leaf three');
            var inputs = map._container.querySelectorAll('.leaflet-control-layers-list input');
            happen.click(inputs[0]);
            toggle.innerHTML.should.be.equal('Name Leaf one');
            happen.click(inputs[2]);
            toggle.innerHTML.should.be.equal('Name Leaf 11');
            happen.click(inputs[8]);
            toggle.innerHTML.should.be.equal('Name Leaf 11');
        });
    });

    describe('Symbols', function() {
        beforeEach(function() {
            map.setView([0, 0], 1);
        });
        it('Defaults', function() {
            var ctrl = L.control.layers.tree(baseTree1(), overlaysTree1(), {collapsed: false}).addTo(map);
            var items = map._container.querySelectorAll('.leaflet-layerstree-closed');
            items.length.should.be.equal(14);
            for (var i = 0; i < items.length; i++) {
                items[i].innerHTML.should.be.equal('+');
            }
            items = map._container.querySelectorAll('.leaflet-layerstree-opened');
            items.length.should.be.equal(14);
            for (var i = 0; i < items.length; i++) {
                items[i].innerHTML.should.be.equal('−');
            }
            items = map._container.querySelectorAll('.leaflet-layerstree-header-space');
            items.length.should.be.equal(14);
            for (var i = 0; i < items.length; i++) {
                items[i].innerHTML.should.be.equal(' ');
            }
        });
        it('Closed', function() {
            var symbol = '^';
            var ctrl = L.control.layers.tree(baseTree1(), overlaysTree1(), {collapsed: false, closedSymbol: symbol}).addTo(map);
            map.addLayer(layerB);
            var items = map._container.querySelectorAll('.leaflet-layerstree-closed');
            items.length.should.be.equal(14);
            for (var i = 0; i < items.length; i++) {
                items[i].innerHTML.should.be.equal(symbol);
            }
        });
        it('Opened', function() {
            var symbol = 'v';
            var ctrl = L.control.layers.tree(baseTree1(), overlaysTree1(), {collapsed: false, openedSymbol: symbol}).addTo(map);
            var items = map._container.querySelectorAll('.leaflet-layerstree-opened');
            items.length.should.be.equal(14);
            for (var i = 0; i < items.length; i++) {
                items[i].innerHTML.should.be.equal(symbol);
            }
        });
        it('Space', function() {
            var symbol = '_*_';
            var ctrl = L.control.layers.tree(baseTree1(), overlaysTree1(), {collapsed: false, spaceSymbol: symbol}).addTo(map);
            var items = map._container.querySelectorAll('.leaflet-layerstree-header-space');
            items.length.should.be.equal(14);
            for (var i = 0; i < items.length; i++) {
                items[i].innerHTML.should.be.equal(symbol);
            }
        });
    });

    describe('Selector back', function() {
        beforeEach(function() {
            map.setView([0, 0], 1);
        });
        it('Default', function() {
            var ctrl = L.control.layers.tree(baseTree1(), overlaysTree1(), {collapsed: false}).addTo(map);
            var headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(14);
            for (var h = 0; h < headers.length; h++) {
                var things = [];
                var keys = ['closed', 'opened', 'space', 'label']
                var items = headers[h].querySelectorAll('span, label, div');
                for (var i = 0; i < items.length; i++) {
                    keys.forEach(function(key) {
                        if (items[i].className.indexOf(key) > 0) {
                            things.push(key);
                        }
                    });
                }
                things[2].should.be.equal('space');
                things[3].should.be.equal('label');
            }
        });

        it('Back', function() {
            var ctrl = L.control.layers.tree(baseTree1(), overlaysTree1(), {collapsed: false, selectorBack: true}).addTo(map);
            var headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(14);
            for (var h = 0; h < headers.length; h++) {
                var things = [];
                var keys = ['closed', 'opened', 'space', 'label']
                var items = headers[h].querySelectorAll('span, label, div');
                for (var i = 0; i < items.length; i++) {
                    keys.forEach(function(key) {
                        if (items[i].className.indexOf(key) > 0) {
                            things.push(key);
                        }
                    });
                }
                things[1].should.be.equal('space');
                things[0].should.be.equal('label');
            }
        });
    });

    describe('Expand and collapse all', function() {
        beforeEach(function() {
            map.setView([0, 0], 1);
        });
        it('expandAll', function() {
            var ctrl = L.control.layers.tree(baseTree1(), overlaysTree1(), {collapsed: false, expandAll: 'exp'}).addTo(map);
            ctrl.collapseTree().collapseTree(true);
            var headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(14);
            checkHidden(headers, [0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1], 0);
            var ct = map._container.querySelectorAll('.leaflet-layerstree-expand-collapse');
            ct.length.should.be.equal(2);
            happen.click(ct[0]);
            checkHidden(headers, [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], 0);
            happen.click(ct[1]);
            checkHidden(headers, false, 0);
        });
        it('collapseAll', function() {
            var ctrl = L.control.layers.tree(baseTree1(), overlaysTree1(), {collapsed: false, collapseAll: 'col'}).addTo(map);
            ctrl.expandTree().expandTree(true);
            var headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(14);
            checkHidden(headers, false, 0);
            var ct = map._container.querySelectorAll('.leaflet-layerstree-expand-collapse');
            ct.length.should.be.equal(2);
            happen.click(ct[0]);
            checkHidden(headers, [0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0], 0);
            happen.click(ct[1]);
            checkHidden(headers, [0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1], 0);
        });
        it('Empties', function() {
            var ctrl = L.control.layers.tree(baseTree1(), overlaysTree1(), {collapsed: false, collapseAll: '', expandAll: ''}).addTo(map);
            var ct = map._container.querySelectorAll('.leaflet-layerstree-expand-collapse');
            ct.length.should.be.equal(0);
        });
        it('All', function() {
            var ctrl = L.control.layers.tree(baseTree1(), overlaysTree1(), {collapsed: false, collapseAll: 'col', expandAll: 'exp'}).addTo(map);
            var ct = map._container.querySelectorAll('.leaflet-layerstree-expand-collapse');
            ct.length.should.be.equal(4);
        });
        it('Arrays', function() {
            var ctrl = L.control.layers.tree(baseArray1(), overlaysArray1(), {collapsed: false, collapseAll: 'col'}).addTo(map);
            var ct = map._container.querySelectorAll('.leaflet-layerstree-expand-collapse');
            var headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(14);
            checkHidden(headers, [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0], 0);
            var ct = map._container.querySelectorAll('.leaflet-layerstree-expand-collapse');
            ct.length.should.be.equal(2);
            happen.click(ct[0]);
            checkHidden(headers, [1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0], 0);
            happen.click(ct[1]);
            checkHidden(headers, [1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0], 0);
        });
    });

    describe('Reset trees', function() {
        beforeEach(function() {
            map.setView([0, 0], 1);
        });
        it('case 1', function() {
            var ctl = L.control.layers.tree(baseArray2(), null, {collapsed: false}).addTo(map);
            map.addLayer(layerB);
            map._layers[L.Util.stamp(layerB)].should.be.equal(layerB);
            var headers = map._container.querySelectorAll('.leaflet-control-layers-base .leaflet-layerstree-header');
            headers.length.should.be.equal(3); // including the hidden root
            ctl.setBaseTree(baseTree1());
            map._layers[L.Util.stamp(layerB)].should.be.equal(layerB);

            headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(7)
            happen.click(headers[4].querySelector('label'));
            map._layers[L.Util.stamp(layerA)].should.be.equal(layerA);
        });
        it('case 2', function() {
            var ctl = L.control.layers.tree(baseArray2(), overlaysTree1(), {collapsed: false}).addTo(map);
            map.addLayer(layerB);
            map._layers[L.Util.stamp(layerB)].should.be.equal(layerB);
            var headers = map._container.querySelectorAll('.leaflet-control-layers-base .leaflet-layerstree-header');
            headers.length.should.be.equal(3); // including the hidden root
            ctl.setBaseTree(baseTree1());
            map._layers[L.Util.stamp(layerB)].should.be.equal(layerB);

            headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(14)
        });
        it('case 3', function() {
            var ctl = L.control.layers.tree(baseTree1(), overlaysTree1(), {collapsed: false}).addTo(map);
            map.addLayer(layerB);
            map.addLayer(markerA);
            map._layers[L.Util.stamp(layerB)].should.be.equal(layerB);
            map._layers[L.Util.stamp(markerA)].should.be.equal(markerA);
            var headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(14);
            var inputs = map._container.querySelectorAll('.leaflet-layerstree-header input');
            inputs.length.should.be.equal(10);
            inputs[4].checked.should.be.true;
            inputs[7].checked.should.be.true;

            ctl.setBaseTree(baseArray2());
            map._layers[L.Util.stamp(layerB)].should.be.equal(layerB);
            map._layers[L.Util.stamp(markerA)].should.be.equal(markerA);

            headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(10)
            inputs = map._container.querySelectorAll('.leaflet-layerstree-header input');
            inputs.length.should.be.equal(7);
            inputs[1].checked.should.be.true;
            inputs[4].checked.should.be.true;

            ctl.setOverlayTree(overlaysArray2());
            map._layers[L.Util.stamp(layerB)].should.be.equal(layerB);
            map._layers[L.Util.stamp(markerA)].should.be.equal(markerA);

            headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(6)
            inputs = map._container.querySelectorAll('.leaflet-layerstree-header input');
            inputs.length.should.be.equal(4);
            inputs[1].checked.should.be.true;
            inputs[2].checked.should.be.true;
        });
        it('case 4', function() {
            var ctl = L.control.layers.tree(baseTree1(), overlaysTree1(), {collapsed: false}).addTo(map);
            map.addLayer(layerB);
            map.addLayer(markerO);
            map._layers[L.Util.stamp(layerB)].should.be.equal(layerB);
            map._layers[L.Util.stamp(markerO)].should.be.equal(markerO);

            ctl.setOverlayTree(overlaysArray2());
            map._layers[L.Util.stamp(layerB)].should.be.equal(layerB);
            map._layers[L.Util.stamp(markerO)].should.be.equal(markerO);

            var inputs = map._container.querySelectorAll('.leaflet-layerstree-header input');
            inputs.length.should.be.equal(7);
            inputs[5].checked.should.be.false;
            inputs[6].checked.should.be.false;
        });
    });
});
