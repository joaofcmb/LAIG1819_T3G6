/**
 * Pente game class
 */

class Game extends CGFobject {
    constructor(scene) {
        super(scene);

        // True - Playing. False otherwise
        this.state  = false;

        // Players: white & black. First player: white
        this.player = 'white';

        this.difficulty = {}; this.difficulty = 'Medium';
        this.gameMode   = {}; this.gameMode   = 'Player vs Player';
        this.board = new Board(scene);
        this.logic = new Logic(this);
    }

    /**
     * Initializes game 
     */
    playGame() {
        this.logic.initGame();

        // Initialize game variables
        this.board.createNewBoard();
        this.playerOne = {playerID: 'playerOne', piece: '1', captures: 0, currSequence: 0};
        this.playerTwo = {playerID: 'playerTwo', piece: '2', captures: 0, currSequence: 0};

        if(this.gameMode == 'Player vs AI') {
            this.playerTwo['playerID'] = this.difficulty;
        }
        else if(this.gameMode == 'AI vs AI') {
            this.playerOne['playerID'] = this.difficulty;
            this.playerTwo['playerID'] = this.difficulty;
        }        
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
            var cellLine = Math.floor(pickId / 13); var cellColumn = pickId % 13;
            this.addPiece(cellLine, cellColumn);
        if (this.state & pickId) {
            this.logic.gameStep(this.board.boardContent, this.playerOne, this.playerTwo, line, column);
        }

        // Draw game (board)
        this.board.display();
    }
}