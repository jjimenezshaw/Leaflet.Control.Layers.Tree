'use strict';

describe('L.Control.Layers.Tree', function() {
    chai.should();
    //this.timeout(500000);

    describe('Functions in place', function() {

        it('L.Control.Layers.Tree has correct func', function() {
            L.control.layers.tree.should.be.a('function');
        });
        it('L.control.layers.tree object creation', function() {
            var t = L.control.layers.tree();
            t.should.be.a('object');
        });
    });
});
