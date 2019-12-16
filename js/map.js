mapboxgl.accessToken = 'pk.eyJ1IjoicGFuYW1hY2hlbmciLCJhIjoiY2s0N3MzbjViMHlkYjNkbWt4bjF2OHN3ZiJ9.qXx-2uH3-_Y1zMPd8E2jfw';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center:  [-98, 38.88],
  minZoom: 2,
  zoom: 4
});

map.on('load', function() {
  map.addSource('counties', {
    'type': 'vector',
    'url':  'mapbox://mapbox.82pkq93d'
  });

  map.addLayer({
    'id': 'counties',
    'type': 'fill',
    'source': 'counties',
    'source-layer': 'original',
    'paint': {
      'fill-outline-color': 'rgba(0,0,0,0.1)',
      'fill-color': 'rgba(0,0,0,0.1)'
    },
  }, 'settlement-label');

  map.addLayer({
    'id': 'counties-highlighted',
    'type': 'fill',
    'source': 'counties',
    'source-layer': 'original',
    'paint': {
      'fill-outline-color': '#484896',
      'fill-color': '#6e599f',
      'fill-opacity': 0.75
    },
    'filter': ['in', 'FIPS', '']
  }, 'settlement-label'); // Place polygon under these labels.

  map.on('click', function(e) {
    var bbox = [
      [e.point.x, e.point.y],
      [e.point.x, e.point.y]
    ];

    var features = map.queryRenderedFeatures(bbox, {
      layers: ['counties']
    });

    var filter = features.reduce(
      function(memo, feature) {
        memo.push(feature.properties.FIPS);
        return memo;
      },
      ['in', 'FIPS']
    );
      
    map.setFilter('counties-highlighted', filter);
    // console.log(e.lngLat)
    // console.log(features);
    
    if (features[0] != undefined) {
      var strModalContent = `<h4> FIPS: ${features[0].properties.FIPS}</h4><hr>
                              <h4>This area is located in <h3 style="color: red">${features[0].properties.COUNTY}</h3></h4> `;
    } else {
      var strModalContent = `No data to display`;
    }
    console.log(features[0]);

    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(strModalContent)
      .addTo(map);
  });

  map.on('mouseenter', 'places', function() {
    map.getCanvas().style.cursor = 'pointer';
  });
  
  // Change it back to a pointer when it leaves.
  map.on('mouseleave', 'places', function() {
    map.getCanvas().style.cursor = '';
  });
});