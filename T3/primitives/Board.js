/**
 * Pente Board Object
 */
class Board extends CGFobject {
    constructor(scene) {
        super(scene);

        this.initComponents();
        this.initMaterials();
    }

    initComponents() {
        this.boardFrame = new Cube(this.scene, 100, 100);
        this.board = new Plane(this.scene, 100, 100);
    }

    initMaterials() {
        this.boardAppearence = new CGFappearence(scene);
        // Apply board material stuff
    }

    display() {
        this.scene.pushMatrix();
            this.scene.pushMatrix();
                this.boardFrame.display();
            this.scene.popMatrix();

            this.scene.pushMatrix();
                this.board.display();
            this.scene.popMatrix();
        this.scene.popMatrix();
    }
}