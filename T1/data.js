class Data {
    constructor() {
        // SCENE
        this.root = "";             // TODO - Apply to graph
        this.axisLength = 1;        // TODO - Apply to scene

        // VIEWS - TODO figure out how the cameras are supposed to be added
        this.orthoCams = [];
        this.perspectiveCams = [];

        // TODO - figure out unknown default values
        this.orthoDefault =
        {
            id: "no-def", 
            near: 0.1, far: 100.0,
            
            left: 1.0, right: 1.0, top: 1.0, bottom: 1.0 // 0 fov??? how to scale camera depending on values
        };

        this.perspectiveDefault =
        {
            id: "no-def", 
            near: 0.1, far: 100.0, angle: "?", // default fov is 0.4 (out of 180 degrees ???)
            
            from: {x: 15, y: 15, z: 15},
            to:   {x: 0, y: 0, z: 0}
        };


        // AMBIENT
        this.ambient = {r: 0.0, g: 0.0, b: 0.0, a: 1.0};        // Global Ambient Light
        this.background = {r: 0.0, g: 0.0, b: 0.0, a: 1.0};     // Background color
        

        // LIGHTS - TODO Test the Lights
        this.omniLights = [];
        this.spotLights = [];

        this.omniDefault = 
        {    
            id: "no-def", enabled: "true", 
            location: {x: 0.0, y: 0.0, z: 100.0, w: 1.0}, 

            ambient: {r: 1.0, g: 1.0, b: 1.0, a: 1.0},
            diffuse: {r: 1.0, g: 1.0, b: 1.0, a: 1.0},
            specular: {r: 1.0, g: 1.0, b: 1.0, a: 1.0},
        };
        
        this.spotDefault = 
        {    
            id: "no-def", enabled: "true", angle: 60, exponent: 1.0,
            location: {x: 0.0, y: 0.0, z: 100.0, w: 1.0}, 
            target: {x: 0.0, y: 0.0, z: 0.0, w: 1.0},

            ambient: {r: 1.0, g: 1.0, b: 1.0, a: 1.0},
            diffuse: {r: 1.0, g: 1.0, b: 1.0, a: 1.0},
            specular: {r: 1.0, g: 1.0, b: 1.0, a: 1.0},
        };

        // TEXTURES  - TODO


        // MATERIALS  - TODO


        // TRANSFORMATIONS - TODO


        // COMPONENTS  - TODO


        // PRIMITIVES - TODO
    }
}
