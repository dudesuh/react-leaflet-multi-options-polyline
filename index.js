import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {FeatureGroup, Polyline} from 'react-leaflet'
import L from 'leaflet'

export default class ReactLeafletMultiOptionsPolyline extends Component {
  render () {
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
      const coordinates = new L.LatLng(item.lat, item.lng)
      currentLineIdx = optionIdxFn(item, positions[idx - 1], idx, positions)
      currentLine[currentLineIdx].push(coordinates)
      if (idx === 1) {
        last = positions[idx - 1]
        lastLineIdx = optionIdxFn(positions[idx - 1], null, idx - 1, positions)
        currentLine[lastLineIdx].push(last)
        if (lastLineIdx !== currentLineIdx) {
          currentLine[lastLineIdx].push(coordinates)
          lines[lastLineIdx].push(currentLine[lastLineIdx])
          currentLine[lastLineIdx] = []
        }
      } else {
        if (lastLineIdx !== currentLineIdx) {
          currentLine[lastLineIdx].push(coordinates)
          lines[lastLineIdx].push(currentLine[lastLineIdx])
          currentLine[lastLineIdx] = []
        }
      }
      lastLineIdx = currentLineIdx
      last = positions[idx]
    }
    // Push last items
    lines[currentLineIdx].push(currentLine)
    console.log(lines)
    return (
      <FeatureGroup>
        {options.map((lineOptions, idx) => lines[idx].map(line => <Polyline {...this.props} positions={line} {...lineOptions} />))}
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
