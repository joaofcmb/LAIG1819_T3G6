/**
 * MyTorus class
 */
class MyTorus extends CGFobject
{	
	/**
	 * MyTorus constructor.
	 * 
	 * @param {any} scene 
	 * @param {number} inner 
	 * @param {number} outer 
	 * @param {number} slices 
	 * @param {number} loops
	 */
	constructor(scene, inner, outer, slices, loops) 
	{
		super(scene);

		this.inner = inner;
		this.outer = outer;
		this.slices = slices;
        this.loops = loops;

		this.initBuffers();
	};

	initBuffers() 
	{	
		// DRAW VERTICES, TEXTURE COORDINATES AND NORMALS ------------
        this.vertices = [];
		this.texCoords = [];
		this.normals = [];

        var mainAngle = 2 * Math.PI / this.slices;
		var subAngle = 2 * Math.PI / this.loops;

		for (var i = 0; i < this.slices + 1; i++) {
			for (var j = 0; j < this.loops + 1; j++) {
                var totalR = this.outer + this.inner * Math.cos(subAngle * j);

				this.vertices.push(totalR * Math.cos(mainAngle * i), totalR* Math.sin(mainAngle * i), this.inner * Math.sin(subAngle * j));
				this.texCoords.push(i / this.slices, j / this.loops);
                this.normals.push(Math.cos(mainAngle * i) * Math.cos(subAngle * j), Math.sin(mainAngle * i) * Math.cos(subAngle * j), Math.sin(subAngle * j));
			}
        }

		// DRAW INDICES ------------
		this.indices = [];
		
		for (var i = 0; i < this.slices; i++) {
			for (var j = 0; j < this.loops; j++) {
                var p1 = j + i * (this.loops + 1); var p2 = p1 + 1;
                var a1 = p1 + this.loops + 1;      var a2 = a1 + 1;

				this.indices.push(p1, a1, a2);
				this.indices.push(a2, p2, p1);
			}
		}

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};
};
