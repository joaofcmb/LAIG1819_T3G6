var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var PRIMITIVES_INDEX = 7;
var COMPONENTS_INDEX = 8;
var LOCATION_INDEX = 0;
var TARGET_INDEX = 1;

class Parser {

    /**
     * @constructor
     */
    constructor(filename, data, scene) {

        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        this.data = data;
        //scene.graph = this;

        //this.nodes = [];

        //this.idRoot = null;                    // The id of the root element.

        //this.axisCoords = [];
        //this.axisCoords['x'] = [1, 0, 0];
        //this.axisCoords['y'] = [0, 1, 0];
        //this.axisCoords['z'] = [0, 0, 1];

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
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);
        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the data is loaded ok, signal the scene so that any additional initialization depending on the data can take place
        this.scene.onDataLoaded();
    }

    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "yas")
            return "root tag <yas> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var index, error;

        // Processes each node, verifying errors.

        var elements = ["scene", "views", "ambient", "lights", "textures", "materials", "transformations", "primitives"];
        var elementsIndex = [SCENE_INDEX, VIEWS_INDEX, AMBIENT_INDEX, LIGHTS_INDEX, TEXTURES_INDEX, MATERIALS_INDEX, TRANSFORMATIONS_INDEX, PRIMITIVES_INDEX];

        for (var i = 0; i < elements.length; i++) {
            if ((index = nodeNames.indexOf(elements[i])) == -1)
                return "tag <" + elements[i] + "> missing";
            else {
                if (index != elementsIndex[i])
                    this.onXMLMinorError("tag <" + elements[i] + "> out of order");

                //Parse block
                if (i == SCENE_INDEX && ((error = this.parseScene(nodes[index])) != null))
                    return error;
                else if (i == VIEWS_INDEX && ((error = this.parseViews(nodes[index])) != null))
                    return error;
                else if (i == AMBIENT_INDEX && ((error = this.parseAmbient(nodes[index])) != null))
                    return error;
                else if (i == LIGHTS_INDEX && ((error = this.parseLights(nodes[index])) != null))
                    return error;
                else if (i == TEXTURES_INDEX && ((error = this.parseTextures(nodes[index])) != null))
                    return error;
                else if (i == MATERIALS_INDEX && ((error = this.parseMaterials(nodes[index])) != null))
                    return error;
                else if (i == TRANSFORMATIONS_INDEX && ((error = this.parseTransformations(nodes[index])) != null))
                    return error;
                else if (i == PRIMITIVES_INDEX && ((error = this.parsePrimitives(nodes[index])) != null))
                    return error;
            }
        }

    }

    /*
        Parses the <scene> block.
    */
    parseScene(sceneNode) {
        this.data.root = this.reader.getString(sceneNode, "root");
        this.data.axisLength = this.reader.getFloat(sceneNode, "axis_length");

        if (this.data.root == null)
            return "root element in <scene> must be defined in order to parse XML file"
        else if (this.data.root == "")
            return "root element in <scene> must have a proper name."

        if (this.data.axisLength == null || isNaN(this.data.axisLength)) {
            this.data.axisLength = 0;
            this.onXMLMinorError("axis_length element missing on <scene>; using 0 as default value");
        }

        this.log("Parsed scene");
    }

    /*
        Parses the <views> block.
    */
    parseViews(viewsNode) {
        var viewsDefault = this.reader.getString(viewsNode, "default");
        if (viewsDefault == null)
            return "default element in <views> must be defined in order to parse XML file"
        else if (viewsDefault == "")
            return "default element in <views> must have a proper name."

        var children = viewsNode.children;

        if (children.length < 1)
            return "There must be at least one type of view defined";

        var nodeNames = [];
        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        for (var i = 0; i < children.length; i++) {
            var cam = new Object();

            var camID = this.reader.getString(children[i], "id");
            cam.near = this.reader.getFloat(children[i], "near");
            cam.far = this.reader.getFloat(children[i], "far");

            if (nodeNames[i] == "perspective") {
                cam.angle = this.reader.getFloat(children[i], "angle");

                var perspectiveChildren = children[i].children;

                if (perspectiveChildren.length != 2)
                    return "Perspective view with [id = " + perspective[0] + "] must have only two children."
                else if (perspectiveChildren[0].nodeName != "from")
                    return "<" + perspectiveChildren[0].nodeName + "> invalid children of perspective view with [id = " + camID + "]."
                else if (perspectiveChildren[1].nodeName != "to")
                    return "<" + perspectiveChildren[1].nodeName + "> invalid children of perspective view with [id = " + camID + "]."
                else {
                    cam.fromX = this.reader.getFloat(perspectiveChildren[0], "x"); cam.fromY = this.reader.getFloat(perspectiveChildren[0], "y"); cam.fromZ = this.reader.getFloat(perspectiveChildren[0], "z");
                    cam.toX = this.reader.getFloat(perspectiveChildren[1], "x"); cam.toY = this.reader.getFloat(perspectiveChildren[1], "y"); cam.toZ = this.reader.getFloat(perspectiveChildren[1], "z");
                }

                this.data.perspectiveCams[camID] = cam;
            }
            else if (nodeNames[i] == "ortho") {
                cam.left = this.reader.getFloat(children[i], "left");
                cam.right = this.reader.getFloat(children[i], "right");
                cam.top = this.reader.getFloat(children[i], "top");
                cam.bottom = this.reader.getFloat(children[i], "bottom");

                this.data.orthoCams[camID] = cam;
            }
            else
                return "<" + nodeNames[i] + "> is not a valid type of view. Valid types: <perspective> or <ortho>."
        }

        var error;
        if ((error = this.validateViewsInfo()) != null)
            return error;

        this.log("Parsed views");
    }

    /*
        Validates <views> XML information
    */
    validateViewsInfo() {
        var totalCams = [];

        for (var firstKey in this.data.perspectiveCams) {
            if (this.data.perspectiveCams.hasOwnProperty(firstKey)) {
                if (firstKey == "" || firstKey == null)
                    return "Perspective view with id not properly defined.";
                else
                    totalCams.push(firstKey);

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
                if (firstKey == "" || firstKey == null)
                    return "Perspective view with id not properly defined.";
                else
                    totalCams.push(firstKey);
                for (var secondKey in this.data.orthoCams[firstKey]) {
                    if (this.data.orthoCams[firstKey].hasOwnProperty(secondKey)) {
                        if (this.data.orthoCams[firstKey][secondKey] == null || isNaN(this.data.orthoCams[firstKey][secondKey])) {
                            this.data.orthoCams[firstKey][secondKey] = this.data.orthoDefault[secondKey];
                            this.onXMLMinorError("Perspective view with [id = " + firstKey + "] is not properly defined. Default values has been used.");
                        }
                    }
                }
            }
        }

        for (var i = 0; i < totalCams.length; i++) {
            for (var j = 0; j < totalCams.length; j++) {
                if (j != i && totalCams[i] == totalCams[j])
                    return "Two views are using same ID [" + totalCams[i] + "]"
            }
        }
    }

    /*
       Parses the <ambient> block.
   */
    parseAmbient(ambientNode) {
        var children = ambientNode.children;

        if (children.length != 2)
            return "<ambient> block is not properly defined";

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

    /*
        Validates <ambient> XML information
    */
    validateAmbientInfo(children, ambient, background) {
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
                this.onXMLMinorError(elements[i] + " (" + type[i] + ") element missing on <ambient>; using " + values[i] + " as default value");
            }
        }

        this.data.ambient.r = properValues[0]; this.data.ambient.g = properValues[1]; this.data.ambient.b = properValues[2]; this.data.ambient.a = properValues[3];
        this.data.background.r = properValues[4]; this.data.background.g = properValues[5]; this.data.background.b = properValues[6]; this.data.background.a = properValues[7];
    }

    /*
        Parses the <ligths> block.
    */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        if (children.length < 1)
            return "There must be at least one block of <omni> or <spot> lights";

        var nodeNames = [];
        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var elements = [
            "ambientR", "ambientG", "ambientB", "ambientA",
            "diffuseR", "diffuseG", "diffuseB", "diffuseA",
            "specularR", "specularG", "specularB", "specularA"
        ]

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
                    return "Omni light with id not properly defined.";
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
                    return "Spot light with id not properly defined"
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

        var error;
        if ((error = this.validateLightsInfo()) != null)
            return error;

        this.log("Parsed lights");
    }

    /*
       Validates <lights> XML information
   */
    validateLightsInfo() {
        var totalLights = [];

        for (var firstKey in this.data.omniLights) {
            if (this.data.omniLights.hasOwnProperty(firstKey)) {
                totalLights.push(firstKey);

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
                totalLights.push(firstKey);

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

        for (var i = 0; i < totalLights.length; i++) {
            for (var j = 0; j < totalLights.length; j++) {
                if (j != i && totalLights[i] == totalLights[j])
                    return "Two lights are using same ID [" + totalLights[i] + "]"
            }
        }
    }

    /*
        Parses the <textures> block.
    */
    parseTextures(texturesNode) {
        var children = texturesNode.children;

        if (children.length < 1)
            return "There must be at least one block of textures";

        var nodeNames = [];
        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName != "texture") {
                this.onXMLMinorError("<" + children[i].nodeName + "> block on <textures> node was not properly written. Do you mean <texture> ?");
                nodeNames.push("texture");
            }
            else
                nodeNames.push(children[i].nodeName);
        }

        var textures = [];
        for (var i = 0; i < children.length; i++) {
            var texture = [
                this.reader.getString(children[i], "id"),
                this.reader.getString(children[i], "file")
            ];
            textures.push(texture);
        }

        var error;
        if ((error = this.validateTexturesInfo(textures)) != null)
            return error;

        this.log("Parsed textures");
    }

    /*
      Validates <textures> XML information
    */
    validateTexturesInfo(textures) {
        for (var i = 0; i < textures.length; i++) {
            if (textures[i][0] == "" || textures[i][0] == null)
                return "texture block on <textures> is not properly defined."
            else if (textures[i][1] == "" || textures[i][1] == null)
                return "texture block on <textures> with [id = " + textures[i][0] + "] is not properly defined."
        }

        for (var i = 0; i < textures.length; i++) {
            for (var j = 0; j < textures.length; j++) {
                if (i != j && textures[i][0] == textures[j][0])
                    return "There are two textures using the same id [" + textures[i][0] + "]."
            }
        }
    }

    /*
        Parses the <materials> block.
    */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;

        if (children.length < 1)
            return "There must be at least one block of materials";

        var nodeNames = [];
        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName != "material") {
                this.onXMLMinorError("<" + children[i].nodeName + "> block on <materials> node was not properly written. Do you mean <material> ?");
                nodeNames.push("material");
            }
            else
                nodeNames.push(children[i].nodeName);
        }

        var materials = [];
        for (var i = 0; i < children.length; i++) {
            var materialChildren = children[i].children;

            if (materialChildren.length != 4)
                return "material with [id = " + this.reader.getString(children[i], "id") + "] on <materials> have not all needed elements."
            else if (materialChildren[0].nodeName != "emission")
                return "<" + materialChildren[0].nodeName + "> is not a proper element of <materials>."
            else if (materialChildren[1].nodeName != "ambient")
                return "<" + materialChildren[1].nodeName + "> is not a proper element of <materials>."
            else if (materialChildren[2].nodeName != "diffuse")
                return "<" + materialChildren[2].nodeName + "> is not a proper element of <materials>."
            else if (materialChildren[3].nodeName != "specular")
                return "<" + materialChildren[3].nodeName + "> is not a proper element of <materials>."

            var material = [
                this.reader.getString(children[i], "id"),
                this.reader.getFloat(children[i], "shininess"),
            ];

            for (var j = 0; j < materialChildren.length; j++) {
                material.push(this.reader.getFloat(materialChildren[j], "r"));
                material.push(this.reader.getFloat(materialChildren[j], "g"));
                material.push(this.reader.getFloat(materialChildren[j], "b"));
                material.push(this.reader.getFloat(materialChildren[j], "a"));
            }

            materials.push(material);
        }

        var error;
        if ((error = this.validateMaterialsInfo(materials)) != null)
            return error;

        this.log("Parsed materials");
    }

    /*
      Validates <materials> XML information
    */
    validateMaterialsInfo(materials) {
        var materialsDefaultValues = [
            "unknown", 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0
        ];

        for (var i = 0; i < materials.length; i++) {
            for (var j = 0; j < materials[i].length; j++) {

                if (j == 0 && (materials[i][j] == "" || materials[i][j] == null))
                    return "material block on <materials> is not properly defined."
                else if (j != 0 && (materials[i][j] == null || isNaN(materials[i][j]))) {
                    materials[i][j] = materialsDefaultValues[j];
                    this.onXMLMinorError("material with [id = " + materials[i][0] + "] has an invalid value. Default value has been used.");
                }
            }
        }

        for (var i = 0; i < materials.length; i++) {
            for (var j = 0; j < materials.length; j++) {
                if (i != j && materials[i][0] == materials[j][0])
                    return "There are two materials using the same id [" + materials[i][0] + "]."
            }
        }
    }

    /*
        Parses the <transformations> block.
    */
    parseTransformations(transformations) {
        var children = transformations.children;

        if (children.length < 1)
            return "There must be at least one block of transformations";

        var nodeNames = [];
        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName != "transformation") {
                this.onXMLMinorError("<" + children[i].nodeName + "> block on <transformations> node was not properly written. Do you mean <transformation> ?");
                nodeNames.push("transformation");
            }
            else
                nodeNames.push(children[i].nodeName);
        }

        var transformations = [];
        for (var i = 0; i < children.length; i++) {
            var transformation = [
                this.reader.getString(children[i], "id")
            ];

            var transformationChildren = children[i].children;

            if (transformationChildren.length < 1)
                return "Transformation with [id =" + transformation[0] + "] must have at least one transformation."

            for (var j = 0; j < transformationChildren.length; j++) {
                var tmpTransformation = [];

                if (transformationChildren[j].nodeName == "translate" || transformationChildren[j].nodeName == "scale") {
                    tmpTransformation.push(transformationChildren[j].nodeName);
                    tmpTransformation.push(this.reader.getFloat(transformationChildren[j], "x"));
                    tmpTransformation.push(this.reader.getFloat(transformationChildren[j], "y"));
                    tmpTransformation.push(this.reader.getFloat(transformationChildren[j], "z"));
                }
                else if (transformationChildren[j].nodeName == "rotate") {
                    tmpTransformation.push(transformationChildren[j].nodeName);
                    tmpTransformation.push(this.reader.getString(transformationChildren[j], "axis"));
                    tmpTransformation.push(this.reader.getFloat(transformationChildren[j], "angle"));
                }
                else
                    return "Transformation <" + transformationChildren[j].nodeName + "> not valid. Valid transformations <translate>, <rotate>, <scale>."

                transformation.push(tmpTransformation);
            }

            transformations.push(transformation);
        }

        var error;
        if ((error = this.validateTransformationsInfo(transformations)) != null)
            return error;

        this.log("Parsed transformations");
    }

    /*
      Validates <transformations> XML information
    */
    validateTransformationsInfo(transformations) {
        var translateDefaultValues = [0.0, 0.0, 0.0];
        var rotateDefaultValues = ['x', 0.0];
        var scaleDefaultValues = [1.0, 1.0, 1.0];

        for (var i = 0; i < transformations.length; i++) {
            if (transformations[i][0] == null || transformations[i][0] == "")
                return "transformation block on <transformations> is not properly defined."

            for (var j = 1; j < transformations[i].length; j++) {
                for (var k = 1; k < transformations[i][j].length; k++) {
                    if (transformations[i][j][0] == "rotate" && k == 1 && (transformations[i][j][k] == null || transformations[i][j][k] == "")) {
                        transformations[i][j][k] = rotateDefaultValues[k];
                        this.onXMLMinorError("transformation with [id = " + transformations[i][0] + "] has an invalid value on " + transformations[i][j][0] + ". Default value has been used.");
                    }
                    else if ((transformations[i][j][k] == null || isNaN(transformations[i][j][k])) && !(transformations[i][j][0] == "rotate" && k == 1)) {
                        if (transformations[i][j][0] == "translate")
                            transformations[i][j][k] = translateDefaultValues[k];
                        else if (transformations[i][j][0] == "rotate")
                            transformations[i][j][k] = rotateDefaultValues[k];
                        else if (transformations[i][j][0] == "scale")
                            transformations[i][j][k] = scaleDefaultValues[k];

                        this.onXMLMinorError("transformation with [id = " + transformations[i][0] + "] has an invalid value on " + transformations[i][j][0] + ". Default value has been used.");
                    }
                }
            }
        }

        for (var i = 0; i < transformations.length; i++) {
            for (var j = 0; j < transformations.length; j++) {
                if (i != j && transformations[i][0] == transformations[j][0])
                    return "There are two transformations using the same id [" + transformations[i][0] + "]."
            }
        }
    }

    /*
       Parses the <primitives> block.
    */
    parsePrimitives(primitives) {
        var children = primitives.children;

        if (children.length < 1)
            return "There must be at least one block of primitives";

        var nodeNames = [];
        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError("<" + children[i].nodeName + "> block on <primitives> node was not properly written. Do you mean <primitive> ?");
                nodeNames.push("primitive");
            }
            else
                nodeNames.push(children[i].nodeName);
        }

        var primitives = [];

        for (var i = 0; i < children.length; i++) {
            var primitveChildren = children[i].children;

            if (primitveChildren.length != 1)
                return "There must exist only one tag per primitive. Available tags: <rectangle>, <triangle>, <cylinder>, <sphere>, <torus>."

            var primitive = new Object();
            primitive.type = primitveChildren[0].nodeName;
            primitive.id = this.reader.getString(children[i], "id");

            if (primitveChildren[0].nodeName == "rectangle") {
                primitive.x1 = this.reader.getFloat(primitveChildren[0], "x1"); primitive.y1 = this.reader.getFloat(primitveChildren[0], "y1");
                primitive.x2 = this.reader.getFloat(primitveChildren[0], "x2"); primitive.y2 = this.reader.getFloat(primitveChildren[0], "y2");
            }
            else if (primitveChildren[0].nodeName == "triangle") {
                primitive.x1 = this.reader.getFloat(primitveChildren[0], "x1"); primitive.y1 = this.reader.getFloat(primitveChildren[0], "y1"); primitive.z1 = this.reader.getFloat(primitveChildren[0], "z1");
                primitive.x2 = this.reader.getFloat(primitveChildren[0], "x2"); primitive.y2 = this.reader.getFloat(primitveChildren[0], "y2"); primitive.z2 = this.reader.getFloat(primitveChildren[0], "z2");
                primitive.x3 = this.reader.getFloat(primitveChildren[0], "x3"); primitive.y3 = this.reader.getFloat(primitveChildren[0], "y3"); primitive.z3 = this.reader.getFloat(primitveChildren[0], "z3");
            }
            else if (primitveChildren[0].nodeName == "cylinder") {
                primitive.base = this.reader.getFloat(primitveChildren[0], "base"); primitive.top = this.reader.getFloat(primitveChildren[0], "top");
                primitive.slices = this.reader.getInteger(primitveChildren[0], "slices"); primitive.stacks = this.reader.getInteger(primitveChildren[0], "stacks");
            }
            else if (primitveChildren[0].nodeName == "shpere") {
                primitive.radius = this.reader.getFloat(primitveChildren[0], "radius");
                primitive.slices = this.reader.getInteger(primitveChildren[0], "slices"); primitive.stacks = this.reader.getInteger(primitveChildren[0], "stacks");
            }
            else if (primitveChildren[0].nodeName == "torus") {
                primitive.inner = this.reader.getFloat(primitveChildren[0], "inner"); primitive.outer = this.reader.getFloat(primitveChildren[0], "outer");
                primitive.slices = this.reader.getInteger(primitveChildren[0], "slices"); primitive.loops = this.reader.getInteger(primitveChildren[0], "loops");
            }
            else
                return "Primitive <" + primitveChildren[0].nodeName + "> not valid. Valid transformations <rectangle>, <triangle>, <cylinder>, <sphere>, <torus>."

            primitives.push(primitive);
        }

        var error;
        if ((error = this.validatePrimitivesInfo(primitives)) != null)
            return error;

        this.log("Parsed primitives");
    }

    /*
      Validates <primitives> XML information
    */
    validatePrimitivesInfo(primitives) {
        var rectangleDefaultValues = { x1: 1.0, y1: 1.0, x2: 1.0, y2: 1.0 };
        var triangleDefaultValues = {
            x1: 1.0, y1: 1.0, z1: 1.0,
            x2: 1.0, y2: 1.0, z2: 1.0,
            x3: 1.0, y3: 1.0, z3: 1.0
        };
        var cylinderDefaultValues = { base: 1.0, top: 1.0, height: 1.0, slices: 1, stacks: 1 };
        var sphereDefaultValues = { radius: 1.0, slices: 1, stacks: 1 };
        var torusDefaultValues = { inner: 1.0, outer: 1.0, slices: 1, loops: 1 };

        for (var i = 0; i < primitives.length; i++) {
            for (var key in primitives[i]) {
                if (primitives[i].hasOwnProperty(key)) {
                    if (key == "id" && (primitives[i][key] == null || primitives[i][key] == ""))
                        return "primitive block on <primitives> is not properly defined."
                    else if (key != "type" && key != "id" && (primitives[i][key] == null || isNaN(primitives[i][key]))) {
                        if (primitives[i].type == "rectangle")
                            primitives[i][key] == rectangleDefaultValues.key;
                        else if (primitives[i].type == "triangle")
                            primitives[i][key] == triangleDefaultValues.key;
                        else if (primitives[i].type == "cylinder")
                            primitives[i][key] == cylinderDefaultValues.key;
                        else if (primitives[i].type == "sphere")
                            primitives[i][key] == sphereDefaultValues.key;
                        else if (primitives[i].type == "torus")
                            primitives[i][key] == torusDefaultValues.key;

                        this.onXMLMinorError("primitive with [id = " + primitives[i].id + "] has an invalid value on " + key + ". Default value has been used.");
                    }
                }
            }
        }

        for (var i = 0; i < primitives.length; i++) {
            for (var j = 0; j < primitives.length; j++) {
                if (i != j && primitives[i].id == primitives[j].id)
                    return "There are two primitives using the same id [" + primitives[i].id + "]."
            }
        }
    }

    /*
    * Callback to be executed on any read error, showing an error on the console.
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