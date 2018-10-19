class MyRectangle extends CGFobject
{
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
            this.x1, this.y1, 0,

            this.x2, this.y1, 0,
            this.x2, this.y1, 0,

            this.x2, this.y2, 0,
            this.x2, this.y2, 0,

            this.x1, this.y2, 0,
            this.x1, this.y2, 0,
        ];

        // DRAW NORMALS ------------
   	 	this.normals = [
            0, 0, 1,
            0, 0, -1,

            0, 0, 1,
            0, 0, -1,

            0, 0, 1,
            0, 0, -1,

            0, 0, 1,
            0, 0, -1,
        ];

		// DRAW INDICES ------------
        this.indices = [
            0, 2, 4,
            4, 6, 0,

            5, 3, 1,
            1, 7, 5
        ];

        // DRAW TEXCOORDS ----------
        var dX = Math.abs(this.x2 - this.x1);
        var dY = Math.abs(this.y2 - this.y1);

        this.texCoords = [
            0, dY / this.fT,
            dX / this.fS, dY / this.fT,

            dX / this.fS, dY / this.fT,
            0, dY / this.fT,

            dX / this.fS, 0,
            0, 0,

            0, 0,
            dX / this.fS, 0
        ];
        
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
    };
    
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
