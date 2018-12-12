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

        this.initStack();
    }

    initComponents() {
        this.cube = new Cube(this.scene, 100, 100);
        this.board = new Plane(this.scene, 100, 100);
        this.piece = new MySphere(this.scene, .035, 8, 10);
    }

    initMaterials() {
        this.boardAppearance = new CGFappearance(this.scene);

        this.blackAppearance = new CGFappearance(this.scene);
        this.blackAppearance.setDiffuse(1, 1, 1, 1);

        this.whiteAppearance = new CGFappearance(this.scene);
        this.blackAppearance.setDiffuse(.1, .1, .1, 1);
    }

    initStack() {
        this.stackTranslate = [[-.08, -.08], [-.08, .08], [.08, .08], [.08, -.08], [0, 0]];
        this.whiteStacks = new Array(5).fill(40);
        this.blackStacks = new Array(5).fill(40);

        this.whiteStackDisplay = this.stackDisplay(this.whiteStacks);
        this.blackStackDisplay = this.stackDisplay(this.blackStacks);
    }

    stackDisplay(stack) {
        for (var i = 0; i < 5; i++) {
            this.scene.pushMatrix();
                this.scene.translate(this.stackTranslate[i][0], 0, this.stackTranslate[i][1]);
                for (let j = 0; j < stack[i]; j++) {
                    this.scene.translate(0, .007, 0);
                    this.pieceDisplay();
                }
            this.scene.popMatrix();
        }
    }

    pieceDisplay() {
        this.scene.pushMatrix();
            this.scene.scale(1, .2, 1);
            this.piece.display();
        this.scene.popMatrix();
    }

    display() {
        this.scene.pushMatrix();
            // Bases for the pieces on the side
            this.scene.pushMatrix();
                this.scene.translate(1.5, 0, -.5);
                this.scene.scale(.15, .05, .15);
                this.cube.display();
            this.scene.popMatrix();
            this.scene.pushMatrix();
                this.scene.translate(-1.5, 0, .5);
                this.scene.scale(.15, .05, .15);
                this.cube.display();
            this.scene.popMatrix();

            // Board Frame
            this.scene.pushMatrix();
                this.scene.scale(1, .05, 1);
                this.cube.display();
            this.scene.popMatrix();

            // Actual Board
            this.boardAppearance.apply();
            this.scene.pushMatrix();
                this.scene.translate(0, .051, 0);
                this.scene.scale(.91, 1, .91);
                this.board.display();
            this.scene.popMatrix();

            // White Pieces
            this.whiteAppearance.apply();
            //  - Stack Pieces
            this.scene.pushMatrix();
                this.scene.translate(-1.5, .05, .5);
                this.stackDisplay(this.whiteStacks);
            this.scene.popMatrix();

            // Black Pieces
            this.blackAppearance.apply();
            //  - Stack Pieces
            this.scene.pushMatrix();
                this.scene.translate(1.5, .05, -.5);
                this.stackDisplay(this.blackStacks);
            this.scene.popMatrix();
        this.scene.popMatrix();
    }
}
