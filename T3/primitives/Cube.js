/**
 * Cube class
 */
class Cube extends CGFobject {

    /**
     * Cube constructor.
     * 
     * @param {any} scene 
     * @param {number} npartsU 
     * @param {number} npartsV 
     */
    constructor(scene, npartsU, npartsV) {
        super(scene);

        this.plane = new Plane(scene, npartsU, npartsV);
    }

    /**
     * Displays cube
     */
    display() {
        this.plane.display();
    }
}