/**
 * MyTriangle class
 */
class MyTriangle extends CGFobject
{   
    /**
     * MyTriangle constructor.
     * 
     * @param {any} scene 
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} z1 
     * @param {number} x2 
     * @param {number} y2 
     * @param {number} z2 
     * @param {number} x3 
     * @param {number} y3 
     * @param {number} z3 
     * @param {number} lS 
     * @param {number} lT 
     */
	constructor(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3, fS, fT)
	{
		super(scene);

        this.p = [
            x1, y1, z1,
            x2, y2, z2,
            x3, y3, z3,
        ];

        // Geometric pre-calculations
        this.v12 = vec3.fromValues(x2 - x1, y2 - y1, z2 - z1);
        this.v13 = vec3.fromValues(x3 - x1, y3 - y1, z3 - z1);

        this.fS = fS; this.fT = fT;

		this.initBuffers();
	};

	initBuffers()
	{
		// DRAW VERTICES, INDICES AND NORMALS------------

        // Normal pre-calc
        var clockwiseNormal = vec3.create();
        vec3.cross(clockwiseNormal, this.v12, this.v13);
        vec3.normalize(clockwiseNormal, clockwiseNormal);

		this.vertices = [];
   	 	this.normals = [];

        for (var i = 0; i < this.p.length; i+= 3) {
            this.vertices.push(this.p[i], this.p[i + 1], this.p[i + 2]);
            this.normals.push(clockwiseNormal[0], clockwiseNormal[1], clockwiseNormal[2]);
        }

        this.indices = [0, 1, 2];

        // DRAW TEXCOORDS ----------
        var dist12 = vec3.length(this.v12);
        var dist13 = vec3.length(this.v13);
        var dist23 = Math.sqrt(Math.pow(this.p[0] - this.p[6], 2) + Math.pow(this.p[1] - this.p[7], 2) + Math.pow(this.p[2] - this.p[8], 2)); 
        var angle = Math.acos(-dist23 * dist23 + dist13 * dist13 + dist12 * dist12 / (2 * dist13 * dist12));

        this.texCoords = [
            dist13 * Math.cos(angle) / this.fS, (1 - dist13 * Math.sin(angle)) / this.fT,
            0, 1 / this.fT,
            dist12 / this.fS, 1 / this.fT
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
