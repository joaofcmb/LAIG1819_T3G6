class Data {
    constructor() {
        // SCENE
        this.root = "";             // TODO - Apply to graph
        this.axisLength = 1;        // TODO - Apply to scene

        // VIEWS - TODO


        // AMBIENT
        this.ambient = {r: 0.0, g: 0.0, b: 0.0, a: 1.0};        // Global Ambient Light
        this.background = {r: 0.0, g: 0.0, b: 0.0, a: 1.0};     // Background color
        

        // LIGHTS - TODO Test the Lights
        this.omniLights = [];
        this.spotLights = [];

        this.omniDefault = 
        {    
            id: "no-def", enabled: "true", 
            location: {x: 0, y: 0, z: 100, w: 1}, 

            ambient: {r: 1.0, g: 1.0, b: 1.0, a: 1.0},
            diffuse: {r: 1.0, g: 1.0, b: 1.0, a: 1.0},
            specular: {r: 1.0, g: 1.0, b: 1.0, a: 1.0},
        };
        
        this.spotDefault = 
        {    
            id: "no-def", enabled: "true", angle: 60, exponent: 1.0,
            location: {x: 0, y: 0, z: 100, w: 1}, 
            target: {x: 0, y: 0, z: 0, w: 1},

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
