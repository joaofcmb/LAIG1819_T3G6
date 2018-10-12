/**
 * MyCylinder
 * @constructor
 */
class MyCylinder extends CGFobject
{
	constructor(scene, base, top, height, slices, stacks, fS, fT) 
	{
		super(scene);

		this.base = base;
		this.top = top;
		this.height = height
		this.slices = slices;
		this.stacks = stacks;

		this.fS = fS; this.fT = fT;

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

		var texScaleS = 2 * Math.PI * this.base / this.fS; // Linear scale using the base perimeter as reference 
		var texScaleT = Math.sqrt(Math.pow(this.base - this.top, 2) + this.height * this.height) / this.fT; 

		var zN = 1 / (this.base - this.top);
		var nCoef = 1 / Math.sqrt(1 + zN * zN); // Coeficient to normalize the normal
		zN *= nCoef;

		for (var i = 0; i < this.stacks + 1; i++) {
			for (var j = 0; j < this.slices + 1; j++) {
				this.vertices.push(Math.cos(angle * j) * (this.base + i * dR), Math.sin(angle * j) * (this.base + i * dR), this.height * i/this.stacks);
				this.texCoords.push(texScaleS * (1 - j/this.slices), texScaleT * i/this.stacks);
				this.normals.push(nCoef * Math.cos(angle * j), nCoef * Math.sin(angle * j), zN);
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
