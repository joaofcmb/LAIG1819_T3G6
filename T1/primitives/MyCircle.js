
class MyCircle extends CGFobject
{
	constructor(scene, slices)
	{
		super(scene);

		this.slices = slices;
		this.initBuffers();
	};

	initBuffers()
	{
		// DRAW VERTICES ------------

		this.vertices = [];
    	this.texCoords = [];
   	 	this.normals = [];

		var angle = 2* Math.PI / this.slices;

		for (var j = 0; j < this.slices; j++) {
			this.vertices.push(Math.cos(angle * j), Math.sin(angle * j), 0);
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
};
