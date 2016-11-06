var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var light = new THREE.DirectionalLight( 0xefefff, 1.5 );
				light.position.set( 1, 1, 1 ).normalize();
				scene.add( light );


var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( 0xf0f0f0 );
renderer.setPixelRatio( window.devicePixelRatio );
document.body.appendChild( renderer.domElement );

//var renderer = new THREE.CanvasRenderer();
//renderer.setClearColor( 0xf0f0f0 );
//renderer.setPixelRatio( window.devicePixelRatio );
//renderer.setSize( window.innerWidth, window.innerHeight );
//document.body.appendChild(renderer.domElement);

var geometry = new THREE.IcosahedronGeometry(2, 0);

//var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
var sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );

camera.position.z = 5;


//Render loop
var render = function () {
    requestAnimationFrame(render);

    sphere.rotation.x += 0.01;
    sphere.rotation.y += 0.01;
    sphere.rotation.z += 0.01;


    renderer.render(scene, camera);
};
render();

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}