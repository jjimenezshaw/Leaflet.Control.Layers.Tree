'use strict';

const should = chai.should();

const layerA = new L.TileLayer('');
const layerB = new L.TileLayer('');

function baseArray1() {
    return [
        {label: 'Leaf one', name: 'Name Leaf one', layer: new L.TileLayer('')},
        {label: 'Leaf two', name: 'Name Leaf two', layer: new L.TileLayer('', {idx: 'two'})},
        {
            label: 'Node 1',
            children: [
                {label: 'Leaf 11', name: 'Name Leaf 11', layer: layerA},
                {label: 'Leaf 12', layer: new L.TileLayer('')},
            ],
        },
        {label: 'Leaf three', name: 'Name Leaf three', layer: layerB},
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
        children: baseArray1(),
    };
}

const markerO = new L.Marker([0, 0]);
const markerA = new L.Marker([40, 0]);
const markerB = new L.Marker([0, 30]);
const markerC = new L.Marker([0, 20]);

function overlaysArray1() {
    return [
        {label: 'Over one', name: 'Name Over one', layer: markerO},
        {label: 'Over two', name: 'Name Over two', layer: new L.LayerGroup([])},
        {
            label: 'O Node 1',
            children: [
                {label: 'Over 11', name: 'Name Over 11', layer: markerA},
                {label: 'Over 12', layer: new L.LayerGroup([])},
            ],
        },
        {label: 'Over three', name: 'Name Over three', layer: markerB},
    ];
}

function overlaysArraySelectAll(collapsed1, collapsed2) {
    return [
        {label: 'Over one', name: 'Name Over one', layer: markerO},
        {label: 'Over two', name: 'Name Over two', layer: new L.LayerGroup([])},
        {
            label: 'O Node 1',
            selectAllCheckbox: true,
            collapsed: collapsed1,
            children: [
                {label: 'Over 11', name: 'Name Over 11', layer: markerA},
                {label: 'Over 12', layer: new L.LayerGroup([])},
                {
                    label: '1 Node 1',
                    selectAllCheckbox: 'my title',
                    collapsed: collapsed2,
                    children: [
                        {label: 'Over 21', name: 'Name Over 21', layer: markerC},
                        {label: 'Over 22', layer: new L.LayerGroup([])},
                    ],
                },
            ],
        },
        {label: 'Over three', name: 'Name Over three', layer: markerB},
    ];
}

function overlaysArrayEventedClasses(callbackSel, callbackUnsel) {
    return [
        {label: 'Over one', name: 'Name Over one', layer: markerO},
        {label: 'Over two', name: 'Name Over two', layer: new L.LayerGroup([])},
        {
            label: '<span class="sel">Sel</span> <span class="unsel">Unsel</span> O Node 1',
            eventedClasses: [
                {className: 'sel', selectAll: callbackSel ? callbackSel : true},
                {className: 'unsel', selectAll: callbackUnsel ? callbackUnsel : false},
            ],
            children: [
                {label: 'Over 11', name: 'Name Over 11', layer: markerA},
                {label: 'Over 12', layer: new L.LayerGroup([])},
                {
                    label: '<span class="sel">Sel</span> <span class="unsel">Unsel</span> 1 Node 1',
                    eventedClasses: [
                        {className: 'sel', selectAll: callbackSel ? callbackSel : true},
                        {className: 'unsel', selectAll: callbackUnsel ? callbackUnsel : false},
                    ],
                    children: [
                        {label: 'Over 21', name: 'Name Over 21', layer: markerC},
                        {label: 'Over 22', layer: new L.LayerGroup([])},
                    ],
                },
            ],
        },
        {label: 'Over three', name: 'Name Over three', layer: markerB},
    ];
}

function overlaysTree1() {
    return {
        noShow: false,
        label: 'Root O node',
        children: overlaysArray1(),
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
    return (el.offsetParent === null);
}

function checkHidden(list, value, first) {
    first = first || 0;
    if (!Array.isArray(value)) {
        const v = value;
        value = [];
        for (const _i in list) value.push(v);
    }
    for (let j = first; j < list.length; j++) {
        isHidden(list[j]).should.be.equal(!!value[j], 'position ' + j);
    }
}

describe('L.Control.Layers.Tree', function() {
    this.timeout(5000);
    let map;

    beforeEach(function() {
        map?.remove();
        map = new L.Map('map');
        document.body.appendChild(map._container);
    });

    describe('Functions in place', function() {
        beforeEach(function() {
            map.setView([0, 0], 14);
        });

        it('L.Control.Layers.Tree has correct func', function() {
            L.Control.Layers.Tree.should.be.a('function');
        });
        it('L.control.layers.tree object creation', function() {
            const t = new L.Control.Layers.Tree();
            t.should.be.a('object');
        });
    });


    describe('Disabled functions', function() {
        const t = new L.Control.Layers.Tree();
        const methods = [t.addBaseLayer, t.addOverlay, t.removeLayer];
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
            const ctl = new L.Control.Layers.Tree(baseTree1(), null,
                {collapsed: false}).addTo(map);
            const inputs = map._container.querySelectorAll('.leaflet-control-layers-base input');
            inputs.length.should.be.equal(5);
            const headers = map._container.querySelectorAll('.leaflet-control-layers-base .leaflet-layerstree-header');
            headers.length.should.be.equal(7);
            checkHidden(headers, false, 0);
            ctl.collapseTree();
            checkHidden(headers, true, 1);
        });
        it('they are accessible on mouseover', function() {
            const ctrl = new L.Control.Layers.Tree(baseTree1()).addTo(map);
            const inputs = map._container.querySelectorAll('.leaflet-control-layers-base input');
            inputs.length.should.be.equal(5);
            const headers = map._container.querySelectorAll('.leaflet-control-layers-base .leaflet-layerstree-header');
            headers.length.should.be.equal(7);

            // Nothing visible because the control is collapsed
            checkHidden(inputs, true, 0);
            checkHidden(headers, true, 0);

            // mouse over the control to show it.
            happen.once(ctrl._container, MOVE_OVER_TYPE);
            checkHidden(inputs, false, 0);
            checkHidden(headers, false, 0);
            // Hi, let it as you found it.
            happen.once(ctrl._container, MOVE_OUT_TYPE);
        });
    });

    describe('Simple base tests with array', function() {
        beforeEach(function() {
            map.setView([0, 0], 14);
        });

        it('they are accessible on mouseover', function() {
            const ctrl = new L.Control.Layers.Tree(baseArray1()).addTo(map);
            const inputs = map._container.querySelectorAll('.leaflet-control-layers-base input');
            inputs.length.should.be.equal(5);
            const headers = map._container.querySelectorAll('.leaflet-control-layers-base .leaflet-layerstree-header');
            headers.length.should.be.equal(7); // The root is hidden, but it is there

            // Nothing visible because the control is collapsed
            checkHidden(inputs, true, 0);
            checkHidden(headers, true, 0);

            // mouse over the control to show it.
            happen.once(ctrl._container, MOVE_OVER_TYPE);
            checkHidden(inputs, false, 0);
            checkHidden(headers, false, 1);
            checkHidden(headers, [1, 0, 0, 0, 0, 0, 0], 0); // see, root is hidden!
            // Hi, let it as you found it.
            happen.once(ctrl._container, MOVE_OUT_TYPE);
        });
    });

    describe('Simple overlays tests', function() {
        beforeEach(function() {
            map.setView([0, 0], 1);
        });

        it('they are there', function() {
            const ctl = new L.Control.Layers.Tree(null, overlaysTree1(),
                {collapsed: false}).addTo(map);
            const inputs = map._container.querySelectorAll('.leaflet-control-layers-overlays input');
            inputs.length.should.be.equal(5);
            const headers = map._container.querySelectorAll('.leaflet-control-layers-overlays .leaflet-layerstree-header');
            headers.length.should.be.equal(7);
            checkHidden(headers, false, 0);
            ctl.collapseTree(true);
            checkHidden(headers, true, 1);
        });
        it('they are accessible on mouseover', function() {
            const ctrl = new L.Control.Layers.Tree(null, overlaysTree1()).addTo(map);
            const inputs = map._container.querySelectorAll('.leaflet-control-layers-overlays input');
            inputs.length.should.be.equal(5);
            const headers = map._container.querySelectorAll('.leaflet-control-layers-overlays .leaflet-layerstree-header');
            headers.length.should.be.equal(7);

            // Nothing visible because the control is collapsed
            checkHidden(inputs, true, 0);
            checkHidden(headers, true, 0);

            // mouse over the control to show it.
            happen.once(ctrl._container, MOVE_OVER_TYPE);
            checkHidden(inputs, false, 0);
            checkHidden(headers, false, 0);
            // Hi, let it as you found it.
            happen.once(ctrl._container, MOVE_OUT_TYPE);
        });
    });

    describe('Simple overlays array tests', function() {
        beforeEach(function() {
            map.setView([0, 0], 1);
        });

        it('they are accessible on mouseover', function() {
            const ctrl = new L.Control.Layers.Tree(null, overlaysArray1()).addTo(map);
            const inputs = map._container.querySelectorAll('.leaflet-control-layers-overlays input');
            inputs.length.should.be.equal(5);
            const headers = map._container.querySelectorAll('.leaflet-control-layers-overlays .leaflet-layerstree-header');
            headers.length.should.be.equal(7);

            // Nothing visible because the control is collapsed
            checkHidden(inputs, true, 0);
            checkHidden(headers, true, 0);

            // mouse over the control to show it.
            happen.once(ctrl._container, MOVE_OVER_TYPE);
            checkHidden(inputs, false, 0);
            checkHidden(headers, false, 1);
            checkHidden(headers, [1, 0, 0, 0, 0, 0, 0], 0);
            // Hi, let it as you found it.
            happen.once(ctrl._container, MOVE_OUT_TYPE);
        });
    });

    describe('Collapsed nodes', function() {
        beforeEach(function() {
            map.setView([0, 0], 14);
        });

        it('all collapsed', function() {
            new L.Control.Layers.Tree(null, overlaysArraySelectAll(true, true), {collapsed: false}).addTo(map);
            const inputs = map._container.querySelectorAll('.leaflet-control-layers-overlays input');
            inputs.length.should.be.equal(9);
            const headers = map._container.querySelectorAll('.leaflet-control-layers-overlays .leaflet-layerstree-header');
            headers.length.should.be.equal(10); // The root is hidden, but it is there

            checkHidden(inputs, [0, 0, 0, 1, 1, 1, 1, 1, 0], 0);
            checkHidden(headers, [1, 0, 0, 0, 1, 1, 1, 1, 1, 0], 0);

            happen.click(headers[3]);
            checkHidden(headers, [1, 0, 0, 0, 0, 0, 0, 1, 1, 0], 0);
        });
        it('inner collapsed', function() {
            new L.Control.Layers.Tree(null, overlaysArraySelectAll(false, true), {collapsed: false}).addTo(map);
            const inputs = map._container.querySelectorAll('.leaflet-control-layers-overlays input');
            inputs.length.should.be.equal(9);
            const headers = map._container.querySelectorAll('.leaflet-control-layers-overlays .leaflet-layerstree-header');
            headers.length.should.be.equal(10); // The root is hidden, but it is there

            checkHidden(headers, [1, 0, 0, 0, 0, 0, 0, 1, 1, 0], 0);
        });
        it('outer collapsed', function() {
            new L.Control.Layers.Tree(null, overlaysArraySelectAll(true, false), {collapsed: false}).addTo(map);
            const inputs = map._container.querySelectorAll('.leaflet-control-layers-overlays input');
            inputs.length.should.be.equal(9);
            const headers = map._container.querySelectorAll('.leaflet-control-layers-overlays .leaflet-layerstree-header');
            headers.length.should.be.equal(10); // The root is hidden, but it is there

            checkHidden(inputs, [0, 0, 0, 1, 1, 1, 1, 1, 0], 0);
            checkHidden(headers, [1, 0, 0, 0, 1, 1, 1, 1, 1, 0], 0);

            happen.click(headers[3]);
            checkHidden(headers, [1, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
        });
    });

    describe('EventedClasses', function() {
        beforeEach(function() {
            map.setView([0, 0], 14);
        });

        it('select all 1', function() {
            const ctl = new L.Control.Layers.Tree(null, overlaysArrayEventedClasses(), {collapsed: false}).addTo(map);
            const headers = map._container.querySelectorAll('.leaflet-layerstree-header');

            headers[3].parentElement.querySelectorAll('input').length.should.be.equal(4);
            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(0);

            happen.click(headers[3].querySelector('.sel'));
            map._layers[L.Util.stamp(markerA)].should.be.equal(markerA);
            map._layers[L.Util.stamp(markerC)].should.be.equal(markerC);
            should.not.exist(map._layers[L.Util.stamp(markerB)]);
            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(4);
            ctl.getContainer().parentElement.querySelectorAll('input:checked').length.should.be.equal(4);
        });

        it('deselect all 1', function() {
            const ctl = new L.Control.Layers.Tree(null, overlaysArrayEventedClasses(), {collapsed: false}).addTo(map);
            const headers = map._container.querySelectorAll('.leaflet-layerstree-header');

            headers[3].parentElement.querySelectorAll('input').length.should.be.equal(4);
            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(0);

            happen.click(headers[3].querySelector('.sel'));
            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(4);

            happen.click(headers[3].querySelector('.unsel'));
            should.not.exist(map._layers[L.Util.stamp(markerA)]);
            should.not.exist(map._layers[L.Util.stamp(markerC)]);
            should.not.exist(map._layers[L.Util.stamp(markerB)]);
            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(0);
            ctl.getContainer().parentElement.querySelectorAll('input:checked').length.should.be.equal(0);
        });

        it('select all 2', function() {
            const ctl = new L.Control.Layers.Tree(null, overlaysArrayEventedClasses(), {collapsed: false}).addTo(map);
            const headers = map._container.querySelectorAll('.leaflet-layerstree-header');

            headers[6].parentElement.querySelectorAll('input').length.should.be.equal(2);
            headers[6].parentElement.querySelectorAll('input:checked').length.should.be.equal(0);

            happen.click(headers[6].querySelector('.sel'));
            map._layers[L.Util.stamp(markerC)].should.be.equal(markerC);
            should.not.exist(map._layers[L.Util.stamp(markerA)]);
            should.not.exist(map._layers[L.Util.stamp(markerB)]);
            headers[6].parentElement.querySelectorAll('input:checked').length.should.be.equal(2);
            ctl.getContainer().parentElement.querySelectorAll('input:checked').length.should.be.equal(2);
        });

        it('deselect all 2', function() {
            const ctl = new L.Control.Layers.Tree(null, overlaysArrayEventedClasses(), {collapsed: false}).addTo(map);
            const headers = map._container.querySelectorAll('.leaflet-layerstree-header');

            headers[6].parentElement.querySelectorAll('input').length.should.be.equal(2);
            headers[6].parentElement.querySelectorAll('input:checked').length.should.be.equal(0);

            happen.click(headers[6].querySelector('.sel'));
            headers[6].parentElement.querySelectorAll('input:checked').length.should.be.equal(2);

            happen.click(headers[6].querySelector('.unsel'));
            should.not.exist(map._layers[L.Util.stamp(markerA)]);
            should.not.exist(map._layers[L.Util.stamp(markerC)]);
            should.not.exist(map._layers[L.Util.stamp(markerB)]);
            headers[6].parentElement.querySelectorAll('input:checked').length.should.be.equal(0);
            ctl.getContainer().parentElement.querySelectorAll('input:checked').length.should.be.equal(0);
        });

        it('select unselect callbacks', function() {
            function callbackSel(ev, domNode, treeNode, map) {
                ev.type.should.be.equal('click');
                domNode.querySelectorAll('input').length.should.be.equal(4);
                treeNode.children.length.should.be.equal(3);
                should.exist(map);
                return true;
            }

            function callbackUnsel(ev, domNode, treeNode, map) {
                ev.type.should.be.equal('click');
                domNode.querySelectorAll('input').length.should.be.equal(4);
                treeNode.children.length.should.be.equal(3);
                should.exist(map);
                return false;
            }

            new L.Control.Layers.Tree(null, overlaysArrayEventedClasses(callbackSel, callbackUnsel), {collapsed: false}).addTo(map);
            const headers = map._container.querySelectorAll('.leaflet-layerstree-header');

            headers[3].parentElement.querySelectorAll('input').length.should.be.equal(4);
            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(0);

            happen.click(headers[3].querySelector('.sel'));
            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(4);

            happen.click(headers[3].querySelector('.unsel'));
            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(0);
        });

        it('selector toggle', function() {
            function callback(_ev, domNode, _treeNode, _map) {
                const noneSelected = domNode.querySelectorAll('input:checked').length === 0;
                return noneSelected;
            }

            new L.Control.Layers.Tree(null, overlaysArrayEventedClasses(callback, callback), {collapsed: false}).addTo(map);
            const headers = map._container.querySelectorAll('.leaflet-layerstree-header');

            headers[3].parentElement.querySelectorAll('input').length.should.be.equal(4);
            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(0);

            happen.click(headers[3].querySelector('.sel'));
            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(4);
            happen.click(headers[3].querySelector('.sel'));
            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(0);

            happen.click(headers[5].querySelector('input'));
            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(1);

            happen.click(headers[3].querySelector('.sel'));
            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(0);
            happen.click(headers[3].querySelector('.sel'));
            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(4);
        });
    });

    describe('SelectAll', function() {
        beforeEach(function() {
            map.setView([0, 0], 2);
        });

        it('selector toggle', function() {
            function shouldbe(mA, mB, mC) {
                function checkit(layer, present) {
                    if (present) {
                        map._layers[L.Util.stamp(layer)].should.be.equal(layer);
                    } else {
                        should.not.exist(map._layers[L.Util.stamp(layer)]);
                    }
                }
                checkit(markerA, mA);
                checkit(markerB, mB);
                checkit(markerC, mC);
            }

            new L.Control.Layers.Tree(null, overlaysArraySelectAll(), {collapsed: false}).addTo(map);
            const headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(10);

            headers[6].querySelector('input').title.should.be.equal('my title');

            happen.click(headers[9].querySelector('input'));

            headers[3].parentElement.querySelectorAll('input').length.should.be.equal(6);
            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(0);

            happen.click(headers[3].querySelector('input'));
            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(6);
            shouldbe(true, true, true);
            happen.click(headers[3].querySelector('input'));
            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(0);
            shouldbe(false, true, false);

            happen.click(headers[9].querySelector('input'));
            shouldbe(false, false, false);

            happen.click(headers[4].querySelector('input'));
            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(1);
            shouldbe(true, false, false);
            headers[3].parentElement.querySelectorAll('input:indeterminate').length.should.be.equal(1);

            happen.click(headers[3].querySelector('input'));
            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(6);
            shouldbe(true, false, true);
            happen.click(headers[3].querySelector('input'));
            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(0);
            shouldbe(false, false, false);

            happen.click(headers[6].querySelector('input'));
            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(3);
            headers[6].parentElement.querySelectorAll('input:checked').length.should.be.equal(3);
            headers[3].parentElement.querySelectorAll('input:indeterminate').length.should.be.equal(1);
            shouldbe(false, false, true);
            happen.click(headers[3].querySelector('input'));
            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(6);
            shouldbe(true, false, true);
        });
        it('show if all selected or deselected', function() {
            new L.Control.Layers.Tree(null, overlaysArraySelectAll(), {collapsed: false}).addTo(map);
            const headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(10);

            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(0);
            headers[3].parentElement.querySelectorAll('input:indeterminate').length.should.be.equal(0);
            happen.click(headers[3].querySelector('input'));
            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(6);
            headers[3].parentElement.querySelectorAll('input:indeterminate').length.should.be.equal(0);

            happen.click(headers[7].querySelector('input'));
            headers[3].parentElement.querySelector('input').checked.should.be.false;
            headers[3].parentElement.querySelector('input').indeterminate.should.be.true;
            headers[6].parentElement.querySelector('input').checked.should.be.false;
            headers[6].parentElement.querySelector('input').indeterminate.should.be.true;

            happen.click(headers[7].querySelector('input'));
            headers[3].parentElement.querySelector('input').checked.should.be.true;
            headers[3].parentElement.querySelector('input').indeterminate.should.be.false;
            headers[6].parentElement.querySelector('input').checked.should.be.true;
            headers[6].parentElement.querySelector('input').indeterminate.should.be.false;

            happen.click(headers[6].querySelector('input'));
            headers[3].parentElement.querySelector('input').checked.should.be.false;
            headers[3].parentElement.querySelector('input').indeterminate.should.be.true;
            headers[6].parentElement.querySelector('input').checked.should.be.false;
            headers[6].parentElement.querySelector('input').indeterminate.should.be.false;

            happen.click(headers[6].querySelector('input'));
            headers[3].parentElement.querySelector('input').checked.should.be.true;
            headers[3].parentElement.querySelector('input').indeterminate.should.be.false;
            headers[6].parentElement.querySelector('input').checked.should.be.true;
            headers[6].parentElement.querySelector('input').indeterminate.should.be.false;

            headers[3].parentElement.querySelectorAll('input:checked').length.should.be.equal(6);
            headers[3].parentElement.querySelectorAll('input:indeterminate').length.should.be.equal(0);
        });
    });

    describe('Select', function() {
        beforeEach(function() {
            map.setView([0, 0], 14);
        });

        it('sel layer B and A', function() {
            new L.Control.Layers.Tree(baseTree1(), null, {collapsed: false}).addTo(map);
            const headers = map._container.querySelectorAll('.leaflet-control-layers-base .leaflet-layerstree-header');
            headers.length.should.be.equal(7);
            happen.click(headers[6].querySelector('label'));
            map._layers[L.Util.stamp(layerB)].should.be.equal(layerB);
            happen.click(headers[4].querySelector('label'));
            map._layers[L.Util.stamp(layerA)].should.be.equal(layerA);
        });

        it('labelIsSelector', function() {
            let ctl;
            const counter = [0, 0, 0, 0];
            ['both', 'base', 'overlay', 'none'].forEach(function(labelIsSelector) {
                ctl && map.removeControl(ctl);
                ctl = new L.Control.Layers.Tree(baseTree1(), overlaysArray1(), {collapsed: false, labelIsSelector: labelIsSelector}).addTo(map);
                const headers = map._container.querySelectorAll('.leaflet-layerstree-header');
                headers.length.should.be.equal(14);

                if (labelIsSelector === 'both' || labelIsSelector === 'base') {
                    happen.click(headers[6].querySelector('label'));
                    map._layers[L.Util.stamp(layerB)].should.be.equal(layerB);
                    counter[0]++;
                } else {
                    should.not.exist(headers[6].querySelector('label'));
                    happen.click(headers[6].querySelector('input'));
                    map._layers[L.Util.stamp(layerB)].should.be.equal(layerB);
                    counter[1]++;
                }

                if (labelIsSelector === 'both' || labelIsSelector === 'overlay') {
                    happen.click(headers[11].querySelector('label'));
                    map._layers[L.Util.stamp(markerA)].should.be.equal(markerA);
                    counter[2]++;
                } else {
                    should.not.exist(headers[11].querySelector('label'));
                    happen.click(headers[11].querySelector('input'));
                    map._layers[L.Util.stamp(markerA)].should.be.equal(markerA);
                    counter[3]++;
                }
                map.removeLayer(layerB);
                map.removeLayer(markerA);
            });
            chai.expect(counter).to.eql([2, 2, 2, 2]);
        });
    });

    describe('Labels', function() {
        beforeEach(function() {
            map.setView([0, 0], 1);
        });
        it('labels base', function() {
            new L.Control.Layers.Tree(baseTree1(), null, {collapsed: false}).addTo(map);
            const headers = map._container.querySelectorAll('.leaflet-control-layers-base .leaflet-layerstree-header');
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
            const ctrl = new L.Control.Layers.Tree(baseTree1(), null, {collapsed: false}).addTo(map);
            map.addLayer(layerB);
            const headers = map._container.querySelectorAll('.leaflet-control-layers-base .leaflet-layerstree-header');
            headers.length.should.be.equal(7);
            checkHidden(headers, false, 0);
            ctrl.collapseTree().expandSelected(false);
            checkHidden(headers, [0, 0, 0, 0, 1, 1, 0], 0);
        });

        it('Collapse', function() {
            const ctrl = new L.Control.Layers.Tree(baseTree1(), overlaysTree1(), {collapsed: false}).addTo(map);
            map.addLayer(layerB);
            const headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(14);
            checkHidden(headers, false, 0);
            ctrl.collapseTree();
            checkHidden(headers, [0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0], 0);
            ctrl.collapseTree(true);
            checkHidden(headers, [0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1], 0);
        });

        it('Expand', function() {
            const ctrl = new L.Control.Layers.Tree(baseTree1(), overlaysTree1(), {collapsed: false}).addTo(map);
            map.addLayer(layerB);
            const headers = map._container.querySelectorAll('.leaflet-layerstree-header');
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
        it('Named Toggle', function() {
            new L.Control.Layers.Tree(baseTree1(), overlaysTree1(), {namedToggle: true}).addTo(map);
            map.addLayer(layerB);
            const toggle = map._container.querySelector('.leaflet-control-layers-toggle');
            toggle.innerHTML.should.be.equal('Name Leaf three');
            const inputs = map._container.querySelectorAll('.leaflet-control-layers-list input');
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
            new L.Control.Layers.Tree(baseTree1(), overlaysTree1(), {collapsed: false}).addTo(map);
            let items = map._container.querySelectorAll('.leaflet-layerstree-closed');
            items.length.should.be.equal(14);
            for (let i = 0; i < items.length; i++) {
                items[i].innerHTML.should.be.equal('+');
            }
            items = map._container.querySelectorAll('.leaflet-layerstree-opened');
            items.length.should.be.equal(14);
            for (let j = 0; j < items.length; j++) {
                items[j].innerHTML.should.be.equal('−');
            }
            items = map._container.querySelectorAll('.leaflet-layerstree-header-space');
            items.length.should.be.equal(14);
            for (let k = 0; k < items.length; k++) {
                items[k].innerHTML.should.be.equal(' ');
            }
        });
        it('Closed', function() {
            const symbol = '^';
            new L.Control.Layers.Tree(baseTree1(), overlaysTree1(), {collapsed: false, closedSymbol: symbol}).addTo(map);
            map.addLayer(layerB);
            const items = map._container.querySelectorAll('.leaflet-layerstree-closed');
            items.length.should.be.equal(14);
            for (let i = 0; i < items.length; i++) {
                items[i].innerHTML.should.be.equal(symbol);
            }
        });
        it('Opened', function() {
            const symbol = 'v';
            new L.Control.Layers.Tree(baseTree1(), overlaysTree1(), {collapsed: false, openedSymbol: symbol}).addTo(map);
            const items = map._container.querySelectorAll('.leaflet-layerstree-opened');
            items.length.should.be.equal(14);
            for (let i = 0; i < items.length; i++) {
                items[i].innerHTML.should.be.equal(symbol);
            }
        });
        it('Space', function() {
            const symbol = '_*_';
            new L.Control.Layers.Tree(baseTree1(), overlaysTree1(), {collapsed: false, spaceSymbol: symbol}).addTo(map);
            const items = map._container.querySelectorAll('.leaflet-layerstree-header-space');
            items.length.should.be.equal(14);
            for (let i = 0; i < items.length; i++) {
                items[i].innerHTML.should.be.equal(symbol);
            }
        });
    });

    describe('Selector back', function() {
        beforeEach(function() {
            map.setView([0, 0], 1);
        });
        it('Default', function() {
            new L.Control.Layers.Tree(baseTree1(), overlaysTree1(), {collapsed: false}).addTo(map);
            const headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(14);
            for (let h = 0; h < headers.length; h++) {
                const things = [];
                const keys = ['closed', 'opened', 'space', 'label'];
                const items = headers[h].querySelectorAll('span, label, div');
                for (let i = 0; i < items.length; i++) {
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
            new L.Control.Layers.Tree(baseTree1(), overlaysTree1(), {collapsed: false, selectorBack: true}).addTo(map);
            const headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(14);
            for (let h = 0; h < headers.length; h++) {
                const things = [];
                const keys = ['closed', 'opened', 'space', 'label'];
                const items = headers[h].querySelectorAll('span, label, div');
                for (let i = 0; i < items.length; i++) {
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
            const ctrl = new L.Control.Layers.Tree(baseTree1(), overlaysTree1(), {collapsed: false, expandAll: 'exp'}).addTo(map);
            ctrl.collapseTree().collapseTree(true);
            const headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(14);
            checkHidden(headers, [0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1], 0);
            const ct = map._container.querySelectorAll('.leaflet-layerstree-expand-collapse');
            ct.length.should.be.equal(2);
            happen.click(ct[0]);
            checkHidden(headers, [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], 0);
            happen.click(ct[1]);
            checkHidden(headers, false, 0);
        });
        it('collapseAll', function() {
            const ctrl = new L.Control.Layers.Tree(baseTree1(), overlaysTree1(), {collapsed: false, collapseAll: 'col'}).addTo(map);
            ctrl.expandTree().expandTree(true);
            const headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(14);
            checkHidden(headers, false, 0);
            const ct = map._container.querySelectorAll('.leaflet-layerstree-expand-collapse');
            ct.length.should.be.equal(2);
            happen.click(ct[0]);
            checkHidden(headers, [0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0], 0);
            happen.click(ct[1]);
            checkHidden(headers, [0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1], 0);
        });
        it('Empties', function() {
            new L.Control.Layers.Tree(baseTree1(), overlaysTree1(), {collapsed: false, collapseAll: '', expandAll: ''}).addTo(map);
            const ct = map._container.querySelectorAll('.leaflet-layerstree-expand-collapse');
            ct.length.should.be.equal(0);
        });
        it('All', function() {
            new L.Control.Layers.Tree(baseTree1(), overlaysTree1(), {collapsed: false, collapseAll: 'col', expandAll: 'exp'}).addTo(map);
            const ct = map._container.querySelectorAll('.leaflet-layerstree-expand-collapse');
            ct.length.should.be.equal(4);
        });
        it('Arrays', function() {
            new L.Control.Layers.Tree(baseArray1(), overlaysArray1(), {collapsed: false, collapseAll: 'col'}).addTo(map);
            map._container.querySelectorAll('.leaflet-layerstree-expand-collapse');
            const headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(14);
            checkHidden(headers, [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0], 0);
            const ct = map._container.querySelectorAll('.leaflet-layerstree-expand-collapse');
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
            const ctl = new L.Control.Layers.Tree(baseArray2(), null, {collapsed: false}).addTo(map);
            map.addLayer(layerB);
            map._layers[L.Util.stamp(layerB)].should.be.equal(layerB);
            let headers = map._container.querySelectorAll('.leaflet-control-layers-base .leaflet-layerstree-header');
            headers.length.should.be.equal(3); // including the hidden root
            ctl.setBaseTree(baseTree1());
            map._layers[L.Util.stamp(layerB)].should.be.equal(layerB);

            headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(7);
            happen.click(headers[4].querySelector('label'));
            map._layers[L.Util.stamp(layerA)].should.be.equal(layerA);
        });
        it('case 2', function() {
            const ctl = new L.Control.Layers.Tree(baseArray2(), overlaysTree1(), {collapsed: false}).addTo(map);
            map.addLayer(layerB);
            map._layers[L.Util.stamp(layerB)].should.be.equal(layerB);
            let headers = map._container.querySelectorAll('.leaflet-control-layers-base .leaflet-layerstree-header');
            headers.length.should.be.equal(3); // including the hidden root
            ctl.setBaseTree(baseTree1());
            map._layers[L.Util.stamp(layerB)].should.be.equal(layerB);

            headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(14);
        });
        it('case 3', function() {
            const ctl = new L.Control.Layers.Tree(baseTree1(), overlaysTree1(), {collapsed: false}).addTo(map);
            map.addLayer(layerB);
            map.addLayer(markerA);
            map._layers[L.Util.stamp(layerB)].should.be.equal(layerB);
            map._layers[L.Util.stamp(markerA)].should.be.equal(markerA);
            let headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(14);
            let inputs = map._container.querySelectorAll('.leaflet-layerstree-header input');
            inputs.length.should.be.equal(10);
            inputs[4].checked.should.be.true;
            inputs[7].checked.should.be.true;

            ctl.setBaseTree(baseArray2());
            map._layers[L.Util.stamp(layerB)].should.be.equal(layerB);
            map._layers[L.Util.stamp(markerA)].should.be.equal(markerA);

            headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(10);
            inputs = map._container.querySelectorAll('.leaflet-layerstree-header input');
            inputs.length.should.be.equal(7);
            inputs[1].checked.should.be.true;
            inputs[4].checked.should.be.true;

            ctl.setOverlayTree(overlaysArray2());
            map._layers[L.Util.stamp(layerB)].should.be.equal(layerB);
            map._layers[L.Util.stamp(markerA)].should.be.equal(markerA);

            headers = map._container.querySelectorAll('.leaflet-layerstree-header');
            headers.length.should.be.equal(6);
            inputs = map._container.querySelectorAll('.leaflet-layerstree-header input');
            inputs.length.should.be.equal(4);
            inputs[1].checked.should.be.true;
            inputs[2].checked.should.be.true;
        });
        it('case 4', function() {
            const ctl = new L.Control.Layers.Tree(baseTree1(), overlaysTree1(), {collapsed: false}).addTo(map);
            map.addLayer(layerB);
            map.addLayer(markerO);
            map._layers[L.Util.stamp(layerB)].should.be.equal(layerB);
            map._layers[L.Util.stamp(markerO)].should.be.equal(markerO);

            ctl.setOverlayTree(overlaysArray2());
            map._layers[L.Util.stamp(layerB)].should.be.equal(layerB);
            map._layers[L.Util.stamp(markerO)].should.be.equal(markerO);

            const inputs = map._container.querySelectorAll('.leaflet-layerstree-header input');
            inputs.length.should.be.equal(7);
            inputs[5].checked.should.be.false;
            inputs[6].checked.should.be.false;
        });
    });
});
