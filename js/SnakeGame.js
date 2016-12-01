var keyPressed, scene, camera, Y_AXIS, X_AXIS, dirLight, light,
    renderer, Environment, Snake;

document.onkeydown = checkKey;

/**
 * Key down event listener to listen to WASD keys
 * @param {Event} e 
 */
function checkKey(e) {
    e = e || window.event;
    //check if the input matches a WASD key, else don't update the keyPressed, allowing the snake to keep moving on its original path
    if (e.keyCode == '87' || e.keyCode == '83' || e.keyCode == '65' || e.keyCode == '68') {
        keyPressed = e.keyCode;
    }

}

//-------The basics of a 3D scene, the scene graph, camera, light, and renderer--------//
scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

Y_AXIS = new THREE.Vector3(0, 1, 0);
X_AXIS = new THREE.Vector3(1, 0, 0);

dirLight = new THREE.DirectionalLight(0x57c9d3, 0.3);
dirLight.position.set(19, 3, 3).normalize();
dirLight.castShadow = true;
dirLight.shadowCameraVisible = true;
scene.add(dirLight);

light = new THREE.HemisphereLight(0xffffdf, 0x080820, 1);
scene.add(light);

//---------Renderer setup----------//
renderer = new THREE.WebGLRenderer();
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

//---------Camera controls setup---------//
controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = false;

/**
 * Environment (the geometry the snake moves around) set up
 */
Environment = {
    init: function () {
        this.geometry = new THREE.IcosahedronGeometry(2, 0);

        this.material = new THREE.MeshPhongMaterial({
            color: 0xffdcb3,
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

/**
 * Snake object setup
 */
Snake = {

    /**
     * Initialize default values for Snake object
     * @param {Number} radius (radius of snake node)
     */
    init: function (radius) {
        var head, child, child2;

        this.geometry = new THREE.SphereGeometry(radius);
        this.radius = radius;
        this.material = new THREE.MeshPhongMaterial({
            color: 0x7cc73c,
            shininess: 0,
            shading: THREE.FlatShading,
            emissive: 0x617154
        });
        this.speed = 0.02; //speed, in arc unit length per frame
        this.tailDistance = 15; //distance apart each tail node is, in frames
        this.segments = [];

        this.queue = [];

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        //head node
        head = new Node(this.mesh, new THREE.Vector3(0, 0, 1.7595), "head");
        this.segments.push(head);

        //hardcoded children
        child = new Node(this.mesh, new THREE.Vector3(0, -radius * 2, 1.7595), "child1");
        this.segments.push(child);

        child2 = new Node(this.mesh, new THREE.Vector3(0, -radius * 4, 1.7595), "child2");
        this.segments.push(child2);

        scene.add(child.mesh);
        scene.add(child2.mesh);
        scene.add(head.mesh);
    },

    /**
     * Updates the position of the head and tail in the direction of the keyPressed
     */
    updatePosition: function () {
        var head = this.segments[0];
        if (keyPressed) {
            head.prevPos = head.mesh.position.clone();
            this.rotateAxisAngle();
            this.gravityAttract(head.mesh);
            this.updateTail();
        }
    },

    /**
     * Rotates the head node (essentially "moving" the snake around the environment) by calculating a correct axis and angle by accounting for different radii of rotation affecting constant speed of rotation
     */
    rotateAxisAngle: function () {
        var head, headPos, radius, theta;

        head = this.segments[0];
        headPos = head.mesh.position.clone();

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

    /**
     * Update the tail node positions
     */
    updateTail: function () {

        var headPos = this.segments[0].mesh.position.clone();
        this.queue.unshift(headPos);

        /* Method 1: Use an array to store a path of all positions of the head node each frame, and set each tail node's position a certain frame "distance" behind (i.e. 10 frames behind) the previous node's position. This allows for 90 degree turns on the environment.
        Only in use if there are a sufficient number of frames */
        if (this.queue.length > this.segments.length * this.tailDistance) {

            if (this.queue.length > ((this.segments.length + 2) * this.tailDistance)) {
                this.queue.pop();
            }

            for (var i = 0; i < this.segments.length; i++) {
                var node, newPos;
                node = this.segments[i];
                newPos = this.queue[i * this.tailDistance];
                node.setPos(newPos);
            }


            /* Method 2: Use the head node's position as a target for interpolation, and have each child take on the previous node's position, this is essentially interpolating toward the head node. This method does not allow for 90 sharp turns, but can be used even if there aren't enough frames for the first method.
            Only in use if there are NOT a sufficient number of frames */
        } else {

            for (var i = 1; i < this.segments.length; i++) {
                var tailNode, tailNodePos, prevNode, prevNodePos,
                    prevToTailDir, offset, newPos;

                tailNode = this.segments[i];
                tailNodePos = tailNode.mesh.position.clone();

                prevNode = this.segments[i - 1];
                prevNodePos = prevNode.prevPos.clone();

                //store the current position of the node as it's "prevPos"
                tailNode.prevPos = tailNode.mesh.position.clone();

                prevToTailDir = tailNodePos.sub(prevNodePos).normalize();
                offset = prevToTailDir.multiplyScalar(this.radius * 2);
                newPos = prevNode.prevPos.add(offset);
                tailNode.setPos(newPos);
            }
        }

    },

    /**
     * Apply a "gravity" force to the node of a snake using simple raycasting and vector math
     * @param {Node} node
     */
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

/**
 * Node class
 * @param {Mesh} m 
 * @param {Vector3} pos
 * @param {String} name
 */
function Node(m, pos, name) {
    this.name = name;
    this.mesh = m.clone();
    this.mesh.position.x = pos.x;
    this.mesh.position.y = pos.y;
    this.mesh.position.z = pos.z;

    this.prevPos = this.mesh.position.clone();

    /**
     * Function to set the position of the Node
     * @param {Vector3} pos
     */
    this.setPos = function (pos) {
        this.mesh.position.x = pos.x;
        this.mesh.position.y = pos.y;
        this.mesh.position.z = pos.z;
    }
}

/**
 * Rotate a mesh around a given world axis at a given angle
 * @param {Mesh} mesh
 * @param {Vector3} axis
 * @param {Number} angle (in radians)
 */
function rotateAboutWorldAxis(mesh, axis, angle) {
    var rotationMatrix, currentPos, newPos;

    rotationMatrix = new THREE.Matrix4();
    rotationMatrix.makeRotationAxis(axis.normalize(), angle);
    currentPos = new THREE.Vector4(mesh.position.x, mesh.position.y, mesh.position.z, 1);
    newPos = currentPos.applyMatrix4(rotationMatrix);

    mesh.position.x = newPos.x;
    mesh.position.y = newPos.y;
    mesh.position.z = newPos.z;

}

Snake.init(0.15);
Environment.init();


/**
 * Update loop that gets called at 60fps, 
 * Calculate animations, and render the scene
 */
function update() {

    requestAnimationFrame(update);
    controls.update();
    //call updateposition
    Snake.updatePosition();

    renderer.render(scene, camera);
};
update();

window.addEventListener('resize', onWindowResize, false);

/**
 * Window resizing function to change the size of the render frame 
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}