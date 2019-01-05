/**
 * Pente Board Object (13x13)
 * 
 * Board length -> 1 unit
 * Board without frame -> .91 units
 * Cell unit -> .91 / 13 = .07 units
 */
class Board extends CGFobject {
    /**
     * 
     * @param {Object} scene The active scene
     */
    constructor(scene) {
        super(scene);
        this.picking = false;

        this.initComponents();
        this.initBoard();
        this.initMaterials();
        this.initStack();

        this.currAnimations = [];
        this.ghostShader = new CGFshader(this.scene.gl, './shaders/Ghost.vert', './shaders/Ghost.frag');
    }

    /**
     * Initializes components to display
     */
    initComponents() {        
        this.cube = new Cube(this.scene, 30, 30);
        this.board = new Plane(this.scene, 60, 60);
        this.piece = new MySphere(this.scene, .035, 8, 10);
    }

    /**
     * Initializes the board's internal state
     */
    initBoard() {
        this.model = {'none': 0, 'white': 1, 'black': 2};

        this.boardCells = new Array(13).fill(0).map(() => new Array(13).fill(this.model['none']));
        this.ghostPick = new Array(13*13).fill(new Plane(this.scene, 1, 1));
    }

    /**
     * Initializes materials for the board and its pieces
     */
    initMaterials() {
        this.boardAppearance = new CGFappearance(this.scene);
        this.boardAppearance.loadTexture('scenes/images/pente.png');

        this.whiteAppearance = new CGFappearance(this.scene);
        this.whiteAppearance.setDiffuse(.5, .5, .5, 1);
        this.whiteAppearance.setAmbient(.2, .2, .2, 1);
        this.whiteAppearance.setSpecular(.7, .7, .7, 1);

        this.blackAppearance = new CGFappearance(this.scene);
        this.blackAppearance.setDiffuse(.15, .15, .15, 1);
        this.blackAppearance.setAmbient(.1, .1, .1, 1);
        this.blackAppearance.setSpecular(.7, .7, .7, 1);
    }

    /**
     * Initializes the stacks containing the pieces not placed on the board.
     */
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
    
    /***********************/
    /** ANIMATION METHODS **/
    /***********************/

    /**
     * Adds an animation inserting a piece into the board
     * 
     * @param {Number} cellLine Line number of the selected cell
     * @param {Number} cellColumn Column number of the selected cell 
     * @param {Number} element Model notation of the type of piece being inserted
     */
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

    /**
     * Adds an animation removing a piece from the board
     * 
     * @param {Number} cellLine Line number of the cell where the piece is
     * @param {Number} cellColumn Column number of the cell where the piece is
     * @param {String} type Specifies whether the piece is just being removed 'remove' or is part of a capture move 'capture'
     */
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

    /**
     * Resets the board in an animated manner.
     */
    reset() {
        for (var i = 0; i < 13; i++)
            for (var j = 0; j < 13; j++)
                if (this.boardCells[i][j] != this.model['none'])
                    this.removePiece(i, j);
    }

    /**
     * Verifies if there's a capture animation occuring.
     * 
     * @returns {Boolean} Whether a capture animation is occuring or not
     */
    isCapture() {
        return  this.currAnimations.find((fAnim) => fAnim.animation.type == 'capture');
    }

    /**
     * Updates the shake factor being applied to pieces being shaked, as part of the capture animation
     * 
     * @param {*} elapsedTime Time elapsed since the start of the shake state 
     */
    shakeUpdate(elapsedTime) {
        this.shakeFactor = Math.sin(elapsedTime *.05) * .01;

        this.currAnimations.forEach((fAnim, i) => (this.boardCells[fAnim.line][fAnim.column] = this.model['none']), this);
    }

    /**
     * Updates all the board's animations.
     * 
     * Used for all board animations, excluding captures
     * 
     * @param {Number} deltaTime Time elapsed since the last update
     * 
     * @returns {Number} Amount of ongoing animations
     */
    update(deltaTime) {
        this.currAnimations.forEach(this.updateAnimation.bind(this, deltaTime));
        return this.currAnimations.length;
    }

    /**
     * Updates the board's animations adding pieces to the board.
     * 
     * Used for capture animations
     * 
     * @param {Number} deltaTime Time elapsed since the last update
     * 
     * @returns {Number} Amount of ongoing animations
     */
    updateAdd(deltaTime) {
        var animations = this.currAnimations.filter((fAnim) => fAnim.animation.type == 'add');
        animations.forEach(this.updateAnimation.bind(this, deltaTime));
        return animations.length;
    }

    /**
     * Updates the board's animations removing capture pieces from the board.
     * 
     * Used for capture animations
     * 
     * @param {Number} deltaTime Time elapsed since the last update
     * 
     * @returns {Number} Amount of ongoing animations
     */
    updateCapture(deltaTime) {
        var animations = this.currAnimations.filter((fAnim) => fAnim.animation.type == 'capture');
        animations.forEach(function(fAnim, i) {
            this.boardCells[fAnim.line][fAnim.column] = this.model['none'];
            this.updateAnimation(deltaTime, fAnim);
        }, this);
        return animations.length;
    }

    /**
     * Updates an individual board animation
     * 
     * @private Called internally by the methods handling animation updates
     * 
     * @param {Number} deltaTime    Time elapsed since the last update
     * @param {Object} fAnim        Animation to be updated
     * 
     */
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

    /*********************/
    /** DISPLAY METHODS **/
    /*********************/


    /**
     * Displays the stacks of a player containing its pieces.
     * 
     * @param {String} type Type of stack being displayed ({'white', 'black})
     */
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

    /**
     * Displays the pieces of a player on the board.
     * 
     * @param {String} type Type of piece being displayed ({'white', 'black})
     */
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

    
    /**
     * Displays the pieces being shaken as part of a capture animation.
     */
    shakeDisplay() {
        this.currAnimations.forEach(function(fAnim) {
            this.scene.pushMatrix();
                this.scene.translate(this.shakeFactor -.84 + .14 * fAnim.column, .0545, .84 - .14 * fAnim.line);
                this.pieceDisplay();
            this.scene.popMatrix();
        }, this);
    }

    /**
     * Display a single piece.
     */
    pieceDisplay() {
        this.scene.pushMatrix();
            this.scene.scale(1, .2, 1);
            this.piece.display();
        this.scene.popMatrix();
    }

    
    /**
     * Displays all the objects regarding a player
     * 
     * @param {String} type Type of objects being displayed ({'white', 'black})
     */
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

    /**
     * Displays the board
     */
    display() {
        this.scene.pushMatrix();
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
            // - Base for the stacks
            this.scene.pushMatrix();
                this.scene.translate(-1.5, 0, .5);
                this.scene.scale(.15, .05, .15);
                this.cube.display();
            this.scene.popMatrix();

            this.typeDisplay('white');

            // Black Pieces
            this.blackAppearance.apply();
            // - Base for the stacks
            this.scene.pushMatrix();
                this.scene.translate(1.5, 0, -.5);
                this.scene.scale(.15, .05, .15);
                this.cube.display();
            this.scene.popMatrix();

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
