// Global variable
var DEGREE_TO_RAD = Math.PI / 180;

/**
 * Scene class, representing the scene that is going to be rendered.
 */
class Scene extends CGFscene {
    /**
     * Scene constructor
     * 
     * @param {object} data 
     * @param {class} interf 
     */
    constructor(data, interf) {
        super();
        this.lock = {};
        this.data = data;
        this.lightValues = {};
        this.interface = interf;
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * 
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;
        this.initCameras();
        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(75, 75, 75), vec3.fromValues(0, 0, 0));
        this.interface.setActiveCamera(this.camera);

        this.interface.Views = "";
    }

    /**
     * Updates the scene cameras. 
     */
    updateCameras() {
        // CFGcamera prototypes:
        // ----------------------> CFGcamera(angle, near, far, from, to)
        // ----------------------> CGFcameraOrtho(left, right, bottom, top, near, far, from, to, up) - UP(0,1,0)

        if (this.interface.Views == "")
            this.interface.Views = this.data.defaultCamID;

        var cam = null;

        if ((cam = this.data.perspectiveCams[this.interface.Views]) != null)
            this.camera = new CGFcamera(Math.PI * cam.angle / 180, cam.near, cam.far, vec3.fromValues(cam.fromX, cam.fromY, cam.fromZ), vec3.fromValues(cam.toX, cam.toY, cam.toZ));
        else if ((cam = this.data.orthoCams[this.interface.Views]) != null)
            this.camera = new CGFcameraOrtho(cam.left, cam.right, cam.bottom, cam.top, cam.near, cam.far, vec3.fromValues(cam.fromX, cam.fromY, cam.fromZ), 
                                             vec3.fromValues(cam.toX, cam.toY, cam.toZ), vec3.fromValues(0, 1, 0));

        this.interface.setActiveCamera(this.camera);
    }

    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        var index = 0;

        // Reads the lights from the data
        for (var key in this.data.omniLights) {
            if (index >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.data.omniLights.hasOwnProperty(key))
                this.setupLight(index++, this.data.omniLights[key], false);
        }

        for (var key in this.data.spotLights) {
            if (index >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.data.spotLights.hasOwnProperty(key))
                this.setupLight(index++, this.data.spotLights[key], true);
        }
    }

    /**
     * Setup up lights previously inited on initLights() function.
     * 
     * @param {number} index 
     * @param {object} light 
     * @param {boolean} isSpot 
     */
    setupLight(index, light, isSpot) {

        // Lights are predefined in CGFscene
        this.lights[index].setPosition(light.locationX, light.locationY, light.locationZ, light.locationW);
        this.lights[index].setAmbient(light.ambientR, light.ambientG, light.ambientB, light.ambientA);
        this.lights[index].setDiffuse(light.diffuseR, light.diffuseG, light.diffuseB, light.diffuseA);
        this.lights[index].setSpecular(light.specularR, light.specularG, light.specularB, light.specularA);

        if (isSpot) {
            this.lights[index].setSpotDirection(light.targetX - light.locationX, light.targetY - light.locationY, light.targetZ - light.locationZ);

            this.lights[index].setSpotExponent(light.exponent);
            this.lights[index].setSpotCutOff(light.angle);
        }

        if (light.enabled) this.lights[index].enable();
        else this.lights[index].disable();

        this.lights[index].update();
    }


    /**
     * Handler called by parser when the data is finally loaded. 
     * 
     * As loading is asynchronous, this may be called already after the application has started the run loop. 
     */
    onDataLoaded() {
        this.axis = new CGFaxis(this, this.data.axisLength);

        this.gl.clearColor(this.data.background.r, this.data.background.g, this.data.background.b, this.data.background.a);
        this.setGlobalAmbientLight(this.data.ambient.r, this.data.ambient.g, this.data.ambient.b, this.data.ambient.a);

        this.interface.addLightsGroup(this.data);
        this.interface.addViewsGroup(this.data);

        this.updateCameras();
        this.initLights();

        // Load data into the graph
        this.data.setupGraph(this);

        this.sceneInited = true;
    }

    /**
     * Updates materials by pressing key M. 
     */
    updateMaterials() {
        for (var key in this.data.components) {
            if (this.data.components.hasOwnProperty(key)) {
                var activeMaterials = this.data.components[key].activeMaterials;
                
                for (var i = 0; i < activeMaterials.length; i++) {
                    if (this.data.components[key].activeMaterial == activeMaterials[i]) {
                        if ((i + 1) == activeMaterials.length)
                            this.data.components[key].activeMaterial = activeMaterials[0];
                        else 
                            this.data.components[key].activeMaterial = activeMaterials[i + 1];
                         
                        break;
                    }
                }
            }
        }

    }

    /**
     * Displays the scene.
     */
    display() {
        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation)
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();

        // Draw axis
        this.axis.display();

        if (this.sceneInited) {

            //Handle Views
            if (this.lock["Lock Views"])
                this.updateCameras();

            //Handle Lights
            var i = 0;
            for (var key in this.lightValues) {
                if (this.lightValues.hasOwnProperty(key)) {
                    if (this.lightValues[key]) {
                        this.lights[i].setVisible(true);
                        this.lights[i].enable();
                    }
                    else {
                        this.lights[i].setVisible(false);
                        this.lights[i].disable();
                    }
                    this.lights[i].update();
                    i++;
                }
            }

            // Displays the scene
            this.data.displayGraph(this);
        }

        this.popMatrix();

        // ---- END Background, camera and axis setup
    }
}