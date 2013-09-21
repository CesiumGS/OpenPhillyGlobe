var viewer = new Cesium.Viewer('cesiumContainer', {
    selectedImageryProviderViewModel : new Cesium.ImageryProviderViewModel(
    {
        name : 'Open\u00adStreet\u00adMap',
        iconUrl : Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/openStreetMap.png'),
        tooltip : 'OpenStreetMap (OSM) is a collaborative project to create a free editable map \
of the world.\nhttp://www.openstreetmap.org',
        creationFunction : function() {
            return new Cesium.OpenStreetMapImageryProvider({
                url : 'http://tile.openstreetmap.org/'
            });
        }
    })
});
    
//Adds default balloon and tracking support (left click/right click)
viewer.extend(Cesium.viewerDynamicObjectMixin);
    
//Load a data source GeoJsonDataSource, KmlDataSource, CzmlDataSource
var geoJsonDataSource = new Cesium.GeoJsonDataSource();
    
//If you want to style the GeoJsonDataSource, you can do it before loading a file
var billboard = new Cesium.DynamicBillboard();
    
//Use a billboard instead of a point
geoJsonDataSource.defaultPoint.point = undefined;    
geoJsonDataSource.defaultPoint.billboard = billboard;
billboard.show = new Cesium.ConstantProperty(true);
billboard.image = new Cesium.ConstantProperty('http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png');
billboard.width = new Cesium.ConstantProperty(32);
billboard.height = new Cesium.ConstantProperty(32);
billboard.verticalOrigin = new Cesium.ConstantProperty(Cesium.VerticalOrigin.BOTTOM);
    
//Make polygon solid plue
geoJsonDataSource.defaultPolygon.polygon.material.color = new Cesium.ConstantProperty(Cesium.Color.clone(Cesium.Color.BLUE));
//Make polyline solid plue
geoJsonDataSource.defaultLine.polyline.color = new Cesium.ConstantProperty(Cesium.Color.clone(Cesium.Color.RED));

//Actually load the data source
geoJsonDataSource.loadUrl('Assets/example.geojson');
    
//Add it to viewer.
viewer.dataSources.add(geoJsonDataSource);
    
//If using the data source layer, you can programmatically bring up the balloon browser by assigning a dynamic object to
//viewer.balloonedObject = dynamicObject




///////////////////

var cameras = [{
		name : '1100 Block of Chestnut',
		longitude : -75.160045,
		latitude : 39.950361,
		averageWeekdayPedestrianActivity : 10729
	}, {
		name : '1700 Block of Walnut',
		longitude : -75.170419,
		latitude : 39.950103,
		averageWeekdayPedestrianActivity : 7106
	}, {
		name : '1200 Block of Walnut',
		longitude : -75.161977,
		latitude : 39.949066,
		averageWeekdayPedestrianActivity : 23642
	}, {
		name : '800 Block of Market',
		longitude : -75.154075,
		latitude : 39.951215,
		averageWeekdayPedestrianActivity : 20963
	}, {
		name : 'Intersection of 12th & Market',
		longitude : -75.160150,
		latitude : 39.951965,
		averageWeekdayPedestrianActivity : 22010
	}, {
		name : '1500 Block of Chestnut',
		longitude : -75.167012,
		latitude : 39.951249,
		averageWeekdayPedestrianActivity : 20687
	}, {
		name : '1600 Block of Chestnut',
		longitude : -75.168656,
		latitude : 39.951472,
		averageWeekdayPedestrianActivity : 23109
}];












var scene = viewer.scene;
var primitives = scene.getPrimitives();
var ellipsoid = viewer.centralBody.getEllipsoid();

// TODO: something cool with radius!
var radius = 20.0;

var outlineInstances = [];
var extrusionInstances = [];

for (var k = 0; k < cameras.length; ++k) {
	var camera = cameras[k];
	
    var center = ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(camera.longitude, camera.latitude));
    var height = 0.0;
// TODO: user control scale    
    var extrudedHeight = camera.averageWeekdayPedestrianActivity / 100.0;
    
    outlineInstances.push(new Cesium.GeometryInstance({
        geometry : new Cesium.CircleOutlineGeometry({
            center : center,
            radius : radius,
            height: height,
            extrudedHeight: extrudedHeight,
            numberOfVerticalLines: 0,
            granularity : Cesium.Math.toRadians(6.0)
        }),
        attributes : {
            color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.WHITE)
        }
    }));
    
    extrusionInstances.push(new Cesium.GeometryInstance({
        geometry : new Cesium.CircleGeometry({
            center : center,
            radius : radius,
            height: height,
            extrudedHeight: extrudedHeight,
            vertexFormat : Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
        }),
        attributes : {
            color : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 1.0, 0.0, 0.5))
        }
    }));
}

primitives.add(new Cesium.Primitive({
    geometryInstances : outlineInstances,
    appearance : new Cesium.PerInstanceColorAppearance({
        flat : true,
        renderState : {
            depthTest : {
                enabled : true
            },
            lineWidth : Math.min(4.0, scene.getContext().getMaximumAliasedLineWidth())
        }
    })
}));

primitives.add(new Cesium.Primitive({
    geometryInstances : extrusionInstances,
    appearance : new Cesium.PerInstanceColorAppearance({
        closed : true
    })
}));





var flight = Cesium.CameraFlightPath.createAnimationCartographic(scene, {
    destination : Cesium.Cartographic.fromDegrees(-75.163616, 39.952382, 1500.0),
    duration : 2000
});
scene.getAnimations().add(flight);