import React from 'react'
import {Map, TileLayer, FeatureGroup} from 'react-leaflet'
import ReactLeafletMultiOptionsPolyline from '../../src'

export default class DataMap extends React.Component {
  constructor (props) {
    super(props)
    this.multiOptionsPolyline = null
    this.ref = map => {
      this.multiOptionsPolyline = map
      this.setState({bounds: map.getBounds()})
    }
    this.state = {bounds: null}
  }

  render () {
    return (
      <Map onMoveEnds={() => this.setState({bounds: null})} onZoomEnd={() => this.setState({bounds: null})} zoom={5} center={[38.729412, -9.139263]} maxZoom={18} bounds={this.state.bounds} id='mapTrips' style={{height: '40%'}} >
        <TileLayer
          maxZoom={18}
          attribution={'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
          '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="http://mapbox.com">Mapbox</a>'}
          url='https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW5hcGFsdmVzIiwiYSI6ImNpcHIxcDRzajAwNzJpZW5idHNucnZjY2gifQ.vMgJ5qWfBiKa_R-hmuuO0w'
        />
        <FeatureGroup>
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
        </FeatureGroup>
      </Map>
    )
  }
}
