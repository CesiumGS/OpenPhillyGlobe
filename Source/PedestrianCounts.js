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
		var delta = 0.0001;
		// Duck typed; cameras is not an array of Cartographic.
		var e = Cesium.Extent.fromCartographicArray(cameras);
		var extentSlice = new Cesium.ExtentPrimitive({
			extent : Cesium.Extent.fromDegrees(e.west - delta, e.south - delta, e.east + delta, e.north + delta),
			show : false,
			asynchronous : false
		});
		extentSlice.__hideOnPick = true;
		primitives.add(extentSlice);

		var animatingExtentSlice = false;

		function animateExtentSlice(id) {
//			if (!animatingExtentSlice) {
				animatingExtentSlice = true;
				
				extentSlice.show = true;
				extentSlice.material.uniforms.color.alpha = 0.5;
				
		        scene.getAnimations().addProperty(extentSlice, 'height', extentSlice.height, id.top, {
		            duration : 600,
		            onComplete : function() {
		            	animatingExtentSlice = false;
		            },
		            easingFunction : Cesium.Tween.Easing.Cubic.InOut
		        });
//			}
		}
		
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
		        	html : camera.name + '<br />Average Weekday Pedestrian Activity ' + camera[year].averageWeekdayPedestrianActivity,
		        	top : top,
		        	animateExtentSlice : animateExtentSlice
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
		        	html : camera.name + '<br />Average Weekend Pedestrian Activity ' + camera[year].averageWeekendPedestrianActivity,
		        	top : top,
		        	animateExtentSlice : animateExtentSlice
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
			        	html : camera.name + '<br />' + property + ' ' + camera[year][property],
			        	top : top,
			        	animateExtentSlice : animateExtentSlice
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