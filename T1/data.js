class Data {
    constructor() {
        // SCENE
        this.root = "";             // TODO - Apply to graph
        this.axisLength = 1;        // TODO - Apply to scene

        // VIEWS - TODO figure out how the cameras are supposed to be added
        this.orthoCams = new Object();
        this.perspectiveCams = new Object();

        // TODO - figure out unknown default values
        this.orthoDefault = {
            near: 0.1, far: 1000.0,
            left: 1.0, right: 1.0, top: 1.0, bottom: 1.0 // 0 fov??? how to scale camera depending on values
        };

        this.perspectiveDefault = {
            near: 0.1, far: 100.0, angle: "?", // default fov is 0.4 (out of 180 degrees ???)
            fromX: 15, fromY: 15, fromZ: 15,
            toX: 0, toY: 0, toZ: 0
        };


        // AMBIENT
        this.ambient = {r: 0.0, g: 0.0, b: 0.0, a: 1.0};        // Global Ambient Light
        this.background = {r: 0.0, g: 0.0, b: 0.0, a: 1.0};     // Background color
        
        
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
        
        this.spotDefault =  {    
            enabled: true, angle: 60, exponent: 1.0,
            locationX: 0.0, locationY: 0.0, locationZ: 0.0, locationW: 0.0, 
            targetX: 0.0, targetY: 0.0, targetZ: 0.0, 
            ambientR: 0.2, ambientG: 0.2, ambientB: 0.2, ambientA: 1.0, 
            diffuseR: 0.5, diffuseG: 0.5, diffuseB: 0.5, diffuseA: 1.0, 
            specularR: 0.3, specularG: 0.3, specularB: 0.3, specularA: 1.0
        };


        // TEXTURES  - TODO


        // MATERIALS  - TODO


        // TRANSFORMATIONS - TODO


        // COMPONENTS  - TODO


        // PRIMITIVES - TODO
    }
}
