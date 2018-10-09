/**
 * MyQuad
 * @constructor
 */
class MySphere extends CGFobject
{
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
		var vAngle = Math.PI / (2* this.stacks);

		for (var i = 0; i < this.stacks * 2 + 2; i++) {
			for (var j = 0; j < this.slices * 2; j++) {
				this.vertices.push(	Math.cos(hAngle * j) * Math.cos(vAngle * i) * this.radius,
									Math.sin(hAngle * j) * Math.cos(vAngle * i) * this.radius,
									Math.sin(vAngle * i) * this.radius);
				this.texCoords.push((Math.cos(hAngle * j) * Math.cos(vAngle * i)+1) / 2, (1-(Math.sin(hAngle * j) * Math.cos(vAngle * i)+1) / 2));
				this.normals.push(Math.cos(hAngle * j), Math.sin(hAngle * j), Math.sin(vAngle * i));
			}
		}

		// DRAW INDICES ------------

		this.indices = [];

		for (var j = 0; j < this.stacks * 2; j++) {
			for (var i = 0; i < this.slices * 2 - 2; i++) {
				this.indices.push(i + j * this.slices, i + 1 + j * this.slices, i + (j + 1) * this.slices);
				this.indices.push(i + 1 + j * this.slices, i + 1 + (j + 1) * this.slices, i + (j + 1) * this.slices);
			}
			this.indices.push(this.slices - 1 + j * this.slices, j * this.slices, (2 + j) * this.slices - 1);
			this.indices.push(j * this.slices, (j + 1) * this.slices, (2 + j) * this.slices - 1);
		}

		// Logs
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
		this.scene.rotate(Math.PI, 0, 1, 0);
		super.display();
	};
};
