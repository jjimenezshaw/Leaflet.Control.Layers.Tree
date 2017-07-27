/*
 */

(function(L) {
    if (typeof L === 'undefined') {
        throw new Error('Leaflet must be included first');
    }


    L.Control.Layers.Tree = L.Control.Layers.extend({
        options: {
            closedSymbol: '+',
            openedSymbol: '&minus;',
            spaceSymbol: ' ',
            namedToggle: false,
        },

        initialize: function (baseTree, overlaysTree, options) {
            var id = 0; // to keep unique id
            function iterate(tree, output, overlays) {
                if (tree && tree.layer) {
                    if (!overlays) {
                        tree.layer._layersTreeName = tree.name ? tree.name : tree.label;
                    }
                    output[id++] = tree.layer;
                }
                if (tree && tree.children && tree.children.length) {
                    tree.children.forEach(function(child) {
                        iterate(child, output, overlays);
                    });
                }
                return output;
            }
            this._baseTree = baseTree;
            this._overlaysTree = overlaysTree;
            L.Util.setOptions(this, options);
            L.Control.Layers.prototype.initialize.call(
                this,
                iterate(baseTree, {}),
                iterate(overlaysTree, {}, true),
                options);

        },

        addBaseLayer: function (layer, name) {
            console.log('addBaseLayer disabled for now');
        },

        addOverlay: function (layer, name) {
            console.log('addOverlay disabled for now');
        },

        removeLayer: function (layer) {
            console.log('removeLayer disabled for now');
        },


        onAdd: function(map) {
            function changeName(layer) {
                if (layer._layersTreeName) {
                    toggle.innerHTML = layer._layersTreeName;
                }
            }

            var ret = L.Control.Layers.prototype.onAdd.call(this, map);
            if (this.options.namedToggle) { 
                var toggle = this._container.getElementsByClassName('leaflet-control-layers-toggle')[0];
                L.DomUtil.addClass(toggle, 'leaflet-layerstree-named-toggle');
                map.on('baselayerchange', function(e) {changeName(e.layer);}, this);
                map.eachLayer(function(layer) { 
                    if (layer._layersTreeName) changeName(layer);
                });
            }
            return ret;
        },

        _addItem: function(obj) {
            // it is called in the original _update, and should do nothing.
        },

        /* overwrite _update function in Control.Layers */
        _update: function () {
            if (!this._container) { return this; }
            var ret = L.Control.Layers.prototype._update.call(this);
            this._addTreeLayout(this._baseTree, false);
            this._addTreeLayout(this._overlaysTree, true);
            return ret;
        },

        _addTreeLayout: function(tree, overlay) {
            if (!tree) return;
            var container = overlay ? this._overlaysList : this._baseLayersList;
            this._iterateTreeLayout(tree, container, overlay, tree.noShow)
            if (this._checkDisabledLayers) {
                // to keep compatibility with 0.7
                this._checkDisabledLayers();
            }
        },

        _iterateTreeLayout: function(tree, container, overlay, noShow) {
            if (!tree) return;
            var that = this;
            function creator(type, cls, append, innerHTML) {
                var obj = document.createElement(type);
                if (cls) obj.className = cls;
                if (innerHTML) obj.innerHTML = innerHTML;
                if (append) append.appendChild(obj);
                return obj;
            }
            var header = creator('div', 'leaflet-layerstree-header', container);
            var sel = creator('span', null, header);
            var closed = creator('span', 'leaflet-layerstree-closed', sel, this.options.closedSymbol);
            var opened = creator('span', 'leaflet-layerstree-opened', sel, this.options.openedSymbol);
            var space = creator('span', 'leaflet-layerstree-header-space', sel, this.options.spaceSymbol);

            var hide = 'leaflet-layerstree-hide';
            if (tree.children && tree.children.length) {
                var children = creator('div', 'leaflet-layerstree-children', container);
                var sensible = tree.layer ? sel : header;
                L.DomUtil.addClass(sensible, 'leaflet-layerstree-header-pointer');
                L.DomEvent.on(sensible, 'click', function(e) {
                    if (L.DomUtil.hasClass(opened, hide)) {
                        // it is not opened, so open it
                        L.DomUtil.addClass(closed, hide);
                        L.DomUtil.removeClass(opened, hide);
                        L.DomUtil.removeClass(children, hide);
                    } else {
                        // close it
                        L.DomUtil.removeClass(closed, hide);
                        L.DomUtil.addClass(opened, hide);
                        L.DomUtil.addClass(children, hide);
                    }
                });
                tree.children.forEach(function(child) {
                    var node = creator('div', 'leaflet-layerstree-node', children)
                    that._iterateTreeLayout(child, node, overlay);
                });
            } else {
                L.DomUtil.addClass(sel, hide);
            }

            var entry = creator('span', null, header);
            var label = creator('label', 'leaflet-layerstree-header-label', entry);
            if (tree.layer) {
                // now create the element like in _addItem
                var checked = this._map.hasLayer(tree.layer)
                var input;
                if (overlay) {
                    input = this._createCheckboxElement(checked);
                } else {
                    input = this._createRadioElement('leaflet-base-layers', checked);
                }
                if (this._layerControlInputs) {
                    // to keep compatibility with 0.7
                    this._layerControlInputs.push(input);
                }
                input.layerId = L.Util.stamp(tree.layer);
                //L.DomEvent.on(input, 'click', this._onInputClick, this);
                label.append(input);
            }
            var name = creator('span', 'leaflet-layerstree-header-name', label, tree.label);
            L.DomUtil.addClass(closed, hide);
            if (noShow) {
                L.DomUtil.addClass(header, hide);
                L.DomUtil.addClass(children, 'leaflet-layerstree-children-nopad');
            }

        },

        _createCheckboxElement: function(checked) {
            var input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'leaflet-control-layers-selector';
            input.defaultChecked = checked;
            return input;
        },

    });

    L.control.layers.tree = function(base, overlays, options) {
        return new L.Control.Layers.Tree(base, overlays, options);
    }

})(L);
