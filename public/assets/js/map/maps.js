(function (e) {
    if (!Array.prototype.forEach){
        e.forEach = e.forEach || function (action, that) {
            for (var i = 0, l = this.length; i < l; i++){
                if (i in this){
                    action.call(that, this[i], i, this);
                }  
            }
        };
    }

})(Array.prototype);


var mapObject,
    markers = [],
    markersData = {
        'Marker': [
            {
                location_latitude: 51.550913,
                location_longitude: -0.456819,
                status: 'For Rent',
                bed_num: '4',
                bath_num: '2',
                area: '1450',
                map_img_url: 'assets/img/property/01.jpg',
                address: '25/B Milford Road, New York',
                price: '20,000',
                title: 'New Modern Apartment',
                url: 'property-single.html',
            },
            {
                location_latitude: 51.521706,
                location_longitude: -0.065418,
                status: 'For Rent',
                bed_num: '4',
                bath_num: '2',
                area: '1450',
                map_img_url: 'assets/img/property/02.jpg',
                address: '25/B Milford Road, New York',
                price: '20,000',
                title: 'New Modern Apartment',
                url: 'property-single.html',
            },
            {
                location_latitude: 51.419960,
                location_longitude: -0.990052,
                status: 'For Rent',
                bed_num: '4',
                bath_num: '2',
                area: '1450',
                map_img_url: 'assets/img/property/03.jpg',
                address: '25/B Milford Road, New York',
                price: '20,000',
                title: 'New Modern Apartment',
                url: 'property-single.html',
            },
            {
                location_latitude: 51.617477,
                location_longitude: -0.172400,
                status: 'For Rent',
                bed_num: '4',
                bath_num: '2',
                area: '1450',
                map_img_url: 'assets/img/property/04.jpg',
                address: '25/B Milford Road, New York',
                price: '20,000',
                title: 'New Modern Apartment',
                url: 'property-single.html',
            },
            {
                location_latitude: 51.574847,
                location_longitude: -0.167921,
                status: 'For Rent',
                bed_num: '4',
                bath_num: '2',
                area: '1450',
                map_img_url: 'assets/img/property/05.jpg',
                address: '25/B Milford Road, New York',
                price: '20,000',
                title: 'New Modern Apartment',
                url: 'property-single.html',
            },
            {
                location_latitude: 51.481659,
                location_longitude: -0.339207,
                status: 'For Rent',
                bed_num: '4',
                bath_num: '2',
                area: '1450',
                map_img_url: 'assets/img/property/06.jpg',
                address: '25/B Milford Road, New York',
                price: '20,000',
                title: 'New Modern Apartment',
                url: 'property-single.html',
            },

            {
                location_latitude: 51.420938,
                location_longitude: -0.467646,
                status: 'For Rent',
                bed_num: '4',
                bath_num: '2',
                area: '1450',
                map_img_url: 'assets/img/property/01.jpg',
                address: '25/B Milford Road, New York',
                price: '20,000',
                title: 'New Modern Apartment',
                url: 'property-single.html',
            },
            {
                location_latitude: 51.501623,
                location_longitude: -0.231335,
                status: 'For Rent',
                bed_num: '4',
                bath_num: '2',
                area: '1450',
                map_img_url: 'assets/img/property/02.jpg',
                address: '25/B Milford Road, New York',
                price: '20,000',
                title: 'New Modern Apartment',
                url: 'property-single.html',
            }
        ]

    };

var mapOptions = {
    zoom: 10,
    center: new google.maps.LatLng(51.574847, -0.167921),
    mapTypeId: google.maps.MapTypeId.ROADMAP,

    mapTypeControl: false,
    mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        position: google.maps.ControlPosition.LEFT_CENTER
    },
    panControl: false,
    panControlOptions: {
        position: google.maps.ControlPosition.TOP_RIGHT
    },
    zoomControl: true,
    zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM
    },
    scrollwheel: false,
    scaleControl: false,
    scaleControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT
    },
    streetViewControl: true,
    streetViewControlOptions: {
        position: google.maps.ControlPosition.LEFT_TOP
    },
    styles: [
        {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "administrative.land_parcel",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "poi",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "labels.icon",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road.local",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "transit",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        }
    ]
};

var marker;
mapObject = new google.maps.Map(document.getElementById('property-map-listing'), mapOptions);
for (var key in markersData)
    markersData[key].forEach(function (item) {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(item.location_latitude, item.location_longitude),
            map: mapObject,
            icon: 'assets/img/property/map-marker.svg',
        });

        if ('undefined' === typeof markers[key])
            markers[key] = [];
        markers[key].push(marker);
        google.maps.event.addListener(marker, 'click', (function () {
            closeInfoBox();
            getInfoBox(item).open(mapObject, this);
            mapObject.setCenter(new google.maps.LatLng(item.location_latitude, item.location_longitude));
        }));

    });

new MarkerClusterer(mapObject, markers[key]);

function hideAllMarkers() {
    for (var key in markers)
        markers[key].forEach(function (marker) {
            marker.setMap(null);
        });
};



function closeInfoBox() {
    $('div.infoBox').remove();
};

function getInfoBox(item) {
    return new InfoBox({

        content: 
            '<div class="property-map-item">'+
                '<div class="listing-img">'+
                    '<img src="' + item.map_img_url +'" alt="">'+
                '</div>'+
                '<div class="listing-content">'+
                    '<h4 class="listing-title"><a href="' + item.url + '">' + item.title + '</a></h4>'+
                    '<p class="listing-sub-title"><i class="far fa-location-dot"></i>' + item.address + '</p>'+
                    '<div class="listing-feature">'+
                        '<ul class="listing-feature-list">'+
                            '<li><i class="far fa-bed-front"></i>' + item.bed_num + ' Beds</li>'+
                            '<li><i class="far fa-bath"></i>' + item.bath_num + ' Baths</li>'+
                            '<li><i class="far fa-compass-drafting"></i>' + item.area + ' SqFt</li>'+
                        '</ul>'+
                    '</div>'+
                    '<div class="listing-price">$' + item.price + '</div>'+
                '</div>'+
                '<div class="property-map-item-arrow"></div>'+
            '</div>',
        disableAutoPan: false,
        maxWidth: 0,
        pixelOffset: new google.maps.Size(10, 92),
        closeBoxMargin: '',
        closeBoxURL: "assets/img/property/close.png",
        isHidden: false,
        alignBottom: true,
        pane: 'floatPane',
        enableEventPropagation: true
    });
};

function onHtmlClick(location_type, key) {
    google.maps.event.trigger(markers[location_type][key], "click");
}

console.error = function(){};


