/**
 * MySphere class
 */
class MySphere extends CGFobject
{	
	/**
	 * MySphere constructor.
	 * 
	 * @param {any} scene 
	 * @param {number} radius 
	 * @param {number} slices 
	 * @param {number} stacks
	 */
	constructor(scene, radius, slices, stacks)
	{
		super(scene);

		this.radius = radius;
		this.slices = slices;
		this.stacks = stacks;

		this.initBuffers();
	};

	initBuffers()
	{
		// DRAW VERTICES, TEXTURE COORDINATES AND NORMALS ------------
		this.vertices = [];
		this.texCoords = [];
		this.normals = [];

		var hAngle = 2* Math.PI / this.slices;
		var vAngle = Math.PI / this.stacks;

		var halfStacks = this.stacks / 2;

		for (var i = - halfStacks; i < halfStacks + 1; i++) {
			for (var j = 0; j < this.slices + 1; j++) {
				this.vertices.push(	Math.cos(hAngle * j) * Math.cos(vAngle * i) * this.radius,
									Math.sin(hAngle * j) * Math.cos(vAngle * i) * this.radius,
									Math.sin(vAngle * i) * this.radius);
				this.texCoords.push(1 - j / this.slices, (i + halfStacks) / this.stacks);
				this.normals.push(Math.cos(hAngle * j) * Math.cos(vAngle * i), Math.sin(hAngle * j) * Math.cos(vAngle * i), Math.sin(vAngle * i));
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
};
