import * as L from 'leaflet';
import {LayersTree, type TreeObject, type TreeOptions} from '../LayersTree';

const markerO = new L.Marker([0, 0]);
const markerA = new L.Marker([40, 0]);
const markerB = new L.Marker([0, 30]);
const markerC = new L.Marker([0, 20]);

const baseTree = {label: 'Base'} as TreeObject;
baseTree.name = 'None';

const overlayTree = {label: 'Overlay'} as TreeObject;
overlayTree.name = 'Root';
overlayTree.layer = markerO;
overlayTree.collapsed = true;
overlayTree.selectAllCheckbox = true;
overlayTree.children = [
    {label: 'Over one', name: 'Name Over one', layer: markerO},
    {label: 'Over two', name: 'Name Over two', layer: new L.LayerGroup([])},
    {
        label: 'O Node 1',
        selectAllCheckbox: true,
        collapsed: true,
        children: [
            {label: 'Over 11', name: 'Name Over 11', layer: markerA},
            {label: 'Over 12', layer: new L.LayerGroup([])},
            {
                label: '1 Node 1',
                selectAllCheckbox: 'my title',
                collapsed: false,
                children: [
                    {label: 'Over 21', name: 'Name Over 21', layer: markerC},
                    {label: 'Over 22', layer: new L.LayerGroup([])},
                ]
            },
        ]
    },
    {label: 'Over three', name: 'Name Over three', layer: markerB}
];

const treeOptions: TreeOptions = {} as TreeOptions;
treeOptions.closedSymbol = '&#8862; &#x1f5c0;';
treeOptions.collapseAll = 'Collapse all';
treeOptions.expandAll = 'Expand all';
treeOptions.labelIsSelector = 'base';
treeOptions.namedToggle = true;
treeOptions.openedSymbol = '&#8863; &#x1f5c1;';
treeOptions.selectorBack = false;
treeOptions.spaceSymbol = '~';
treeOptions.collapsed = false; // from L.Control.LayersOptions

const tree: LayersTree = new LayersTree(baseTree, overlayTree, treeOptions);

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
