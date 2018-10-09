
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
        var v12 = vec3.create();
        v12 = vec3.fromValues(x2 - x1, y2 - y1, z2 - z1);

        var v13 = vec3.create();
        v13 = vec3.fromValues(x3 - x1, y3 - y1, z3 - z1);

        // normal pre-calc
        this.clockwiseNormal = vec3.create();
        this.counterClockNormal = vec3.create();
        vec3.cross(this.clockwiseNormal, v12, v13);
        vec3.cross(this.counterClockNormal, v13, v12);

        // console.log(this.clockwiseNormal);
        // console.log(this.counterClockNormal);

        // texture pre-calc - TODO figure out why vec3.angle isnt identified
        this.uCoord3 = 0.5;
        //this.uCoord3 = vec3.length(v13) * Math.cos(vec3.angle(v12, v13)) / vec3.length(v12);
        
        //console.log(this.uCoord3);

        
		this.initBuffers();
	};

	initBuffers()
	{
		// DRAW VERTICES ------------

		this.vertices = [];
   	 	this.normals = [];

        for (var i = 0; i < this.p.length; i+= 3) {
            this.vertices.push(this.p[i], this.p[i + 1], this.p[i + 2]);
            this.normals.push(this.clockwiseNormal[0], this.clockwiseNormal[1], this.clockwiseNormal[2]);

            this.vertices.push(this.p[i], this.p[i + 1], this.p[i + 2]);
            this.normals.push(this.counterClockNormal[0], this.counterClockNormal[1], this.counterClockNormal[2]);
        }

		// DRAW INDICES ------------

        this.indices = [
            0, 2, 4,
            5, 3, 1
        ];

        // DRAW TEXCOORDS ----------

        this.texCoords = [
            0, 1,
            1, 1,

            1, 1,
            0, 1,

            this.uCoord3, 0,
            1 - this.uCoord3, 0
        ];
        
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};
};
