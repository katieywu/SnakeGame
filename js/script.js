var keyPressed; //global variable;

//check the key of arrow keyboard input
document.onkeydown = checkKey;

function checkKey(e) {
    e = e || window.event;
    //check if the input matches an arrow key, else don't update the keyPressed, allowing the snake to keep moving on its original path
    if (e.keyCode == '38' || e.keyCode == '40' || e.keyCode == '37' || e.keyCode == '39') {
//        keyPressed = e.keyCode;
    } else if (e.keyCode == '87' || e.keyCode == '83' || e.keyCode == '65' || e.keyCode == '68') {
        keyPressed = e.keyCode;
    } 
    else if (e.keyCode == '65') { //if the 'a' key is pressed
//        rotateCameraLeft(true);
    } else if (e.keyCode == '68') { //if the 'd' key is pressed
//        rotateCameraLeft(false);
    }
}

//The basics of a 3D scene, the scene graph, camera, light, and renderer
var scene = new THREE.Scene();

//Set up camera and camera pivot, so we can yaw the camera around Y Axis
var camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 10;
//
//var cameraPivot = new THREE.Object3D();
//scene.add(cameraPivot);
//cameraPivot.add(camera);
//camera.lookAt( cameraPivot.position );


var Y_AXIS = new THREE.Vector3( 0, 1, 0 );
var X_AXIS = new THREE.Vector3( 1, 0, 0 );

var dirLight = new THREE.DirectionalLight( 0xefefff, 0.3 );
dirLight.position.set( 19, 3, 3 ).normalize();
dirLight.castShadow = true;
dirLight.shadowCameraVisible = true;
scene.add(dirLight);

var light = new THREE.HemisphereLight( 0xffffdf, 0x080820, 1 );
scene.add(light);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x93cbc6);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

renderer.shadowMapEnabled = true;
renderer.shadowMapSoft = true;

renderer.shadowCameraNear = 3;
renderer.shadowCameraFar = camera.far;
renderer.shadowCameraFov = 50;

renderer.shadowMapBias = 0.0039;
renderer.shadowMapDarkness = 0.5;
renderer.shadowMapWidth = 1024;
renderer.shadowMapHeight = 1024;

controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = false;

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
        this.mesh.receiveShadow = true;
        this.mesh.castShadow = true;
        scene.add(this.mesh);
    },

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
        this.speed = 0.02; //speed, in arc length per frame
        this.tailDistance = 15; //distance apart each tail node is, in frames
        this.segments = [];
        
        this.queue = [];

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        var head = new Node(this.mesh, new THREE.Vector3(0, 0, 1.7595), "head");
        this.segments.push(head); //push the head to the list

        var child = new Node(this.mesh, new THREE.Vector3(0, -radius * 2, 1.7595), "child1");
        this.segments.push(child);

        var child2 = new Node(this.mesh, new THREE.Vector3(0, -radius * 4, 1.7595), "child2");
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

    updatePosition: function () {
        var head = this.segments[0];
        if (keyPressed) {
            head.prevPos = head.mesh.position.clone();
            this.rotateAxisAngle();
            this.gravityAttract(head.mesh);       
            this.updateTail();
        }
    },

    rotateAxisAngle: function() {
        var head = this.segments[0];
        var headPos = head.mesh.position.clone();
        var radius;
        var theta;
        
        if (keyPressed == '87') {
            // up arrow
            radius = Math.sqrt(headPos.length() * headPos.length() - headPos.x * headPos.x);
            theta = -1 * (this.speed / radius);
            rotateAboutWorldAxis(head.mesh, X_AXIS, theta);            
        } else if (keyPressed == '83') {
            // down arrow
            radius = Math.sqrt(headPos.length() * headPos.length() - headPos.x * headPos.x);
            theta = (this.speed / radius);
            rotateAboutWorldAxis(head.mesh, X_AXIS, theta);
        } else if (keyPressed == '65') {
            // left arrow
            radius = Math.sqrt(headPos.length() * headPos.length() - headPos.y * headPos.y);
            theta = -1 * (this.speed / radius);
            rotateAboutWorldAxis(head.mesh, Y_AXIS, theta);
        } else if (keyPressed == '68') {
            radius = Math.sqrt(headPos.length() * headPos.length() - headPos.y * headPos.y);
            theta = (this.speed / radius);
            rotateAboutWorldAxis(head.mesh, Y_AXIS, theta);
        }
    },
    
    updateTail: function () {
        var headPos = this.segments[0].mesh.position.clone();
        this.queue.unshift(headPos);

        if (this.queue.length > this.segments.length * this.tailDistance) {
            
            if (this.queue.length > ((this.segments.length + 2) * this.tailDistance)) {
                this.queue.pop();
            }

            for (var i = 0; i < this.segments.length; i++) {
                var node = this.segments[i];
                var newPos = this.queue[i * this.tailDistance];
                node.setPos(newPos);
            }
        } else {

            for (var i = 1; i < this.segments.length; i++) {
                var tailNode = this.segments[i];
                var tailNodePos = tailNode.mesh.position.clone();

                var prevNode = this.segments[i - 1];
                var prevNodePos = prevNode.prevPos.clone();

                //store the current position of the node as it's "prevPos"
                tailNode.prevPos = tailNode.mesh.position.clone();

                var prevToTailDir = tailNodePos.sub(prevNodePos).normalize();
                var offset = prevToTailDir.multiplyScalar(this.radius * 2);
                var newPos = prevNode.prevPos.add(offset);
                tailNode.setPos(newPos);
            }
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
            node.position.x = offset.x + intersectionPoint.point.x;
            node.position.y = offset.y + intersectionPoint.point.y;
            node.position.z = offset.z + intersectionPoint.point.z;
            
        }
    }
};

function Node(m, pos, name) {
    this.name = name;
    this.mesh = m.clone();
    this.mesh.position.x = pos.x;
    this.mesh.position.y = pos.y;
    this.mesh.position.z = pos.z;

//    this.curPos = this.mesh.position;
    this.prevPos = this.mesh.position.clone();
        
    this.setPos = function(pos) {
        this.mesh.position.x = pos.x;
        this.mesh.position.y = pos.y;
        this.mesh.position.z = pos.z;
    }
}

function rotateAboutWorldAxis(mesh, axis, angle) {
    var rotationMatrix = new THREE.Matrix4();
    rotationMatrix.makeRotationAxis(axis.normalize(), angle);
    var currentPos = new THREE.Vector4(mesh.position.x, mesh.position.y, mesh.position.z, 1);
    var newPos = currentPos.applyMatrix4(rotationMatrix);
    
    mesh.position.x = newPos.x;
    mesh.position.y = newPos.y;
    mesh.position.z = newPos.z;
    
}

Snake.init(0.15);
Environment.init();

function rotateCameraLeft(toLeft) {
    if (toLeft) {
        cameraPivot.rotateOnAxis(Y_AXIS, -0.1);
    } else {
        cameraPivot.rotateOnAxis(Y_AXIS, 0.1);
    }
}

//Update loop that gets called at 60fps,
//Calculate animations, and render the scene
function update() {

    requestAnimationFrame(update);
    controls.update();
    //call updateposition
    Snake.updatePosition();
    
    renderer.render(scene, camera);
};
update();

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}