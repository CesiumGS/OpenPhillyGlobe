var busRoutes;

function loadSeptaBusRoute(viewer, busCollection, routeNumber) {
	Cesium.jsonp("http://www3.septa.org/hackathon/TransitView/trips.php", 
            {parameters:
            {
                route: routeNumber
            }
    }).then(function(jsonData) {
        var ellipsoid = viewer.centralBody.getEllipsoid();

        for (var i=0; i<jsonData.bus.length; i++) {
            var bus = jsonData.bus[i];
            var busObj = busCollection.getOrCreateObject(bus.label);
            if (!Cesium.defined(busObj.billboard)) {
                busObj.billboard = new Cesium.DynamicBillboard();
                busObj.billboard.image = new Cesium.ConstantProperty('Assets/images/septa_raised.png');
                busObj.billboard.verticalOrigin = new Cesium.ConstantProperty(Cesium.VerticalOrigin.BOTTOM);
                busObj.billboard.nearFarScalar = new Cesium.ConstantProperty(new Cesium.NearFarScalar(5e2, 1.0, 1.0e4, 0.1));
            }
            if (!Cesium.defined(busObj.position)) {
                busObj.position = new Cesium.SampledPositionProperty();
                busObj.position.addSample(viewer.clock.currentTime.clone(), ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(bus.lng, bus.lat)));
            } else {
                busObj.position.addSample(viewer.clock.currentTime.clone().addSeconds(30), ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(bus.lng, bus.lat)));
            }
            //busObj.position = new Cesium.ConstantPositionProperty(ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(bus.lng, bus.lat)));
            var balloonContent = "<table>" +
                    "<tr><td>Label: </td><td>"+bus.label+"</td></tr>" +
                    "<tr><td>Direction: </td><td>"+bus.Direction+"</td></tr>" +
                    "<tr><td>Destination: </td><td>"+bus.destination+"</td></tr>" +
                    "</table>";
            busObj.balloon = new Cesium.ConstantProperty(balloonContent);
        }
    },
    function() {
        // TODO: error
    });
}

function createSeptaBusRoutes(viewer, busCollection) {

	return function loadData(jsonData) {
		busRoutes = jsonData;
		loadSeptaRoutes(viewer, busCollection);
	}
}

function loadSeptaRoutes(viewer, busCollection) {
	for (var i=0; i<busRoutes.length; i++) {
		if (busRoutes[i].route_short_name !== "BSS" &&
				busRoutes[i].route_short_name !== "MFL" &&
				busRoutes[i].route_short_name !== "LUCYGO" &&
				busRoutes[i].route_short_name !== "LUCYGR" &&
				busRoutes[i].route_short_name !== "NHSL" &&
				busRoutes[i].route_short_name !== "NHSLS" &&
				busRoutes[i].route_short_name !== "10B" &&
				busRoutes[i].route_short_name !== "15B") {
			//console.log(busRoutes[i].route_short_name);
			loadSeptaBusRoute(viewer, busCollection, busRoutes[i].route_short_name);
		}
	}
}