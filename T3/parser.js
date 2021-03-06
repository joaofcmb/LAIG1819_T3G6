// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var ANIMATIONS_INDEX = 7;
var PRIMITIVES_INDEX = 8;
var COMPONENTS_INDEX = 9;
var LOCATION_INDEX = 0;
var TARGET_INDEX = 1;

var DEGREE_TO_RAD = Math.PI / 180;

/**
 * Parser class, that is responsible for processing XML file.
 */
class Parser {

    /**
     * Parser default constructor.
     * 
     * @param {string} filename 
     * @param {any} data 
     * @param {any} scene 
     */
    constructor(filename, data, scene) {

        this.loadedOk = null;

        this.scene = scene;
        this.data = data;

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */

        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading.
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        var error = this.parseXMLFile(rootElement);
        if (error != null) {
            this.onXMLError(error);
            return;
        }

        // Signal the scene so that any additional initialization depending on the data can take place
        this.scene.onDataLoaded();
    }

    /**
     * Parses the XML file.
     * 
     * @param {any} rootElement 
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "yas")
            return "root tag <yas> missing";

        var index, error;
        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];
        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        // Processes each node, verifying errors.
        var elements = ["scene", "views", "ambient", "lights", "textures", "materials",
            "transformations", "animations", "primitives", "components"];
        var elementsIndex = [
            SCENE_INDEX, VIEWS_INDEX, AMBIENT_INDEX, LIGHTS_INDEX, TEXTURES_INDEX,
            MATERIALS_INDEX, TRANSFORMATIONS_INDEX, ANIMATIONS_INDEX, PRIMITIVES_INDEX, COMPONENTS_INDEX
        ];

        for (var i = 0; i < elements.length; i++) {
            if ((index = nodeNames.indexOf(elements[i])) == -1)
                return "tag <" + elements[i] + "> missing";
            else {
                if (index != elementsIndex[i])
                    this.onXMLMinorError("tag <" + elements[i] + "> out of order");

                switch (i) {
                    case SCENE_INDEX:
                        if ((error = this.parseScene(nodes[index])) != null)
                            return error;
                        break;
                    case VIEWS_INDEX:
                        if ((error = this.parseViews(nodes[index])) != null)
                            return error;
                        break;
                    case AMBIENT_INDEX:
                        if ((error = this.parseAmbient(nodes[index])) != null)
                            return error;
                        break;
                    case LIGHTS_INDEX:
                        if ((error = this.parseLights(nodes[index])) != null)
                            return error;
                        break;
                    case TEXTURES_INDEX:
                        if ((error = this.parseTextures(nodes[index])) != null)
                            return error;
                        break;
                    case MATERIALS_INDEX:
                        if ((error = this.parseMaterials(nodes[index])) != null)
                            return error;
                        break;
                    case TRANSFORMATIONS_INDEX:
                        if ((error = this.parseTransformations(nodes[index])) != null)
                            return error;
                        break;
                    case ANIMATIONS_INDEX:
                        if ((error = this.parseAnimations(nodes[index])) != null)
                            return error;
                        break;
                    case PRIMITIVES_INDEX:
                        if ((error = this.parsePrimitives(nodes[index])) != null)
                            return error;
                        break;
                    case COMPONENTS_INDEX:
                        if ((error = this.parseComponents(nodes[index])) != null)
                            return error;
                        break;
                }
            }
        }
        this.log("XML Parsing finished");
    }

    /**
     * Parses the <scene> block.
     * 
     * @param {any} sceneNode 
     */
    parseScene(sceneNode) {
        this.data.root = this.reader.getString(sceneNode, "root");
        this.data.axisLength = this.reader.getFloat(sceneNode, "axis_length");

        if (this.data.root == null || this.data.root == "")
            return "<root> element in <scene> is not properly defined."

        if (this.data.axisLength == null || isNaN(this.data.axisLength)) {
            this.data.axisLength = 0;
            this.onXMLMinorError("<axis_length> element is not properly defined on <scene>; using 0 as default value.");
        }
        this.log("Parsed scene");
    }

    /**
     * Parses the <views> block.
     * 
     * @param {any} viewsNode 
     */
    parseViews(viewsNode) {
        var error;

        var viewsDefault = this.reader.getString(viewsNode, "default");
        if (viewsDefault == null || viewsDefault == "")
            return "<default> element in <views> is not properly defined."

        var children = viewsNode.children;
        if (children.length < 1)
            return "There must be at least one type of view defined.";

        var flag = false;
        var nodeNames = [];
        for (var i = 0; i < children.length; i++) {
            nodeNames.push(children[i].nodeName);
            if (this.reader.getString(children[i], "id") == viewsDefault)
                flag = true;
        }

        if (!flag)
            return "default view [" + viewsDefault + "] is referecing a non existent view."
        else if ((error = this.checkRepeatedIDs(children, "views")) != null)
            return error;

        for (var i = 0; i < children.length; i++) {
            var cam = new Object();

            var camID = this.reader.getString(children[i], "id");
            cam.near = this.reader.getFloat(children[i], "near");
            cam.far = this.reader.getFloat(children[i], "far");

            if (nodeNames[i] == "perspective") {
                if (camID == null || camID == "")
                    return "Perspective view with id not properly defined.";

                cam.angle = this.reader.getFloat(children[i], "angle");
            }
            else if (nodeNames[i] == "ortho") {
                if (camID == null || camID == "")
                    return "Ortho view with id not properly defined.";

                cam.left = this.reader.getFloat(children[i], "left");
                cam.right = this.reader.getFloat(children[i], "right");
                cam.top = this.reader.getFloat(children[i], "top");
                cam.bottom = this.reader.getFloat(children[i], "bottom");
            }
            else
                return "<" + nodeNames[i] + "> is not a valid type of view. Valid types: <perspective> or <ortho>."

            var viewChildren = children[i].children;

            if (viewChildren.length != 2)
                return "View with [id = " + camID + "] must have two children (<from> and <to>)."
            else if (viewChildren[0].nodeName != "from")
                return "<" + viewChildren[0].nodeName + "> invalid child of view with [id = " + camID + "]. Expected <from>"
            else if (viewChildren[1].nodeName != "to")
                return "<" + viewChildren[1].nodeName + "> invalid child of view with [id = " + camID + "]. Expected <to>"
            else {
                cam.fromX = this.reader.getFloat(viewChildren[0], "x"); cam.fromY = this.reader.getFloat(viewChildren[0], "y"); cam.fromZ = this.reader.getFloat(viewChildren[0], "z");
                cam.toX = this.reader.getFloat(viewChildren[1], "x"); cam.toY = this.reader.getFloat(viewChildren[1], "y"); cam.toZ = this.reader.getFloat(viewChildren[1], "z");
            }

            if (nodeNames[i] == "perspective")
                this.data.perspectiveCams[camID] = cam;
            else if (nodeNames[i] == "ortho")
                this.data.orthoCams[camID] = cam;

        }

        this.data.defaultCamID = viewsDefault;

        if ((error = this.validateViewsInfo()) != null)
            return error;

        this.scene.updateCameras();
        this.log("Parsed views");
    }

    /**
     * Validates <views> XML information.
     */
    validateViewsInfo() {
        for (var firstKey in this.data.perspectiveCams) {
            if (this.data.perspectiveCams.hasOwnProperty(firstKey)) {
                for (var secondKey in this.data.perspectiveCams[firstKey]) {
                    if (this.data.perspectiveCams[firstKey].hasOwnProperty(secondKey)) {
                        if (this.data.perspectiveCams[firstKey][secondKey] == null || isNaN(this.data.perspectiveCams[firstKey][secondKey])) {
                            this.data.perspectiveCams[firstKey][secondKey] = this.data.perspectiveDefault[secondKey];
                            this.onXMLMinorError("Perspective view with [id = " + firstKey + "] is not properly defined. Default values has been used.");
                        }
                    }
                }
            }
        }

        for (var firstKey in this.data.orthoCams) {
            if (this.data.orthoCams.hasOwnProperty(firstKey)) {
                for (var secondKey in this.data.orthoCams[firstKey]) {
                    if (this.data.orthoCams[firstKey].hasOwnProperty(secondKey)) {
                        if (this.data.orthoCams[firstKey][secondKey] == null || isNaN(this.data.orthoCams[firstKey][secondKey])) {
                            this.data.orthoCams[firstKey][secondKey] = this.data.orthoDefault[secondKey];
                            this.onXMLMinorError("Ortho view with [id = " + firstKey + "] is not properly defined. Default values has been used.");
                        }
                    }
                }
            }
        }
    }

    /**
     * Parses the <ambient> block.
     * 
     * @param {any} ambientNode 
     */
    parseAmbient(ambientNode) {
        var children = ambientNode.children;

        if (children.length != 2)
            return "<ambient> block is not properly defined.";

        var nodeNames = [];
        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        if (nodeNames[0] != "ambient")
            return "<" + nodeNames[0] + "> in ambient is not valid."
        else if (nodeNames[1] != "background")
            return "<" + nodeNames[1] + "> in ambient is not valid."

        this.validateAmbientInfo(children);

        this.log("Parsed ambient");
    }

    /**
     * Validates <ambient> XML information.
     * 
     * @param {Array} children 
     */
    validateAmbientInfo(children) {
        var ar, ag, ab, aa, br, bg, bb, ba;

        var values = [0, 0, 0, 1,
            0, 0, 0, 1];
        var childrenPos = [0, 0, 0, 0,
            1, 1, 1, 1];
        var elements = ["red", "green", "blue", "alpha",
            "red", "green", "blue", "alpha"];
        var shortElements = ["r", "g", "b", "a",
            "r", "g", "b", "a"];
        var type = ["ambient", "ambient", "ambient", "ambient",
            "background", "background", "background", "background"];
        var properValues = [ar, ag, ab, aa,
            br, bg, bb, ba];

        for (var i = 0; i < elements.length; i++) {
            properValues[i] = this.reader.getFloat(children[childrenPos[i]], shortElements[i])
            if (properValues[i] == null || isNaN(properValues[i])) {
                properValues[i] = values[i];
                this.onXMLMinorError("<" + elements[i] + " -- " + type[i] + "> element missing on <ambient>; Using " + values[i] + " as default value.");
            }
        }

        this.data.ambient.r = properValues[0]; this.data.ambient.g = properValues[1]; this.data.ambient.b = properValues[2]; this.data.ambient.a = properValues[3];
        this.data.background.r = properValues[4]; this.data.background.g = properValues[5]; this.data.background.b = properValues[6]; this.data.background.a = properValues[7];
    }


    /**
     * Parses the <ligths> block.
     * 
     * @param {any} lightsNode 
     */
    parseLights(lightsNode) {
        var error;

        var children = lightsNode.children;
        if (children.length < 1)
            return "There must be at least one block of <omni> or <spot> lights.";

        var nodeNames = [];
        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var elements = [
            "ambientR", "ambientG", "ambientB", "ambientA",
            "diffuseR", "diffuseG", "diffuseB", "diffuseA",
            "specularR", "specularG", "specularB", "specularA"
        ]

        if ((error = this.checkRepeatedIDs(children, "lights")) != null)
            return error;

        for (var i = 0; i < children.length; i++) {

            var pointer = 0;
            var light = new Object();
            var lightChildren = children[i].children;
            var lightID = this.reader.getString(children[i], "id");
            var index = nodeNames[i] == "omni" ? 1 : 2;

            light.enabled = this.reader.getBoolean(children[i], "enabled");
            light.locationX = this.reader.getFloat(lightChildren[LOCATION_INDEX], "x");
            light.locationY = this.reader.getFloat(lightChildren[LOCATION_INDEX], "y");
            light.locationZ = this.reader.getFloat(lightChildren[LOCATION_INDEX], "z");
            light.locationW = this.reader.getFloat(lightChildren[LOCATION_INDEX], "w");

            for (var j = index; j < lightChildren.length; j++) {
                light[elements[pointer]] = this.reader.getFloat(lightChildren[j], "r");
                light[elements[pointer + 1]] = this.reader.getFloat(lightChildren[j], "g");
                light[elements[pointer + 2]] = this.reader.getFloat(lightChildren[j], "b");
                light[elements[pointer + 3]] = this.reader.getFloat(lightChildren[j], "a");
                pointer += 4;
            }

            if (nodeNames[i] == "omni") {
                if (lightID == "" || lightID == null)
                    return "Omni light is not properly defined.";
                else if (lightChildren.length != 4)
                    return "Omni light with [id = " + lightID + "] have not all needed elements."

                if (lightChildren[0].nodeName != "location")
                    return "<" + lightChildren[0].nodeName + "> in light with [id = " + lightID + "] is not valid."
                else if (lightChildren[1].nodeName != "ambient")
                    return "<" + lightChildren[1].nodeName + "> in light with [id = " + lightID + "] is not valid."
                else if (lightChildren[2].nodeName != "diffuse")
                    return "<" + lightChildren[2].nodeName + "> in light with [id = " + lightID + "] is not valid."
                else if (lightChildren[3].nodeName != "specular")
                    return "<" + lightChildren[3].nodeName + "> in light with [id = " + lightID + "] is not valid."

                this.data.omniLights[lightID] = light;
            }
            else if (nodeNames[i] == "spot") {
                if (lightID == "" || lightID == null)
                    return "Spot light is not properly defined"
                else if (lightChildren.length != 5)
                    return "Spot light with [id = " + lightID + "] have not all needed elements."

                light.angle = this.reader.getFloat(children[i], "angle");
                light.exponent = this.reader.getFloat(children[i], "exponent");

                if (lightChildren[0].nodeName != "location")
                    return "<" + lightChildren[0].nodeName + "> in light with [id = " + lightID + "] is not valid."
                else if (lightChildren[1].nodeName != "target")
                    return "<" + lightChildren[1].nodeName + "> in light with [id = " + lightID + "] is not valid."
                else if (lightChildren[2].nodeName != "ambient")
                    return "<" + lightChildren[2].nodeName + "> in light with [id = " + lightID + "] is not valid."
                else if (lightChildren[3].nodeName != "diffuse")
                    return "<" + lightChildren[3].nodeName + "> in light with [id = " + lightID + "] is not valid."
                else if (lightChildren[4].nodeName != "specular")
                    return "<" + lightChildren[4].nodeName + "> in light with [id = " + lightID + "] is not valid."

                light.targetX = this.reader.getFloat(lightChildren[TARGET_INDEX], "x");
                light.targetY = this.reader.getFloat(lightChildren[TARGET_INDEX], "y");
                light.targetZ = this.reader.getFloat(lightChildren[TARGET_INDEX], "z");

                this.data.spotLights[lightID] = light;
            }
            else
                return "<" + nodeNames[i] + "> is not a valid type of light. Valid types: <omni> or <perspective>."
        }

        if ((error = this.validateLightsInfo()) != null)
            return error;

        this.log("Parsed lights");
    }

    /**
     * Validates <lights> XML information.
     */
    validateLightsInfo() {
        for (var firstKey in this.data.omniLights) {
            if (this.data.omniLights.hasOwnProperty(firstKey)) {
                for (var secondKey in this.data.omniLights[firstKey]) {
                    if (this.data.omniLights[firstKey].hasOwnProperty(secondKey)) {
                        if (secondKey == "enabled" && (!(this.data.omniLights[firstKey][secondKey] == 1 || this.data.omniLights[firstKey][secondKey] == 0 || this.data.omniLights[firstKey][secondKey] != null))) {
                            this.data.omniLights[firstKey][secondKey] = this.data.omniDefault[secondKey];
                            this.onXMLMinorError("Omni light with [id = " + firstKey + "] has an invalid <enabled> value. Default value has been used.");
                        }
                        else if (secondKey != "enabled" && this.data.omniLights[firstKey][secondKey] == null || isNaN(this.data.omniLights[firstKey][secondKey])) {
                            this.data.omniLights[firstKey][secondKey] = this.data.omniDefault[secondKey];
                            this.onXMLMinorError("Omni light with [id = " + firstKey + "] is not properly defined. Default values has been used.");
                        }
                    }
                }
            }
        }

        for (var firstKey in this.data.spotLights) {
            if (this.data.spotLights.hasOwnProperty(firstKey)) {
                for (var secondKey in this.data.spotLights[firstKey]) {
                    if (this.data.spotLights[firstKey].hasOwnProperty(secondKey)) {
                        if (secondKey == "enabled" && (!(this.data.spotLights[firstKey][secondKey] == 1 || this.data.spotLights[firstKey][secondKey] == 0 || this.data.spotLights[firstKey][secondKey] != null))) {
                            this.data.spotLights[firstKey][secondKey] = this.data.spotDefault[secondKey];
                            this.onXMLMinorError("Spot light with [id = " + firstKey + "] has an invalid <enabled> value. Default value has been used.");
                        }
                        else if (secondKey != "enabled" && this.data.spotLights[firstKey][secondKey] == null || isNaN(this.data.spotLights[firstKey][secondKey])) {
                            this.data.spotLights[firstKey][secondKey] = this.data.spotDefault[secondKey];
                            this.onXMLMinorError("Spot light with [id = " + firstKey + "] is not properly defined. Default values has been used.");
                        }
                    }
                }
            }
        }
    }


    /**
     * Parses the <textures> block.
     * 
     * @param {any} texturesNode 
     */
    parseTextures(texturesNode) {
        var error;

        var children = texturesNode.children;
        if (children.length < 1)
            return "There must be at least one block of textures.";

        if ((error = this.checkRepeatedIDs(children, "textures")) != null)
            return error;

        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName != "texture")
                this.onXMLMinorError("<" + children[i].nodeName + "> block on <textures> node was not properly written. Do you mean <texture> ?");
        }

        for (var i = 0; i < children.length; i++) {

            var textureID = this.reader.getString(children[i], "id");
            if (textureID == "" || textureID == null)
                return "<texture> block on <textures> is not properly defined."

            this.data.textures[textureID] = this.reader.getString(children[i], "file");
        }

        if ((error = this.validateTexturesInfo()) != null)
            return error;

        this.log("Parsed textures");
    }

    /**
     * Validates <textures> XML information.
     */
    validateTexturesInfo() {
        for (var key in this.data.textures) {
            if (this.data.textures.hasOwnProperty(key)) {
                if (this.data.textures[key] == null || this.data.textures[key] == "")
                    return "<texture> block on <textures> with [id = " + key + "] is not properly defined."
            }
        }
    }


    /**
     * Parses the <materials> block.
     * 
     * @param {any} materialsNode 
     */
    parseMaterials(materialsNode) {
        var error;
        var children = materialsNode.children;

        if (children.length < 1)
            return "There must be at least one block of materials.";

        if ((error = this.checkRepeatedIDs(children, "textures")) != null)
            return error;

        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName != "material")
                this.onXMLMinorError("<" + children[i].nodeName + "> block on <materials> node was not properly written. Do you mean <material> ?");
        }

        for (var i = 0; i < children.length; i++) {
            var index = 0;
            var materialChildren = children[i].children;

            var materialID = this.reader.getString(children[i], "id");
            if (materialID == null || materialID == "")
                return "<material> block on <materials> is not properly defined."

            if (materialChildren.length != 4)
                return "material with [id = " + materialID + "] on <materials> have not all needed elements."
            else if (materialChildren[0].nodeName != "emission" && materialChildren[0].nodeName != "ambient" && materialChildren[0].nodeName != "diffuse" && materialChildren[0].nodeName != "specular")
                return "<" + materialChildren[0].nodeName + "> is not a proper element of <materials>."
            else if (materialChildren[1].nodeName != "emission" && materialChildren[1].nodeName != "ambient" && materialChildren[1].nodeName != "diffuse" && materialChildren[1].nodeName != "specular")
                return "<" + materialChildren[1].nodeName + "> is not a proper element of <materials>."
            else if (materialChildren[2].nodeName != "emission" && materialChildren[2].nodeName != "ambient" && materialChildren[2].nodeName != "diffuse" && materialChildren[2].nodeName != "specular")
                return "<" + materialChildren[2].nodeName + "> is not a proper element of <materials>."
            else if (materialChildren[3].nodeName != "emission" && materialChildren[3].nodeName != "ambient" && materialChildren[3].nodeName != "diffuse" && materialChildren[3].nodeName != "specular")
                return "<" + materialChildren[3].nodeName + "> is not a proper element of <materials>."

            var material = new Object();
            material.shininess = this.reader.getFloat(children[i], "shininess");

            var materialProperties = [
                "emissionR", "emissionG", "emissionB", "emissionA",
                "ambientR", "ambientG", "ambientB", "ambientA",
                "diffuseR", "diffuseG", "diffuseB", "diffuseA",
                "specularR", "specularG", "specularB", "specularA"
            ];

            for (var j = 0; j < materialChildren.length; j++) {
                material[materialProperties[index]] = this.reader.getFloat(materialChildren[j], "r");
                material[materialProperties[index + 1]] = this.reader.getFloat(materialChildren[j], "g");
                material[materialProperties[index + 2]] = this.reader.getFloat(materialChildren[j], "b");
                material[materialProperties[index + 3]] = this.reader.getFloat(materialChildren[j], "a");
                index += 4;
            }

            this.data.materials[materialID] = material;
        }

        if ((error = this.validateMaterialsInfo()) != null)
            return error;

        this.log("Parsed materials");
    }

    /**
     * Validates <materials> XML information.
     */
    validateMaterialsInfo() {
        for (var firstKey in this.data.materials) {
            if (this.data.materials.hasOwnProperty(firstKey)) {
                for (var secondKey in this.data.materials[firstKey]) {
                    if (this.data.materials[firstKey].hasOwnProperty(secondKey)) {
                        if (this.data.materials[firstKey][secondKey] == null || isNaN(this.data.materials[firstKey][secondKey])) {
                            this.data.materials[firstKey][secondKey] = this.data.materialDefault[secondKey];
                            this.onXMLMinorError("<material> with [id = " + firstKey + "] has an invalid value. Default value has been used.");
                        }
                    }
                }
            }
        }
    }

    /**
     * Parses the <transformations> block.
     * 
     * @param {any} transformations 
     */
    parseTransformations(transformations) {
        var error;

        var children = transformations.children;
        if (children.length < 1)
            return "There must be at least one block of transformations";

        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName != "transformation")
                this.onXMLMinorError("<" + children[i].nodeName + "> block on <transformations> node was not properly written. Do you mean <transformation> ?");
        }

        if ((error = this.checkRepeatedIDs(children, "transformations")) != null)
            return error;

        for (var i = 0; i < children.length; i++) {
            var baseTransform = [];
            var transformationChildren = children[i].children;

            var tranformID = this.reader.getString(children[i], "id");
            if (tranformID == null || tranformID == "")
                return "<transformation> block on <transformations> is not properly defined."

            if (transformationChildren.length < 1)
                return "Transformation with [id = " + tranformID + "] must have at least one transformation."

            for (var j = 0; j < transformationChildren.length; j++) {
                var transformation = new Object();
                transformation.type = transformationChildren[j].nodeName;

                if (transformationChildren[j].nodeName == "translate" || transformationChildren[j].nodeName == "scale") {
                    transformation.x = this.reader.getFloat(transformationChildren[j], "x");
                    transformation.y = this.reader.getFloat(transformationChildren[j], "y");
                    transformation.z = this.reader.getFloat(transformationChildren[j], "z");
                }
                else if (transformationChildren[j].nodeName == "rotate") {
                    transformation.axis = this.reader.getString(transformationChildren[j], "axis");
                    transformation.angle = this.reader.getFloat(transformationChildren[j], "angle");
                }
                else
                    return "Transformation <" + transformationChildren[j].nodeName + "> not valid. Valid transformations <translate>, <rotate>, <scale>."

                baseTransform.push(transformation);
            }

            this.data.transforms[tranformID] = baseTransform;
        }

        if ((error = this.validateTransformationsInfo()) != null)
            return error;

        this.log("Parsed transformations");
    }

    /**
     * Validates <transformations> XML information.
     */
    validateTransformationsInfo() {
        for (var firstKey in this.data.transforms) {
            if (this.data.transforms.hasOwnProperty(firstKey)) {
                for (var i = 0; i < this.data.transforms[firstKey].length; i++) {
                    for (var secondKey in this.data.transforms[firstKey][i]) {
                        if (this.data.transforms[firstKey][i].hasOwnProperty(secondKey)) {
                            var type = this.data.transforms[firstKey][i].type;
                            if (type == "rotate" && secondKey == "axis" && (this.data.transforms[firstKey][i][secondKey] == null || this.data.transforms[firstKey][i][secondKey] == "")) {
                                this.data.transforms[firstKey][i][secondKey] = this.data.rotateDefault[secondKey];
                                this.onXMLMinorError("Transformation with [id = " + firstKey + "] has an invalid value on " + secondKey + ". Default value has been used.");
                            }
                            else if (secondKey != "type" && secondKey != "axis" && (this.data.transforms[firstKey][i][secondKey] == null || isNaN(this.data.transforms[firstKey][i][secondKey]))) {
                                if (type == "translate")
                                    this.data.transforms[firstKey][i][secondKey] = this.data.translateDefault[secondKey];
                                else if (type == "rotate")
                                    this.data.transforms[firstKey][i][secondKey] = this.data.rotateDefault[secondKey];
                                else if (type == "scale")
                                    this.data.transforms[firstKey][i][secondKey] = this.data.scaleDefault[secondKey];

                                this.onXMLMinorError("Transformation with [id = " + firstKey + "] has an invalid value on " + secondKey + ". Default value has been used.");
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Parses the <animations> block.
     * 
     * @param {any} animations 
     */
    parseAnimations(animations) {
        var error;

        var children = animations.children;
        if (children.length == 0)
            return;

        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName != "linear" && children[i].nodeName != "circular")
                return "<" + children[i].nodeName + "> block on <animations> is not valid. Valid animations: <linear> or <circular>.";
        }

        if ((error = this.checkRepeatedIDs(children, "animations")) != null)
            return error;

        for (var i = 0; i < children.length; i++) {
            var animation = new Object();

            var animationID = this.reader.getString(children[i], "id");
            if (animationID == null || animationID == "")
                return "Animation on <animations> block is not properly defined";

            animation.controlPoints = [];
            animation.span = this.reader.getFloat(children[i], "span");
            if (animation.span == null || isNaN(animation.span))
                return "<span> value on animation with [id = " + animationID + "] is not properly defined";

            if (children[i].nodeName == "linear") {
                var linearChildren = children[i].children;

                if (linearChildren.length < 2)
                    return "Linear animation with [id = " + animationID + "] must have at least 2 control points."

                for (var j = 0; j < linearChildren.length; j++) {

                    if (linearChildren[j].nodeName != "controlpoint")
                        this.onXMLMinorError("<" + linearChildren[j].nodeName + "> block on linear animation with [id = " + animationID + "] was not properly written. Do you mean <controlpoint> ?");

                    var x = this.reader.getFloat(linearChildren[j], "xx");
                    if (x == null || isNaN(x))
                        return "<xx> value on linear animation with [id = " + animationID + "] is not properly defined";

                    var y = this.reader.getFloat(linearChildren[j], "yy");
                    if (y == null || isNaN(y))
                        return "<yy> value on linear animation with [id = " + animationID + "] is not properly defined";

                    var z = this.reader.getFloat(linearChildren[j], "zz");
                    if (z == null || isNaN(z))
                        return "<zz> value on linear animation with [id = " + animationID + "] is not properly defined";

                    animation.controlPoints.push(vec3.fromValues(x, y, z));
                }

                animation.type = "linear";
                this.data.animations[animationID] = animation;
            }
            else {
                animation.center = this.reader.getVector3(children[i], "center", false);
                if (animation.center == null || isNaN(animation.center[0]) || isNaN(animation.center[1]) || isNaN(animation.center[2]))
                    return "<center> values on circular animation with [id = " + animationID + "] are not properly defined";

                animation.radius = this.reader.getFloat(children[i], "radius");
                if (animation.radius == null || isNaN(animation.radius))
                    return "<radius> value on circular animation with [id = " + animationID + "] is not properly defined";

                animation.startAng = this.reader.getFloat(children[i], "startang");
                if (animation.startAng == null || isNaN(animation.startAng))
                    return "<startang> value on circular animation with [id = " + animationID + "] is not properly defined";

                animation.rotAng = this.reader.getFloat(children[i], "rotang");
                if (animation.rotAng == null || isNaN(animation.rotAng))
                    return "<rotang> value on circular animation with [id = " + animationID + "] is not properly defined";

                animation.type = "circular";
                this.data.animations[animationID] = animation;
            }
        }

        this.log("Parsed animations");
    }

    /**
     * Parses the <primitives> block.
     * 
     * @param {any} primitives 
     */
    parsePrimitives(primitives) {
        var error;

        var children = primitives.children;
        if (children.length < 1)
            return "There must be at least one block of primitives";

        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName != "primitive")
                this.onXMLMinorError("<" + children[i].nodeName + "> block on <primitives> node was not properly written. Do you mean <primitive> ?");
        }

        if ((error = this.checkRepeatedIDs(children, "primitives")) != null)
            return error;

        for (var i = 0; i < children.length; i++) {
            var primitiveChildren = children[i].children;

            if (primitiveChildren.length != 1)
                return "There must exist only one tag per primitive. Available tags: <rectangle>, <triangle>, <cylinder>, <sphere>, <torus>, <plane>, <patch>, <vehicle>, <cylinder2>, <terrain>, <water>."

            var primitive = new Object();
            primitive.type = primitiveChildren[0].nodeName;

            var primitiveID = this.reader.getString(children[i], "id");
            if (primitiveID == null || primitiveID == "")
                return "<primitive> block on <primitives> is not properly defined."

            switch (primitiveChildren[0].nodeName) {
                case "rectangle":
                    primitive.x1 = this.reader.getFloat(primitiveChildren[0], "x1"); primitive.y1 = this.reader.getFloat(primitiveChildren[0], "y1");
                    primitive.x2 = this.reader.getFloat(primitiveChildren[0], "x2"); primitive.y2 = this.reader.getFloat(primitiveChildren[0], "y2");
                    break;
                case "triangle":
                    primitive.x1 = this.reader.getFloat(primitiveChildren[0], "x1"); primitive.y1 = this.reader.getFloat(primitiveChildren[0], "y1"); primitive.z1 = this.reader.getFloat(primitiveChildren[0], "z1");
                    primitive.x2 = this.reader.getFloat(primitiveChildren[0], "x2"); primitive.y2 = this.reader.getFloat(primitiveChildren[0], "y2"); primitive.z2 = this.reader.getFloat(primitiveChildren[0], "z2");
                    primitive.x3 = this.reader.getFloat(primitiveChildren[0], "x3"); primitive.y3 = this.reader.getFloat(primitiveChildren[0], "y3"); primitive.z3 = this.reader.getFloat(primitiveChildren[0], "z3");
                    break;
                case "cylinder":
                case "cylinder2":
                    primitive.base = this.reader.getFloat(primitiveChildren[0], "base"); primitive.top = this.reader.getFloat(primitiveChildren[0], "top"); primitive.height = this.reader.getFloat(primitiveChildren[0], "height");
                    primitive.slices = this.reader.getInteger(primitiveChildren[0], "slices"); primitive.stacks = this.reader.getInteger(primitiveChildren[0], "stacks");
                    break;
                case "sphere":
                    primitive.radius = this.reader.getFloat(primitiveChildren[0], "radius");
                    primitive.slices = this.reader.getInteger(primitiveChildren[0], "slices"); primitive.stacks = this.reader.getInteger(primitiveChildren[0], "stacks");
                    break;
                case "torus":
                    primitive.inner = this.reader.getFloat(primitiveChildren[0], "inner"); primitive.outer = this.reader.getFloat(primitiveChildren[0], "outer");
                    primitive.slices = this.reader.getInteger(primitiveChildren[0], "slices"); primitive.loops = this.reader.getInteger(primitiveChildren[0], "loops");
                    break;
                case "plane":
                    primitive.npartsU = this.reader.getInteger(primitiveChildren[0], "npartsU");
                    primitive.npartsV = this.reader.getInteger(primitiveChildren[0], "npartsV");
                    break;
                case "patch":
                    primitive.npointsU = this.reader.getInteger(primitiveChildren[0], "npointsU");
                    primitive.npointsV = this.reader.getInteger(primitiveChildren[0], "npointsV");
                    primitive.npartsU = this.reader.getInteger(primitiveChildren[0], "npartsU");
                    primitive.npartsV = this.reader.getInteger(primitiveChildren[0], "npartsV");

                    var totalPoints = primitive.npointsU * primitive.npointsV;
                    var controlPoints = primitiveChildren[0].children;

                    if (totalPoints != controlPoints.length)
                        return "Primitive with [id = " + primitiveID + "] is not properly defined. It has " + controlPoints.length + " and should have " + totalPoints + ".";

                    primitive.controlPoints = [];

                    for (var j = 0; j < controlPoints.length; j += 0) {
                        var upoints = [];
                        var npointsV = primitive.npointsV;

                        while (npointsV > 0) {
                            var x = this.reader.getFloat(controlPoints[j], "xx");
                            if (x == null || isNaN(x))
                                return "<xx> value on controlpoint of primitive with [id = " + primitiveID + "] is not properly defined";

                            var y = this.reader.getFloat(controlPoints[j], "yy");
                            if (y == null || isNaN(y))
                                return "<yy> value on controlpoint of primitive with [id = " + primitiveID + "] is not properly defined";

                            var z = this.reader.getFloat(controlPoints[j], "zz");
                            if (z == null || isNaN(z))
                                return "<zz> value on controlpoint of primitive with [id = " + primitiveID + "] is not properly defined";

                            upoints.push([x, y, z, 1]);

                            j++;
                            npointsV--;
                        }

                        primitive.controlPoints.push(upoints);
                    }
                    break;
                case "terrain":
                case "water":
                    var idtexture = this.reader.getString(primitiveChildren[0], "idtexture");
                    if (this.data.textures[idtexture] == null)
                        return "<idtexture> on primitive with [id = " + primitiveID + "] is referencing a non existent texture.";

                    primitive.idtexture = idtexture;

                    if (primitiveChildren[0].nodeName == "terrain") {
                        var idheightmap = this.reader.getString(primitiveChildren[0], "idheightmap");
                        if (this.data.textures[idheightmap] == null)
                            return "<idheightmap> on primitive with [id = " + primitiveID + "] is referencing a non existent texture.";

                        primitive.idheightmap = idheightmap;
                    }
                    else {
                        var idwavemap = this.reader.getString(primitiveChildren[0], "idwavemap");
                        if (this.data.textures[idwavemap] == null)
                            return "<idwavemap> on primitive with [id = " + primitiveID + "] is referencing a non existent texture.";

                        primitive.idwavemap = idwavemap;
                    }

                    primitive.parts = this.reader.getInteger(primitiveChildren[0], "parts");
                    if (primitive.parts == null || isNaN(primitive.parts))
                        return "Primitive with [id = " + primitiveID + "] has an invalid value on <parts>.";

                    primitive.heightscale = this.reader.getFloat(primitiveChildren[0], "heightscale");
                    if (primitive.heightscale == null || isNaN(primitive.heightscale))
                        return "Primitive with [id = " + primitiveID + "] has an invalid value on <heightscale>.";

                    if (primitiveChildren[0].nodeName == "water") {
                        primitive.texscale = this.reader.getFloat(primitiveChildren[0], "texscale");
                        if (primitive.texscale == null || isNaN(primitive.texscale))
                            return "Primitive with [id = " + primitiveID + "] has an invalid value on <texscale>.";
                    }
                    break;
                case "vehicle":
                    break;
                case "board":
                    primitive.whiteCam = this.reader.getString(primitiveChildren[0], "whiteCam");
                    if (!Object.keys(this.data.orthoCams).concat(Object.keys(this.data.perspectiveCams)).includes(primitive.whiteCam))
                        return "Camera assigned to board game [id = " + primitiveID + "] does not exist.";
                    break;
                case "cube":
                    primitive.npartsU = this.reader.getInteger(primitiveChildren[0], "npartsU");
                    primitive.npartsV = this.reader.getInteger(primitiveChildren[0], "npartsV");
                    break;
                default:
                    return "Primitive <" + primitiveChildren[0].nodeName + "> not valid. Valid primitives: <rectangle>, <triangle>, <cylinder>, <sphere>, <torus>, <plane>, <patch>, <vehicle>, <cylinder2>, <terrain>, <water>, <board>, <cube>."

            }

            this.data.primitives[primitiveID] = primitive;
        }

        if ((error = this.validatePrimitivesInfo(primitives)) != null)
            return error;

        this.log("Parsed primitives");
    }

    /**
     * Validates <primitives> XML information. 
     */
    validatePrimitivesInfo() {
        for (var firstKey in this.data.primitives) {
            if (this.data.primitives.hasOwnProperty(firstKey)) {
                for (var secondKey in this.data.primitives[firstKey]) {
                    if (this.data.primitives[firstKey].hasOwnProperty(secondKey)) {
                        if (secondKey != "type" &&
                            secondKey != "controlPoints" &&
                            this.data.primitives[firstKey].type != "terrain" &&
                            this.data.primitives[firstKey].type != "water" &&
                            this.data.primitives[firstKey].type != "board" &&
                            (this.data.primitives[firstKey][secondKey] == null || isNaN(this.data.primitives[firstKey][secondKey]))) {
                            return "Primitive with [id = " + firstKey + "] is not valid due to <" + secondKey + "> value on " + this.data.primitives[firstKey].type + ".";
                        }
                    }
                }
            }
        }
    }

    /**
     * Parses the <components> block.
     * 
     * @param {any} components 
     */
    parseComponents(components) {
        var error;
        var flag = false;
        var componentsID = [];
        var children = components.children;

        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName != "component")
                this.onXMLMinorError("<" + children[i].nodeName + "> block on <components> node was not properly written. Do you mean <component> ?");
        }

        if ((error = this.checkRepeatedIDs(children, "components")) != null)
            return error;

        for (var i = 0; i < children.length; i++) {
            componentsID.push(this.reader.getString(children[i], "id"));
        }

        for (var i = 0; i < children.length; i++) {
            var componentChildren = children[i].children;
            var componentID = this.reader.getString(children[i], "id");

            this.data.components[componentID] = new Object();

            if (componentID == null || componentID == "")
                return "<component> block on <components> is not properly defined."
            else if (componentID == this.data.root)
                flag = true;

            if ((error = this.validateComponentsInfo(componentChildren)) != null)
                return error;

            for (var j = 0; j < componentChildren.length; j++) {

                switch (componentChildren[j].nodeName) {
                    case "transformation":
                        if ((error = this.parseComponentTransform(componentChildren[j], componentID)) != null)
                            return error;
                        break;
                    case "materials":
                        if ((error = this.parseComponentMaterials(componentChildren[j], componentID)) != null)
                            return error;
                        break;
                    case "texture":
                        if ((error = this.parseComponentTextures(componentChildren[j], componentID)) != null)
                            return error;
                        break;
                    case "animations":
                        if (j > 0 && componentChildren[j - 1].nodeName != "transformation")
                            return "Block <animations> on components must be declared immediately after <transformation> block.";
                        else if ((error = this.parseComponentAnimations(componentChildren[j], componentID)) != null)
                            return error;
                        break;
                    case "children":
                        if ((error = this.parseComponentChildren(componentsID, componentChildren[j], componentID)) != null)
                            return error;
                        break;
                }
            }
        }

        if (!flag)
            return "There must be a component whose id corresponds to the root element on <scene> tag."

        this.log("Parsed components");
    }

    /**
     * Parses transformation block on <components>.
     * 
     * @param {any} node 
     * @param {number} componentID 
     */
    parseComponentTransform(node, componentID) {
        var nodeChildren = node.children;

        if (nodeChildren.length == 1 && nodeChildren[0].nodeName != "translate" && nodeChildren[0].nodeName != "rotate" && nodeChildren[0].nodeName != "scale") {
            if (nodeChildren[0].nodeName == "transformationref") {
                var tranformRefID = this.reader.getString(nodeChildren[0], "id");
                if (tranformRefID == null || tranformRefID == "")
                    return "Transformation block on <components> is not properly defined.";

                var transform = this.data.transforms[tranformRefID];
                if (transform == null)
                    return "Transformation block on <components> not valid due to the non existence of transformationred with the given ID.";
                else
                    this.data.components[componentID].transforms = tranformRefID;
            }
            else
                return "Transformation block on <components> not valid. Valid transformations <transformationref> or <translate>, <rotate>, <scale>.";
        }
        else {
            for (var i = 0; i < nodeChildren.length; i++) {
                if (nodeChildren[i].nodeName != "translate" && nodeChildren[i].nodeName != "rotate" && nodeChildren[i].nodeName != "scale")
                    return "Transformation block on <components> not valid. Valid transformations <transformationref> or <translate>, <rotate>, <scale>.";
            }

            var baseTransform = [];

            for (var i = 0; i < nodeChildren.length; i++) {
                var transformation = new Object();
                transformation.type = nodeChildren[i].nodeName;

                if (nodeChildren[i].nodeName == "translate" || nodeChildren[i].nodeName == "scale") {
                    transformation.x = this.reader.getFloat(nodeChildren[i], "x");
                    if (transformation.x == null || isNaN(transformation.x)) {
                        if (nodeChildren[i].nodeName == "translate")
                            transformation.x = this.data.translateDefault.x;
                        else
                            transformation.x = this.data.scaleDefault.x;
                        this.onXMLMinorError("Transformation block on <components> not valid due to invalid input values. Default values has been used.");
                    }

                    transformation.y = this.reader.getFloat(nodeChildren[i], "y");
                    if (transformation.y == null || isNaN(transformation.y)) {
                        if (nodeChildren[i].nodeName == "translate")
                            transformation.y = this.data.translateDefault.y;
                        else
                            transformation.y = this.data.scaleDefault.y;
                        this.onXMLMinorError("Transformation block on <components> not valid due to invalid input values. Default values has been used.");
                    }

                    transformation.z = this.reader.getFloat(nodeChildren[i], "z");
                    if (transformation.z == null || isNaN(transformation.z)) {
                        if (nodeChildren[i].nodeName == "translate")
                            transformation.z = this.data.translateDefault.z;
                        else
                            transformation.z = this.data.scaleDefault.z;
                        this.onXMLMinorError("Transformation block on <components> not valid due to invalid input values. Default values has been used.");
                    }
                }
                else if (nodeChildren[i].nodeName == "rotate") {
                    transformation.axis = this.reader.getString(nodeChildren[i], "axis");
                    if (transformation.axis == null || transformation.axis == "") {
                        transformation.axis = this.data.rotateDefault.axis;
                        this.onXMLMinorError("Transformation block on <components> not valid due to invalid input values. Default values has been used.");
                    }

                    transformation.angle = this.reader.getFloat(nodeChildren[i], "angle");
                    if (transformation.angle == null || isNaN(transformation.angle)) {
                        transformation.angle = this.data.rotateDefault.angle;
                        this.onXMLMinorError("Transformation block on <components> not valid due to invalid input values. Default values has been used.");
                    }
                }
                baseTransform.push(transformation);
            }
            this.data.components[componentID].transforms = baseTransform;
        }
    }

    /**
     * Parses materials block on <components>.
     * 
     * @param {any} node 
     * @param {number} componentID 
     */
    parseComponentMaterials(node, componentID) {
        var nodeChildren = node.children;

        if (nodeChildren.length < 1)
            return "component with [id = " + componentID + "] must have at least one material block on <materials>.";
        else {
            var materials = [];

            for (var i = 0; i < nodeChildren.length; i++) {
                if (nodeChildren[i].nodeName != "material")
                    return "component with [id = " + componentID + "] is not properly defined on <materials> due to invalid value <" + nodeChildren[i].nodeName + ">."

                var materialID = this.reader.getString(nodeChildren[i], "id");

                if (materialID == null || materialID == "")
                    return "component with [id = " + componentID + "] is not properly defined on <materials> due to invalid ID.";
                else if (materialID != "inherit" && this.data.materials[materialID] == null)
                    return "component with [id = " + componentID + "] is not properly defined on <materials> because material with [id = " + materialID + "] is referencing an non existent material.";

                materials.push(materialID);
            }
            this.data.components[componentID].materials = materials;
        }

    }


    /**
     * Parses textures block on <components>.
     * 
     * @param {any} node 
     * @param {number} componentID 
     */
    parseComponentTextures(node, componentID) {
        var textureID = this.reader.getString(node, "id");
        var textureLenS = null;
        var textureLenT = null;

        if (this.reader.hasAttribute(node, "length_s") && this.reader.hasAttribute(node, "length_t")) {
            textureLenS = this.reader.getFloat(node, "length_s");
            textureLenT = this.reader.getFloat(node, "length_t");
        }

        if (textureID == null || textureID == "")
            return "component with [id = " + componentID + "] is not properly defined on <texture> due to invalid ID.";
        else if (textureID != "inherit" && textureID != "none" && (textureLenS == null || isNaN(textureLenS) || textureLenT == null || isNaN(textureLenT)))
            return "component with [id = " + componentID + "] is not properly defined on <texture> due to invalid values. " + textureID + "  " + textureLenT + "  " + textureLenT;

        if (textureID != "inherit" && textureID != "none" && this.data.textures[textureID] == null)
            return "component with [id = " + componentID + "] is not properly defined on <texture> because texture with [id = " + textureID + "] is referencing an non existent texture.";

        this.data.components[componentID].textureID = textureID;
        this.data.components[componentID].texLengthS = textureLenS;
        this.data.components[componentID].texLengthT = textureLenT;
    }

    /**
     * Parses animations block on <components>.
     * 
     * @param {any} node 
     * @param {number} componentID 
     */
    parseComponentAnimations(node, componentID) {
        var animationsArray = [];
        var nodeChildren = node.children;

        for (var i = 0; i < nodeChildren.length; i++) {
            if (nodeChildren[i].nodeName != "animationref")
                this.onXMLMinorError("Invalid children on <animations> block in component with [id = " + componentID + "]. Do you mean <animationref> ?");

            var animationID = this.reader.getString(nodeChildren[i], "id");

            var animation = this.data.animations[animationID];

            if (animationID == null || animationID == "")
                return "<component> with [id = " + componentID + "] has an animation reference not properly defined.";
            else if (animation == null)
                return "<component> with [id = " + componentID + "] is referencing a non existent animation <" + animationID + ">.";
            else
                animationsArray.push(animationID);
        }

        this.data.components[componentID].animations = animationsArray;
    }


    /**
     * Parses children block on <components>.
     * 
     * @param {number} componentsID 
     * @param {any} node 
     * @param {number} componentID 
     */
    parseComponentChildren(componentsID, node, componentID) {
        var componentsArray = [];
        var primitivesArray = [];

        var nodeChildren = node.children;

        if (nodeChildren.length < 1)
            return "<component> with [id = " + componentID + "] must have at least one of the following tags: <componentref> or <primitiveref>.";


        for (var i = 0; i < nodeChildren.length; i++) {

            var nodeChildrenID = this.reader.getString(nodeChildren[i], "id");
            if (nodeChildrenID == null || nodeChildrenID == "")
                return "<component> with [id = " + componentID + "] has the following tag <" + nodeChildren[i].nodeName + "> not properly defined.";

            if (nodeChildren[i].nodeName == "componentref") {
                var flag = false;

                for (var j = 0; j < componentsID.length; j++) {
                    if (componentsID[j] == nodeChildrenID)
                        flag = true;
                }

                if (flag)
                    componentsArray.push(nodeChildrenID);
                else
                    return "<component> with [id = " + componentID + "] has the following tag <componentref> referencing a non existent component <" + nodeChildrenID + ">.";

            }
            else if (nodeChildren[i].nodeName == "primitiveref") {
                var primitive = this.data.primitives[nodeChildrenID];

                if (primitive == null)
                    return "component with [id = " + componentID + "] has the following tag <primitiveref> referencing a non existent primitive.";

                primitivesArray.push(nodeChildrenID);
            }
            else
                return "<component> with [id = " + componentID + "] has an invalid tag <" + nodeChildren[i].nodeName + ">. Available tags: <componentref> or <primitiveref>";
        }

        this.data.components[componentID].components = componentsArray;
        this.data.components[componentID].primitives = primitivesArray;
    }


    /**
     * Validates <components> XML information.
     * 
     * @param {any} componentChildren 
     */
    validateComponentsInfo(componentChildren) {

        var neededElements = [0, 0, 0, 0];

        for (var j = 0; j < componentChildren.length; j++) {
            if (componentChildren[j].nodeName == "transformation")
                neededElements[0] = 1;
            else if (componentChildren[j].nodeName == "materials")
                neededElements[1] = 1;
            else if (componentChildren[j].nodeName == "texture")
                neededElements[2] = 1;
            else if (componentChildren[j].nodeName == "children")
                neededElements[3] = 1;
            else if (componentChildren[j].nodeName != "animations")
                return "Invalid children on <components>: " + componentChildren[j].nodeName + ".";
        }

        for (var j = 0; j < neededElements.length; j++) {
            if (neededElements[j] == 0)
                return "<components> does not contain all needed elements. It must contain: <transformation>, <materials>, <texture>, <children> blocks. Block <animations> is optional.";
        }
    }

    /**
     * Checks if there exists two children of node using the same ID.
     * @param {any} node 
     * @param {string} type 
     */
    checkRepeatedIDs(node, type) {
        var ids = [];

        for (var i = 0; i < node.length; i++)
            ids.push(this.reader.getString(node[i], "id"));

        for (var i = 0; i < ids.length; i++) {
            for (var j = 0; j < ids.length; j++) {
                if (i != j && ids[i] == ids[j])
                    return "There are two " + type + " using the same id [" + ids[i] + "]."
            }
        }
    }

    /**
     * Callback to be executed on any read error, showing an error on the console.
     * 
     * @param {string} message 
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

}