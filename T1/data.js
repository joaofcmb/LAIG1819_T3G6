class Data {
    constructor() {
        // SCENE
        this.root = "";
        this.axisLength = 1;

        // VIEWS - TODO figure out how the cameras are supposed to be added
        this.orthoCams = new Object();
        this.perspectiveCams = new Object();

        // TODO - figure out unknown default values
        this.orthoDefault = {
            near: 0.1, far: 100.0,
            left: 1.0, right: 1.0, top: 1.0, bottom: 1.0,
            fromX: 15, fromY: 15, fromZ: 15,
            toX: 0, toY: 0, toZ: 0
        };

        this.perspectiveDefault = {
            near: 0.1, far: 100.0, angle: "?", // default fov is 0.4 (out of 180 degrees ???)
            fromX: 15, fromY: 15, fromZ: 15,
            toX: 0, toY: 0, toZ: 0
        };


        // AMBIENT
        this.ambient = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 };        // Global Ambient Light
        this.background = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 };     // Background color


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

        this.spotDefault = {
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

        this.defaultAppearance = new CGFappearance();
        this.defaultAppearance.setShininess(material.shininess);
        this.defaultAppearance.setAmbient(material.ambientR, material.ambientG, material.ambientB, material.ambientA);
        this.defaultAppearance.setDiffuse(material.diffuseR, material.diffuseG, material.diffuseB, material.diffuseA);
        this.defaultAppearance.setSpecular(material.specularR, material.specularG, material.specularB, material.specularA);

        // TRANSFORMATIONS - TODO integrate transforms with graph
        this.transforms = new Object(); //  transforms format (Each transform has multiple objects for each step): 
        //  ID -> [ {type: rotate, axis: 'x', angle: 0.0},  {type: translate, x: 0.0, y: 0.0, z: 0.0}, ...} ]

        this.translateDefault = { x: 0.0, y: 0.0, z: 0.0 };
        this.rotateDefault = { axis: 'x', angle: 0.0 };
        this.scaleDefault = { x: 1.0, y: 1.0, z: 1.0 };

        // PRIMITIVES - TODO integrate primitives with graph
        this.primitives = new Object(); // format: ID -> {type: rectangle, x1: -0.5, y1: -0.5, x2: 0.5, y2: 0.5} specifying type and its arguments

        // COMPONENTS  - TODO integrate components with graph
        this.components = new Object(); // format: ID -> { 
        //                  transforms: "transformID" OR [ {type: "rotate", axis 'x', angle: 0.0}, etc.. ], 
        //                  materials: "inherit" OR [materialID1, materialID2], 
        //                  textureID: "inherit" OR "texID", texLengthS: "1.0", texLengthT: "1.0",
        //                  components: ["comp1ID", "comp2ID"], primitiveID: "primitiveID"
        //               }
    }

    /*  
        Called from the scene after data initialization (signalled by the parser)

        Sets up the scene graph nodes (pre-processing and objects initialization)

        TODO test the graph setup
    */
    setupGraph(scene) {
        // SETUP COMPONENTS
        for (var compID in this.components) {
            if (!this.components.hasOwnProperty(compID)) continue;

            // It is being assumed that all the parameters have been checked out on the parser

            // TRANSFORM MATRIX INIT ------------------ TODO refactor with an associative array instead of switch
            scene.loadIdentity();

            var transformOps = this.components[compID].transforms;
            if (!Array.isArray(transformOps)) // If ID is specified instead, get transform from transforms list 
                transformOps = this.transforms[transformOps];

            for (var transIndex in transformOps) {
                var transOp = transformOps[transIndex];
                switch (transOp.type) {
                    case "translate":
                        scene.translate(transOp.x, transOp.y, transOp.z);
                        break;
                    case "rotate":
                        switch (transOp.axis) {
                            case 'x':
                                scene.rotate(Math.PI * transOp.angle / 180, 1, 0, 0);
                                break;
                            case 'y':
                                scene.rotate(Math.PI * transOp.angle / 180, 0, 1, 0);
                                break;
                            case 'z':
                                scene.rotate(Math.PI * transOp.angle / 180, 0, 0, 1);
                                break;
                        }
                        break;
                    case "scale":
                        scene.scale(transOp.x, transOp.y, transOp.z);
                        break;
                }
            }
            this.components[compID].transformMatrix = scene.getMatrix();

            //  MATERIAL INIT ------------------
            this.components[compID].activeMaterials = [];

            for (var materialIndex in this.components[compID].materials) {
                var materialID = this.components[compID].materials[materialIndex];

                if (materialID == "inherit") {
                    this.components[compID].activeMaterials.push("inherit");
                }
                else {
                    var material = this.materials[materialID];

                    if (material.hasOwnProperty("emissionR")) { // Check if this material hasnt been instantiated yet
                        var appearance = new CGFappearance(scene);

                        appearance.setShininess(material.shininess);
                        appearance.setAmbient(material.ambientR, material.ambientG, material.ambientB, material.ambientA);
                        appearance.setDiffuse(material.diffuseR, material.diffuseG, material.diffuseB, material.diffuseA);
                        appearance.setSpecular(material.specularR, material.specularG, material.specularB, material.specularA);

                        this.materials[materialID] = appearance;
                    }
                    this.components[compID].activeMaterials.push(this.materials[materialID]);
                }
            }
            this.components[compID].activeMaterial = this.components[compID].activeMaterials[0]; // Sets first material as default

            // TEXTURE INIT (TODO - avoid duplicate texture instatiations)
            var textureID = this.components[compID].textureID;
            this.components[compID].activeTexture = textureID != "inherit" && textureID != "none" ? new CGFtexture(scene, this.textures[textureID]) : textureID;

            //console.log(this.components);
            //console.log(this.components[compID].primitiveID);

            // PRIMITIVES INIT --------------------
            // TODO Scale factors (seperate primitive per component)
            if (this.components[compID].hasOwnProperty("primitiveID")) {
                var primitiveID = this.components[compID].primitiveID;
                var primitive = this.primitives[primitiveID];
                
                switch (primitive.type) {
                    case "rectangle":
                        this.components[compID].activePrimitive = new MyRectangle(scene, primitive.x1, primitive.y1, 
                                                                                  primitive.x2, primitive.y2,
                                                                                  this.components[compID].texLengthS, this.components[compID].texLengthT);
                        break;
                    case "triangle":
                        this.components[compID].activePrimitive = new MyTriangle(scene, primitive.x1, primitive.y1, primitive.z1,
                                                                                 primitive.x2, primitive.y2, primitive.z2,
                                                                                 primitive.x3, primitive.y3, primitive.z3,
                                                                                 this.components[compID].texLengthS, this.components[compID].texLengthT);
                        break;
                    case "cylinder":
                        this.components[compID].activePrimitive = new MyCylinder(scene, primitive.base, primitive.top, primitive.height, primitive.slices, primitive.stacks);
                        break;
                    case "sphere":
                        this.components[compID].activePrimitive = new MySphere(scene, primitive.radius, primitive.slices, primitive.stacks);
                        break;
                    case "torus":
                        this.components[compID].activePrimitive = new MyTorus(scene, primitive.inner, primitive.outer, primitive.slices, primitive.loops);
                        break;
                }
            }
        }
    }

    /* 
        Called during the display() callback of the scene

        Displays the scene graph contents

        NOTICE: It is assumed that the scene has been initialized with identity matrix
    */
    displayGraph(scene) {
        var rootComponent = this.components[this.root];
        this.displayComponent(scene, rootComponent, this.defaultAppearance, "none");
    }

    // recursive call of graph components
    displayComponent(scene, component, parentMaterial, parentTexture) {
        scene.multMatrix(component.transformMatrix);

        var currAppearance = (component.activeMaterial != "inherit") ? component.activeMaterial : parentMaterial;

        switch (component.activeTexture) {
            case "inherit":
                var currTexture = parentTexture;
                break;
            case "none":
                var currTexture = null;
                break;
            default:
                var currTexture = component.activeTexture;
                break;
        }

        for (var childIndex in component.components) {
            var child = component.components[childIndex];
            // TODO push materials and textures
            scene.pushMatrix();
                this.displayComponent(scene, this.components[child], currAppearance, currTexture);
            scene.popMatrix();
        }

        currAppearance.setTexture(currTexture);
        currAppearance.setTextureWrap('REPEAT', 'REPEAT');
        currAppearance.apply();

        if (component.activePrimitive) {
            component.activePrimitive.display();
        }

    }
}