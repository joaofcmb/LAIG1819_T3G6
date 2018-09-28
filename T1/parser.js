var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 1;
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
       Parses the <ambient> block.
   */
    parseAmbient(ambientNode) {

        var children = ambientNode.children;

        var nodeNames = [];
        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

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

        for(var i = 0; i < ambient.length; i++) {

            if (ambient[i] == null || isNaN(ambient[i])) {
                ambient[i] = i == (ambient.length - 1) ? 1 : 0;
                this.onXMLMinorError("axis_length element missing on <scene>; using 0 as default value");
            }

            if (background[i] == null || isNaN(background[i])) {
                background[i] = i == (background.length - 1) ? 1 : 0;
                this.onXMLMinorError("axis_length element missing on <scene>; using 0 as default value");
            }

        }

        for(var i = 0; i < ambient.length; i++) 
            this.log(ambient[i] + " - " + background[i]);

        
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