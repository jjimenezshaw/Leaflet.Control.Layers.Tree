import * as L from 'leaflet';

declare module 'leaflet' {
    namespace Control {
        namespace Layers {
            interface TreeObject {
                children?: TreeObject[];
                collapsed?: boolean;
                label: string;
                layer?: L.Layer;
                name?: string;
                selectAllCheckbox?: boolean | string;
            }

            interface TreeOptions extends L.Control.LayersOptions {
                /**
                * Symbol displayed on a closed node.
                * @default '+'
                */
                closedSymbol?: string;

                /**
                * Symbol displayed on an open node.
                * @default '−' (&minus;)
                */
                openedSymbol?: string;

                /**
                * Symbol between the closed or opened symbol, and the text.
                * @default ' ' (a normal space)
                */
                spaceSymbol?: string;

                /**
                * Flag to indicate if the selector (+ or −) is after the text.
                * @default false
                */
                selectorBack?: boolean;

                /**
                * Flag to replace the toggle image (box with the layers image)
                * with the 'name' of the selected base layer.
                * If the name field is not present in the tree for this layer,
                * label is used.
                * See that you can show a different name when control is
                * collapsed than the one that appears in the tree
                * when it is expanded. Your node in the tree can be
                * { label: 'OSM', name: 'OpenStreetMap', layer: layer }.
                * @default false
                */
                namedToggle?: boolean;

                /**
                * Text for an entry in control that collapses the tree
                * (baselayers or overlays).
                * If empty, no entry is created.
                * @default ''.
                */
                collapseAll?: string;

                /**
                * Text for an entry in control that expands the tree.
                * If empty, no entry is created.
                * @default ''
                */
                expandAll?: string;

                /**
                * Controls if a label or only the checkbox/radio button can
                * toggle layers.
                * If set to both, overlay or base those labels can be clicked on
                * to toggle the layer.
                * @default 'both'.
                */
                labelIsSelector?: 'both' | 'overlay' | 'base' | string;
            }

            class Tree extends L.Control.Layers {
                constructor(
                    baseTree?: TreeObject,
                    overlayTree?: TreeObject,
                    options?: TreeOptions
                );

                setBaseTree(baseTree: TreeObject): this;

                setOverlayTree(overlayTree: TreeObject): this;

                addBaseLayer(layer: L.Layer, name: string): never;

                addOverlay(layer: L.Layer, name: string): never;

                removeLayer(layer: L.Layer): never;

                expandTree(isOverlay?: boolean): this;

                collapseTree(isOverlay?: boolean): this;

                expandSelected(isOverlay?: boolean): this;

                options: TreeOptions;
            }
        }
    }

    namespace control {
        namespace layers {
            function tree(
                baseTree?: Control.Layers.TreeObject,
                overlayTree?: Control.Layers.TreeObject,
                options?: Control.Layers.TreeOptions
            ): Control.Layers.Tree;
        }
    }
}
