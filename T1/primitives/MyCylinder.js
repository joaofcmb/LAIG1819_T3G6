/**
 * MyQuad
 * @constructor
 */
class MyCylinder extends CGFobject
{
	constructor(scene, slices, stacks) 
	{
		super(scene);

		this.slices = slices;
		this.stacks = stacks;

		this.base = new MyCircle(scene, slices);

		this.initBuffers();
	};

	initBuffers() 
	{	
		// DRAW VERTICES AND TEXTURE COORDINATES ------------

		this.vertices = [];
		this.texCoords = [];

		var angle = 2* Math.PI / this.slices;

		for (var i = 0; i < this.stacks + 1; i++) {
			for (var j = 0; j < this.slices; j++) {
				this.vertices.push(Math.cos(angle * j), Math.sin(angle * j), 0 + i/this.stacks);
				this.texCoords.push(j/this.slices, i/this.stacks);
			}
		}

		// DRAW INDICES ------------

		this.indices = [];
		
		for (var j = 0; j < this.stacks; j++) {
			for (var i = 0; i < this.slices - 1; i++) {
				this.indices.push(i + j * this.slices, i + 1 + j * this.slices, i + (j + 1) * this.slices);
				this.indices.push(i + 1 + j * this.slices, i + 1 + (j + 1) * this.slices, i + (j + 1) * this.slices);
			}
			this.indices.push(this.slices - 1 + j * this.slices, j * this.slices, (2 + j) * this.slices - 1);
			this.indices.push(j * this.slices, (j + 1) * this.slices, (2 + j) * this.slices - 1);
		}


		// DRAW NORMALS ------------

		this.normals = [];
		var angle = 2*Math.PI / this.slices; // alpha / 2

		for (var i = 0; i < this.stacks + 1; i++) {
			for (var j = 0; j < this.slices; j++) {
				this.normals.push(Math.cos(angle * j), Math.sin(angle * j), 0);
			}
		}
        /*
		for (var i = 0; i < this.vertices.length; i++) {
			console.log(this.vertices[i]);
			console.log("--");
		}
		
		console.log("INDICES");
		for (var i = 0; i < this.indices.length; i++) {
			console.log(this.indices[i]);
			console.log("--");
		}

		console.log("NORMALS");
		for (var i = 0; i < this.normals.length; i++) {
			console.log(this.normals[i]);
			console.log("--");
		}

		

		console.log(this.vertices.length);
		console.log(this.indices.length);
		console.log(this.normals.length);
        */
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};

	display()
	{
		super.display();
		this.scene.pushMatrix();
			this.scene.rotate(Math.PI, 1, 0, 0);
			this.base.display();
		this.scene.popMatrix();		

		this.scene.translate(0, 0, 1); 
		this.base.display();
	};
};
