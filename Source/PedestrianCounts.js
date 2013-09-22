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
		'Average Weekday Pedestrian Activity' : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 1.0, 0.0, 0.5)),
		'Average Weekend Pedestrian Activity' : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.0, 0.0, 0.5)),
		
		'Week 1' : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 0.0, 1.0, 0.5)),
		'Week 2' : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 0.0, 0.5)),
		'Week 3' : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 1.0, 0.5)),
		'Week 4' : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.0, 1.0, 0.5)),
		
		'Monday' : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.0, 0.0, 0.5)),
		'Tuesday' : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 1.0, 0.0, 0.5)),
		'Wednesday' : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 0.0, 1.0, 0.5)),
		'Thursday' : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 1.0, 1.0, 0.5)),
		'Friday' : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 0.0, 0.5)),
		'Saturday' : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.0, 1.0, 0.5)),
		'Sunday' : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 1.0, 0.5)),
		
		'Early Morning' : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.0, 0.0, 0.5)),
		'Morning RH ' : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 1.0, 0.0, 0.5)),
		'Late Morning' : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 0.0, 1.0, 0.5)),
		'Lunch' : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 1.0, 1.0, 0.5)),
		'Late Afternoon' : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 0.0, 0.5)),
		'Evening RH' : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.0, 1.0, 0.5)),
		'Evening' : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 1.0, 0.5)),
		'Late Night' : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.5, 0.0, 0.5))		
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

		function animateExtentSlice(id) {
			extentSlice.show = true;
			extentSlice.material.uniforms.color.alpha = 0.5;
			
	        scene.getAnimations().addProperty(extentSlice, 'height', extentSlice.height, id.top, {
	            duration : 600,
	            onComplete : function() {
	            	animatingExtentSlice = false;
	            },
	            easingFunction : Cesium.Tween.Easing.Cubic.InOut
	        });
		}
		
// TODO: something cool with radius!
		var radius = 20.0;

		var extrusionInstances = [];

		for (var k = 0; k < cameras.length; ++k) {
			var camera = cameras[k];
		    var center = ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(camera.longitude, camera.latitude));

		    var bottom = 0.0;
		    var top = 0.0;
		    
		    var properties = [
///*
			   'Average Weekday Pedestrian Activity',
  			   'Average Weekend Pedestrian Activity',
//*/
/*  			   
	           'Week 1',
	           'Week 2',
	           'Week 3',
	           'Week 4'
*/
/*
			   'Monday',
			   'Tuesday',
			   'Wednesday',
			   'Thursday',
			   'Friday',
			   'Saturday',
			   'Sunday'
*/
/*  			   
  				'Early Morning',
  				'Morning RH ',
  				'Late Morning',
  				'Lunch',
  				'Late Afternoon',
  				'Evening RH',
  				'Evening',
  				'Late Night'
*/			   
		    ];
		    
		    for (var n = 0; n < properties.length; ++n) {
		    	var property = properties[n];
		    	
		    	if (!Cesium.defined(property)) {
		    		// Each year doesn't have all the data
debugger;		    		
		    		continue;
		    	}

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
			        	html : camera.name + '<br />' + property + ' ' + numberWithCommas(camera[year][property]),
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