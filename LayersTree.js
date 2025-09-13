/*
 * Control like Layers, but showing layers in a tree.
 * Do not forget to include the css file.
 */

import {Control, DomEvent, DomUtil, Util} from 'leaflet';

export class LayersTree extends Control.Layers {
    static {
        this.setDefaultOptions({
            closedSymbol: '+',
            openedSymbol: '&minus;',
            spaceSymbol: ' ',
            selectorBack: false,
            namedToggle: false,
            collapseAll: '',
            expandAll: '',
            labelIsSelector: 'both',
        });
    }

    // Class names are error prone texts, so write them once here
    _initClassesNames() {
        this.cls = {
            children: 'leaflet-layerstree-children',
            childrenNopad: 'leaflet-layerstree-children-nopad',
            hide: 'leaflet-layerstree-hide',
            closed: 'leaflet-layerstree-closed',
            opened: 'leaflet-layerstree-opened',
            space: 'leaflet-layerstree-header-space',
            pointer: 'leaflet-layerstree-header-pointer',
            header: 'leaflet-layerstree-header',
            neverShow: 'leaflet-layerstree-nevershow',
            node: 'leaflet-layerstree-node',
            name: 'leaflet-layerstree-header-name',
            label: 'leaflet-layerstree-header-label',
            selAllCheckbox: 'leaflet-layerstree-sel-all-checkbox',
        };
    }

    initialize(baseTree, overlaysTree, options) {
        this._scrollTop = 0;
        this._initClassesNames();
        this._baseTree = null;
        this._overlaysTree = null;
        Util.setOptions(this, options);
        Control.Layers.prototype.initialize.call(this, null, null, options);
        this._setTrees(baseTree, overlaysTree);
    }

    setBaseTree(tree) {
        return this._setTrees(tree);
    }

    setOverlayTree(tree) {
        return this._setTrees(undefined, tree);
    }

    addBaseLayer(_layer, _name) {
        throw 'addBaseLayer is disabled';
    }

    addOverlay(_layer, _name) {
        throw 'addOverlay is disabled';
    }

    removeLayer(_layer) {
        throw 'removeLayer is disabled';
    }

    collapse() {
        this._scrollTop = this._sect().scrollTop;
        return Control.Layers.prototype.collapse.call(this);
    }

    expand() {
        Control.Layers.prototype.expand.call(this);
        this._sect().scrollTop = this._scrollTop;
    }

    onAdd(map) {
        const ret = Control.Layers.prototype.onAdd.call(this, map);
        if (this.options.namedToggle) {
            function changeName(layer) {
                if (layer._layersTreeName) {
                    toggle.innerHTML = layer._layersTreeName;
                }
            }

            const toggle = ret.getElementsByClassName('leaflet-control-layers-toggle')[0];
            toggle.classList.add('leaflet-layerstree-named-toggle');
            // Start with this value...
            map.eachLayer(function(layer) {changeName(layer);});
            // ... and change it whenever the baselayer is changed.
            map.on('baselayerchange', function(e) {changeName(e.layer);}, this);
        }
        return ret;
        // return this._container;
    }

    // Expands the whole tree (base other overlays)
    expandTree(overlay) {
        const container = overlay ? this._overlaysList : this._baseLayersList;
        if (container) {
            this._applyOnTree(container, false);
        }
        return this._localExpand();
    }

    // Collapses the whole tree (base other overlays)
    collapseTree(overlay) {
        const container = overlay ? this._overlaysList : this._baseLayersList;
        if (container) {
            this._applyOnTree(container, true);
        }
        return this._localExpand();
    }

    // Expands the tree, only to show the selected inputs
    expandSelected(overlay) {
        function iter(el) {
            // Function to iterate the whole DOM upwards
            const p = el.parentElement;
            if (p) {
                if (p.classList.contains(that.cls.children) &&
                    !el.classList.contains(that.cls.childrenNopad)) {
                    p.classList.remove(hide);
                }

                if (p.classList.contains(that.cls.node)) {
                    const h = p.getElementsByClassName(that.cls.header)[0];
                    that._applyOnTree(h, false);
                }
                iter(p);
            }
        }

        const that = this;
        const container = overlay ? this._overlaysList : this._baseLayersList;
        if (!container) return this;
        const hide = this.cls.hide;
        const inputs = this._layerControlInputs || container.getElementsByTagName('input');
        for (const input of inputs) {
            if (this._getLayer && !!this._getLayer(input.layerId).overlay != !!overlay) continue;
            if (input.checked) {
                // Get out of the header,
                // to not open the possible (but rare) children
                iter(input.parentElement.parentElement.parentElement.parentElement);
            }
        }
        return this._localExpand();
    }

    // "private" methods, not exposed in the API
    _sect() {
        // to keep compatibility after 1.3 https://github.com/Leaflet/Leaflet/pull/6380
        return this._section || this._form;
    }

    _setTrees(base, overlays) {
        let id = 0; // to keep unique id
        function iterate(tree, output, overlays) {
            if (tree && tree.layer) {
                if (!overlays) {
                    tree.layer._layersTreeName = tree.name || tree.label;
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

        // We accept arrays, but convert into an object with children
        function forArrays(input) {
            if (Array.isArray(input)) {
                return {noShow: true, children: input};
            } else {
                return input;
            }
        }

        // Clean everything, and start again.
        if (this._layerControlInputs) {
            this._layerControlInputs = [];
        }
        for (const layer of this._layers) {
            layer.layer.off('add remove', this._onLayerChange, this);
        }
        this._layers = [];

        if (base !== undefined) this._baseTree = forArrays(base);
        if (overlays !== undefined) this._overlaysTree = forArrays(overlays);

        const bflat = iterate(this._baseTree, {});
        for (const j in bflat) {
            this._addLayer(bflat[j], j);
        }

        const oflat = iterate(this._overlaysTree, {}, true);
        for (const k in oflat) {
            this._addLayer(oflat[k], k, true);
        }
        return (this._map) ? this._update() : this;
    }

    // Used to update the vertical scrollbar
    _localExpand() {
        if (this._map && this._container.classList.contains('leaflet-control-layers-expanded')) {
            const top = this._sect().scrollTop;
            this.expand();
            this._sect().scrollTop = top; // to keep the scroll location
            this._scrollTop = top;
        }
        return this;
    }

    // collapses or expands the tree in the container.
    _applyOnTree(container, collapse) {
        const iters = [
            {cls: this.cls.children, hide: collapse},
            {cls: this.cls.opened, hide: collapse},
            {cls: this.cls.closed, hide: !collapse},
        ];
        iters.forEach(function(it) {
            const els = container.getElementsByClassName(it.cls);
            for (const el of els) {
                if (el.classList.contains(this.cls.childrenNopad)) {
                    // do nothing
                } else if (it.hide) {
                    el.classList.add(this.cls.hide);
                } else {
                    // removeClass(el, this.cls.hide);
                    el.classList.remove(this.cls.hide);
                }
            }
        }, this);
    }

    // it is called in the original _update, and shouldn't do anything.
    _addItem(_obj) {
    }

    // overwrite _update function in Control.Layers
    _update() {
        if (!this._container) { return this; }
        Control.Layers.prototype._update.call(this);
        this._addTreeLayout(this._baseTree, false);
        this._addTreeLayout(this._overlaysTree, true);
        return this._localExpand();
    }

    // Create the DOM objects for the tree
    _addTreeLayout(tree, overlay) {
        if (!tree) return;
        const container = overlay ? this._overlaysList : this._baseLayersList;
        this._expandCollapseAll(overlay, this.options.collapseAll, this.collapseTree);
        this._expandCollapseAll(overlay, this.options.expandAll, this.expandTree);
        this._iterateTreeLayout(tree, container, overlay, [], tree.noShow);
        if (this._checkDisabledLayers) {
            // to keep compatibility
            this._checkDisabledLayers();
        }
    }

    // Create the "Collapse all" or expand, if needed.
    _expandCollapseAll(overlay, text, fn, ctx) {
        const container = overlay ? this._overlaysList : this._baseLayersList;
        ctx = ctx ? ctx : this;
        if (text) {
            const o = document.createElement('div');
            o.className = 'leaflet-layerstree-expand-collapse';
            container.appendChild(o);
            o.innerHTML = text;
            o.tabIndex = 0;
            DomEvent.on(o, 'click keydown', function(e) {
                if (e.type !== 'keydown' || e.keyCode === 32) {
                    o.blur();
                    fn.call(ctx, overlay);
                    this._localExpand();
                }
            }, this);
        }
    }

    // recursive function to create the DOM children
    _iterateTreeLayout(tree, container, overlay, selAllNodes, noShow) {
        if (!tree) return;
        function creator(type, cls, append, innerHTML) {
            const obj = DomUtil.create(type, cls, append);
            if (innerHTML) obj.innerHTML = innerHTML;
            return obj;
        }

        // create the header with it fields
        const header = creator('div', this.cls.header, container);
        const sel = creator('span');
        const entry = creator('span');
        const closed = creator('span', this.cls.closed, sel, this.options.closedSymbol);
        const opened = creator('span', this.cls.opened, sel, this.options.openedSymbol);
        const space = creator('span', this.cls.space, null, this.options.spaceSymbol);
        if (this.options.selectorBack) {
            sel.insertBefore(space, closed);
            header.appendChild(entry);
            header.appendChild(sel);
        } else {
            sel.appendChild(space);
            header.appendChild(sel);
            header.appendChild(entry);
        }

        function updateSelAllCheckbox(ancestor) {
            const selector = ancestor.querySelector('input[type=checkbox]');
            let selectedAll = true;
            let selectedNone = true;
            const inputs = ancestor.querySelectorAll('input[type=checkbox]');
            [].forEach.call(inputs, function(inp) { // to work in node for tests
                if (inp === selector) {
                    // ignore
                } else if (inp.indeterminate) {
                    selectedAll = false;
                    selectedNone = false;
                } else if (inp.checked) {
                    selectedNone = false;
                } else if (!inp.checked) {
                    selectedAll = false;
                }
            });
            if (selectedAll) {
                selector.indeterminate = false;
                selector.checked = true;
            } else if (selectedNone) {
                selector.indeterminate = false;
                selector.checked = false;
            } else {
                selector.indeterminate = true;
                selector.checked = false;
            }
        }

        function manageSelectorsAll(input, ctx) {
            selAllNodes.forEach(function(ancestor) {
                DomEvent.on(input, 'click', function(_ev) {
                    updateSelAllCheckbox(ancestor);
                }, ctx);
            }, ctx);
        }

        let children;
        let selAll;
        if (tree.selectAllCheckbox) {
            selAll = this._createCheckboxElement(false);
            selAll.className += ' ' + this.cls.selAllCheckbox;
        }

        const hide = this.cls.hide; // To toggle state
        // create the children group, with the header event click
        if (tree.children) {
            children = creator('div', this.cls.children, container);
            const sensible = tree.layer ? sel : header;
            sensible.classList.add(this.cls.pointer);
            sensible.tabIndex = 0;
            DomEvent.on(sensible, 'click keydown', function(e) {
                // leaflet internal flag to prevent click propagation and collapsing tree on mobile browsers
                if (this._preventClick) {
                    return;
                }
                if (e.type === 'keydown' && e.keyCode !== 32) {
                    return;
                }
                sensible.blur();

                if (opened.classList.contains(hide)) {
                    // it is not opened, so open it
                    closed.classList.add(hide);
                    opened.classList.remove(hide);
                    children.classList.remove(hide);
                } else {
                    // close it
                    closed.classList.remove(hide);
                    opened.classList.add(hide);
                    children.classList.add(hide);
                }
                this._localExpand();
            }, this);
            if (selAll) {
                selAllNodes.splice(0, 0, container);
            }
            tree.children.forEach(function(child) {
                const node = creator('div', this.cls.node, children);
                this._iterateTreeLayout(child, node, overlay, selAllNodes);
            }, this);
            if (selAll) {
                selAllNodes.splice(0, 1);
            }
        } else {
            // no children, so the selector makes no sense.
            sel.classList.add(this.cls.neverShow);
        }

        // make (or not) the label clickable to toggle the layer
        let labelType;
        if (tree.layer) {
            if ((this.options.labelIsSelector === 'both') || // if option is set to both
                (overlay && this.options.labelIsSelector === 'overlay') || // if an overlay layer and options is set to overlay
                (!overlay && this.options.labelIsSelector === 'base')) { // if a base layer and option is set to base
                labelType = 'label';
            } else { // if option is set to something else
                labelType = 'span';
            }
        } else {
            labelType = 'span';
        }
        // create the input and label
        const label = creator(labelType, this.cls.label, entry);
        if (tree.layer) {
            // now create the element like in _addItem
            const checked = this._map.hasLayer(tree.layer);
            let input;
            const radioGroup = overlay ? tree.radioGroup : 'leaflet-base-layers_' + Util.stamp(this);
            if (radioGroup) {
                input = this._createRadioElement(radioGroup, checked);
            } else {
                input = this._createCheckboxElement(checked);
                manageSelectorsAll(input, this);
            }
            if (this._layerControlInputs) {
                // to keep compatibility with 1.0.3
                this._layerControlInputs.push(input);
            }
            input.layerId = Util.stamp(tree.layer);
            DomEvent.on(input, 'click', this._onInputClick, this);
            label.appendChild(input);
        }

        function isText(variable) {
            return (typeof variable === 'string' || variable instanceof String);
        }

        function isFunction(functionToCheck) {
            return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
        }

        function selectAllCheckboxes(select, ctx) {
            const inputs = container.getElementsByTagName('input');
            for (const input of inputs) {
                if (input.type !== 'checkbox') continue;
                input.checked = select;
                input.indeterminate = false;
            }
            ctx._onInputClick();
        }
        if (tree.selectAllCheckbox) {
            // selAll is already created
            label.appendChild(selAll);
            if (isText(tree.selectAllCheckbox)) {
                selAll.title = tree.selectAllCheckbox;
            }
            DomEvent.on(selAll, 'click', function(ev) {
                ev.stopPropagation();
                selectAllCheckboxes(selAll.checked, this);
            }, this);
            updateSelAllCheckbox(container);
            manageSelectorsAll(selAll, this);
        }

        creator('span', this.cls.name, label, tree.label);

        // hide the button which doesn't fit the collapsed state, then hide children conditionally
        (tree.collapsed ? opened : closed).classList.add(hide);
        tree.collapsed && children && children.classList.add(hide);

        if (noShow) {
            header.classList.add(this.cls.neverShow);
            children.classList.add(this.cls.childrenNopad);
        }

        let eventeds = tree.eventedClasses;
        if (!(eventeds instanceof Array)) {
            eventeds = [eventeds];
        }

        for (const evented of eventeds) {
            if (evented && evented.className) {
                const obj = container.querySelector('.' + evented.className);
                if (obj) {
                    DomEvent.on(obj, evented.event || 'click', (function(selectAll) {
                        return function(ev) {
                            ev.stopPropagation();
                            const select = isFunction(selectAll) ? selectAll(ev, container, tree, this._map) : selectAll;
                            if (select !== undefined && select !== null) {
                                selectAllCheckboxes(select, this);
                            }
                        };
                    })(evented.selectAll), this);
                }
            }
        }
    }

    // IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see https://stackoverflow.com/a/119079)
    _createRadioElement(name, checked) {
        const radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' +
                name + '"' + (checked ? ' checked="checked"' : '') + '/>';

        const radioFragment = document.createElement('div');
        radioFragment.innerHTML = radioHtml;

        return radioFragment.firstChild;
    }

    _createCheckboxElement(checked) {
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'leaflet-control-layers-selector';
        input.defaultChecked = checked;
        return input;
    }
}
