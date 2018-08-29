# react-leaflet-multi-options-polyline

Provides a React component to enable multiple styles for a polyline in a [react-leaflet](https://react-leaflet.js.org) map.
Based on [Leaflet.MultiOptionsPolyline](https://github.com/hgoebl/Leaflet.MultiOptionsPolyline) by hgoebl.

## Demos
To see demos page run on terminal:

`yarn install` and then `yarn start`

## Usage
```javascript
import React from 'react'
import {Map, TileLayer} from 'react-leaflet'
import ReactLeafletMultiOptionsPolyline from '../../'

export default class DataMap extends React.Component {
  constructor (props) {
    super(props)
    this.multiOptionsPolyline = null
    this.ref = map => {
      this.multiOptionsPolyline = map
      this.setState({bounds: map.getBounds()})
    }
    this.state = {bounds: undefined}
  }

  render () {
    return (
      <Map
        bounds={this.state.bounds}
        style={{height: '40%'}} >
        <TileLayer
          attribution={'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
          '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="http://mapbox.com">Mapbox</a>'}
          url='https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW5hcGFsdmVzIiwiYSI6ImNpcHIxcDRzajAwNzJpZW5idHNucnZjY2gifQ.vMgJ5qWfBiKa_R-hmuuO0w'
        />
        <ReactLeafletMultiOptionsPolyline
          ref={this.ref}
          positions={this.props.positions}
          optionIdxFn={this.props.optionIdxFn}
          options={this.props.options}
          weight={5}
          lineCap='butt'
          opacity={0.75}
          smoothFactor={1}
          zoomAnimation={false}
        />
      </Map>
    )
  }
}
```
