# Leaflet.ControlLayersTree
A Tree Layers Control for Leaflet.

## Description
This plugin extends [`Control.Layers`](http://leafletjs.com/reference-1.1.0.html#control-layers) allowing a tree structure for the layers layout. In `Control.Layers` you can only display a flat list of layers (baselayers and overlays), that is usually enough for small sets. If you have a long list of baselayers or overlays, and you want to organize them in a tree (allowing the user collapse and expand branches), this is a good option.

## Installation
Using npm for browserify `npm install leaflet.control.layers.tree` (and require('leaflet.control.layers.tree')), or just download `L.Control.Layers.Tree.js` and `L.Control.Layers.Tree.css` and add a script and link tag for it in your html.

## Usage
1. Create your layers. Do this as usual.
2. Create your layers tree, like the one just below.
3. create the control and add to the map: `L.control.layers.tree(baseTree, overalysTree, options).addTo(map);`
4. Voilà!
```javascript
var baseTree = {                                                                
    label: 'Base Layers',                                                        
    children: [                                                                 
        {                                                                       
            label: 'World',                                                     
            children: [                                                         
                { label: 'OpenStreeMap', layer: osm },                          
                { label: 'Esri', layer: esri },
                { label: 'Google Satellite', layer: g_s },                      
                /* ... */                                                       
            ]                                                                   
        },                                                                      
        {                                                                       
            label: 'Europe',                                                    
            children: [                                                         
                { label: 'France', layer: france },                             
                { label: 'Germany', layer: germany },                           
                { label: 'Spain', layer: spain },                               
                /* ... */                                                       
            ]                                                                   
        },                                                                      
        {                                                                       
            label: 'USA',                                                       
            children: [                                                         
                {                                                               
                    label: 'General',                                           
                    children: [                                                 
                        { label: 'Nautical', layer: usa_naut },                 
                        { label: 'Satellite', layer: usa_sat },                 
                        { label: 'Topographical', layer: usa_topo },             
                    ]                                                           
                },                                                              
                {                                                               
                    label: 'States',                                            
                    children: [                                                 
                        { label: 'CA', layer: usa_ca },                         
                        { label: 'NY', layer: usa_ny },                         
                        /* ... */                                               
                    ]                                                           
                }                                                               
            ]                                                                   
        },                                                                      
    ]                                                                           
}; 
```

## API
### `L.control.layers.tree(baseTree, overlaysTree, options)`
Creates the control. The arguments are:
  * `baseTree`: Tree defining the base layers (like the one above).
  * `overlaysTree`: Similar than baseTree, but for overlays.
  * `options`: specific options for the tree. See that it includes `L.Control.Layer` [options](http://leafletjs.com/reference-1.1.0.html#control-layers)
