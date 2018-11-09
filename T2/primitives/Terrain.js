/**
 * Terrain class
 */
class Terrain extends CGFobject {

    /**
     * Terrain constructor.
     *
     */
    constructor(scene, texture, heightMap, parts, heightScale) {
        super(scene);

        this.plane = new Plane(scene, parts, parts);
        this.terrainShader = new CGFshader(this.gl, "./shaders/TerrainVertex.glsl", "./shaders/TerrainFragment.glsl")
    };
    
    /**
	 * Terrain display function
	 */
    display() {    
        this.scene.setActiveShader(this.terrainShader);
        this.plane.display();
        this.scene.setActiveShader(this.default);
    }
}