/**
 * Data class, creating XML data storage.
 */
class Data {
    /**
     * Data default constructor.
     */
    constructor() {
        // SCENE
        this.root = "";
        this.axisLength = 1;

        // VIEWS
        this.orthoCams = new Object();
        this.perspectiveCams = new Object();

        this.defaultCamID = "";
        this.cameras = new Object(); // ID -> CGFCamera()

         // Perspective view default values
         this.perspectiveDefault = {
            near: 0.1, far: 100.0, angle: "?",
            fromX: 15, fromY: 15, fromZ: 15,
            toX: 0, toY: 0, toZ: 0
        };

        // Ortho view default values
        this.orthoDefault = {
            near: 0.1, far: 100.0,
            left: 1.0, right: 1.0, top: 1.0, bottom: 1.0,
            fromX: 15, fromY: 15, fromZ: 15,
            toX: 0, toY: 0, toZ: 0
        };


        // AMBIENT
        this.ambient = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 };        // Global Ambient Light
        this.background = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 };     // Background color


        // LIGHTS
        this.omniLights = new Object();
        this.spotLights = new Object();

        // Omni light default values
        this.omniDefault = {
            enabled: true,
            locationX: 0.0, locationY: 0.0, locationZ: 0.0, locationW: 0.0,

            ambientR: 0.2, ambientG: 0.2, ambientB: 0.2, ambientA: 1.0,
            diffuseR: 0.5, diffuseG: 0.5, diffuseB: 0.5, diffuseA: 1.0,
            specularR: 0.3, specularG: 0.3, specularB: 0.3, specularA: 1.0
        };

        // Spot light default values
        this.spotDefault = {
            enabled: true, angle: 60, exponent: 1.0,
            locationX: 0.0, locationY: 0.0, locationZ: 0.0, locationW: 0.0,
            targetX: 0.0, targetY: 0.0, targetZ: 0.0,

            ambientR: 0.2, ambientG: 0.2, ambientB: 0.2, ambientA: 1.0,
            diffuseR: 0.5, diffuseG: 0.5, diffuseB: 0.5, diffuseA: 1.0,
            specularR: 0.3, specularG: 0.3, specularB: 0.3, specularA: 1.0
        };

        // TEXTURES
        this.textures = new Object(); // Associative array of ID -> file

        // MATERIALS
        this.materials = new Object();
        
        // Materials default values
        this.materialDefault = {
            shininess: 0,
            emissionR: 0, emissionG: 0, emissionB: 0, emissionA: 1.0,
            ambientR: 0.3, ambientG: 0.3, ambientB: 0.3, ambientA: 1.0,
            diffuseR: 0.5, diffuseG: 0.5, diffuseB: 0.5, diffuseA: 1.0,
            specularR: 0.2, specularG: 0.2, specularB: 0.2, specularA: 1.0
        }

        // TRANSFORMATIONS
        this.transforms = new Object();     // Transforms format (Each transform has multiple objects for each step): 
                                            //  ID -> [ {type: rotate, axis: 'x', angle: 0.0},
                                            //          {type: translate, x: 0.0, y: 0.0, z: 0.0}, 
                                            //          ...} ]

        // Transformations defaults values for: Translate, Rotate, Scale                                            
        this.translateDefault = { x: 0.0, y: 0.0, z: 0.0 };
        this.rotateDefault = { axis: 'x', angle: 0.0 };
        this.scaleDefault = { x: 1.0, y: 1.0, z: 1.0 };

        // ANIMATIONS
        this.animations = new Object();     // Contains all animations after being instantiated
                                            // Format e.g: ID -> {type: linear, span: 1000, controlPoints: [{x: 0, y: 0, z: 0}, {x: 1, y: 0, z: 1}]}
                                            // Format e.g: ID -> {type: circular, span: 1000, center: {x: 0, y: 0, z: 0}, radius: 1, startAng: 0, rotAng: 90}
        // PRIMITIVES
        this.primitives = new Object();     // Format e.g: ID -> {type: rectangle, x1: -0.5, y1: -0.5, x2: 0.5, y2: 0.5}
        this.waterPrimitives = [];

        // COMPONENTS
        this.components = new Object();     // Format: ID -> { 
                                            //                  transforms: "transformID" OR [ {type: "rotate", axis 'x', angle: 0.0}, ... ],
                                            //                  animations: [animationID, ...]
                                            //                  materials: "inherit" OR [materialID1, materialID2], 
                                            //                  textureID: "inherit" OR "texID", texLengthS: "1.0", texLengthT: "1.0",
                                            //                  components: ["comp1ID", "comp2ID"], primitives: ["primitive1ID", "primitive2ID"]
                                            //               }
    }
    
    /**
     * Called from the scene after data initialization (signalled by the parser).
     * 
     * Sets up the scene graph nodes (pre-processing and objects initialization).
     * 
     * It is being assumed that all the parameters have been checked out on the parser.
     * 
     * @param {any} scene 
     */
    setupGraph(scene) {
        // Setup components
        for (var compID in this.components) {
            if (!this.components.hasOwnProperty(compID)) continue;

            // Transform matrix init
            scene.loadIdentity();

            var transformOps = this.components[compID].transforms;
            
            // If ID is specified instead (not an array), get transform from transforms list 
            if (!Array.isArray(transformOps))
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

            // Animations init
            this.components[compID].activeAnimations = [];
            this.components[compID].activeAnimationIndex = 0;

            for (var animationIndex in this.components[compID].animations) {
                var animation = this.animations[this.components[compID].animations[animationIndex]];

                switch (animation.type) {
                    case "linear":
                        this.components[compID].activeAnimations.push(new LinearAnimation(scene, animation.span, animation.controlPoints));
                        break;
                    case "circular":
                        this.components[compID].activeAnimations.push(new CircularAnimation(scene, animation.span, animation.center, animation.radius, 
                                                                                        animation.startAng, animation.rotAng));
                        break;
                }
            }

            //  Material init
            this.defaultAppearance = new CGFappearance(scene);
            this.defaultAppearance.setShininess(this.materialDefault.shininess);
            this.defaultAppearance.setEmission(this.materialDefault.emissionR, this.materialDefault.emissionG, this.materialDefault.emissionB, this.materialDefault.emissionA);
            this.defaultAppearance.setAmbient(this.materialDefault.ambientR, this.materialDefault.ambientG, this.materialDefault.ambientB, this.materialDefault.ambientA);
            this.defaultAppearance.setDiffuse(this.materialDefault.diffuseR, this.materialDefault.diffuseG, this.materialDefault.diffuseB, this.materialDefault.diffuseA);
            this.defaultAppearance.setSpecular(this.materialDefault.specularR, this.materialDefault.specularG, this.materialDefault.specularB, this.materialDefault.specularA);

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
                        appearance.setEmission(material.emissionR, material.emissionG, material.emissionB, material.emissionA);
                        appearance.setAmbient(material.ambientR, material.ambientG, material.ambientB, material.ambientA);
                        appearance.setDiffuse(material.diffuseR, material.diffuseG, material.diffuseB, material.diffuseA);
                        appearance.setSpecular(material.specularR, material.specularG, material.specularB, material.specularA);

                        this.materials[materialID] = appearance;
                    }
                    this.components[compID].activeMaterials.push(this.materials[materialID]);
                }
            }
            this.components[compID].activeMaterial = this.components[compID].activeMaterials[0]; // Sets first material as default

            // Texture init
            var textureID = this.components[compID].textureID;
            this.components[compID].activeTexture = textureID != "inherit" && textureID != "none" ? new CGFtexture(scene, this.textures[textureID]) : textureID;

            this.components[compID].isTexScaleSet = (this.components[compID].texLengthS && this.components[compID].texLengthT);


            // Primitives init
            this.components[compID].activePrimitives = [];

            for (var primiI in this.components[compID].primitives) {
                var primitiveID = this.components[compID].primitives[primiI];
                var primitive = this.primitives[primitiveID];
                
                switch (primitive.type) {
                    case "rectangle":
                        this.components[compID].activePrimitives.push(new MyRectangle(scene, primitive.x1, primitive.y1, 
                                                                                primitive.x2, primitive.y2,
                                                                                this.components[compID].texLengthS || 1, this.components[compID].texLengthT || 1)
                        );
                        break;
                    case "triangle":
                        this.components[compID].activePrimitives.push(new MyTriangle(scene, primitive.x1, primitive.y1, primitive.z1,
                                                                                primitive.x2, primitive.y2, primitive.z2,
                                                                                primitive.x3, primitive.y3, primitive.z3,
                                                                                this.components[compID].texLengthS || 1, this.components[compID].texLengthT || 1)
                        );
                        break;
                    case "cylinder":
                        this.components[compID].activePrimitives.push(new MyCylinder(scene, primitive.base, primitive.top, primitive.height, 
                                                                                primitive.slices, primitive.stacks)
                        );
                        break;
                    case "sphere":
                        this.components[compID].activePrimitives.push(new MySphere(scene, primitive.radius, primitive.slices, primitive.stacks));
                        break;
                    case "torus":
                        this.components[compID].activePrimitives.push(new MyTorus(scene, primitive.inner, primitive.outer, primitive.slices, primitive.loops));
                        break;
                    case "plane": 
                        this.components[compID].activePrimitives.push(new Plane(scene, primitive.npartsU, primitive.npartsV));
                        break;
                    case "patch": 
                        this.components[compID].activePrimitives.push(new Patch(scene, primitive.npointsU - 1, primitive.npointsV - 1, primitive.npartsU, primitive.npartsV, primitive.controlPoints));
                        break;
                    case "cylinder2":
                        this.components[compID].activePrimitives.push(new Cylinder2(scene, primitive.base, primitive.top, primitive.height, 
                                                                                    primitive.slices, primitive.stacks)
                        );
                        break;
                    case "vehicle":
                        this.components[compID].activePrimitives.push(new Vehicle(scene, this));
                        break;
                    case "terrain":
                        this.components[compID].activePrimitives.push(new Terrain(  scene,
                                                                                    new CGFtexture(scene, this.textures[primitive.idtexture]),
                                                                                    new CGFtexture(scene, this.textures[primitive.idheightmap]),
                                                                                    primitive.parts, primitive.heightscale));
                        break;
                    case "water":
                        var water = new Water(  scene,
                                                new CGFtexture(scene, this.textures[primitive.idtexture]),
                                                new CGFtexture(scene, this.textures[primitive.idwavemap]),
                                                primitive.parts, primitive.heightscale, primitive.texscale);
                        this.waterPrimitives.push(water);                                                
                        this.components[compID].activePrimitives.push(water)
                        break;
                    case "board":
                        this.game = new Game(scene, primitive.whiteCam);
                        this.components[compID].activePrimitives.push(this.game);
                        break;
                    case "cube":
                        this.components[compID].activePrimitives.push(new Cube(scene, primitive.npartsU, primitive.npartsV));
                        break;
                }
            }
        }
    }

    /**
     * Called during the display() callback of the scene.
     * 
     * Displays the scene graph contents.
     * 
     * It is assumed that the scene has been initialized with identity matrix.
     * 
     * @param {any} scene 
     */
    displayGraph(scene) {
        this.materialStack = [];
        this.textureStack = [];

        this.displayComponent(scene, this.components[this.root], this.defaultAppearance, null, [1,1]);
    }

    /**
     * Recursive call of graph components, proper display them.
     * 
     * @param {any} scene 
     * @param {object} component 
     * @param {appearance} parentMaterial 
     * @param {texture} parentTexture 
     * @param {array} parentScaleFactors 
     */
    displayComponent(scene, component, parentMaterial, parentTexture, parentScaleFactors) {
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

        if (!component.isTexScaleSet) {
            component.texLengthS = parentScaleFactors[0];
            component.texLengthT = parentScaleFactors[1];
        }

        for (var childIndex in component.components) {
            var child = component.components[childIndex];

            scene.pushMatrix();
                this.materialStack.push(currAppearance);
                    this.textureStack.push(currTexture);
                        this.displayComponent(scene, this.components[child], currAppearance, currTexture, [component.texLengthS, component.texLengthT]);
                    this.textureStack.pop(currTexture);
                this.materialStack.pop(currAppearance);
            scene.popMatrix();
        }

        if (component.activePrimitives.length > 0) {
            currAppearance.setTexture(currTexture);
            currAppearance.setTextureWrap('REPEAT', 'REPEAT');
            currAppearance.apply();
            
            if (!component.isTexScaleSet) {
                for (var primI in component.activePrimitives) {
                    var primitive = component.activePrimitives[primI];

                    if (primitive instanceof MyTriangle || primitive instanceof MyRectangle)
                        primitive.setScaleFactors(parentScaleFactors);
                }
                
                component.isTexScaleSet = true;
            }
            
            if (component.activeAnimations.length > 0)
                component.activeAnimations[component.activeAnimationIndex].apply();

            for (var primI in component.activePrimitives)
                component.activePrimitives[primI].display();
        }
    }
}