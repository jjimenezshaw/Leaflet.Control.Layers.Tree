/*
 */

(function(L) {
    if (typeof L === 'undefined') {
        throw new Error('Leaflet must be included first');
    }

    /*
     * L.Control.Layers.Tree extends L.Control.Layers because it reuses
     * most of its functionality. Only the HTML creation is different.
     */
    L.Control.Layers.Tree = L.Control.Layers.extend({
        options: {
            closedSymbol: '+',
            openedSymbol: '&minus;',
            spaceSymbol: ' ',
            selectorBack: false,
            namedToggle: false,
            collapseAll: '',
            expandAll: '',
        },

        initialize: function (baseTree, overlaysTree, options) {
            var id = 0; // to keep unique id
            function iterate(tree, output, overlays) {
                if (tree && tree.layer) {
                    if (!overlays) {
                        tree.layer._layersTreeName = tree.name ?
                                                     tree.name : tree.label;
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
            return this;
        },

        addOverlay: function (layer, name) {
            console.log('addOverlay disabled for now');
            return this;
        },

        removeLayer: function (layer) {
            console.log('removeLayer disabled for now');
            return this;
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
                // Start with this value...
                map.eachLayer(function(layer) {changeName(layer);});
                // ... and change it whenever the baselayer is changed.
                map.on('baselayerchange', function(e) {changeName(e.layer);}, this);
            }
            return ret;
        },

        // Expands the whole tree (base other overlays)
        expandTree: function(overlay) {
            var container = overlay ? this._overlaysList : this._baseLayersList;
            if (container) {
                this._applyOnTree(container, false);
            }
            return this;
        },

        // Collapses the whole tree (base other overlays)
        collapseTree: function(overlay) {
            var container = overlay ? this._overlaysList : this._baseLayersList;
            if (container) {
                this._applyOnTree(container, true);
            }
            return this;
        },

        // Expands the tree, only to show the selected inputs
        expandSelected: function(overlay) {
            function iter(el) {
                // Function to iterate the whole DOM upwards
                var p = el.parentElement;
                if (p) {
                    if (L.DomUtil.hasClass(p, 'leaflet-layerstree-children') &&
                        !L.DomUtil.hasClass(el, 'leaflet-layerstree-children-nopad')) {
                        L.DomUtil.removeClass(p, hide);
                    }

                    if (L.DomUtil.hasClass(p, 'leaflet-layerstree-node')) {
                        var h = p.getElementsByClassName('leaflet-layerstree-header')[0];
                        that._applyOnTree(h, false);
                    }
                    iter(p);
                }
            }

            var that = this;
            var container = overlay ? this._overlaysList : this._baseLayersList;
            if (!container) return this;
            var hide = 'leaflet-layerstree-hide';
            var inputs =  this._layerControlInputs || container.getElementsByTagName('input');
            for (var i = 0; i < inputs.length; i++) {
                // Loop over every (valid) input.
                var input = inputs[i];
                if (this._getLayer && this._getLayer(input.layerId).overlay != overlay) continue
                if (input.checked) {
                    // Get out of the header,
                    // to not open the posible (but rare) children
                    iter(input.parentElement.parentElement.parentElement.parentElement);
                }
            }
            return this;
        },

        // collapses or expands the tree in the containter.
        _applyOnTree: function(container, collapse) {
            var iters = [
                { cls: 'leaflet-layerstree-children', hide: collapse },
                { cls: 'leaflet-layerstree-opened', hide: collapse },
                { cls: 'leaflet-layerstree-closed', hide: !collapse },
            ];
            var hide = 'leaflet-layerstree-hide';
            iters.forEach(function (it) {
                var els = container.getElementsByClassName(it.cls);
                for (var i = 0; i < els.length; i++) {
                    var el = els[i];
                    if (!L.DomUtil.hasClass(el, 'leaflet-layerstree-children-nopad')) {
                        if (it.hide) {
                            L.DomUtil.addClass(el, hide);
                        } else {
                            L.DomUtil.removeClass(el, hide);
                        }
                    }
                }
            });
        },

        _addItem: function(obj) {
            // it is called in the original _update, and shouldn't do anything.
        },

        /* overwrite _update function in Control.Layers */
        _update: function () {
            if (!this._container) { return this; }
            var ret = L.Control.Layers.prototype._update.call(this);
            this._addTreeLayout(this._baseTree, false);
            this._addTreeLayout(this._overlaysTree, true);
            return ret;
        },

        // Create the DOM objects for the tree
        _addTreeLayout: function(tree, overlay) {
            if (!tree) return;
            var container = overlay ? this._overlaysList : this._baseLayersList;
            this._expandCollapseAll(overlay, this.options.collapseAll, this.collapseTree);
            this._expandCollapseAll(overlay, this.options.expandAll, this.expandTree);
            this._iterateTreeLayout(tree, container, overlay, tree.noShow)
            if (this._checkDisabledLayers) {
                // to keep compatibility
                this._checkDisabledLayers();
            }
        },

        // Create the "Collapse all" or expand, if needed.
        _expandCollapseAll: function(overlay, text, fn, ctx) {
            var container = overlay ? this._overlaysList : this._baseLayersList;
            ctx = ctx ? ctx : this;
            if (text) {
                var o = document.createElement('div');
                o.className = 'leaflet-layerstree-expand-collapse';
                container.appendChild(o);
                o.innerHTML = text;
                L.DomEvent.on(o, 'click', function(e) {
                    fn.call(ctx, overlay);
                });
            }
        },

        // recursive funtion to create the DOM children
        _iterateTreeLayout: function(tree, container, overlay, noShow) {
            if (!tree) return;
            function creator(type, cls, append, innerHTML) {
                var obj = L.DomUtil.create(type, cls, append);
                if (innerHTML) obj.innerHTML = innerHTML;
                return obj;
            }

            var header = creator('div', 'leaflet-layerstree-header', container);
            var sel = creator('span');
            var entry = creator('span');
            var closed = creator('span', 'leaflet-layerstree-closed', sel, this.options.closedSymbol);
            var opened = creator('span', 'leaflet-layerstree-opened', sel, this.options.openedSymbol);
            var space = creator('span', 'leaflet-layerstree-header-space', null, this.options.spaceSymbol);
            if (this.options.selectorBack) {
                sel.insertBefore(space, closed);
                header.appendChild(entry);
                header.appendChild(sel);
            } else {
                sel.appendChild(space);
                header.appendChild(sel);
                header.appendChild(entry);
            }

            var hide = 'leaflet-layerstree-hide'; // To toggle state
            var neverShow = 'leaflet-layerstree-nevershow'; // To hide elements permanently
            if (tree.children) {
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
                    this._iterateTreeLayout(child, node, overlay);
                }, this);
            } else {
                L.DomUtil.addClass(sel, neverShow);
            }

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
                    // to keep compatibility with 1.0.3
                    this._layerControlInputs.push(input);
                }
                input.layerId = L.Util.stamp(tree.layer);
                //L.DomEvent.on(input, 'click', this._onInputClick, this);
                label.append(input);
            }
            var name = creator('span', 'leaflet-layerstree-header-name', label, tree.label);
            L.DomUtil.addClass(closed, hide);
            if (noShow) {
                L.DomUtil.addClass(header, neverShow);
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
