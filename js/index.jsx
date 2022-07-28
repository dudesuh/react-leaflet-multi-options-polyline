import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FeatureGroup } from 'react-leaflet';
import { Polyline } from 'react-leaflet';
import L from 'leaflet';
import { getBounds } from 'geolib';
import { useMap } from 'react-leaflet/hooks';

export default function ReactLeafletMultiOptionsPolyline(props) {
    const mapPositions = () => {
        const { positions, optionIdxFn, options } = props;
        const lines = new Array(options.length);
        const currentLine = new Array(options.length);
        for (let idx = 0; idx < options.length; ++idx) {
            currentLine[idx] = [];
            lines[idx] = [];
        }
        let last;
        let lastLineIdx = 0;
        let currentLineIdx = 0;
        for (let idx = 1; idx < positions.length; ++idx) {
            const item = positions[idx];
            const previous = positions[idx - 1];
            const coordinates = new L.LatLng(item.lat, item.lng);
            currentLineIdx = optionIdxFn(item, previous, idx, positions);
            currentLine[currentLineIdx].push(coordinates);
            // If 1st item, must handle item at index 0;
            if (idx === 1) {
                last = previous;
                lastLineIdx = optionIdxFn(
                    previous,
                    previous,
                    idx - 1,
                    positions
                );
                currentLine[lastLineIdx].push(last);
                if (lastLineIdx !== currentLineIdx) {
                    currentLine[lastLineIdx].push(coordinates);
                    lines[lastLineIdx].push(currentLine[lastLineIdx]);
                    currentLine[lastLineIdx] = [];
                }
            } else {
                // If the result of optionIdxFn from last is different from current, push last line and clear it;
                if (lastLineIdx !== currentLineIdx) {
                    currentLine[lastLineIdx].push(coordinates);
                    lines[lastLineIdx].push(currentLine[lastLineIdx]);
                    currentLine[lastLineIdx] = [];
                }
            }
            // Keep index and item
            lastLineIdx = currentLineIdx;
            last = item;
        }
        // Push last items;
        lines[currentLineIdx].push(currentLine[currentLineIdx]);
        return lines;
    };
    const [lines, setLines] = useState(mapPositions());
    const map = useMap();

    useEffect(() => {
        const bounds = getBounds(props.positions);
        map.fitBounds(
            new L.LatLngBounds(
                new L.LatLng(bounds.maxLat, bounds.minLng),
                new L.LatLng(bounds.minLat, bounds.maxLng)
            )
        );
    });

    useEffect(() => {
        setLines(mapPositions());
    }, [props.positions, props.optionIdxFn, props.options]);

    return (
        <FeatureGroup>
            {lines.map((optionsLine, optionsIdx) =>
                optionsLine.map((line, idx) => (
                    <Polyline
                        key={idx}
                        {...props}
                        positions={line}
                        {...props.options[optionsIdx]}
                    />
                ))
            )}
        </FeatureGroup>
    );
}

ReactLeafletMultiOptionsPolyline.propTypes = {
    positions: PropTypes.arrayOf(PropTypes.instanceOf(L.LatLng)).isRequired,
    optionIdxFn: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(PropTypes.object.isRequired),
};
