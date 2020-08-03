/**
 * This file is specific to rendering and add markers to a specific map.
 * It contains the functions specific to the google maps api.
 */

// coordinates for centering the map around Singapore
const SG_LATITUDE = 1.3521;
const SG_LONGITUDE = 103.8198;
const SG_MAP_ZOOM = 11;
// appropriate zoom for the map to show the individual job
const JOB_MAP_ZOOM = 15;

/**
 * Creates a map in the provided html div.
 *
 * @param {String} mapElementId The map element id.
 * @param {float} latitude The center latitude. Defaulted to Singapore lat.
 * @param {float} longitude The center longitude. Defaulted to Singapore lon.
 * @param {int} zoom The zoom of the map. Defaulted to Singapore zoom.
 * @return {google.maps.Map} The map object created.
 */
function createMap(mapElementId, latitude=SG_LATITUDE,
    longitude=SG_LONGITUDE, zoom=SG_MAP_ZOOM) {
  if (mapElementId === '') {
    throw new Error('map element id should not be empty');
  }

  return new google.maps.Map(document.getElementById(mapElementId), {
    center: {lat: latitude, lng: longitude},
    zoom: zoom,
  });
}

/**
 * Drops the markers so that the user can see them falling.
 * The pins indicate the location of the job. You can also
 * click on them to get some information about them.
 *
 * @param {google.maps.Map} map The map to add the marker to.
 * @param {Object} job The job to be added to the marker.
 * @return {google.maps.Marker} The marker created.
 */
function addMarker(map, job) {
  if (map === null) {
    throw new Error('map should not be null');
  }

  const jobLocation = job['jobLocation'];
  return new google.maps.Marker({
    position: {lat: jobLocation['latitude'], lng: jobLocation['longitude']},
    map: map,
    animation: google.maps.Animation.DROP,
    title: job['jobTitle'],
  });
}

/**
 * Finds the coordinates based on the Singapore postal code.
 *
 * @param {String} postalCode The postal code.
 * @return {Object} The coordinates. Returns empty object for any error.
 */
function findCoordinates(postalCode) {
  const request = {
    query: `Singapore ${postalCode}`,
    fields: ['name', 'geometry'],
  };

  console.log('request', request);

  /* HTML element required for rendering the results. */
  const service = new google.maps.places.PlacesService(
      document.getElementById('places-results'));

  return service.findPlaceFromQuery(request, (results, status) => {
    console.log('response', status);
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      // there should only be one location with that postal code
      if (results.length != 1) {
        throw new Error('unable to find one location for given postal code: ' +
            postalCode);
      }
      const location = results[0].geometry.location;
      console.log('location', location.lat(), location.lng());
      return {
        latitude: location.lat(),
        longitude: location.lng(),
      };
    }
  });
}

export {createMap, addMarker, findCoordinates, JOB_MAP_ZOOM};
