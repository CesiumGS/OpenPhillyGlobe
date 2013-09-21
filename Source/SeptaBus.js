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
                busObj.billboard.image = new Cesium.ConstantProperty('../Assets/images/septa_raised.png');
                busObj.billboard.verticalOrigin = new Cesium.ConstantProperty(Cesium.VerticalOrigin.BOTTOM);
            }
            if (!Cesium.defined(busObj.position)) {
                busObj.position = new Cesium.SampledPositionProperty();
            }
            busObj.position.addSample(viewer.clock.currentTime, ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(bus.lng, bus.lat)));
        }
    });
}