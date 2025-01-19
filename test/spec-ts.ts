import * as L from 'leaflet';
import 'L.Control.Layers.Tree';

const markerO = L.marker([0, 0]);
const markerA = L.marker([40, 0]);
const markerB = L.marker([0, 30]);
const markerC = L.marker([0, 20]);

const baseTree = {label: 'Base'} as L.Control.Layers.TreeObject;
baseTree.name = 'None';

const overlayTree = {label: 'Overlay'} as L.Control.Layers.TreeObject;
overlayTree.name = 'Root';
overlayTree.layer = markerO;
overlayTree.collapsed = true;
overlayTree.selectAllCheckbox = true;
overlayTree.children = [
    {label: 'Over one', name: 'Name Over one', layer: markerO},
    {label: 'Over two', name: 'Name Over two', layer: L.layerGroup([])},
    {
        label: 'O Node 1',
        selectAllCheckbox: true,
        collapsed: true,
        children: [
            {label: 'Over 11', name: 'Name Over 11', layer: markerA},
            {label: 'Over 12', layer: L.layerGroup([])},
            {
                label: '1 Node 1',
                selectAllCheckbox: 'my title',
                collapsed: false,
                children: [
                    {label: 'Over 21', name: 'Name Over 21', layer: markerC},
                    {label: 'Over 22', layer: L.layerGroup([])},
                ]
            },
        ]
    },
    {label: 'Over three', name: 'Name Over three', layer: markerB}
];

const treeOptions: L.Control.Layers.TreeOptions = {} as L.Control.Layers.TreeOptions;
treeOptions.closedSymbol = '&#8862; &#x1f5c0;';
treeOptions.collapseAll = 'Collapse all';
treeOptions.expandAll = 'Expand all';
treeOptions.labelIsSelector = 'base';
treeOptions.namedToggle = true;
treeOptions.openedSymbol = '&#8863; &#x1f5c1;';
treeOptions.selectorBack = false;
treeOptions.spaceSymbol = '~';
treeOptions.collapsed = false; // from L.Control.LayersOptions

const tree: L.Control.Layers.Tree = L.control.layers.tree(baseTree, overlayTree, treeOptions);

tree.options.closedSymbol;
tree.options.collapseAll;
tree.options.expandAll;
tree.options.labelIsSelector;
tree.options.namedToggle;
tree.options.openedSymbol;
tree.options.selectorBack;
tree.options.spaceSymbol;
tree.options.collapsed;

tree.setBaseTree(baseTree);
tree.setOverlayTree(overlayTree);

tree.expandSelected(false);
tree.expandTree(false);
tree.collapseTree(false);
tree.expand();

try {
    tree.addBaseLayer(markerA, 'Throws error');
} catch (e) {
    console.error(e);
}

try {
    tree.addOverlay(markerB, 'Throws error');
} catch (e) {
    console.error(e);
}

try {
    tree.removeLayer(markerC);
} catch (e) {
    console.error(e);
}
