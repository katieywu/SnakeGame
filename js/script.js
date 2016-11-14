var keyPressed; //global variable;

//check the key of arrow keyboard input
document.onkeydown = checkKey;

function checkKey(e) {
    e = e || window.event;

    //check if the input matches an arrow key, else don't update the keyPressed, allowing the snake to keep moving on its original path
    if (e.keyCode == '38' || e.keyCode == '40' || e.keyCode == '37' || e.keyCode == '39') {
        keyPressed = e.keyCode;
    }
}

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
    init: function () {
        this.geometry = new THREE.IcosahedronGeometry(2, 0);

        this.material = new THREE.MeshPhongMaterial({
            color: 0xffdcb3,
            //            transparent: true, opacity: 0.5,
            shininess: 30,
            shading: THREE.FlatShading,
            emissive: 0xff5757
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.set(Math.PI / 6.0, 0, Math.PI / 2.0);
        scene.add(this.mesh);
    },

    animate: function () {
        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.01;
        //        this.mesh.position.x += 0.01;
    }
};

var Snake = {
    init: function (radius) {
        this.geometry = new THREE.SphereGeometry(radius);
        this.radius = radius;
        this.material = new THREE.MeshPhongMaterial({
            color: 0x7cc73c,
            shininess: 0,
            shading: THREE.FlatShading,
            emissive: 0x617154
        });
        this.segments = [];

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = true;
//        this.mesh.position.set(0, 0, 1.7595);

        var head = new Node(this.mesh, new THREE.Vector3(0,0,1.7595));
        this.segments.push(head); //push the head to the list
        
//        var child = this.mesh.clone(); //push first child to the list
//        child.position.set(0, -radius * 2, 1.7595);
//        this.segments.push(child);
//
//        var child2 = this.mesh.clone(); //push second child to the list
//        child2.position.set(0, -radius * 4, 1.7595);
//        this.segments.push(child2);
        
        var child = new Node(this.mesh, new THREE.Vector3(0, -radius * 2, 1.7595));
        this.segments.push(child);
        
        var child2 = new Node(this.mesh, new THREE.Vector3(0, -radius * 4, 1.7595));
        this.segments.push(child2);
        
        
        scene.add(child.mesh);
        scene.add(child2.mesh);

        scene.add(head.mesh);
    },

    animate: function () {
        this.mesh.rotation.x += 0.01;
    },

    addChild: function () {
        this.children.push(new THREE.Vector3(-0.1, 0, 1.7595));
    },

    updatePosition: function (u) {
        var head = this.segments[0];
        if (keyPressed == '38') {
            // up arrow
            rotateAboutWorldAxis(head.mesh, new THREE.Vector3(1, 0, 0), -0.005);

        } else if (keyPressed == '40') {
            // down arrow
            rotateAboutWorldAxis(head.mesh, new THREE.Vector3(1, 0, 0), 0.005);

        } else if (keyPressed == '37') {
            // left arrow
            rotateAboutWorldAxis(head.mesh, new THREE.Vector3(0, 1, 0), -0.005);

        } else if (keyPressed == '39') {
            // right arrow
            rotateAboutWorldAxis(head.mesh, new THREE.Vector3(0, 1, 0), 0.005);
        }
        
        //update the positions of the segments accordingly
        console.log(head.position);
        
        for (var i = 0; i < this.segments.length; i++) {
            this.gravityAttract(this.segments[i].mesh);
//            console.log(this);
            console.log(this.segments[i]);
        }
    },

    gravityAttract: function (node) {
        var offset, raycaster, rayOrigin, rayFinalPos, rayDir,
            intersects, intersectionPoint;

        raycaster = new THREE.Raycaster();
        rayOrigin = node.position.clone();
        rayFinalPos = Environment.mesh.position.clone();
        rayDir = rayFinalPos.sub(rayOrigin).normalize();

        raycaster.set(rayOrigin, rayDir);

        intersects = raycaster.intersectObject(Environment.mesh);
        intersectionPoint = intersects[0];

        if (intersectionPoint != undefined) {

            offset = rayDir.negate().multiplyScalar(Snake.radius);
            //        console.log(Snake.radius);
            //        console.log(intersectionPoint.point);

            node.position.x = offset.x + intersectionPoint.point.x;
            node.position.y = offset.y + intersectionPoint.point.y;
            node.position.z = offset.z + intersectionPoint.point.z;

        }
    }
};

function Node(m, pos) {
    this.mesh = m.clone();
    this.mesh.position.x = pos.x;
    this.mesh.position.y = pos.y;
    this.mesh.position.z = pos.z;

    this.position = this.mesh.position;
    this.queue = [];
}

function rotateAboutWorldAxis(object, axis, angle) {
    var rotationMatrix = new THREE.Matrix4();
    rotationMatrix.makeRotationAxis(axis.normalize(), angle);
    var currentPos = new THREE.Vector4(object.position.x, object.position.y, object.position.z, 1);
    var newPos = currentPos.applyMatrix4(rotationMatrix);

    object.position.x = newPos.x;
    object.position.y = newPos.y;
    object.position.z = newPos.z;
    
//    console.log(object.children);
    return newPos;

}

Snake.init(0.15);
Environment.init();



//Update loop that gets called at 60fps,
//Calculate animations, and render the scene
var deltaTime = 0;
function update() {
    var u; //normalized time
    if (deltaTime == 60) {
        deltaTime = 0;
    }
    
    u = deltaTime++ / 60.0;

    requestAnimationFrame(update);
    
    Environment.animate();
//    Snake.animate();
    
    //call updateposition
    Snake.updatePosition(u);
    
//    update gravity so snake always sticks to surface
//    Snake.gravityAttract(Snake.mesh);
    
    renderer.render(scene, camera);
};
update();

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}