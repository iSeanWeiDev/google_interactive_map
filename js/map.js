mapboxgl.accessToken = 'pk.eyJ1IjoicGFuYW1hY2hlbmciLCJhIjoiY2s0N3MzbjViMHlkYjNkbWt4bjF2OHN3ZiJ9.qXx-2uH3-_Y1zMPd8E2jfw';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center:  [-98, 38.88],
  minZoom: 2,
  zoom: 4
});
var customData = {
  'features': [
    {
      'type': 'Feature',
      'properties': {
        'title': 'Lincoln Park',
        'description':
        'A northside park that is home to the Lincoln Park Zoo'
      },
      'geometry': {
        'coordinates': [-87.637596, 41.940403],
        'type': 'Point'
      }
    },
    {
      'type': 'Feature',
      'properties': {
        'title': 'Burnham Park',
        'description': "A lakefront park on Chicago's south side"
      },
      'geometry': {
        'coordinates': [-87.603735, 41.829985],
        'type': 'Point'
      }
    },
    {
      'type': 'Feature',
      'properties': {
        'title': 'Millennium Park',
        'description':
        'A downtown park known for its art installations and unique architecture'
      },
      'geometry': {
        'coordinates': [-87.622554, 41.882534],
        'type': 'Point'
      }
    },
    {
      'type': 'Feature',
      'properties': {
        'title': 'Grant Park',
        'description':
        "A downtown park that is the site of many of Chicago's favorite festivals and events"
      },
      'geometry': {
        'coordinates': [-87.619185, 41.876367],
        'type': 'Point'
      }
    },
    {
      'type': 'Feature',
      'properties': {
        'title': 'Humboldt Park',
        'description': "A large park on Chicago's northwest side"
      },
      'geometry': {
        'coordinates': [-87.70199, 41.905423],
        'type': 'Point'
      }
    },
    {
      'type': 'Feature',
      'properties': {
        'title': 'Douglas Park',
        'description':
        "A large park near in Chicago's North Lawndale neighborhood"
      },
      'geometry': {
        'coordinates': [-87.699329, 41.860092],
        'type': 'Point'
      }
    },
    {
      'type': 'Feature',
      'properties': {
      'title': 'Calumet Park',
        'description':
        'A park on the Illinois-Indiana border featuring a historic fieldhouse'
      },
      'geometry': {
        'coordinates': [-87.530221, 41.715515],
        'type': 'Point'
      }
    },
    {
      'type': 'Feature',
      'properties': {
      'title': 'Jackson Park',
        'description':
        "A lakeside park that was the site of the 1893 World's Fair"
      },
      'geometry': {
        'coordinates': [-87.580389, 41.783185],
        'type': 'Point'
      }
    },
    {
      'type': 'Feature',
      'properties': {
        'title': 'Columbus Park',
        'description':
        "A large park in Chicago's Austin neighborhood"
      },
      'geometry': {
        'coordinates': [-87.769775, 41.873683],
        'type': 'Point'
      }
    }
  ],
  'type': 'FeatureCollection'
  };
  function forwardGeocoder(query) {
    var matchingFeatures = [];
    for (var i = 0; i < customData.features.length; i++) {
      var feature = customData.features[i];
      // handle queries with different capitalization than the source data by calling toLowerCase()
      if (feature.properties.title.toLowerCase().search(query.toLowerCase()) !== -1) {
        // add a tree emoji as a prefix for custom data results
        // using carmen geojson format: https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
        feature['place_name'] = '🌲 ' + feature.properties.title;
        feature['center'] = feature.geometry.coordinates;
        feature['place_type'] = ['park'];
        matchingFeatures.push(feature);
      }
    }

    return matchingFeatures;
  }
     
map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    localGeocoder: forwardGeocoder,
    zoom: 14,
    placeholder: 'Enter search e.g. Lincoln Park',
    mapboxgl: mapboxgl
  })
); 
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
      var strModalContent = `<h4 style="margin-top: 0px; margin-bottom: 0px;">
                                 FIPS: ${features[0].properties.FIPS}
                              </h4><hr>
                              <h4 style="margin-top: 0px; margin-bottom: 0px;">
                                This area is located in 
                                <h3 style="color: red; margin-top: 0px; margin-bottom: 0px;">${features[0].properties.COUNTY}</h3>
                              </h4> `;
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