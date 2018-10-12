/**
* MyInterface class, creating a GUI interface.
*/
class Interface extends CGFinterface {
    constructor() {
        super();

        this.views = [];
        this.Views = 'perspectiveID';
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);

        this.gui = new dat.GUI();

        return true;
    }

    addViewsGroup(data) {
        for (var key in data.perspectiveCams) {
            if (data.perspectiveCams.hasOwnProperty(key)) {
                this.views.push(key);
            }
        }

        for (var key in data.orthoCams) {
            if (data.orthoCams.hasOwnProperty(key)) {
                this.views.push(key);
            }
        }

        this.gui.add(this, 'Views', this.views);
    }

    /**
     * Adds a folder containing the IDs of the lights passed as parameter.
     * @param {array} lights
     */
    addLightsGroup(data) {
        var lights = this.gui.addFolder("Lights");
        lights.open();

        for (var key in data.omniLights) {
            if (data.omniLights.hasOwnProperty(key)) {
                this.scene.lightValues[key] = data.omniLights[key]["enabled"];
                lights.add(this.scene.lightValues, key);
            }
        }

        for (var key in data.spotLights) {
            if (data.spotLights.hasOwnProperty(key)) {
                this.scene.lightValues[key] = data.spotLights[key]["enabled"];
                lights.add(this.scene.lightValues, key);
            }
        }
    }
}