//The basics of a 3D scene, the scene graph, camera, light, and renderer
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000 );
//var light = new THREE.DirectionalLight( 0xefefff, 1.0 );
//				light.position.set( 1, 1, 1 ).normalize();
camera.position.z = 10;

var light = new THREE.HemisphereLight( 0xffffdf, 0x080820, 1 );
scene.add(light);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x93cbc6);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);


var Environment = {
    init : function() {
        this.geometry = new THREE.IcosahedronGeometry(2, 0);

        this.material = new THREE.MeshPhongMaterial({
            color: 0xffdcb3,
//            transparent: true, opacity: 0.5,
            shininess: 30,
            shading: THREE.FlatShading,
            emissive: 0xff5757
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.set(Math.PI/6.0,0,Math.PI/2.0);
        scene.add(this.mesh);
    },
        
    animate : function() {
        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.01;
//        this.mesh.position.x += 0.01;
    }
};

var Snake = {
    init : function(radius) {
        this.geometry = new THREE.SphereGeometry(radius);
        this.radius = radius;
        this.material = new THREE.MeshPhongMaterial
            ({color: 0x7cc73c, 
             shininess: 0,
             shading: THREE.FlatShading, 
             emissive: 0x617154 });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(-3,0,0);
        scene.add(this.mesh);
    },
        
    animate : function() {
        this.mesh.rotation.x += 0.01;
    }
};

Snake.init(0.2);
Environment.init();

function gravityAttract() {
    var raycaster = new THREE.Raycaster();
    var rayOrigin = Snake.mesh.position.clone();
    var rayFinalPos = Environment.mesh.position.clone();
    var rayDir = rayFinalPos.sub(rayOrigin).normalize();
    
    raycaster.set(rayOrigin, rayDir);

    var intersects = raycaster.intersectObject(Environment.mesh);
    var intersectionPoint = intersects[0];
    
    if (intersectionPoint != undefined) {

        var offset = rayDir.negate().multiplyScalar(Snake.radius);
        console.log(Snake.radius);
        console.log(intersectionPoint.point);
        
//        var newPos = offset.x
        Snake.mesh.position.x = offset.x + intersectionPoint.point.x;
        Snake.mesh.position.y = offset.y + intersectionPoint.point.y;
        Snake.mesh.position.z = offset.z + intersectionPoint.point.z;
//        var point = offset * intersection.

//        console.log(intersectionPoint.point);
    }


}

//Update loop that gets called at 60fps,
//Calculate animations, and render the scene
function update() {
    requestAnimationFrame(update);
    Environment.animate();
    Snake.animate();
    gravityAttract();

    
    renderer.render(scene, camera);
};
update();

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}