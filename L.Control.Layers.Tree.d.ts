declare module "leaflet.control.layers.tree" {
  module "leaflet" {
    interface ILayerTreeChildren {
      label: string;
      layer: L.Layer;
      selectAllCheckbox?: boolean;
      children?: ILayerTreeChildren[];
    }

    interface ILayerTree {
      label: string;
      children?: ILayerTreeChildren[];
    }

    interface ILayerTreeOptions {
      /**
       * Symbol displayed on a closed node.
       * @default '+'
       */
      closedSymbol: string;
      /**
       * Symbol displayed on an open node.
       * @default '−' (&minus;)
       */
      openSymbol: string;
      /**
       * Symbol between the closed or opened symbol, and the text. Default .
       * @default ' ' (a normal space)
       */
      spaceSymbol: boolean;
      /**
       * Flag to indicate if the selector (+ or −) is after the text.
       * @default 'false'
       */
      selectorBack: boolean;
      /**
       * Flag to replace the toggle image (box with the layers image) with the 'name' of the selected base layer.
       * If the name field is not present in the tree for this layer, label is used.
       * See that you can show a different name when control is collapsed than the one that appears in the tree
       * when it is expanded. Your node in the tree can be
       * { label: 'OSM', name: 'OpenStreetMap', layer: layer }.
       * @default 'false'.
       */
      namedToggle: boolean;
      /**
       * Text for an entry in control that collapses the tree (baselayers or overlays).
       * If empty, no entry is created.
       * @default ''.
       */
      collapseAll: string;
      /**
       * Text for an entry in control that expands the tree. If empty, no entry is created.
       * @default ''.
       */
      expandAll: string;
      /**
       * Controls if a label or only the checkbox/radiobutton can toggle layers.
       * If set to both, overlay or base those labels can be clicked on to toggle the layer.
       * @default 'both'.
       */
      labelIsSelector: string;
    }

    namespace control {
      namespace layers {
        function tree(
          baseTree: ILayerTree,
          overlayTree: ILayerTree,
          options?: Partial<ILayerTreeOptions>
        ): L.Control;
      }
    }
  }
}
