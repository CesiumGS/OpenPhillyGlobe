function createPedestrianCount(viewer, json, year, properties) {

	$("#pedCount").dialog("open");
	$("#pedAverage").dialog("open");

	$( "#pedAverage" ).dialog( "option", "position", { my: "center top", at: "center bottom", of: $("#pedCount") } );


	var scene = viewer.scene;
	var primitives = scene.getPrimitives();
	var ellipsoid = viewer.centralBody.getEllipsoid();

	var composite = new Cesium.CompositePrimitive();
	primitives.add(composite);

	// TODO: Potential UI for these.  Low priority.
	var scale = 1.0 / 100.0;

	var pdf = json.pdf;
	var styles = json.styles;
	var cameras = json.cameras;

	var delta = 0.0001;
	// Duck typed; cameras is not an array of Cartographic.
	var e = Cesium.Extent.fromCartographicArray(cameras);
	var extentSlice = new Cesium.ExtentPrimitive({
		extent : Cesium.Extent.fromDegrees(e.west - delta, e.south - delta, e.east + delta, e.north + delta),
		show : false,
		asynchronous : false
	});
	extentSlice.__hideOnPick = true;
	composite.add(extentSlice);

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

	for ( var k = 0; k < cameras.length; ++k) {
		var camera = cameras[k];
		var center = ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(camera.longitude, camera.latitude));

		var bottom = 0.0;
		var top = 0.0;

		for ( var n = 0; n < properties.length; ++n) {
			var property = properties[n];

			if (!Cesium.defined(camera[year][property])) {
				// Each year doesn't have all the data
				continue;
			}

			bottom = top;
			top += camera[year][property] * scale;

			var html = '<div style="font-weight: bold">' + camera.name + '</div><br />' +
                property + ' ' + numberWithCommas(camera[year][property]) + '<br /><br />' +
                '<a href="' + pdf + '" target="_blank">PDF Report</a>';

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
					// Not optimized!
					color : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(styles[property][0], styles[property][1], styles[property][2], styles[property][3]))
				},
				id : {
					showBalloon : true,
					html : html,
					top : top,
					animateExtentSlice : animateExtentSlice,
					__fadedIn : false
				}
			}));
		}
	}

	// Workaround Cesium bug
	if (extrusionInstances.length > 0) {
		var p = new Cesium.Primitive({
			geometryInstances : extrusionInstances,
			appearance : new Cesium.PerInstanceColorAppearance({
				closed : true
			}),
			// TODO: sync until we have onComplete
			asynchronous : false
		});
		composite.add(p);
	}
	
	return composite;
}