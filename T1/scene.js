var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class Scene extends CGFscene {
    constructor(data) {
        super();
        this.data = data;

        this.lightValues = {};
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
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

        // Adds primitives (most likely temporary)
        this.rectangle = new MyRectangle(this, -.5, -.5, .5, .5);
        this.triangle = new MyTriangle(this, -0.5, 0, 0, 0.5, 0, 0, 0, 1, 1);
        this.cylinder = new MyCylinder(this, 0.5, 1.5, 1.5, 8, 8);
        this.sphere = new MySphere(this, 1, 8, 8);
        this.torus = new MyTorus(this, .5, 1.5, 6, 8)
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    }

    /**
     * Initializes the scene lights with the values read from the XML file.
     *
     */
    initLights() {
        var i = 0;  // Lights index.

        // Reads the lights from the data
        for (var key in this.data.omniLights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.data.omniLights.hasOwnProperty(key))
                this.setupLight(i++, this.data.omniLights[key], false);
        }

        for (var key in this.data.spotLights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.data.spotLights.hasOwnProperty(key))
                this.setupLight(i++, this.data.spotLights[key], true);
        }
    }

    setupLight(i, light, isSpot) {
        //lights are predefined in cgfscene
        this.lights[i].setPosition(light.locationX, light.locationY, light.locationZ, light.locationW);
        this.lights[i].setAmbient(light.ambientR, light.ambientG, light.ambientB, light.ambientA);
        this.lights[i].setDiffuse(light.diffuseR, light.diffuseG, light.diffuseB, light.diffuseA);
        this.lights[i].setSpecular(light.specularR, light.specularG, light.specularB, light.specularA);

        if (isSpot) {
            this.lights[i].setDirection(light.targetX - light.locationX, light.targetY - light.locationY, light.targetZ - light.locationZ);

            this.lights[i].setSpotExponent(light.exponent);
            this.lights[i].setSpotCutOff(light.angle);
        }
       
        this.lights[i].setVisible(true);

        if (light.enabled)  this.lights[i].enable();
        else                this.lights[i].disable();

        this.lights[i].update();
    }


    /* Handler called when the data is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onDataLoaded() {
        //this.camera.near = this.graph.near;
        //this.camera.far = this.graph.far;

        //TODO: Change reference length according to parsed graph
        this.axis = new CGFaxis(this, this.data.axisLength);

        // TODO: Change ambient and background details according to parsed graph
        this.gl.clearColor(this.data.background.r, this.data.background.g, this.data.background.b, this.data.background.a);
        this.setGlobalAmbientLight(this.data.ambient.r, this.data.ambient.g, this.data.ambient.b, this.data.ambient.a);

        this.initLights();

        // TODO Adds lights group.
        //this.interface.addLightsGroup(this.graph.lights);

        // Load data into the graph
        this.data.setupGraph(this);

        this.sceneInited = true;
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
                // TODO Handle Lights
                this.lights[0].update();

                /*
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
                */

                // Displays the scene
                this.data.displayGraph(this);
            }
        
        this.popMatrix();

        // ---- END Background, camera and axis setup
    }
}