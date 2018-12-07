/**
 * Pente Board Object
 */
class Board extends CGFobject {
    constructor(scene) {
        super(scene);

        this.initComponents();
    }

    initComponents() {
        this.boardFrame = new Cube(this.scene, 100, 100);
        this.board = new Plane(this.scene, 100, 100);
    }

    display() {

    }
}