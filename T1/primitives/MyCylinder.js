/**
 * MyCylinder
 * @constructor
 */
class MyCylinder extends CGFobject
{
	constructor(scene, base, top, height, slices, stacks) 
	{
		super(scene);

		this.base = base;
		this.top = top;
		this.height = height
		this.slices = slices;
		this.stacks = stacks;

		this.baseCircle = new MyCircle(scene, base, slices);
		this.topCircle = new MyCircle(scene, top, slices);

		this.initBuffers();
	};

	initBuffers() 
	{	
		// DRAW VERTICES, TEXTURE COORDINATES AND NORMALS------------

		this.vertices = [];
		this.texCoords = [];
		this.normals = [];

		var angle = 2* Math.PI / this.slices;
		var dR = (this.top - this.base) / this.stacks;
		var zN = 1 / (this.base - this.top);

		for (var i = 0; i < this.stacks + 1; i++) {
			for (var j = 0; j < this.slices + 1; j++) {
				this.vertices.push(Math.cos(angle * j) * (this.base + i * dR), Math.sin(angle * j) * (this.base + i * dR), this.height * i/this.stacks);
				this.texCoords.push(1 - j/this.slices, i/this.stacks);
				this.normals.push(Math.cos(angle * j), Math.sin(angle * j), zN);
			}
		}

		// DRAW INDICES ------------

		this.indices = [];
		
		for (var j = 0; j < this.stacks; j++) {
			for (var i = 0; i < this.slices; i++) {
				this.indices.push(i + j * (this.slices + 1), i + 1 + j * (this.slices + 1), i + (j + 1) * (this.slices + 1));
				this.indices.push(i + 1 + j * (this.slices + 1), i + 1 + (j + 1) * (this.slices + 1), i + (j + 1) * (this.slices + 1));
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
			this.baseCircle.display();
		this.scene.popMatrix();		

		this.scene.translate(0, 0, this.height); 
		this.topCircle.display();
	};
};
