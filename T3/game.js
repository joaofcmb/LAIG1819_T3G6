/**
 * Pente game class
 */

class Game extends CGFobject {
    constructor(scene) {
        super(scene);

        // True - Playing. False otherwise
        this.state = false;

        this.board = new Board(scene);
        this.logic = new Logic(this);
    }

    /**
     * Initializes game 
     */
    playGame() {
        this.logic.initGame();
    }
    
    /**
     * Exit's current game by terminating Prolog connection
     */
    exitGame() {
        this.logic.exitGame();
    }

    // TODO
    undo() {
        console.log("undo");
    }

    replay() {
        console.log("replay");
    }
    
    /**
     * Adds a piece to the board
     * 
     * @param {number} cellId id of the cell where the piece is added to
     */
    addPiece(cellLine, cellColumn) {
        // Validate move on Server
        this.board.addPiece(cellLine, cellColumn); // For now it doesnt differenciate between white and black
    }

    update(deltaTime) {
        this.board.update(deltaTime);
    }

    display() {
        // Detect picking from board
        var pickId = this.scene.getPicks()[0];
        if (pickId--) { //this.state &&
            var cellLine = Math.floor(pickId / 13); var cellColumn = pickId % 13;
            this.addPiece(cellLine, cellColumn);
        }

        // Draw game (board)
        this.board.display();
    }
}