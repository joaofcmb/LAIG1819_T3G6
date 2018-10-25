/**
 * MyRectangle class
 */
class MyRectangle extends CGFobject
{   
    /**
     * MyRectangle constructor
     * @param {any} scene 
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     * @param {number} fS 
     * @param {number} fT 
     */
	constructor(scene, x1, y1, x2, y2, fS, fT)
	{
        super(scene);
        
        this.x1 = x1; this.y1 = y1;
        this.x2 = x2; this.y2 = y2;
        
        this.fS = fS; this.fT = fT;

		this.initBuffers();
	};

    
	initBuffers()
	{
		// DRAW VERTICES ------------
		this.vertices = [
            this.x1, this.y1, 0,
            this.x2, this.y1, 0,
            this.x2, this.y2, 0,
            this.x1, this.y2, 0
        ];

        // DRAW NORMALS ------------
   	 	this.normals = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ];

		// DRAW INDICES ------------
        this.indices = [
            0, 1, 2,
            2, 3, 0
        ];

        // DRAW TEXCOORDS ----------
        var texScaleS = Math.abs(this.x2 - this.x1) / this.fS;
        var texScaleT = Math.abs(this.y2 - this.y1) / this.fT;

        this.texCoords = [
            0,         texScaleT,
            texScaleS, texScaleT,
            texScaleS, 0,
            0,         0
        ];
        
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
    };
    
    /**
     * Change texture coordinates to new scale factors
     * @param {Array} scaleFactors 
     */
    setScaleFactors(scaleFactors) {
        if(this.scaleFactors == undefined || this.scaleFactors.length == 0)
            return;
            
		var i = 0; 
		while (i < this.texCoords.size()) {
			this.textCoords[i++] *= this.fS / scaleFactors[0];
			this.textCoords[i++] *= this.fT / scaleFactors[1];
		}

		this.fS = scaleFactors[0];
		this.fT = scaleFactors[1];
	}
};
