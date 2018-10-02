/**
 * MyTorus
 * @constructor
 */
class MyTorus extends CGFobject
{
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
		// DRAW VERTICES, NORMALS AND TEXTURE COORDINATES ------------
        this.vertices = [];
        this.normals = [];
        this.texCoords = [];
        
        var radius = (this.outer - this.inner) / 2;

        var mainAngle = 2 * Math.PI / this.slices;
        var subAngle = 2 * Math.PI / this.loops;

		for (var i = 0; i < this.slices + 1; i++) {
			for (var j = 0; j < this.loops + 1; j++) {
                var totalR = this.inner + radius + radius * Math.cos(subAngle * j);

                this.vertices.push(totalR * Math.cos(mainAngle * i), totalR* Math.sin(mainAngle * i), radius * Math.sin(subAngle * j));
                this.normals.push(Math.cos(mainAngle * i), Math.sin(mainAngle * i), Math.sin(subAngle * j));
				this.texCoords.push(j / this.loops, i / this.slices);
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
