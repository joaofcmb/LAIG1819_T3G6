/**
 * Plane class
 */
class Plane extends CGFobject {

    /**
     * Plane constructor.
     * 
     * @param {any} scene 
     * @param {number} npartsU 
     * @param {number} npartsV 
     */
    constructor(scene, npartsU, npartsV) {
        super(scene);

        this.controlvertexes = [
				                [   
                                    [-1.0, 0.0, 1.0, 1],
                                    [-1.0, 0.0, -1.0, 1]
				                ],
                                
                                [  
                                    [1.0, 0.0, 1.0, 1],
                                    [1.0, 0.0, -1.0, 1]
                                ]
        ];

        this.nurbsSurface = new CGFnurbsSurface(1, 1, this.controlvertexes);
        this.nurbsObject = new CGFnurbsObject(this.scene, npartsU, npartsV, this.nurbsSurface);
    };
    
    /**
	 * Plane display function
	 */
    display() {    
		this.nurbsObject.display();
    }
}