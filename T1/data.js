class Data {
    constructor() {
        // SCENE
        this.root = "";             // TODO - Apply to graph
        this.axisLength = 1;        // TODO - Apply to scene

        // VIEWS - TODO figure out how the cameras are supposed to be added
        this.orthoCams = new Object();
        this.perspectiveCams = new Object();

        // TODO - figure out unknown default values
        this.orthoDefault = {
            near: 0.1, far: 1000.0,
            left: 1.0, right: 1.0, top: 1.0, bottom: 1.0 // 0 fov??? how to scale camera depending on values
        };

        this.perspectiveDefault = {
            near: 0.1, far: 100.0, angle: "?", // default fov is 0.4 (out of 180 degrees ???)
            fromX: 15, fromY: 15, fromZ: 15,
            toX: 0, toY: 0, toZ: 0
        };


        // AMBIENT
        this.ambient = {r: 0.0, g: 0.0, b: 0.0, a: 1.0};        // Global Ambient Light
        this.background = {r: 0.0, g: 0.0, b: 0.0, a: 1.0};     // Background color
        
        
        // LIGHTS - TODO Test the Lights
        this.omniLights = new Object();
        this.spotLights = new Object();

        this.omniDefault = {    
            enabled: true, 
            locationX: 0.0, locationY: 0.0, locationZ: 0.0, locationW: 0.0, 

            ambientR: 0.2, ambientG: 0.2, ambientB: 0.2, ambientA: 1.0, 
            diffuseR: 0.5, diffuseG: 0.5, diffuseB: 0.5, diffuseA: 1.0, 
            specularR: 0.3, specularG: 0.3, specularB: 0.3, specularA: 1.0
        };
        
        this.spotDefault =  {    
            enabled: true, angle: 60, exponent: 1.0,
            locationX: 0.0, locationY: 0.0, locationZ: 0.0, locationW: 0.0, 
            targetX: 0.0, targetY: 0.0, targetZ: 0.0, 

            ambientR: 0.2, ambientG: 0.2, ambientB: 0.2, ambientA: 1.0, 
            diffuseR: 0.5, diffuseG: 0.5, diffuseB: 0.5, diffuseA: 1.0, 
            specularR: 0.3, specularG: 0.3, specularB: 0.3, specularA: 1.0
        };


        // TEXTURES  - TODO Test the Textures
        this.textures = new Object(); // associative array of ID -> file

        // MATERIALS  - TODO Test the Materials
        this.materials = new Object();

        this.materialDefault = {
            shininess: 0,
            emissionR: 0, emissionG: 0, emissionB: 0, emissionA: 1.0,
            ambientR: 0.3, ambientG: 0.3, ambientB: 0.3, ambientA: 1.0,
            diffuseR: 0.5, diffuseG: 0.5, diffuseB: 0.5, diffuseA: 1.0,
            specularR: 0.2, specularG: 0.2, specularB: 0.2, specularA: 1.0
        }

        // TRANSFORMATIONS - TODO integrate transforms with graph
        this.transforms = new Object(); //  transforms format (Each transform has multiple objects for each step): 
                                        //  ID -> [ {type: rotate, axis: 'x', angle: 0.0},  {type: translate, x: 0.0, y: 0.0, z: 0.0}, ...} ]

        this.translateDefault   = { x: 0.0, y: 0.0, z: 0.0 };
        this.rotateDefault      = { axis: 'x', angle: 0.0 };
        this.scaleDefault       = { x: 1.0, y: 1.0, z: 1.0 };

        // PRIMITIVES - TODO integrate primitives with graph
        this.primitives = new Object(); // format: ID -> {type: rectangle, x1: -0.5, y1: -0.5, x2: 0.5, y2: 0.5} specifying type and its arguments

        // COMPONENTS  - TODO integrate components with graph
        this.components = new Object(); // format: ID -> { 
                                        //                  transformID: "transformID" OR [ {type: rotate, axis 'x', angle: 0.0}, etc.. ], 
                                        //                  materials: "inherit" OR [materialID1, materialID2], 
                                        //                  textureID: "texID", texLengthS: "1.0", texLengthT: "1.0",
                                        //                  components: ["comp1ID", "comp2ID"], primitives: ["primitiveID"]
                                        //               }
    }

    /*  
        Called from the scene after data initialization (signalled by the parser)

        Sets up the scene graph nodes (pre-processing and objects initialization)
    */
    setupGraph(scene) {
        for (var compID in this.components) {
            if (!this.components.hasOwnProperty(compID))   continue;

            // It is being assumed that all the parameters have been checked out on the parser
            if (this.components[compID])
        }
    }

    /* 
        Called during the display() callback of the scene

        Displays the scene graph contents
    */
    displayGraph(scene) {

    }
}