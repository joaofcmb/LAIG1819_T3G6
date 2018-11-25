/**
 * Water class
 */
class Water extends CGFobject {

    /**
     * Water constructor.
     * 
     * @param {any} scene 
     * @param {CGFtexture} texture 
     * @param {CGFtexture} waveMap 
     * @param {number} parts 
     * @param {number} heightScale 
     * @param {number} texScale 
     */
    constructor(scene, texture, waveMap, parts, heightScale, texScale) {
        super(scene);

        this.texture = texture;
        this.waveMap = waveMap;

        this.plane = new Plane(scene, parts, parts);
        this.waterShader = new CGFshader(this.scene.gl, "./shaders/Water.vert", "./shaders/Water.frag");

        this.waterShader.setUniformsValues({normScale: heightScale, uSamplerHeight: 1, texScale: texScale});
    };  

    /**
     * Updates the time factor and texture increment used by the shaders to animate the water.
     * 
     * @param {number} timeFactor
     */
    setTimeFactor(timeFactor) {
        var texIncrement = this.waterShader.getUniformValue("texIncrement") + 0.01;
        this.waterShader.setUniformsValues({timeFactor: timeFactor, texIncrement: texIncrement});
    }
    
    /**
	 * Displays the water on the scene.
	 */
    display() {    
        this.scene.setActiveShader(this.waterShader);
        this.texture.bind(0);
        this.waveMap.bind(1);
        this.plane.display();
        this.scene.setActiveShader(this.scene.defaultShader);
    }
}