/**
* MyInterface class, creating a GUI interface.
*/
class Interface extends CGFinterface {
    constructor() {
        super();

        this.views = [];
        this.Views;
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);

        this.gui = new dat.GUI();

        this.initKeys();

        return true;
    }
    
    initKeys()
	{
		this.scene.gui = this;
		this.processKeyboard = function(){};
		this.activeKeys = {};
	};

	processKeyDown(event) {
		this.activeKeys[event.code] = true;
        if(event.code == "KeyM") 
            this.scene.updateMaterials();
    };
    
    processKeyUp(event) {
		this.activeKeys[event.code] = false;

    };
    
    isKeyPressed(keyCode) {
		return this.activeKeys[keyCode] || false;
	};

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
        
        this.scene.lock["Lock Views"] = true;
        this.gui.add(this.scene.lock, 'Lock Views');
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