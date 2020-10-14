var scene, camera, renderer, clock, deltaTime, totalTime, recording, rec, controls, background;

let modelLoaded = false;

let loader = new THREE.GLTFLoader();
let dracoLoader = new THREE.DRACOLoader();
dracoLoader.setDecoderPath('./src/draco/');
loader.setDRACOLoader(dracoLoader);

var mixer, data;

var arToolkitSource, arToolkitContext;


function setTitle(title) {
	document.title = "Vilnius iGEM AR – " + title;
}

function loadSingle(dataM, url) {
	if (dataM == undefined) return;
	data = dataM;
	initializeAR();
	load3Dmodel(data, url);
	animate()
}

function onResize() {
	arToolkitSource.onResizeElement()
	arToolkitSource.copyElementSizeTo(renderer.domElement)
	if (arToolkitContext.arController !== null) {
		arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
	}
}

function initializeAR() {
	if (navigator.userAgent.indexOf("like Mac") != -1) {
		if (navigator.userAgent.indexOf("CriOS") != -1) {
			alert("iOS nepalaiko WebRTC naršyklėje Google Chrome. Siūlome naudoti Safari.");
		} else if (navigator.userAgent.indexOf("FxiOS") != -1) {
			alert("iOS nepalaiko WebRTC naršyklėje Mozilla Firefox. Siūlome naudoti Safari.");
		}
	}

	scene = new THREE.Scene();
	let light0 = new THREE.DirectionalLight(0xcccccc, 1);
	light0.position.set(0, 3, 0);
	scene.add(light0);
	let light1 = new THREE.DirectionalLight(0xffffff, 1);
	light1.position.set(1, 1, 1);
	scene.add(light1);
	let light2 = new THREE.DirectionalLight(0xffffff, 1);
	light2.position.set(-1, 1, -1);
	scene.add(light2);
	let light3 = new THREE.DirectionalLight(0xffffff, 1);
	light3.position.set(0, -1, 2);
	scene.add(light3);

	camera = new THREE.Camera();
	scene.add(camera);

	renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true,
	});
	renderer.setClearColor(new THREE.Color('lightgrey'), 0)
	renderer.setSize(1280, 960);
	renderer.outputEncoding = THREE.sRGBEncoding;


	document.body.appendChild(renderer.domElement);

	clock = new THREE.Clock();
	deltaTime = 0;
	totalTime = 0;

	document.getElementById("close-button").addEventListener('click', function () {
		$('#model-info').css('display', 'none');
	}, false);
	////////////////////////////////////////////////////////////
	// setup arToolkitSource
	////////////////////////////////////////////////////////////

	arToolkitSource = new THREEx.ArToolkitSource({
		sourceType: 'webcam',
	});

	arToolkitSource.init(function onReady() {
		onResize()
	});

	// handle resize event
	window.addEventListener('resize', onResize);

	////////////////////////////////////////////////////////////
	// setup arToolkitContext
	////////////////////////////////////////////////////////////	

	// create atToolkitContext
	arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl: 'src/pattern/camera_para.dat',
		detectionMode: 'mono',
		imageSmoothingEnabled: true
	});

	// copy projection matrix to camera when initialization complete
	arToolkitContext.init(function onCompleted() {
		camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
	});

}

function showModelInfo(info) {
	document.getElementById("st-name").innerHTML = info.title;
	document.getElementById("text-info").innerHTML = info.description;
	document.getElementById("model-info").style.display = 'flex';
}

function load3Dmodel(item, url, ar = true) {
	let modelData = item.model;

	let modelMeta = item.meta;
	document.getElementById("info-button").addEventListener('click', function () {
		showModelInfo(modelMeta)
	});
	// interpolates from last position to create smoother transitions when moving.
	// parameter lerp values near 0 are slow, near 1 are fast (instantaneous).
	let root = new THREE.Group();
	root.name = "3Dmodel"
	scene.add(root);
	let smoothedControl;
	if (ar) {
		smoothedControl = new THREEx.ArSmoothedControls(root, {
			lerpPosition: 0.8,
			lerpQuaternion: 0.8,
			lerpScale: 1
		});

		// build markerControls
		let markerControls = new THREEx.ArMarkerControls(
			arToolkitContext,
			root, {
				type: 'pattern',
				patternUrl: "src/pattern/ar.patt",
			}
		);
	}

	//	let modelPath = modelData.path;
	let pos = modelData.pos;
	let rot = modelData.rot;

	if (pos == undefined) pos = {
		z: 0,
		y: 0,
		x: 0
	};
	if (rot == undefined) rot = {
		z: 0,
		y: 0,
		x: 0
	};
	let meshItem;

	loader.load(url, function (load_model) {

		meshItem = load_model.scene;
		let scale = modelData.scale * 0.25;
		meshItem.scale.set(scale, scale, scale);
		meshItem.position.x = pos.x;
		meshItem.position.y = pos.y;
		meshItem.position.z = pos.z;
		meshItem.rotation.x = rot.x;
		meshItem.rotation.y = rot.y;
		meshItem.rotation.z = rot.z;
		modelData.actions = [];
		modelData.mixer = new THREE.AnimationMixer(meshItem);
		for (let i = 0; i < load_model.animations.length; i++) {
			let action = modelData.mixer.clipAction(load_model.animations[i]);
			modelData.actions.push(action);
			action.play()
		}
		root.add(meshItem);
		scene.children[5].children[0].name = '3DmodelGroup'

	}, function (xhr) {
		console.log((xhr.loaded / xhr.total * 100) + '% loaded');

	}, function (error) {
		console.error(error);
	});
	modelData.visible = false;
	modelData.root = root;
	modelData.control = smoothedControl;
}

function setupModel(params) {
	var sceneChildren = scene.children[5];
	var object = scene.getObjectByName("3DmodelGroup");
	object.position.x = params.pos.x
	object.position.y = params.pos.y
	object.position.z = params.pos.z
	object.rotation.x = params.rot.x
	object.rotation.y = params.rot.y
	object.rotation.z = params.rot.z
	object.scale.x = object.scale.y = object.scale.z = params.scale * 0.25
}


function update() {

	// update artoolkit on every frame
	if (arToolkitSource != undefined && arToolkitSource.ready !== false)
		arToolkitContext.update(arToolkitSource.domElement);

	let item = data;
	item.model.control.update(item.model.root);

	if (item.model.root == undefined) return;
	if (item.model.actions == undefined) return;
	if (item.model.root.visible === item.model.visible) return;
	item.model.visible = item.model.root.visible;
}


function animate() {
	if (renderer === undefined) return;
	deltaTime = clock.getDelta();
	totalTime += deltaTime;
	if (data.model.mixer != null) data.model.mixer.update(deltaTime);

	if (controls != undefined) controls.update();
	update()
	renderer.render(scene, camera); // model update
	requestAnimationFrame(animate);
}
