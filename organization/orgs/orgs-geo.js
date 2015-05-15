orgsObj ={};

/**
@todo - switch to MongoDB geo built in queries / indices??
http://docs.mongodb.org/manual/applications/geospatial-indexes/

http://janmatuschek.de/LatitudeLongitudeBoundingCoordinates
http://stackoverflow.com/questions/1689096/calculating-bounding-box-a-certain-distance-away-from-a-lat-long-coordinate-in-j

http://www.movable-type.co.uk/scripts/latlong.html
http://www.movable-type.co.uk/scripts/latlong-vectors.html
http://stackoverflow.com/questions/3939433/determine-points-within-a-given-radius-algorithm
http://stackoverflow.com/questions/1185408/converting-from-longitude-latitude-to-cartesian-coordinates
http://stackoverflow.com/questions/28727155/algorithm-mysql-get-all-points-within-a-radius
*/

  /**
  @param {Number} radius Distance from lat, lng in kilometers
  @param {Number} lat Latitude in degrees
  @param {Number} lng Longitude in degrees
  @return {Object}
    @param {Number} latMin
    @param {Number} latMax
    @param {Number} lngMin
    @param {Number} lngMax
  */
  orgsObj.computeBoundingLatLng =function(radius, lat, lng, params) {
    var ret ={};

    var latRadians =this.degreesToRadians(lat);
    var lngRadians =this.degreesToRadians(lng);

    var earthRadius =6371;    //km (NOT miles)
    var MIN_LAT =-1 *(Math.PI /2);
    var MAX_LAT =Math.PI /2;
    var MIN_LNG =-1 *(Math.PI);
    var MAX_LNG =Math.PI;

    var radDist =radius /earthRadius;

    ret.latMin =latRadians -radDist;
    ret.latMax =latRadians +radDist;

    if(ret.latMin > MIN_LAT && ret.latMax < MAX_LAT) {
      var lngDelta =Math.asin(Math.sin(radDist) / Math.cos(latRadians));
      ret.lngMin =lngRadians - lngDelta;
      if(ret.lngMin < MIN_LNG) {
        ret.lngMin += 2 * Math.PI;
      }
      ret.lngMax = lngRadians + lngDelta;
      if(ret.lngMax > MAX_LNG) {
        ret.lngMax -= 2 * Math.PI;
      }
    }
    else {
      // a pole is within the distance
      ret.latMin = Math.max(ret.latMin, MIN_LAT);
      ret.latMax = Math.min(ret.latMax, MAX_LAT);
      ret.lngMin = MIN_LNG;
      ret.lngMax = MAX_LNG;
    }

    //convert to back to degrees
    ret.latMin =this.radiansToDegrees(ret.latMin);
    ret.latMax =this.radiansToDegrees(ret.latMax);
    ret.lngMin =this.radiansToDegrees(ret.lngMin);
    ret.lngMax =this.radiansToDegrees(ret.lngMax);
    return ret;
  };

  orgsObj.radiansToDegrees =function(radians) {
    return radians * (180 / Math.PI);
  };

  orgsObj.degreesToRadians =function(degrees) {
    return degrees * (Math.PI / 180);
  };