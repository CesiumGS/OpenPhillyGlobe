function createPedestrianCount(viewer) {
	var scene = viewer.scene;
	var primitives = scene.getPrimitives();
	var ellipsoid = viewer.centralBody.getEllipsoid();

// TODO: UI for these
	var year = 'year2013';
//	var year = 'year2012';
	
// TODO: Potential UI for these.  Low priority.
	var scale = 1.0 / 100.0;
	var colors = {
		averageWeekdayPedestrianActivity : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 1.0, 0.0, 0.5)),
		averageWeekendPedestrianActivity : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.0, 0.0, 0.5)),
		
		week1 : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 0.0, 1.0, 0.5)),
		week2 : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 0.0, 0.5)),
		week3 : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 1.0, 0.5)),
		week4 : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.0, 1.0, 0.5)),
		
		monday : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.0, 0.0, 0.5)),
		tuesday : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 1.0, 0.0, 0.5)),
		wednesday : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 0.0, 1.0, 0.5)),
		thursday : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 1.0, 1.0, 0.5)),
		friday : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 0.0, 0.5)),
		saturday : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.0, 1.0, 0.5)),
		sunday : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 1.0, 0.5))
	}
	
	return function(cameras) {
// TODO: something cool with radius!
		var radius = 20.0;

		var extrusionInstances = [];

		for (var k = 0; k < cameras.length; ++k) {
			var camera = cameras[k];
		    var center = ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(camera.longitude, camera.latitude));

		    var bottom = 0.0;
		    var top = 0.0;
		    
/*
		    bottom = top;
		    top += camera[year].averageWeekdayPedestrianActivity * scale;

		    extrusionInstances.push(new Cesium.GeometryInstance({
		        geometry : new Cesium.CircleGeometry({
		            center : center,
		            radius : radius,
		            height: bottom,
		            extrudedHeight: top,
		            vertexFormat : Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
		        }),
		        attributes : {
		            color : colors.averageWeekdayPedestrianActivity
		        },
		        id : {
		        	showBalloon : true,
		        	html : camera.name + '<br />Average Weekday Pedestrian Activity ' + camera[year].averageWeekdayPedestrianActivity
		        }
		    }));
		    
		    bottom = top;
		    top += camera[year].averageWeekendPedestrianActivity * scale;
		    
		    extrusionInstances.push(new Cesium.GeometryInstance({
		        geometry : new Cesium.CircleGeometry({
		            center : center,
		            radius : radius,
		            height: bottom,
		            extrudedHeight: top,
		            vertexFormat : Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
		        }),
		        attributes : {
		            color : colors.averageWeekendPedestrianActivity
		        },
		        id : {
		        	showBalloon : true,
		        	html : camera.name + '<br />Average Weekend Pedestrian Activity ' + camera[year].averageWeekendPedestrianActivity
		        }
		    }));
*/
		    
		    var properties = [
/*		                      
	           'week1',
	           'week2',
	           'week3',
	           'week4'
*/

			   'monday',
			   'tuesday',
			   'wednesday',
			   'thursday',
			   'friday',
			   'saturday',
			   'sunday'
		    ];
		    
		    for (var n = 0; n < properties.length; ++n) {
		    	var property = properties[n];

			    bottom = top;
			    top += camera[year][property] * scale;

			    extrusionInstances.push(new Cesium.GeometryInstance({
			        geometry : new Cesium.CircleGeometry({
			            center : center,
			            radius : radius,
			            height : bottom,
			            extrudedHeight : top,
			            granularity : Cesium.Math.toRadians(10.0),
			            vertexFormat : Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
			        }),
			        attributes : {
			            color : colors[property]
			        },
			        id : {
			        	showBalloon : true,
			        	html : camera.name + '<br />Week 1 ' + camera[year][property]
			        }
			    }));
		    }
		}

		primitives.add(new Cesium.Primitive({
		    geometryInstances : extrusionInstances,
		    appearance : new Cesium.PerInstanceColorAppearance({
		        closed : true
		    })
		}));
	};
}