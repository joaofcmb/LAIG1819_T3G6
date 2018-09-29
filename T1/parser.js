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
var ERROR = -1;
var SUCESS = 0;

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

    }

    /*
        Parses the <scene> block.
    */
    parseScene(sceneNode) {
        var root = this.reader.getString(sceneNode, "root");
        var axisLength = this.reader.getFloat(sceneNode, "axis_length");

        if (root == null)
            return "root element in <scene> must be defined in order to parse XML file";

        if (axisLength == null || isNaN(axisLength)) {
            axisLength = 0;
            this.onXMLMinorError("axis_length element missing on <scene>; using 0 as default value");
        }

        this.log(root + " - " + axisLength);
    }

    /*
        Parses the <views> block.
    */
    parseViews(viewsNode) {
        var viewsDefault = this.reader.getString(viewsNode, "default");
        var children = viewsNode.children;

        if (children.length < 1)
            return "There must be at least one type of view defined";

        var nodeNames = [];
        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var perspectiveViews = [];
        var orthoViews = [];

        //TODO verificar se realmente existem todas as opções escritas no XML

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

        for (var i = 0; i < perspectiveViews.length; i++) {
            this.log(perspectiveViews[i]);
        }

        for (var i = 0; i < orthoViews.length; i++) {
            this.log(orthoViews[i]);
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

        //TODO verificar se realmente existem todas as opções escritas no XML

        var ambient = [
            this.reader.getFloat(children[0], "r"),
            this.reader.getFloat(children[0], "g"),
            this.reader.getFloat(children[0], "b"),
            this.reader.getFloat(children[0], "a"),
        ];

        var background = [
            this.reader.getFloat(children[1], "r"),
            this.reader.getFloat(children[1], "g"),
            this.reader.getFloat(children[1], "b"),
            this.reader.getFloat(children[1], "a"),
        ];

        this.validateAmbientInfo(ambient, background);

        for (var i = 0; i < ambient.length; i++)
            this.log(ambient[i] + " - " + background[i]);
    }

    /*
        Validates views XML information
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
                if ((j == 0) && (perspectiveViews[i][j] == "")) {
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
                if ((j == 0) && (orthoViews[i][j] == ""))
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

    validateAmbientInfo(ambient, background) {
        for (var i = 0; i < ambient.length; i++) {

            if (ambient[i] == null || isNaN(ambient[i])) {
                var value = i == (ambient.length - 1) ? 1 : 0;
                ambient[i] = value;
                this.onXMLMinorError("ambient element missing on <ambient>; using " + value + " as default value");
            }

            if (background[i] == null || isNaN(background[i])) {
                var value = i == (background.length - 1) ? 1 : 0;
                background[i] = value;
                this.onXMLMinorError("background element missing on <ambient>; using " + value + " as default value");
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