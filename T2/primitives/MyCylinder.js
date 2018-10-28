/**
 * MyCylinder class
 */
class MyCylinder extends CGFobject
{	
	/**
	 * MyCylinder constructor.
	 * 
	 * @param {any} scene 
	 * @param {number} base 
	 * @param {number} top 
	 * @param {number} height 
	 * @param {number} slices 
	 * @param {number} stacks
	 */
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

		var zN = (this.base - this.top) / this.height;
		var nCoef = 1 / Math.sqrt(1 + zN * zN); // Coeficient to normalize the normal
		zN *= nCoef;

		for (var i = 0; i < this.stacks + 1; i++) {
			for (var j = 0; j < this.slices + 1; j++) {
				this.vertices.push(Math.cos(angle * j) * (this.base + i * dR), Math.sin(angle * j) * (this.base + i * dR), this.height * i/this.stacks);
				this.texCoords.push(1 - j/this.slices, i / this.stacks);
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
		
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};
	
	/**
	 * Cylinder display function
	 */
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
