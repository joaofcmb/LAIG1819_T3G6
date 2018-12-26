/**
* Interface class, creating a GUI interface.
*/
class Interface extends CGFinterface {
    /**
     * Interface default constructor.
     */
    constructor() {
        super();

        this.difficulty = ['Easy', 'Medium', 'Hard'];
        this.modes = ['Player vs Player', 'Player vs AI', 'AI vs AI'];
        
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
    
    /**
     * Initializes interface needed elements.
     */
    initKeys()
	{
		this.scene.gui = this;
		this.processKeyboard = function(){};
		this.activeKeys = {};
	};

    /**
     * Activates key event after being pressed.
     * @param {any} event 
     */
	processKeyDown(event) {
		this.activeKeys[event.code] = true;
        if(event.code == "KeyM") 
            this.scene.updateMaterials();
    };
    
    /**
     * Deactivates key event after its release is detected.
     * @param {any} event 
     */
    processKeyUp(event) {
		this.activeKeys[event.code] = false;
    };
    
    /**
     * Verifies if key with keycode passed as parameter is being pressed.
     * @param {any} keyCode 
     */
    isKeyPressed(keyCode) {
		return this.activeKeys[keyCode] || false;
	};

    /**
     * Add combo-box to allow user to change between the available views passed in data parameter.
     * @param {array} data 
     */
    addViewsGroup(data) {
        var views = this.gui.addFolder("Views");
        //views.open();

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

        views.add(this, 'Views', this.views);
    }

    /**
     * Adds a folder containing the IDs of the lights passed in data parameter.
     * @param {array} data
     */
    addLightsGroup(data) {
        var lights = this.gui.addFolder("Lights");
        //lights.open();

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

    addGameSettings() {
        var settings = this.gui.addFolder('Game Settings');
        //settings.open();

        settings.add(this.scene, 'Difficulty', this.difficulty);
        settings.add(this.scene, 'Mode', this.modes);
        
        this.scene.cameraRotation["Camera Rotation"] = false;
        settings.add(this.scene.cameraRotation, 'Camera Rotation');

    }

    addOptions() {
        var options = this.gui.addFolder('Main Menu');
        //options.open();

        options.add(this.scene, 'playGame').name('Play Game');
        options.add(this.scene, 'undo').name('Undo');
        options.add(this.scene, 'exitGame').name('Exit Game');
        options.add(this.scene, 'replay').name('Replay');
    }
}