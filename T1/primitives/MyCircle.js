
class MyCircle extends CGFobject
{
	constructor(scene, base, slices, fS, fT)
	{
		super(scene);

		this.base = base;
		this.slices = slices;

		this.fS = fS; this.fT = fT;

		this.initBuffers();
	};

	initBuffers()
	{
		// DRAW VERTICES, TEXTURE COORDINATES AND NORMALS ------------
		this.vertices = [];
    	this.texCoords = [];
   	 	this.normals = [];

		var angle = 2* Math.PI / this.slices;

		for (var j = 0; j < this.slices; j++) {
			this.vertices.push(Math.cos(angle * j) * this.base, Math.sin(angle * j) * this.base, 0);
			this.texCoords.push((Math.cos(angle * j)+1)/2, (1-(Math.sin(angle * j)+1)/2));
			this.normals.push(0,0,1);
		}

		this.vertices.push(0,0,0);
		this.texCoords.push(0.5,0.5);
		this.normals.push(0,0,1);


		// DRAW INDICES ------------

		this.indices = [];

		for (var i = 0; i < this.slices; i++) {
        	if (i != this.slices-1){
          		this.indices.push(i, i+1, this.slices);
        	}
        	else {
          	this.indices.push(i, 0, this.slices);
       		}
		}

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};

	setScaleFactors(scaleFactors) {
		if(this.scaleFactors == undefined || this.scaleFactors.length == 0)
			return;
		
		var i = 0; 

		while (i < this.texCoords.length) {
			this.textCoords[i++] *= this.fS / scaleFactors[0];
			this.textCoords[i++] *= this.fT / scaleFactors[1];
		}

		this.fS = scaleFactors[0];
		this.fT = scaleFactors[1];
	}
};
