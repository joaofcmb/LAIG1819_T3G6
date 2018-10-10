
class MyTriangle extends CGFobject
{
	constructor(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3)
	{
        /*
                        TEXTURE RENDERIZATION

                                 X3
                                 .  (u= d13*cos(ang)/d12, v=0)
                                / \
                           d13 /   \
                              /     \
                             /ang    \
                (u=0, v=1)  *---------* (u=1, v=1)
                           X1   d12   X2
        */

		super(scene);

        this.p = [
            x1, y1, z1,
            x2, y2, z2,
            x3, y3, z3,
        ];

        // Geometric pre-calculations
        this.v12 = vec3.create();
        this.v12 = vec3.fromValues(x2 - x1, y2 - y1, z2 - z1);

        this.v13 = vec3.create();
        this.v13 = vec3.fromValues(x3 - x1, y3 - y1, z3 - z1);

		this.initBuffers();
	};

	initBuffers()
	{
		// DRAW VERTICES AND NORMALS------------

        // normal pre-calc
        var clockwiseNormal = vec3.create();
        var counterClockNormal = vec3.create();
        vec3.cross(clockwiseNormal, this.v12, this.v13);
        vec3.cross(counterClockNormal, this.v13, this.v12);

        // console.log(this.clockwiseNormal);
        // console.log(this.counterClockNormal);

		this.vertices = [];
   	 	this.normals = [];

        for (var i = 0; i < this.p.length; i+= 3) {
            this.vertices.push(this.p[i], this.p[i + 1], this.p[i + 2]);
            this.normals.push(clockwiseNormal[0], clockwiseNormal[1], clockwiseNormal[2]);

            this.vertices.push(this.p[i], this.p[i + 1], this.p[i + 2]);
            this.normals.push(counterClockNormal[0], counterClockNormal[1], counterClockNormal[2]);
        }

		// DRAW INDICES ------------

        this.indices = [
            0, 2, 4,
            5, 3, 1
        ];

        // DRAW TEXCOORDS ----------
        var dist12 = vec3.length(this.v12);
        var dist13 = vec3.length(this.v13);
        var dist23 = Math.sqrt(Math.pow(this.p[0] - this.p[6], 2) + Math.pow(this.p[1] - this.p[7], 2) + Math.pow(this.p[2] - this.p[8], 2));
        
        var angle = Math.acos(-dist23 * dist23 + dist13 * dist13 + dist12 * dist12 / (2 * dist13 * dist12));

        this.texCoords = [
            0, 1,
            dist12, 1,

            dist12, 1,
            0, 1,

            dist13 * Math.cos(angle), 1 - dist13 * Math.sin(angle),
            dist12 - dist13 * Math.cos(angle), 1 - dist13 * Math.sin(angle)
        ];
        
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};
};
