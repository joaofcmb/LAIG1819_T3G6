/**
 * Water class
 */
class Terrain extends CGFobject {

    /**
     * Water constructor.
     *
     */
    constructor(scene, texture, waveMap, parts, heightScale, texScale) {
        super(scene);

        this.texture = texture;
        this.waveMap = waveMap;

        this.plane = new Plane(scene, parts, parts);
        this.waterShader = new CGFshader(this.scene.gl, "./shaders/Water.vert", "./shaders/Water.frag");

        this.waterShader.setUniformsValues({normScale: heightScale, uSamplerHeight: 1});
    };
    
    /**
	 * Water display function
	 */
    display() {    
        this.scene.setActiveShader(this.terrainShader);
        this.texture.bind(0);
        this.heightMap.bind(1);
        this.plane.display();
        this.scene.setActiveShader(this.scene.defaultShader);
    }
}