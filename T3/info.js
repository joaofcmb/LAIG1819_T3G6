/**
 * Game Info class
 */
class Info extends CGFobject {

    /**
     * Info class constructor.
     * 
     * @param {Object} scene 
     * @param {Number} time 
     */
    constructor(scene, time) {
        super(scene);

        this.initInfo(time);
        this.initComponents();
        this.initTextures();
    }

    /**
     * Initializes class needed variables.
     * 
     * @param {Number} time 
     */
    initInfo(time) {
        this.resetPlayerInfo();

        this.time = time;
        this.resetTimer();
    }

    /**
     * Initializes all components that are going to be displayed
     */
    initComponents() {
        this.cube = new Cube(this.scene, 30, 30); 
        this.infoElement = new MyRectangle(this.scene, -1, -1, 1, 1, 2, 2);
    }

    /**
     * Initializes all textures that are going to be displayed
     */
    initTextures() {
        this.whiteAppearance = new CGFappearance(this.scene);
        this.whiteAppearance.setDiffuse(1, 1, 1, 1);

        this.blackAppearance = new CGFappearance(this.scene);
        this.blackAppearance.setDiffuse(0, 0, 0, 1);

        this.letter_C = new CGFappearance(this.scene);
        this.letter_C.loadTexture('scenes/images/letter_C.png');

        this.letter_S = new CGFappearance(this.scene);
        this.letter_S.loadTexture('scenes/images/letter_S.png');

        this.colon = new CGFappearance(this.scene);
        this.colon.loadTexture('scenes/images/colon.jpg');

        this.numbers = {};
        for(var index = 0; index < 10; index++) {
            var number = new CGFappearance(this.scene);
            number.loadTexture("scenes/images/number_" + index + ".png");
            this.numbers[index] = number;
        }
    }

    /**
     * Resets the player info to its initial state.
     */
    resetPlayerInfo() {
        this.playerOneCaptures = { number: 0, object: new MyRectangle(this.scene, -1, -1, 1, 1, 2, 2) };
        this.playerOneSequence = { number: 0, object: new MyRectangle(this.scene, -1, -1, 1, 1, 2, 2) };
        this.playerTwoCaptures = { number: 0, object: new MyRectangle(this.scene, -1, -1, 1, 1, 2, 2) };
        this.playerTwoSequence = { number: 0, object: new MyRectangle(this.scene, -1, -1, 1, 1, 2, 2) };
    }

    /**
     * Resets timer to it's default value.
     */
    resetTimer() {
        this.minutes = Math.floor(this.time / 60);
        this.seconds = Math.round(this.time % 60);
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

    /**
     * Updates timer and returns it's state: True if there is no time remaining, false otherwise.
     */
    updateTimer() {
        this.seconds--;
        
        if(this.minutes > 0 && this.seconds == 0) {
            this.minutes--; 
            this.seconds = 60;
        }
        else if(this.minutes == 0 && this.seconds == 0) {
            this.resetTimer();
            return true;
        }
        
        return false;
    }

    /**
     * Displays all info associated to the game: player scorer's and timer
     */
    display() {
        this.displayTimer();
        this.displayPlayerOne();
        this.displayPlayerTwo();
    }

    /**
     * Displays the timer.
     */
    displayTimer() {
        this.scene.pushMatrix();
            this.scene.translate(-1.5, 0.075, -0.1);
            this.scene.scale(.15, .15, .35);
            this.cube.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
            this.scene.translate(-1.3499, 0.075, 0.175);
            this.scene.scale(.075, .15, .075);
            this.scene.rotate(Math.PI / 2, 0, 1, 0);
            this.numbers[Math.floor(this.minutes / 10)].apply();
            this.infoElement.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
            this.scene.translate(-1.3499, 0.075, 0.025);
            this.scene.scale(.075, .15, .075);
            this.scene.rotate(Math.PI / 2, 0, 1, 0);
            this.numbers[this.minutes % 10].apply();
            this.infoElement.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
            this.scene.translate(-1.3499, 0.075, -0.1);
            this.scene.scale(.075, .15, .05);
            this.scene.rotate(Math.PI / 2, 0, 1, 0);
            this.colon.apply();
            this.infoElement.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
            this.scene.translate(-1.3499, 0.075, -0.225);
            this.scene.scale(.075, .15, .075);
            this.scene.rotate(Math.PI / 2, 0, 1, 0);
            this.numbers[Math.floor(this.seconds / 10)].apply();
            this.infoElement.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
            this.scene.translate(-1.3499, 0.075, -0.375);
            this.scene.scale(.075, .15, .075);
            this.scene.rotate(Math.PI / 2, 0, 1, 0);
            this.numbers[this.seconds % 10].apply();
            this.infoElement.display();
        this.scene.popMatrix();
    }

    /**
     * Displays player one scorer
     */
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
                this.infoElement.display();
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
                this.infoElement.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
                this.scene.translate(-1.425, 0.0501, 0.925);
                this.scene.scale(.075, .05, .075);
                this.scene.rotate(-Math.PI / 2, 1, 0, 0);
                this.numbers[this.playerOneSequence['number']].apply();
                this.playerOneSequence['object'].display();
        this.scene.popMatrix();
    }

    /**
     * Displays player two scorer
     */
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
                this.infoElement.display();
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
                this.infoElement.display();
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