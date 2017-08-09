'use strict';

var layerA = L.tileLayer('');
var layerB = L.tileLayer('');

function baseTree1() {
    return {
        noShow: false,
        label: 'Root node',
        children: [
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
        ]
    };
}

var markerO = L.marker([0, 0]);
var markerA = L.marker([40, 0]);
var markerB = L.marker([0, 30]);

function overlaysTree1() {
    return {
        noShow: false,
        label: 'Root O node',
        children: [
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
    };
}

function isHidden(el) {
    // https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
    return (el.offsetParent === null)
}

function checkHidden(list, value, first) {
    first = first || 0;
    for (var i = first; i < list.length; i++) {
        isHidden(list[i]).should.be.equal(value);
    }
}

describe('L.Control.Layers.Tree', function() {
    chai.should();
    //this.timeout(500000);
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
    describe('Simple base tests', function() {
        beforeEach(function() {
            map.setView([0, 0], 14);
        });

        it('they are there', function() {
            //document.body.appendChild(map._container);
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
            //document.body.appendChild(map._container);
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

    describe('Simple overlays tests', function() {
        beforeEach(function() {
            map.setView([0, 0], 1);
        });

        it('they are there', function() {
            //document.body.appendChild(map._container);
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
            //document.body.appendChild(map._container);
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
});
