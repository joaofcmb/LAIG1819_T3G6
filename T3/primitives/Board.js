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
        this.picking = false;

        this.initComponents();
        this.initBoard();
        this.initMaterials();
        this.initStack();
        this.initShaders();

        this.currAnimations = [];
    }

    initComponents() {        
        this.cube = new Cube(this.scene, 30, 30);
        this.board = new Plane(this.scene, 60, 60);
        this.piece = new MySphere(this.scene, .035, 8, 10);
    }

    initBoard() {
        this.model = {'none': 0, 'white': 1, 'black': 2};

        this.boardCells = new Array(13).fill(0).map(() => new Array(13).fill(this.model['none']));
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
        this.viewStacks = {
            'white': new Array(5).fill(40),
            'black': new Array(5).fill(40)
        }
        this.modelStacks = {
            'white': new Array(5).fill(40),
            'black': new Array(5).fill(40)
        }

        this.stackTypeTranslate = {
            'white': [-1.5, .5],
            'black': [1.5, -.5]
        }

        this.stackTranslate = [[-.08, -.08], [-.08, .08], [.08, .08], [.08, -.08], [0, 0]];
    }

    initShaders() {
        this.ghostShader = new CGFshader(this.scene.gl, './shaders/Ghost.vert', './shaders/Ghost.frag');
    }
    
    addPiece(cellLine, cellColumn, element) {
        var stackType = Object.keys(this.model).find(key => this.model[key] == element);
        var stackI = this.modelStacks[stackType].reduce((acc, val, i, stacks) => val > stacks[acc] ? i : acc, 0);

        var stackPos = vec3.fromValues(
            this.stackTypeTranslate[stackType][0] + this.stackTranslate[stackI][0],
            .0535 + (--this.modelStacks[stackType][stackI] * .007),
            this.stackTypeTranslate[stackType][1] + this.stackTranslate[stackI][1]
        );
        var cellPos = vec3.fromValues(-.84 + .14 * cellColumn, .0545, .84 - .14 * cellLine);

        this.currAnimations.push({
            animation: new PieceAnimation(this.scene, stackPos, cellPos, 'add'), 
            stackType: stackType,
            line: cellLine,
            column: cellColumn
        });

        --this.viewStacks[stackType][stackI];
    }

    removePiece(cellLine, cellColumn, type = 'remove') {
        var stackType = Object.keys(this.model).find(key => this.model[key] == this.boardCells[cellLine][cellColumn]);
        var stackI = this.modelStacks[stackType].reduce((acc, val, i, stacks) => val < stacks[acc] ? i : acc, 0);
        
        var stackPos = vec3.fromValues(
            this.stackTypeTranslate[stackType][0] + this.stackTranslate[stackI][0],
            .0535 + (this.modelStacks[stackType][stackI]++ * .007),
            this.stackTypeTranslate[stackType][1] + this.stackTranslate[stackI][1]
        );
        var cellPos = vec3.fromValues(-.84 + .14 * cellColumn, .0545, .84 - .14 * cellLine);

        this.currAnimations.push({
            animation: new PieceAnimation(this.scene, stackPos, cellPos, type),
            stackType: stackType,
            stackI: stackI,
            line: cellLine,
            column: cellColumn
        });

        if (type == 'remove')
            this.boardCells[cellLine][cellColumn] = this.model['none'];
    }

    reset() {
        for (var i = 0; i < 13; i++)
            for (var j = 0; j < 13; j++)
                if (this.boardCells[i][j] != this.model['none'])
                    this.removePiece(i, j);
    }

    isCapture() {
        return  this.currAnimations.find((fAnim) => fAnim.animation.type == 'capture');
    }


    shakeUpdate(elapsedTime) {
        this.shakeFactor = Math.sin(elapsedTime *.05) * .01;

        this.currAnimations.forEach((fAnim, i) => (this.boardCells[fAnim.line][fAnim.column] = this.model['none']), this);
    }

    update(deltaTime) {
        this.currAnimations.forEach(this.updateAnimation.bind(this, deltaTime));
        return this.currAnimations.length;
    }

    updateAdd(deltaTime) {
        var animations = this.currAnimations.filter((fAnim) => fAnim.animation.type == 'add');
        animations.forEach(this.updateAnimation.bind(this, deltaTime));
        return animations.length;
    }

    updateCapture(deltaTime) {
        var animations = this.currAnimations.filter((fAnim) => fAnim.animation.type == 'capture');
        animations.forEach(function(fAnim, i) {
            this.boardCells[fAnim.line][fAnim.column] = this.model['none'];
            this.updateAnimation(deltaTime, fAnim);
        }, this);
        return animations.length;
    }

    updateAnimation(deltaTime, fAnim) {
        if (fAnim.animation.update(deltaTime) == deltaTime) {
            this.currAnimations.splice(this.currAnimations.indexOf(fAnim), 1);

            switch(fAnim.animation.type) {
                case 'add':
                    this.boardCells[fAnim.line][fAnim.column] = this.model[fAnim.stackType];
                    break;
                case 'remove':
                case 'capture':
                    this.viewStacks[fAnim.stackType][fAnim.stackI]++;
                    break;
            }
        }
    }


    stackDisplay(type) {
        for (var i = 0; i < 5; i++) {
            this.scene.pushMatrix();
                this.scene.translate(this.stackTranslate[i][0], .0035, this.stackTranslate[i][1]);
                for (var j = 0; j < this.viewStacks[type][i]; j++) {
                    this.pieceDisplay();
                    this.scene.translate(0, .007, 0);
                }
            this.scene.popMatrix();
        }
    }

    cellsDisplay(type) {
        for (var i = 0; i < 13; i++) {
            for (var j = 0; j < 13; j++) {
                if (this.boardCells[i][j] == this.model[type]) {
                    this.scene.pushMatrix();
                        this.scene.translate(-.84 + .14 * j, .0545, .84 - .14 * i);
                        this.pieceDisplay();
                    this.scene.popMatrix();
                }
            }
        }
    }

    shakeDisplay() {
        this.currAnimations.forEach(function(fAnim) {
            this.scene.pushMatrix();
                this.scene.translate(this.shakeFactor -.84 + .14 * fAnim.column, .0545, .84 - .14 * fAnim.line);
                this.pieceDisplay();
            this.scene.popMatrix();
        }, this);
    }

    pieceDisplay() {
        this.scene.pushMatrix();
            this.scene.scale(1, .2, 1);
            this.piece.display();
        this.scene.popMatrix();
    }

    typeDisplay(modelType) {
        //  - Stack Pieces
        this.scene.pushMatrix();
            this.scene.translate(this.stackTypeTranslate[modelType][0], .05, this.stackTypeTranslate[modelType][1]);
            this.stackDisplay(modelType);
        this.scene.popMatrix();
        // - Board Pieces
        this.cellsDisplay(modelType);
        // - Shaking Pieces
        if (this.shaking && this.currAnimations[0].stackType == modelType)
            this.shakeDisplay();
        // - Animation Pieces
        for (var i in this.currAnimations) {
            if (this.currAnimations[i].stackType == modelType) {
                this.scene.pushMatrix();
                    this.currAnimations[i].animation.apply();
                    this.pieceDisplay();
                this.scene.popMatrix();
            }
        }
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
            this.typeDisplay('white');

            // Black Pieces
            this.blackAppearance.apply();
            this.typeDisplay('black');
        this.scene.popMatrix();

        if (this.picking) {
            // Ghost objects for selecting board intersections
            this.scene.setActiveShader(this.ghostShader);
            for (var i = 0; i < 13; i++) {
                for (var j = 0; j < 13; j++) {
                    if (this.boardCells[j][i] == this.model['none']) {
                        this.scene.pushMatrix();
                            this.scene.translate(-.84 + .14 * i, .052, .84 - .14 * j);
                            this.scene.scale(.07, 1, .07);

                            var id = j * 13 + i;
                            this.scene.registerForPick(id + 1, this.ghostPick[id]);
                            this.ghostPick[id].display();
                        this.scene.popMatrix();
                    }
                }
            }
            this.scene.clearPickRegistration();
            this.scene.setActiveShader(this.scene.defaultShader);
        }
    }
}
