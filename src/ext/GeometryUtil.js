(function() {

var defaultPrecision = {
	km: 2,
	ha: 2,
	m: 0,
	mi: 2,
	ac: 2,
	yd: 0,
	ft: 0,
	nm: 2
};


/**
 * @class L.GeometryUtil
 * @aka GeometryUtil
 */
L.GeometryUtil = L.extend(L.GeometryUtil || {}, {
	// Ported from the OpenLayers implementation. See https://github.com/openlayers/openlayers/blob/master/lib/OpenLayers/Geometry/LinearRing.js#L270

	// @method geodesicArea(): number
	geodesicArea: function (latLngs) {
		var pointsCount = latLngs.length,
			area = 0.0,
			d2r = Math.PI / 180,
			p1, p2;

		if (pointsCount > 2) {
			for (var i = 0; i < pointsCount; i++) {
				p1 = latLngs[i];
				p2 = latLngs[(i + 1) % pointsCount];
				area += ((p2.lng - p1.lng) * d2r) *
						(2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));
			}
			area = area * 6378137.0 * 6378137.0 / 2.0;
		}

		return Math.abs(area);
	},

	// @method readableArea(area, isMetric): string
	// Returns a readable area string in yards or metric
	readableArea: function (area, isMetric, precision) {
		var areaStr,
			units, 
			precision = L.Util.extend({}, defaultPrecision, precision);

		if (isMetric) {
			units = ['ha', 'm'];
			type = typeof isMetric;
			if (type === 'string') {
				units = [isMetric];
			} else if (type !== 'boolean') {
				units = isMetric;
			}

			if (area >= 1000000 && units.indexOf('km') !== -1) {
				areaStr = _round(area * 0.000001, precision['km']) + ' km&sup2;';
			} else if (area >= 10000 && units.indexOf('ha') !== -1) {
				areaStr = _round(area * 0.0001, precision['ha']) + ' ha';
			} else {
				areaStr = _round(area, precision['m']) + ' m&sup2;';
			}
		} else {
			area /= 0.836127; // Square yards in 1 meter

			if (area >= 3097600) { //3097600 square yards in 1 square mile
				areaStr = _round(area / 3097600, precision['mi']) + ' mi&sup2;';
			} else if (area >= 4840) { //4840 square yards in 1 acre
				areaStr = _round(area / 4840, precision['ac']) + ' acres';
			} else {
				areaStr = _round(area, precision['yd']) + ' yd&sup2;';
			}
		}

		return areaStr;
	},

	// @method readableDistance(distance, units): string
	// Converts a metric distance to one of [ feet, nauticalMile, metric or yards ] string
	//
	// @alternative
	// @method readableDistance(distance, isMetric, useFeet, isNauticalMile): string
	// Converts metric distance to distance string.
	readableDistance: function (distance, isMetric, isFeet, isNauticalMile, precision) {
		var distanceStr,
			units,
			precision = L.Util.extend({}, defaultPrecision, precision);

		if (isMetric) {
			units = typeof isMetric == 'string' ? isMetric : 'metric';
		} else if (isFeet) {
			units = 'feet';
		} else if (isNauticalMile) {
			units = 'nauticalMile';
		} else {
			units = 'yards';
		}

		switch (units) {
		case 'metric':
			// show metres when distance is < 1km, then show km
			if (distance > 1000) {
				distanceStr = _round(distance / 1000, precision['km']) + ' km';
			} else {
				distanceStr = _round(distance, precision['m']) + ' m';
			}
			break;
		case 'feet':
			distance *= 1.09361 * 3;
			distanceStr = _round(distance, precision['ft']) + ' ft';

			break;
		case 'nauticalMile':
			distance *= 0.53996;
			distanceStr = _round(distance / 1000, precision['nm']) + ' nm';
			break;
		case 'yards':
		default:
			distance *= 1.09361;

			if (distance > 1760) {
				distanceStr = _round(distance / 1760, precision['mi']) + ' miles';
			} else {
				distanceStr = _round(distance, precision['yd']) + ' yd';
			}
			break;
		}
		return distanceStr;
	}
});

function _round(value, precision) {
	var rounded;

	if (precision) {
		rounded = value.toFixed(precision);
	} else {
		rounded = Math.round(value);
	}

	return rounded;
}

})();
