var camera, scene, renderer;
var cameraControls;
var uniforms;
var canvasWidth, canvasHeight
var shaderWindow;
var shaderMaterial;
var gui;
var gridXZ;
var clock = new THREE.Clock();
var planeFollowCameraValue = true;
var eyeFollowCameraValue = true;

function fillScene() {
	scene = new THREE.Scene();

	var light = new THREE.DirectionalLight( 0xffffff, 0.7 );
	light.position.set( 200, 200, 200 );
	scene.add( light );
	light = new THREE.DirectionalLight( 0xffffff, 0.7 );
	light.position.set(-200,200,-200);
	scene.add(light);

 	gridXZ = new THREE.GridHelper(2000, 100, new THREE.Color(0xCCCCCC), new THREE.Color(0x888888));
 	//scene.add(gridXZ);

 	initGUI();
 	drawShaderWindow();
}


// Set up the plane that the shader will be drawn to.
// Link the shaders and pass all of the uniforms to them
function drawShaderWindow(){

	var shaderResolution = new THREE.Vector2(100,100); // must be square

	uniforms = {
        iTime: {type: "f", value: 0.1},
        macroCameraNormal: {type: "vec3", value: new THREE.Vector3(1.0,0.0,0.0)},
        shaderResolution: {type: "vec2", value: shaderResolution},
        shaderPlane: {type: "bool", value: false},
        depthShader: {type: "bool", value: false},
        materialColor: {type: "vec3", value: new THREE.Vector3(1.0,0.0,0.0)},
        alpha: {type: "f", value: 1.0},
        morphFractal: {type: "bool", value: false},
        twistField: {type: "bool", value: false},
        fractalPower: {type: "f", value: 3.0},
        YRotate: {type: "bool", value: false},
        fieldSelect: {type: "int", value: 7},
    };

    var vertexShader = document.getElementById('vertexShader').text;
    var fragmentShader = document.getElementById('fragmentShader').text;

    shaderMaterial = new THREE.ShaderMaterial(
        {
          uniforms : uniforms,
          vertexShader : vertexShader,
          fragmentShader : fragmentShader,
          side: THREE.DoubleSide,
          transparent: true,
        });

    var shaderGeometry = new THREE.PlaneGeometry(shaderResolution.x, shaderResolution.y);

    shaderWindow = new THREE.Mesh(shaderGeometry, shaderMaterial);

    // The magic, simply ensure that the plane is always orthogonal to the camera view direction
    // This will be called each render call as well.
	shaderWindow.lookAt(camera.position);

    scene.add(shaderWindow);


}

// Draw the GUI that can be used to manipulate the uniforms that are passed to the shaders.
function initGUI(){


	gui = new dat.GUI();

	var isFractal = true;

	parameters = 
	{
		x: 0, y: 0, z: 0,
		color: "#ff0000",
		opacity: 1, 
		depthShader: false,
		shaderPlane: false,
		material: "Phong",
		morphFractal: false,
		twistField: false,
		fractalPower: 3.0,
		YRotate: false,
		grid: false,
		objectSelect: "MandelBulb",
		planeFollowCamera: true,
		eyeFollowCamera: true,
	};


	// Position modification removed, this is showcased in the other file.
	// This is because the view messes up when the object is not at the origin and the 
	// camera is directly above it.
	/*
	var locationFolder = gui.addFolder('Position');
	var selectX = locationFolder.add( parameters, 'x' ).min(-100).max(100).step(1).listen();
	var selectY = locationFolder.add( parameters, 'y' ).min(-100).max(100).step(1).listen();
	var selectZ = locationFolder.add( parameters, 'z' ).min(-100).max(100).step(1).listen();
	//folder1.open();

	selectX.onChange(function(value) 
	{   shaderWindow.position.x = value;   });
	selectY.onChange(function(value) 
	{   shaderWindow.position.y = value;   });
	selectZ.onChange(function(value) 
	{   shaderWindow.position.z = value;   });
	*/

	 // Chose the color of the object
	var selectColor = gui.addColor( parameters, 'color' ).name('Color').listen();
	selectColor.onChange(function(value) // onFinishChange
	{   var c = new THREE.Color(value);
		uniforms.materialColor.value = new THREE.Vector3(c.r,c.g,c.b); 
	});

	 // The options to chose the distance field from
	var fieldList = [ 
					"Morphing Sphere",		//0
					"Tearing Cube",			//1
					"Coil",					//2
					"Expanding Torus",		//3
					"Sphere Composition",	//4
					"Twisted Torus",		//5
					"Flowing Torus",		//6
					"MandelBulb",			//7
					];
	var objectSelect = gui.add( parameters, 'objectSelect', fieldList ).name('Object').listen();
	objectSelect.onChange(function(value) 
	{
		uniforms.fieldSelect.value = fieldList.indexOf(value);
		isFractal = (value == "MandelBulb");
		updateFractalGUI(isFractal);
	});

	// Begin a constant rotation of the object about the y-axis
	var YRotate = gui.add( parameters, 'YRotate' ).name('Y Rotation').listen();
	YRotate.onChange(function(value) 
	{   
		uniforms.YRotate.value = value;
	});

	// Begin a oscillating twisting of the object about the y-axis
	var twistField = gui.add( parameters, 'twistField' ).name('Twist Field').listen();
	twistField.onChange(function(value) 
	{   
		uniforms.twistField.value = value;
	});


	var viewOptions = gui.addFolder("View Options");
	
	// Display the grid, helps to show that the object is in a scene
	var grid = viewOptions.add( parameters, 'grid' ).name('Grid').listen();
	grid.onChange(function(value) 
	{   
		if(value)
			scene.add(gridXZ);
		else
			scene.remove(gridXZ);
	});


	// Show the shader plane, helps understand how this all works
	var shaderPlane = viewOptions.add( parameters, 'shaderPlane' ).name('Shader Plane').listen();
	shaderPlane.onChange(function(value) 
	{   
		uniforms.shaderPlane.value = value;
		if(value){
			scene.add(gridXZ);
		}
	});

	var planeFollowCamera = viewOptions.add( parameters, 'planeFollowCamera' ).name('Plane To Camera').listen();
	planeFollowCamera.onChange(function(value) 
	{   
		planeFollowCameraValue = value;
		if(!value)
			scene.add(gridXZ);
	});

	var eyeFollowCamera = viewOptions.add( parameters, 'eyeFollowCamera' ).name('Eye To Camera').listen();
	eyeFollowCamera.onChange(function(value) 
	{   
		eyeFollowCameraValue = value;
		if(!value)
			scene.add(gridXZ);
	});

	viewOptions.open();

	// Options that are exclusive to the MandleBulb
	var fractalOptions = gui.addFolder('MandelBulb Parameters');

	var fractalPower = fractalOptions.add( parameters, 'fractalPower' ).min(-10).max(10).step(1).name('Fractal Power').listen();
	fractalPower.onChange(function(value)
	{uniforms.fractalPower.value = value;});

	var morphFractal = fractalOptions.add( parameters, 'morphFractal' ).name('Morph Fractal').listen();
	morphFractal.onChange(function(value)
	{uniforms.morphFractal.value = value;});

	var depthLighting = fractalOptions.add( parameters, 'depthShader' ).name('March Shade').listen();
	depthLighting.onChange(function(value) 
	{uniforms.depthShader.value = value;});

	fractalOptions.open();

	
	// Hide the fractal options when we are not showing a fractal
	function updateFractalGUI(isFractal){
		if(isFractal)
			fractalOptions.open();
		else
			fractalOptions.close();
	}

	gui.open();

}


// Set up the THREE.js renderer and camera
function init() {
	canvasWidth = 1280;
	canvasHeight = 720;
	var canvasRatio = canvasWidth / canvasHeight;

	renderer = new THREE.WebGLRenderer( { antialias: true } );

	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor( 0xffffff, 1.0 );

	camera = new THREE.PerspectiveCamera( 45, canvasRatio, 1, 4000 );
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
	camera.position.set(70,50,70);
	cameraControls.target.set(0,0,0);

}



function addToDOM() {
    var canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
}


function animate() {
	window.requestAnimationFrame(animate);
	render();
}


function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);

	// Update the view and time of the shader ---------
	uniforms.iTime.value += delta;
	if(eyeFollowCameraValue){
		uniforms.macroCameraNormal.value = camera.position;
	}
	else{
		uniforms.macroCameraNormal.value = new THREE.Vector3(1.0,0.0,0.0);
	}
	if(planeFollowCameraValue){
		shaderWindow.lookAt(camera.position);
	}
	//-------------------------------------------------

	renderer.render(scene, camera);
}


try {
  init();
  fillScene();
  addToDOM();
  animate();
} catch(error) {
    console.log("Error:");
    console.log(error);
}
