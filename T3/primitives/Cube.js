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
        this.scene.pushMatrix();
            for (var i = 0; i < 4; i++) {
                this.scene.pushMatrix();
                    this.scene.rotate(i * Math.PI / 2, 1, 0, 0);
                    this.scene.translate(0, 1, 0);
                    this.plane.display();
                this.scene.popMatrix();
            }

            this.scene.pushMatrix();
                this.scene.translate(1, 0, 0);
                this.scene.rotate(-Math.PI / 2, 0, 0, 1);
                this.plane.display();
            this.scene.popMatrix();

            this.scene.pushMatrix();
                this.scene.translate(-1, 0, 0);
                this.scene.rotate(Math.PI / 2, 0, 0, 1);
                this.plane.display();
            this.scene.popMatrix();
        this.scene.popMatrix();
    }
}