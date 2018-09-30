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

class Parser {

    constructor(filename) {

        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        //this.scene = scene;
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

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        //this.scene.onGraphLoaded();
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

        // <SCENE>
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order");

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <VIEWS>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse view block
            if ((error = this.parseViews(nodes[index])) != null)
                return error;
        }

        // <AMBIENT>
        if ((index = nodeNames.indexOf("ambient")) == -1)
            return "tag <ambient> missing";
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <ambient> out of order");

            //Parse ambient block
            if ((error = this.parseAmbient(nodes[index])) != null)
                return error;
        }

        // <LIGHTS>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }

    }

    /*
        Parses the <scene> block.
    */
    parseScene(sceneNode) {
        var root = this.reader.getString(sceneNode, "root");
        var axisLength = this.reader.getFloat(sceneNode, "axis_length");

        if (root == null)
            return "root element in <scene> must be defined in order to parse XML file"
        else if (root == "")
            return "root element in <scene> must have a proper name."

        if (axisLength == null || isNaN(axisLength)) {
            axisLength = 0;
            this.onXMLMinorError("axis_length element missing on <scene>; using 0 as default value");
        }

        //this.log(root + " - " + axisLength);
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

        var perspectiveViews = [];
        var orthoViews = [];

        for (var i = 0; i < children.length; i++) {

            if (nodeNames[i] == "perspective") {
                var perspective = [
                    this.reader.getString(children[i], "id"),
                    this.reader.getFloat(children[i], "near"),
                    this.reader.getFloat(children[i], "far"),
                    this.reader.getFloat(children[i], "angle"),
                ];

                var perspectiveChildren = children[i].children;

                if (perspectiveChildren.length != 2)
                    return "Perspective view with [id = " + perspective[0] + "] must have only two children."
                else if (perspectiveChildren[0].nodeName != "from")
                    return "<" + perspectiveChildren[0].nodeName + "> invalid children of perspective view with [id = " + perspective[0] + "]."
                else if (perspectiveChildren[1].nodeName != "to")
                    return "<" + perspectiveChildren[1].nodeName + "> invalid children of perspective view with [id = " + perspective[0] + "]."
                else {
                    perspective.push(this.reader.getString(perspectiveChildren[0], "x"));
                    perspective.push(this.reader.getString(perspectiveChildren[0], "y"));
                    perspective.push(this.reader.getString(perspectiveChildren[0], "z"));
                    perspective.push(this.reader.getString(perspectiveChildren[1], "x"));
                    perspective.push(this.reader.getString(perspectiveChildren[1], "y"));
                    perspective.push(this.reader.getString(perspectiveChildren[1], "z"));
                }
                perspectiveViews.push(perspective);
            }
            else if (nodeNames[i] == "ortho") {

                var ortho = [
                    this.reader.getString(children[i], "id"),
                    this.reader.getFloat(children[i], "near"),
                    this.reader.getFloat(children[i], "far"),
                    this.reader.getFloat(children[i], "left"),
                    this.reader.getFloat(children[i], "right"),
                    this.reader.getFloat(children[i], "top"),
                    this.reader.getFloat(children[i], "bottom"),
                ];
                orthoViews.push(ortho);
            }
            else
                return "<" + nodeNames[i] + "> is not a valid type of view. Valid types: <perspective> or <ortho>."

        }

        var error;
        if ((error = this.validateViewsInfo(perspectiveViews, orthoViews)) != null)
            return error;

        /*
    for (var i = 0; i < perspectiveViews.length; i++) {
        this.log(perspectiveViews[i]);
    }

    for (var i = 0; i < orthoViews.length; i++) {
        this.log(orthoViews[i]);
    }
*/
    }

    /*
        Validates <views> XML information
    */
    validateViewsInfo(perspectiveViews, orthoViews) {
        var perspectiveDefaultValues = [
            "unknown", 0.1, 1000.0, 60.0,
            15.0, 15.0, 15.0,
            0.0, 0.0, 0.0
        ];

        var orthoDefaultValues = [
            "unknown", 0.1, 1000.0, 0.0,
            0.0, 0.0, 0.0
        ];

        for (var i = 0; i < perspectiveViews.length; i++) {
            for (var j = 0; j < perspectiveViews[i].length; j++) {
                if ((j == 0) && ((perspectiveViews[i][j] == "") || perspectiveViews[i][j] == null)) {
                    return "Perspective view with id not properly defined"
                }
                else {
                    if (perspectiveViews[i][j] == null || isNaN(perspectiveViews[i][j]) && j != 0) {
                        perspectiveViews[i][j] = perspectiveDefaultValues[j];
                        this.onXMLMinorError("Perspective view with [id = " + perspectiveViews[i][0] + "] is not properly defined. Default values has been used.");
                    }
                }
            }
        }

        for (var i = 0; i < orthoViews.length; i++) {
            for (var j = 0; j < orthoViews.length; j++) {
                if ((j == 0) && ((orthoViews[i][j] == "") || orthoViews[i][j] == null))
                    return "Ortho view with id not properly defined"
                else {
                    if (orthoViews[i][j] == null || isNaN(orthoViews[i][j]) && j != 0) {
                        orthoViews[i][j] = orthoDefaultValues[j];
                        this.onXMLMinorError("Ortho view with [id = " + orthoViews[i][0] + "] is not properly defined. Default values has been used.");
                    }
                }
            }
        }

        var totalViews = [];

        for (var i = 0; i < perspectiveViews.length; i++) {
            totalViews.push(perspectiveViews[i]);
        }

        for (var i = 0; i < orthoViews.length; i++) {
            totalViews.push(orthoViews[i]);
        }

        for (var i = 0; i < totalViews.length; i++) {
            for (var j = 0; j < totalViews.length; j++) {
                if (j != i && totalViews[i][0] == totalViews[j][0])
                    return "Two views are using same ID [" + totalViews[i][0] + "]"
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

        var ambient = [];
        var background = [];

        this.validateAmbientInfo(children, ambient, background);

        //for (var i = 0; i < ambient.length; i++)
        //this.log(ambient[i] + " - " + background[i]);
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

        ambient.push(properValues[0]); ambient.push(properValues[1]); ambient.push(properValues[2]); ambient.push(properValues[3]);
        background.push(properValues[4]); background.push(properValues[5]); background.push(properValues[6]); background.push(properValues[7]);
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

        var omniLights = [];
        var spotLights = [];

        for (var i = 0; i < children.length; i++) {

            if (nodeNames[i] == "omni") {
                var tmpOmniLights = [];

                tmpOmniLights.push(this.reader.getString(children[i], "id"));
                tmpOmniLights.push(this.reader.getBoolean(children[i], "enabled"));

                var omniChildren = children[i].children;

                if (omniChildren.length != 4)
                    return "Omni light with [id = " + this.reader.getString(children[i], "id") + "] have not all needed elements."

                if (omniChildren[0].nodeName != "location")
                    return "<" + omniChildren[0].nodeName + "> in light with [id = " + this.reader.getString(children[i], "id") + "] is not valid."
                else if (omniChildren[1].nodeName != "ambient")
                    return "<" + omniChildren[1].nodeName + "> in light with [id = " + this.reader.getString(children[i], "id") + "] is not valid."
                else if (omniChildren[2].nodeName != "diffuse")
                    return "<" + omniChildren[2].nodeName + "> in light with [id = " + this.reader.getString(children[i], "id") + "] is not valid."
                else if (omniChildren[3].nodeName != "specular")
                    return "<" + omniChildren[3].nodeName + "> in light with [id = " + this.reader.getString(children[i], "id") + "] is not valid."

                tmpOmniLights.push(this.reader.getFloat(omniChildren[0], "x"));
                tmpOmniLights.push(this.reader.getFloat(omniChildren[0], "y"));
                tmpOmniLights.push(this.reader.getFloat(omniChildren[0], "z"));
                tmpOmniLights.push(this.reader.getFloat(omniChildren[0], "w"));

                for (var j = 1; j < omniChildren.length; j++) {
                    tmpOmniLights.push(this.reader.getFloat(omniChildren[j], "r"));
                    tmpOmniLights.push(this.reader.getFloat(omniChildren[j], "g"));
                    tmpOmniLights.push(this.reader.getFloat(omniChildren[j], "b"));
                    tmpOmniLights.push(this.reader.getFloat(omniChildren[j], "a"));
                }

                omniLights.push(tmpOmniLights);
            }
            else if (nodeNames[i] == "spot") {
                var tmpSpotLights = [];

                tmpSpotLights.push(this.reader.getString(children[i], "id"));
                tmpSpotLights.push(this.reader.getBoolean(children[i], "enabled"));
                tmpSpotLights.push(this.reader.getFloat(children[i], "angle"));
                tmpSpotLights.push(this.reader.getFloat(children[i], "exponent"));

                var spotChildren = children[i].children;

                if (spotChildren.length != 5)
                    return "Spot light with [id = " + this.reader.getString(children[i], "id") + "] have not all needed elements."

                if (spotChildren[0].nodeName != "location")
                    return "<" + spotChildren[0].nodeName + "> in light with [id = " + this.reader.getString(children[i], "id") + "] is not valid."
                else if (spotChildren[1].nodeName != "target")
                    return "<" + omniChildren[1].nodeName + "> in light with [id = " + this.reader.getString(children[i], "id") + "] is not valid."
                else if (spotChildren[2].nodeName != "ambient")
                    return "<" + omniChildren[2].nodeName + "> in light with [id = " + this.reader.getString(children[i], "id") + "] is not valid."
                else if (spotChildren[3].nodeName != "diffuse")
                    return "<" + omniChildren[3].nodeName + "> in light with [id = " + this.reader.getString(children[i], "id") + "] is not valid."
                else if (spotChildren[4].nodeName != "specular")
                    return "<" + omniChildren[4].nodeName + "> in light with [id = " + this.reader.getString(children[i], "id") + "] is not valid."

                for (var j = 0; j < spotChildren.length - 3; j++) {
                    tmpSpotLights.push(this.reader.getFloat(spotChildren[j], "x"));
                    tmpSpotLights.push(this.reader.getFloat(spotChildren[j], "y"));
                    tmpSpotLights.push(this.reader.getFloat(spotChildren[j], "z"));

                    if (j == 0)
                        tmpSpotLights.push(this.reader.getFloat(spotChildren[j], "w"));
                }

                for (var j = 2; j < spotChildren.length; j++) {
                    tmpSpotLights.push(this.reader.getFloat(spotChildren[j], "r"));
                    tmpSpotLights.push(this.reader.getFloat(spotChildren[j], "g"));
                    tmpSpotLights.push(this.reader.getFloat(spotChildren[j], "b"));
                    tmpSpotLights.push(this.reader.getFloat(spotChildren[j], "a"));
                }

                spotLights.push(tmpSpotLights);
            }
            else
                return "<" + nodeNames[i] + "> is not a valid type of light. Valid types: <omni> or <perspective>."
        }

        var error;
        if ((error = this.validateLightsInfo(omniLights, spotLights)) != null)
            return error;

        //for (var i = 0; i < omniLights.length; i++)
        //this.log(omniLights[i]);

        //for (var i = 0; i < spotLights.length; i++)
        //this.log(spotLights[i]);

    }

    /*
       Validates <lights> XML information
   */
    validateLightsInfo(omniLights, spotLights) {

        var omniDefaultValues = [
            "unknown", false,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0
        ];

        var spotDefaultValues = [
            "unknown", false, 60, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0
        ];

        for (var i = 0; i < omniLights.length; i++) {
            for (var j = 0; j < omniLights[i].length; j++) {

                if (j == 0 && (omniLights[i][j] == "" || omniLights[i][j] == null))
                    return "Omni light with id not properly defined"
                else if (j == 1 && (!(omniLights[i][j] == 1 || omniLights[i][j] == 0 || omniLights[i][j] != null))) {
                    omniLights[i][j] = omniDefaultValues[j];
                    this.onXMLMinorError("Omni light with [id = " + omniLights[i][0] + "] has an invalid <enabled> value. Default value has been used.");
                }
                else if (omniLights[i][j] == null || isNaN(omniLights[i][j]) && j != 0 && j != 1) {
                    omniLights[i][j] = omniDefaultValues[j];
                    this.onXMLMinorError("Omni light with [id = " + omniLights[i][0] + i + " - " + j + "] is not properly defined. Default values has been used.");
                }

            }
        }

        for (var i = 0; i < spotLights.length; i++) {
            for (var j = 0; j < spotLights[i].length; j++) {

                if (j == 0 && (spotLights[i][j] == "" || spotLights[i][j] == null))
                    return "Spot light with id not properly defined"
                else if (j == 1 && (!(spotLights[i][j] == 1 || spotLights[i][j] == 0 || spotLights[i][j] != null))) {
                    spotLights[i][j] = spotDefaultValues[j];
                    this.onXMLMinorError("Spot light with [id = " + spotLights[i][0] + "] has an invalid <enabled> value. Default value has been used.");
                }
                else if (spotLights[i][j] == null || isNaN(spotLights[i][j]) && j != 0 && j != 1) {
                    spotLights[i][j] = spotDefaultValues[j];
                    this.onXMLMinorError("Spot light with [id = " + spotLights[i][0] + "] is not properly defined. Default values has been used.");
                }

            }
        }

        var totalLights = [];

        for (var i = 0; i < omniLights.length; i++) {
            totalLights.push(omniLights[i]);
        }

        for (var i = 0; i < spotLights.length; i++) {
            totalLights.push(spotLights[i]);
        }

        for (var i = 0; i < totalLights.length; i++) {
            for (var j = 0; j < totalLights.length; j++) {
                if (j != i && totalLights[i][0] == totalLights[j][0])
                    return "Two lights are using same ID [" + totalLights[i][0] + "]"
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