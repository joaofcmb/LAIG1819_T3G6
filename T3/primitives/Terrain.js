/**
 * Terrain class
 */
class Terrain extends CGFobject {

    /**
     * Terrain constructor.
     * 
     * @param {any} scene 
     * @param {CGFtexture} texture 
     * @param {CGFtexture} heightMap 
     * @param {number} parts 
     * @param {number} heightScale 
     */
    constructor(scene, texture, heightMap, parts, heightScale) {
        super(scene);

        this.texture = texture;
        this.heightMap = heightMap;

        this.plane = new Plane(scene, parts, parts);
        this.terrainShader = new CGFshader(this.scene.gl, "./shaders/Terrain.vert", "./shaders/Terrain.frag");

        this.terrainShader.setUniformsValues({normScale: heightScale, uSamplerHeight: 1});
    };
    
    /**
	 * Terrain display function
	 */
    display() {    
        this.scene.setActiveShader(this.terrainShader);
        this.texture.bind(0);
        this.heightMap.bind(1);
        this.plane.display();
        this.scene.setActiveShader(this.scene.defaultShader);
    }
}