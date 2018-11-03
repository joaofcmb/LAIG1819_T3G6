/**
 * Cylinder2 class
 */
class Cylinder2 extends CGFobject {

    /**
	 * Cylinder2 constructor.
	 * 
	 * @param {any} scene 
	 * @param {number} base 
	 * @param {number} top 
	 * @param {number} height 
	 * @param {number} slices 
	 * @param {number} stacks
	 */
	constructor(scene, base, top, height, slices, stacks)  {
        super(scene);

        this.controlvertexes = [
                                [   
                                    [-base, 0.0, 0.0, 1],
                                    [-base, base*4.0/3.0, 0.0, 1],
                                    [base, base*4.0/3.0, 0.0, 1],
                                    [base, 0.0, 0.0, 1]
                                ],
                                
                                [   
                                    [-top, 0.0, height, 1],
                                    [-top, top*4/3, height, 1],
                                    [top, top*4/3, height, 1],
                                    [top, 0.0, height, 1]
                                ]
        ];  

        this.nurbsSurface = new CGFnurbsSurface(1, 3, this.controlvertexes);
        this.nurbsObject = new CGFnurbsObject(this.scene, stacks, slices, this.nurbsSurface);
    };
    
    /**
	 * Cylinder2 display function
	 */
    display() {   
        this.nurbsObject.display();

		this.scene.pushMatrix();
            this.scene.rotate(Math.PI, 0, 0, 1); 
            this.nurbsObject.display();
		this.scene.popMatrix();
    }
}