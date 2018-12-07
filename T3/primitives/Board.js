/**
 * Pente Board Object (13x13)
 * 
 * Board length -> 1 unit
 * Board without frame -> .91 units
 * Cell unit -> .91 / 13 = .07 units
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
        this.piece = new MySphere(this.scene, .05, 10, 5);
    }

    initMaterials() {
        this.boardAppearance = new CGFappearance(this.scene);
    }

    display() {
        this.piece.display();

        this.scene.pushMatrix();
            this.scene.pushMatrix();
                this.scene.scale(1, .05, 1);
                this.boardFrame.display();
            this.scene.popMatrix();

            this.boardAppearance.apply();

            this.scene.pushMatrix();
                this.scene.translate(0, .051, 0);
                this.scene.scale(.91, 1, .91);
                this.board.display();
            this.scene.popMatrix();
        this.scene.popMatrix();
    }
}