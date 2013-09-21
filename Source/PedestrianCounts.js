function createPedestrianCount(viewer) {
	var scene = viewer.scene;
	var primitives = scene.getPrimitives();
	var ellipsoid = viewer.centralBody.getEllipsoid();

	return function(cameras) {
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
	};
}