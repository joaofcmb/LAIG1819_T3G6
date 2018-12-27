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
        this.picking = true;

        this.initComponents();
        this.initBoard();
        this.initMaterials();
        this.initStack();
        this.initAnimations();

        this.ghostShader = new CGFshader(this.scene.gl, "./shaders/Ghost.vert", "./shaders/Ghost.frag");
    }

    initComponents() {        
        this.cube = new Cube(this.scene, 30, 30);
        this.board = new Plane(this.scene, 100, 100);
        this.piece = new MySphere(this.scene, .035, 8, 10);
    }

    initBoard() {
        this.model = {'none': 0, 'white': 1, 'black': 2};

        this.boardCells = new Array(13).fill(0).map(() => new Array(13).fill(0));
        this.ghostPick = new Array(13*13).fill(new Plane(this.scene, 1, 1));
    }

    initMaterials() {
        this.boardAppearance = new CGFappearance(this.scene);
        this.boardAppearance.loadTexture('scenes/images/pente.png');

        this.whiteAppearance = new CGFappearance(this.scene);
        this.whiteAppearance.setDiffuse(.8, .8, .8, 1);

        this.blackAppearance = new CGFappearance(this.scene);
        this.blackAppearance.setDiffuse(.1, .1, .1, 1);
    }

    initStack() {
        this.stackTranslate = [[-.08, -.08], [-.08, .08], [.08, .08], [.08, -.08], [0, 0]];
        this.whiteStacks = new Array(5).fill(40);
        this.blackStacks = new Array(5).fill(40);
    }

    initAnimations() {
        this.currAnimations = [];
    }
    
    addPiece(cellLine, cellColumn) {
        var stackI = this.whiteStacks.reduce((acc, val, i, stacks) => val > stacks[acc] ? i : acc, 0);

        var sourcePos = vec3.fromValues(-1.5 + this.stackTranslate[stackI][0], (--this.whiteStacks[stackI] * .007), .5 + this.stackTranslate[stackI][1]);
        var destPos = vec3.fromValues(-.84 + .14 * cellLine, .052, -.84 + .14 * cellColumn);

        this.currAnimations.push({
            animation: new PieceAnimation(this.scene, sourcePos, destPos, 'add'), 
            line: cellLine, 
            column: cellColumn
        });        
    }

    stackDisplay(stack) {
        for (var i = 0; i < 5; i++) {
            this.scene.pushMatrix();
                this.scene.translate(this.stackTranslate[i][0], .0035, this.stackTranslate[i][1]);
                for (var j = 0; j < stack[i]; j++) {
                    this.pieceDisplay();
                    this.scene.translate(0, .007, 0);
                }
            this.scene.popMatrix();
        }
    }

    cellsDisplay(modelID) {
        for (var i = 0; i < 13; i++) {
            for (var j = 0; j < 13; j++) {
                if (this.boardCells[i][j] == this.model[modelID]) {
                    this.scene.pushMatrix();
                        this.scene.translate(-.84 + .14 * i, .052, -.84 + .14 * j);
                        this.pieceDisplay();
                    this.scene.popMatrix();
                }
            }
        }
    }

    pieceDisplay() {
        this.scene.pushMatrix();
            this.scene.scale(1, .2, 1);
            this.piece.display();
        this.scene.popMatrix();
    }

    update(deltaTime) {
        for (var i = 0; i < this.currAnimations.length; i++) {
            // Animation finished, since all animations have the same span it is safe to remove from back
            if (this.currAnimations[i].animation.update(deltaTime) == deltaTime) {
                this.boardCells[this.currAnimations[0].line][this.currAnimations[0].column] = 1;
                this.currAnimations.shift();
            }
        }
    }

    display() {
        // Static Objects
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
            // - Board Pieces
            this.cellsDisplay('white');

            // Black Pieces
            this.blackAppearance.apply();
            //  - Stack Pieces
            this.scene.pushMatrix();
                this.scene.translate(1.5, .05, -.5);
                this.stackDisplay(this.blackStacks);
            this.scene.popMatrix();
            // - Board Pieces
            this.cellsDisplay('black');
        this.scene.popMatrix();

        // Animations
        this.whiteAppearance.apply();
        for (var i in this.currAnimations) {
            this.scene.pushMatrix();
                this.currAnimations[i].animation.apply();
                this.pieceDisplay();
            this.scene.popMatrix();
        }

        // Ghost objects for selecting board intersections
        if (this.picking) {
            this.scene.setActiveShader(this.ghostShader);
            for (var i = 0; i < 13; i++) {
                for (var j = 0; j < 13; j++) {
                    this.scene.pushMatrix();
                        this.scene.translate(-.84 + .14 * j, .052, -.84 + .14 * i);
                        this.scene.scale(.07, 1, .07);

                        var id = j * 13 + i;
                        this.scene.registerForPick(id + 1, this.ghostPick[id]);
                        this.ghostPick[id].display();
                    this.scene.popMatrix();
                }
            }
            this.scene.clearPickRegistration();
            this.scene.setActiveShader(this.scene.defaultShader);
        }
    }
}
