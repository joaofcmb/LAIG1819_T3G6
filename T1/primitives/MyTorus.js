/**
 * MyTorus
 * @constructor
 */
class MyTorus extends CGFobject
{
	constructor(scene, inner, outer, slices, loops, fS, fT) 
	{
		super(scene);

		this.inner = inner;
		this.outer = outer;
		this.slices = slices;
        this.loops = loops;
		
		this.fS = fS; this.fT = fT;

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
		
		var texScaleS = 2 * Math.PI * this.inner / this.fS;
		var texScaleT = 2 * Math.PI * this.outer / this.fT; // Linear scale using the outer (middle circle) perimeter as reference

		for (var i = 0; i < this.slices + 1; i++) {
			for (var j = 0; j < this.loops + 1; j++) {
                var totalR = this.outer + this.inner * Math.cos(subAngle * j);

				this.vertices.push(totalR * Math.cos(mainAngle * i), totalR* Math.sin(mainAngle * i), this.inner * Math.sin(subAngle * j));
				this.texCoords.push(texScaleS * j / this.loops, texScaleT * i / this.slices);
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

	setScaleFactors(scaleFactors) {
		var i = 0; 
		while (i < this.texCoords.size()) {
			this.textCoords[i++] *= this.fS / scaleFactors[0];
			this.textCoords[i++] *= this.fT / scaleFactors[1];
		}

		this.fS = scaleFactors[0];
		this.fT = scaleFactors[1];
	}
};
