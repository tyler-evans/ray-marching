var camera, scene, renderer;
var cameraControls;

var clock = new THREE.Clock();

var shaderWindows = [];
var uniformList = [];

// Returns a copy of the uniforms that will be passed to the shaders.
// We need new uniforms for each shader since we wish to have different objects.
function getUniforms(shaderResolution){
	var uniforms = {
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
	    fieldSelect: {type: "int", value: 6},
	};

	return uniforms;
}

function createShaderObject(resolution, color, fieldNum, position){
	var uniforms = getUniforms(resolution);
	uniforms.materialColor.value = new THREE.Vector3(color.x,color.y,color.z);
	uniforms.fieldSelect.value = fieldNum;
	drawShaderWindow(position, resolution, uniforms);
}

// Link the shaders and pass all of the uniforms to them
function drawShaderWindow(position, shaderResolution, uniforms){

    uniformList.push(uniforms);

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


    shaderWindow.position.set(position.x,position.y,position.z);
	shaderWindow.lookAt(camera.position);

	shaderWindows.push(shaderWindow);


    scene.add(shaderWindow);


}



function fillScene() {
	scene = new THREE.Scene();

	// Add some light
	scene.add( new THREE.AmbientLight( 0x222222 ) );
	var light = new THREE.DirectionalLight( 0xffffff, 0.7 );
	light.position.set( 200, 500, 500 );
	scene.add( light );
	light = new THREE.DirectionalLight( 0xffffff, 0.9 );
	light.position.set( -400, -100, -200 );
	scene.add( light );

	// Add the grid
	var gridXZ = new THREE.GridHelper(2000, 100, new THREE.Color(0xCCCCCC), new THREE.Color(0x888888));
	scene.add(gridXZ);

 	drawClawMachine();

 	var shaderResolution, color, fieldNum, position;
	shaderResolution = new THREE.Vector2(500,500);
	color = new THREE.Vector3(0.0,1.0,1.0);
	fieldNum = 6;
	position = new THREE.Vector3(0,500,0);
	createShaderObject(shaderResolution, color, fieldNum, position);

	color = new THREE.Vector3(0.0,1.0,1.0);
	fieldNum = 1;
	position = new THREE.Vector3(500,75,500);
	createShaderObject(shaderResolution, color, fieldNum, position);

	fieldNum = 5;
	position = new THREE.Vector3(800,75,-1200);
	createShaderObject(shaderResolution, color, fieldNum, position);

	fieldNum = 0;
	position = new THREE.Vector3(-500,75,-500);
	createShaderObject(shaderResolution, color, fieldNum, position);
}


// Condensed since only here for show
function drawClawMachine() {  var bodyMaterial = new THREE.MeshLambertMaterial();  bodyMaterial.color.setRGB( 1, 0.1, 0.1 );  var base = new THREE.Mesh(   new THREE.BoxGeometry( 300, 250, 300 ), bodyMaterial );  base.position.x = 0;  base.position.y = 125;  base.position.z = 0;  scene.add( base );  var sideWall = new THREE.Mesh(   new THREE.BoxGeometry( 300, 150, 20 ), bodyMaterial );  sideWall.position.set(0,325,-140);  scene.add( sideWall );  sideWall = new THREE.Mesh(   new THREE.BoxGeometry( 20, 150, 300 ), bodyMaterial );   sideWall.position.set(140,325,0);   scene.add( sideWall );  sideWall = new THREE.Mesh(   new THREE.BoxGeometry( 300, 150, 20 ), bodyMaterial );   sideWall.position.set(0,325,140);   scene.add( sideWall );  sideWall = new THREE.Mesh(   new THREE.BoxGeometry( 20, 150, 200 ), bodyMaterial );   sideWall.position.set(-140,325,-50);   scene.add( sideWall );  sideWall = new THREE.Mesh(   new THREE.BoxGeometry( 20, 60, 200 ), bodyMaterial );   sideWall.position.set(-140,370,50);   scene.add( sideWall );  var lightGray = new THREE.MeshLambertMaterial();  lightGray.color.setRGB( .5, .5, .5 );  sideWall = new THREE.Mesh(   new THREE.BoxGeometry( 50, 200, 10 ), lightGray );   sideWall.position.set(-105,299,45);   scene.add( sideWall );  sideWall = new THREE.Mesh(   new THREE.BoxGeometry( 10, 200, 100 ), lightGray );   sideWall.position.set(-80,299,90);   scene.add( sideWall );  var blackBody = new THREE.MeshLambertMaterial();  blackBody.color.setRGB( .2, .2, .2 );     var toyBase = new THREE.Mesh(   new THREE.BoxGeometry( 225, 10, 290 ), blackBody);  toyBase.position.x = 30;  toyBase.position.y = 305;  toyBase.position.z = 0;  scene.add( toyBase );  toyBase = new THREE.Mesh(   new THREE.BoxGeometry( 225, 10, 199 ), blackBody);  toyBase.position.x = -30;  toyBase.position.y = 305;  toyBase.position.z = -50;  scene.add( toyBase );  var partialStand1, partialStand1;  partialStand1 = new THREE.Mesh(   new THREE.BoxGeometry( 20, 400, 10 ), bodyMaterial );   partialStand1.position.set(10,600,5);  partialStand2 = new THREE.Mesh(   new THREE.BoxGeometry( 10, 400, 20 ), bodyMaterial );   partialStand2.position.set(5,600,10);  var stand1 = new THREE.Group();  stand1.add(partialStand1);  stand1.add(partialStand2);  var stand2 = stand1.clone();  stand2.rotation.y += Math.PI/2;  var stand3 = stand1.clone();  stand3.rotation.y += Math.PI;  var stand4 = stand1.clone();  stand4.rotation.y += 3*Math.PI/2;  stand1.position.set(-150,0,-150);  stand2.position.set(-150,0,150);  stand3.position.set(150,0,150);  stand4.position.set(150,0,-150);  scene.add(stand1);  scene.add(stand2);  scene.add(stand3);  scene.add(stand4);  var glassMaterial = new THREE.MeshLambertMaterial();  glassMaterial.color.setRGB( 1, 1, 1 );  glassMaterial.transparent = true;  glassMaterial.opacity = 0.5;  var pane = new THREE.Mesh(   new THREE.BoxGeometry( 5, 400, 290 ), glassMaterial );  pane.position.set(-145,600,0);  /*scene.add( pane );  pane = new THREE.Mesh(   new THREE.BoxGeometry( 5, 400, 290 ), glassMaterial );  pane.position.set(145,600,0);  scene.add( pane );  pane = new THREE.Mesh(   new THREE.BoxGeometry( 290, 400, 5 ), glassMaterial );  pane.position.set(0,600,145);  scene.add( pane );  pane = new THREE.Mesh(   new THREE.BoxGeometry( 290, 400, 5 ), glassMaterial );  pane.position.set(0,600,-145);  scene.add( pane );*/  var top = new THREE.Mesh(   new THREE.BoxGeometry( 300, 100, 300 ), bodyMaterial );  top.position.set(0,790,0);  scene.add( top );  var joystickBase = new THREE.Mesh(   new THREE.BoxGeometry( 50, 50, 100 ), lightGray );  joystickBase.position.set(-170,350,-50);  scene.add(joystickBase);  joystickBase = new THREE.Mesh(   new THREE.SphereGeometry(10), blackBody);  joystickBase.position.set(-170,370,-50);  scene.add(joystickBase);  var pivot = new THREE.Group();  pivot.position.set(-170,375,-50);  var joystick = new THREE.Mesh(   new THREE.CylinderGeometry(5, 5, 30), blackBody);  joystick.position.set(0,10,0);  pivot.add(joystick);  scene.add(pivot);  var slideSpeed = 7;  var maxSlideX = 110;  var maxSlideZ = 100;  var egoCentric = false;  document.addEventListener("keydown", moveClaw, false);  function moveClaw(keyPress) {   var key = keyPress.which;   if(key == 86){    if(!egoCentric){        camera.position.set( -600, 600, 0);     cameraControls.target.set(0,500,0);     egoCentric = true;    }    else{     camera.position.set(-1200, 970, 750);    cameraControls.target.set(4,301,92);     egoCentric = false;    }   }  };    }


function init() {
	var canvasWidth = 1280;
	var canvasHeight = 720;
	var canvasRatio = canvasWidth / canvasHeight;
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor( 0xAAAAAA, 1.0 );
	camera = new THREE.PerspectiveCamera( 45, canvasRatio, 1, 4000 );
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
	cameraControls.keyPanSpeed = 0;
	//camera.position.set( -1100, 900, -800);
	camera.position.set(-1200, 970, 750);
	cameraControls.target.set(4,301,92);
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

	shaderWindows[1].position.y = 500*Math.abs(Math.sin(clock.elapsedTime)) + 75;
	shaderWindows[2].position.x = 800*Math.sin(clock.elapsedTime) + 75;

	// Update the views and times of all of the shaders
	for(i=0; i<uniformList.length; i++){
		uniformList[i].iTime.value += delta;
		uniformList[i].macroCameraNormal.value = camera.position;
	}

	// Ensure that all of the shaders are looking at the camera
	for(i=0; i<shaderWindows.length; i++){
		shaderWindows[i].lookAt(camera.position);
	}



	renderer.render(scene, camera);
}

	
try {
  init();
  fillScene();
  addToDOM();
  animate();
} catch(error) {
    console.log("You did something bordering on utter madness. Error was:");
    console.log(error);
}
