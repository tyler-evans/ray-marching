var camera, scene, renderer;
var cameraControls;

var canvasWidth, canvasHeight

var shaderWindow;
var shaderMaterial;

var shaderWindows = [];
var uniformList = [];

var gui;

var gridXZ;

var clock = new THREE.Clock();

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

function random(i,j){ // i <= result < j
	return Math.floor(Math.random() * (j-i) + i)
}


// Add a bunch of the shader objects to the scene.
// Set up all of the uniforms for the shaders.
function fillScene() {
	scene = new THREE.Scene();

	var light = new THREE.DirectionalLight( 0xffffff, 0.7 );
	light.position.set( 200, 200, 200 );
	scene.add( light );
	light = new THREE.DirectionalLight( 0xffffff, 0.7 );
	light.position.set(-200,200,-200);
	scene.add(light);

	gridXZ = new THREE.GridHelper(2000, 100, new THREE.Color(0xCCCCCC), new THREE.Color(0x888888));
	scene.add(gridXZ);

	var shaderResolution, color, fieldNum, position;
	for(j=0; j<5; j++){
		for(i=0; i<5; i++){
			shaderResolution = new THREE.Vector2(50,50);
			color = new THREE.Vector3(Math.random(),Math.random(),Math.random());
			fieldNum = random(0,7);
			position = new THREE.Vector3(40*(2-j),0,40*(i-2));
			createShaderObject(shaderResolution, color, fieldNum, position);
		}
	}



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
	camera.position.set(114,80,207);
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
    console.log("Error:");
    console.log(error);
}
