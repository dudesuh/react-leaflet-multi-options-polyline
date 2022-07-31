import React from 'react';
import ReactDOM from 'react-dom/client';
import DataMap from './DataMap';
import hallenbad from './assets/hallenbad.json';
import hochries from './assets/hochries.json';
import { Container, Row, Col } from 'react-bootstrap';
import L from 'leaflet';

var lastSlot = -1;
var lastOptionIdx = 0;

const multiOptions = {
    triZebra: {
        optionIdxFn: function (latLng, prevLatLng, index) {
            return Math.floor(index / 3) % 3;
        },
        options: [
            { color: '#2FFC14' },
            { color: '#FC14ED' },
            { color: '#FAE900' },
        ],
    },
    heartRate: {
        optionIdxFn: function (latLng) {
            var i;
            var hr = latLng.meta.hr;
            var zones = [100, 110, 120, 130, 140, 150, 160, 164]; // beats per minute

            for (i = 0; i < zones.length; ++i) {
                if (hr <= zones[i]) {
                    return i;
                }
            }
            return zones.length;
        },
        options: [
            { color: '#0000FF' },
            { color: '#0040FF' },
            { color: '#0080FF' }, // below zone
            { color: '#00FFB0' },
            { color: '#00E000' },
            { color: '#80FF00' }, // in zone
            { color: '#FFFF00' },
            { color: '#FFC000' },
            { color: '#FF0000' }, // above zone
        ],
    },
    speed: {
        optionIdxFn: function (latLng, prevLatLng) {
            var i;
            var speed;
            var speedThresholds = [30, 35, 40, 45, 50, 55, 60, 65];

            speed = latLng.distanceTo(prevLatLng); // meters
            speed /= (latLng.meta.time - prevLatLng.meta.time) / 1000; // m/s
            speed *= 3.6; // km/h

            for (i = 0; i < speedThresholds.length; ++i) {
                if (speed <= speedThresholds[i]) {
                    return i;
                }
            }
            return speedThresholds.length;
        },
        options: [
            { color: '#0000FF' },
            { color: '#0040FF' },
            { color: '#0080FF' },
            { color: '#00FFB0' },
            { color: '#00E000' },
            { color: '#80FF00' },
            { color: '#FFFF00' },
            { color: '#FFC000' },
            { color: '#FF0000' },
        ],
    },
    altitude: {
        optionIdxFn: function (latLng) {
            var i;
            var alt = latLng.alt;
            var altThresholds = [800, 900, 1000, 1100, 1200, 1300, 1400, 1500]; // meters

            if (!alt) {
                return 0;
            }

            for (i = 0; i < altThresholds.length; ++i) {
                if (alt <= altThresholds[i]) {
                    return i;
                }
            }
            return altThresholds.length;
        },
        options: [
            { color: '#0000FF' },
            { color: '#0040FF' },
            { color: '#0080FF' },
            { color: '#00FFB0' },
            { color: '#00E000' },
            { color: '#80FF00' },
            { color: '#FFFF00' },
            { color: '#FFC000' },
            { color: '#FF0000' },
        ],
    },
    inclineLast5: {
        optionIdxFn: function (latLng, prevLatLng, index, points) {
            var i;
            var minAltitude;
            var deltaAltitude;
            var deltaTime;
            var incline;
            var startIndex;
            var thresholds = [200, 300, 400, 500, 600, 700, 800, 900]; // m/h

            startIndex = Math.max(index - 5, 0);
            minAltitude = Infinity;
            for (i = startIndex; i < index; ++i) {
                minAltitude = Math.min(minAltitude, points[i].alt);
            }
            deltaAltitude = latLng.alt - minAltitude; // meters
            deltaTime =
                (latLng.meta.time - points[startIndex].meta.time) / 1000; // sec
            incline = (3600 * deltaAltitude) / deltaTime; // m/h

            if (isNaN(incline)) {
                return 4; // neutral
            }

            for (i = 0; i < thresholds.length; ++i) {
                if (incline <= thresholds[i]) {
                    return i;
                }
            }
            return thresholds.length;
        },
        options: [
            { color: '#0000FF' },
            { color: '#0040FF' },
            { color: '#0080FF' },
            { color: '#00FFB0' },
            { color: '#00E000' },
            { color: '#80FF00' },
            { color: '#FFFF00' },
            { color: '#FFC000' },
            { color: '#FF0000' },
        ],
    },
    inclineClustered: {
        optionIdxFn: function (latLng, prevLatLng, index, points) {
            var i;
            var deltaAltitude;
            var deltaTime;
            var incline;
            var startIndex;
            var endIndex;
            var gain;
            var slot;
            var slotSize = Math.floor(points.length / 60);
            var thresholds = [200, 300, 400, 500, 600, 700, 800, 900];

            slot = Math.floor(index / slotSize);
            if (slot === lastSlot) {
                return lastOptionIdx;
            }

            lastSlot = slot;
            startIndex = slot * slotSize;
            endIndex = Math.min(startIndex + slotSize, points.length) - 1;
            gain = 0;
            for (i = startIndex + 1; i <= endIndex; ++i) {
                deltaAltitude = points[i].alt - points[i - 1].alt;
                if (deltaAltitude > 0) {
                    gain += deltaAltitude;
                }
            }
            deltaTime =
                (points[endIndex].meta.time - points[startIndex].meta.time) /
                1000; // sec
            incline = (3600 * gain) / deltaTime; // m/h

            if (isNaN(incline)) {
                return (lastOptionIdx = 4); // neutral
            }

            for (i = 0; i < thresholds.length; ++i) {
                if (incline <= thresholds[i]) {
                    break;
                }
            }
            return (lastOptionIdx = i);
        },
        options: [
            { color: '#0000FF' },
            { color: '#0040FF' },
            { color: '#0080FF' },
            { color: '#00FFB0' },
            { color: '#00E000' },
            { color: '#80FF00' },
            { color: '#FFFF00' },
            { color: '#FFC000' },
            { color: '#FF0000' },
        ],
    },
    inclineSimple: {
        optionIdxFn: function (latLng, prevLatLng) {
            var i;
            var deltaAltitude;
            var deltaTime;
            var incline;
            var thresholds = [200, 300, 400, 500, 600, 700, 800, 900];

            deltaAltitude = latLng.alt - prevLatLng.alt; // meters
            deltaTime = (latLng.meta.time - prevLatLng.meta.time) / 1000; // sec
            incline = (3600 * deltaAltitude) / deltaTime; // m/h

            if (isNaN(incline)) {
                return 4; // neutral
            }

            for (i = 0; i < thresholds.length; ++i) {
                if (incline <= thresholds[i]) {
                    return i;
                }
            }
            return thresholds.length;
        },
        options: [
            { color: '#0000FF' },
            { color: '#0040FF' },
            { color: '#0080FF' },
            { color: '#00FFB0' },
            { color: '#00E000' },
            { color: '#80FF00' },
            { color: '#FFFF00' },
            { color: '#FFC000' },
            { color: '#FF0000' },
        ],
    },
};

const trackPointFactory = (data) => {
    return data.map(function (item) {
        var trkpt = L.latLng(item.lat, item.lng, item.alt);
        trkpt.meta = item.meta;
        return trkpt;
    });
};

const MapRow = (props) => (
    <Row style={{ marginTop: '2%' }}>
        <Col md={4} sm={4}>
            <h2>{props.header}</h2>
            {props.paragraph}
            <br />
            <a
                href={`https://github.com/dudesuh/react-leaflet-multi-options-polyline/blob/master/examples/src/index.js`}
            >
                View Source
            </a>
        </Col>
        <Col md={8} sm={8}>
            <DataMap
                positions={trackPointFactory(props.data)}
                {...multiOptions[props.optionName]}
            />
        </Col>
    </Row>
);

const App = () => (
    <Container>
        <Row>
            <h1>
                React Leaflet Multi Options Polyline <small>Demo</small>
            </h1>
            <h4>
                Use more than one 'options' definition depending on your data!
            </h4>
            <p>
                Here you can see some examples of color-coded polylines. For a
                description how to use this little{' '}
                <a href="https://react-leaflet.js.org">React-Leaflet</a>
                -Component, please go to the{' '}
                <a href="https://github.com/dudesuh/react-leaflet-multi-options-polyline">
                    Github page
                </a>{' '}
                of this project.
            </p>
        </Row>
        <MapRow
            header="Altitude"
            data={hochries}
            optionName="altitude"
            paragraph={
                <p>
                    Takes the (optional) `alt` property from LatLng and selects
                    a color (blue, green, yellow, orange, red) depending on
                    altitude (meters above sea level).
                </p>
            }
        />
        <MapRow
            header="Incline Clustered"
            data={hochries}
            optionName="inclineClustered"
            paragraph={
                <p>
                    This example is the most complex of all. It splits all
                    LatLngs into about 60 groups (slots). The option-index is
                    calculated for the whole group and then stored in the
                    function context. LatLngs from the same group can take this
                    cached option-index, so we can save CPU.
                    <br />
                    <br />
                    Background: the incline is often measured in meter/hour and
                    is a measurement how fast you climb on mountains. For MTB a
                    value of 600-900 m/h is quite ambitious.
                </p>
            }
        />
        <MapRow
            header="Heart Rate"
            data={hochries}
            optionName="heartRate"
            paragraph={
                <p>
                    This is easy. The value in `latLng.meta.hr` is the current
                    heartrate in beats per minute.
                    <br />
                    During a workout, in this case mountaineering, the heartrate
                    can get to its limit.
                    <br />
                    This graphic shows the color-coded heartrate from &lt;100
                    (dark blue), over the target zone (between 120 and 150 bpm,
                    shades of green) and above in yellow, orange and red (above
                    165 beats per minute).
                    <br />
                </p>
            }
        />
        <MapRow
            header="Tri-colored dashed line"
            data={hallenbad}
            optionName="triZebra"
            paragraph={
                <p>
                    This example changes color every 3 LatLng points (only 3
                    different colors).
                    <br />A much more involved task would be to change color
                    after a particular distance.
                </p>
            }
        />
        <MapRow
            header="Speed"
            data={hallenbad}
            optionName="speed"
            paragraph={
                <p>
                    Here you have a ride by car of a guy who seems to drive too
                    fast sometimes (a personally don't know him/her).
                    <br />
                    Speed is color-coded from shades of blue (&lt;= 40 km/h),
                    shades of green (&gt; 40 km/h until 55 km/h) and above it's
                    getting yellow, orange and red.
                    <br />
                    Speed is calculated by `LatLng.distanceTo()` and
                    `latLng.meta.time`.
                </p>
            }
        />
    </Container>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
