/**
 * Game Info class
 */
class Info extends CGFobject {

    constructor(scene) {
        super(scene);

        this.initComponents();
        this.initTextures();

    }

    initComponents() {
        this.cube = new Cube(this.scene, 30, 30); 
        this.letters = new MyRectangle(this.scene, -1, -1, 1, 1, 2, 2);
        
        this.playerOneCaptures = {number: 0, object: new MyRectangle(this.scene, -1, -1, 1, 1, 2, 2) };
        this.playerOneSequence = {number: 0, object: new MyRectangle(this.scene, -1, -1, 1, 1, 2, 2) };

        this.playerTwoCaptures = {number: 0, object: new MyRectangle(this.scene, -1, -1, 1, 1, 2, 2) };
        this.playerTwoSequence = {number: 0, object: new MyRectangle(this.scene, -1, -1, 1, 1, 2, 2) };
    }

    initTextures() {
        this.whiteAppearance = new CGFappearance(this.scene);
        this.whiteAppearance.setDiffuse(1, 1, 1, 1);

        this.blackAppearance = new CGFappearance(this.scene);
        this.blackAppearance.setDiffuse(0, 0, 0, 1);

        this.letter_C = new CGFappearance(this.scene);
        this.letter_C.loadTexture('scenes/images/letter_C.png');

        this.letter_S = new CGFappearance(this.scene);
        this.letter_S.loadTexture('scenes/images/letter_S.png');

        this.numbers = {};
        for(var index = 0; index < 10; index++) {
            var number = new CGFappearance(this.scene);
            number.loadTexture("scenes/images/number_" + index + ".png");
            this.numbers[index] = number;
        }

    }

    /**
     * Updates both player information: number of captures and the current max sequence.
     * 
     * @param {Object} playerOne 
     * @param {Object} playerTwo 
     */
    updatePlayersInfo(playerOne, playerTwo) {
        this.playerOneCaptures['number'] = playerOne['captures']; this.playerOneSequence['number'] = playerOne['currSequence'];
        this.playerTwoCaptures['number'] = playerTwo['captures']; this.playerTwoSequence['number'] = playerTwo['currSequence'];
    }

    display() {

        this.displayPlayerOne();
        this.displayPlayerTwo();
        
    }

    displayPlayerOne() {
        this.whiteAppearance.apply();
        this.scene.pushMatrix();
                this.scene.translate(-1.5, 0, 0.85);
                this.scene.scale(.15, .05, .15);
                this.cube.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
                this.scene.translate(-1.575, 0.0501, 0.775);
                this.scene.scale(.075, .05, .075);
                this.scene.rotate(-Math.PI / 2, 1, 0, 0);
                this.letter_C.apply();
                this.letters.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
                this.scene.translate(-1.425, 0.0501, 0.775);
                this.scene.scale(.075, .05, .075);
                this.scene.rotate(-Math.PI / 2, 1, 0, 0);
                this.numbers[this.playerOneCaptures['number']].apply();                
                this.playerOneCaptures['object'].display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
                this.scene.translate(-1.575, 0.0501, 0.925);
                this.scene.scale(.075, .05, .075);
                this.scene.rotate(-Math.PI / 2, 1, 0, 0);
                this.letter_S.apply();
                this.letters.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
                this.scene.translate(-1.425, 0.0501, 0.925);
                this.scene.scale(.075, .05, .075);
                this.scene.rotate(-Math.PI / 2, 1, 0, 0);
                this.numbers[this.playerOneSequence['number']].apply();
                this.playerOneSequence['object'].display();
        this.scene.popMatrix();
    }

    displayPlayerTwo() {
        this.blackAppearance.apply();
        this.scene.pushMatrix();
                this.scene.translate(1.5, 0, -0.85);
                this.scene.scale(.15, .05, .15);
                this.cube.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
                this.scene.translate(1.575, 0.0501, -0.775);
                this.scene.scale(.075, .05, .075);
                this.scene.rotate(-Math.PI, 0, 1, 0);
                this.scene.rotate(-Math.PI / 2, 1, 0, 0);
                this.letter_C.apply();
                this.letters.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
                this.scene.translate(1.425, 0.0501, -0.775);
                this.scene.scale(.075, .05, .075);
                this.scene.rotate(-Math.PI, 0, 1, 0);
                this.scene.rotate(-Math.PI / 2, 1, 0, 0);
                this.numbers[this.playerTwoCaptures['number']].apply();
                this.playerTwoCaptures['object'].display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
                this.scene.translate(1.575, 0.0501, -0.925);
                this.scene.scale(.075, .05, .075);
                this.scene.rotate(-Math.PI, 0, 1, 0);
                this.scene.rotate(-Math.PI / 2, 1, 0, 0);
                this.letter_S.apply();
                this.letters.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
                this.scene.translate(1.425, 0.0501, -0.925);
                this.scene.scale(.075, .05, .075);
                this.scene.rotate(-Math.PI, 0, 1, 0);
                this.scene.rotate(-Math.PI / 2, 1, 0, 0);
                this.numbers[this.playerTwoSequence['number']].apply();
                this.playerTwoSequence['object'].display();
        this.scene.popMatrix();
    }
}