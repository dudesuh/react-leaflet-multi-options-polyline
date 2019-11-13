import React from 'react'
import PropTypes from 'prop-types'
import {FeatureGroup, Polyline} from 'react-leaflet'
import L from 'leaflet'
import {getBounds} from 'geolib'

export default class ReactLeafletMultiOptionsPolyline extends React.Component {
  constructor (props) {
    super(props)
    this.mapPositions = this.mapPositions.bind(this)
    this.state = {
      lines: this.mapPositions()
    }
    this.getBounds = this.getBounds.bind(this)
  }

  mapPositions () {
    const {positions, optionIdxFn, options} = this.props
    const lines = new Array(options.length)
    const currentLine = new Array(options.length)
    for (let idx = 0; idx < options.length; ++idx) {
      currentLine[idx] = []
      lines[idx] = []
    }
    let last
    let lastLineIdx = 0
    let currentLineIdx = 0
    for (let idx = 1; idx < positions.length; ++idx) {
      const item = positions[idx]
      const previous = positions[idx - 1]
      const coordinates = new L.LatLng(item.lat, item.lng)
      currentLineIdx = optionIdxFn(item, previous, idx, positions)
      currentLine[currentLineIdx].push(coordinates)
      // If 1st item, must handle item at index 0;
      if (idx === 1) {
        last = previous
        lastLineIdx = optionIdxFn(previous, previous, idx - 1, positions)
        currentLine[lastLineIdx].push(last)
        if (lastLineIdx !== currentLineIdx) {
          currentLine[lastLineIdx].push(coordinates)
          lines[lastLineIdx].push(currentLine[lastLineIdx])
          currentLine[lastLineIdx] = []
        }
      } else {
        // If the result of optionIdxFn from last is different from current, push last line and clear it;
        if (lastLineIdx !== currentLineIdx) {
          currentLine[lastLineIdx].push(coordinates)
          lines[lastLineIdx].push(currentLine[lastLineIdx])
          currentLine[lastLineIdx] = []
        }
      }
      // Keep index and item
      lastLineIdx = currentLineIdx
      last = item
    }
    // Push last items;
    lines[currentLineIdx].push(currentLine[currentLineIdx])
    return lines
  }

  shouldComponentUpdate (nextProps, nextState) {
    return nextProps !== this.props
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    this.setState({
      lines: this.mapPositions()
    })
  }

  getBounds () {
    const bounds = getBounds(this.props.positions)
    return new L.LatLngBounds(new L.LatLng(bounds.maxLat, bounds.minLng), new L.LatLng(bounds.minLat, bounds.maxLng))
  }

  render () {
    return (
      <FeatureGroup>
        {this.state.lines.map((optionsLine, optionsIdx) =>
          optionsLine.map((line, idx) =>
            <Polyline key={idx} {...this.props} positions={line} {...this.props.options[optionsIdx]} />
          )
        )}
      </FeatureGroup>
    )
  }
}

ReactLeafletMultiOptionsPolyline.propTypes = {
  positions: PropTypes.arrayOf(PropTypes.instanceOf(L.LatLng)).isRequired,
  optionIdxFn: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.object.isRequired
  )
}
