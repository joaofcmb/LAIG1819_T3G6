/**
 * Patch class
 */
class Patch extends CGFobject {

    /**
     * Patch constructor.
     * 
     * @param {any} scene 
     * @param {number} degree1
     * @param {number} degree2
     * @param {number} npartsU 
     * @param {number} npartsV 
     */
    constructor(scene, degree1, degree2, npartsU, npartsV, controlvertexes) {
        super(scene);

        this.nurbsSurface = new CGFnurbsSurface(degree1, degree2, controlvertexes);
        this.nurbsObject = new CGFnurbsObject(this.scene, npartsU, npartsV, this.nurbsSurface);
    };
    
    /**
	 * Patch display function
	 */
    display() {    
		this.nurbsObject.display();
    }
}