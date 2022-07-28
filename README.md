# react-leaflet-multi-options-polyline

Provides a React component to enable multiple styles for a polyline in a [react-leaflet](https://react-leaflet.js.org) map.
Based on [Leaflet.MultiOptionsPolyline](https://github.com/hgoebl/Leaflet.MultiOptionsPolyline) by hgoebl.

## Demos
To see demos page run on terminal:

`yarn install` and then `yarn start`

## Usage
```javascript
import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import ReactLeafletMultiOptionsPolyline from '../../';

export default function DataMap ({positions, optionIdxFn, options}) {
    return (
        <MapContainer
            style={{height: '40%'}}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
                />
                <ReactLeafletMultiOptionsPolyline
                    positions={positions}
                    optionIdxFn={optionIdxFn}
                    options={options}
                    weight={5}
                    lineCap='butt'
                    opacity={0.75}
                    smoothFactor={1}
                    zoomAnimation={false}
                />
        </MapContainer>
    )
}
```
