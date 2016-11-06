var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
//var light = new THREE.DirectionalLight( 0xefefff, 1.0 );
//				light.position.set( 1, 1, 1 ).normalize();
var light = new THREE.HemisphereLight( 0xffffdf, 0x080820, 1 );
scene.add(light);


var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( 0xf0f0f0 );
renderer.setPixelRatio( window.devicePixelRatio );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.IcosahedronGeometry(2, 0);

var material = new THREE.MeshPhongMaterial(
    {color: 0xffdcb3, 
     specular: 0x3bbbff,
     shininess: 10,
     shading: THREE.FlatShading, 
     emissive: 0xff5757 } );


var sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );

camera.position.z = 5;


//Render loop
var render = function () {
    requestAnimationFrame(render);

    sphere.rotation.x += 0.01;
    sphere.rotation.y += 0.01;

    renderer.render(scene, camera);
};
render();

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}