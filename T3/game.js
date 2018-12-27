/**
 * Pente game class
 */

class Game extends CGFobject {
    constructor(scene) {
        super(scene);

        // True - Playing. False otherwise
        this.state  = false;    

        this.difficulty = {}; this.difficulty = 'Medium';
        this.gameMode   = {}; this.gameMode   = 'Player vs Player';
        this.board = new Board(scene);
        this.logic = new Logic();
    }

    /**
     * Initializes game 
     */
    playGame() {
        // Checks if there is a game in progress
        if (this.state) {
            console.log("Invalid Command: Game In Progress !");
            return;
        }
        else {
            console.log("Command: Play Game !");
        } 
        
        // Send init command 
        if(this.logic.initGame() != 'success') 
            return;
        else {
            this.state = true;
            console.log("Request successful.");
        }

        // Initialize game variables
        this.board = new Board(this.scene);
        this.playerOne = {playerID: 'playerOne', piece: '1', captures: 0, currSequence: 0}; //this.currPlayer = this.playerOne;
        this.playerTwo = {playerID: 'playerTwo', piece: '2', captures: 0, currSequence: 0};this.currPlayer = this.playerTwo;

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
        // Checks if there is a game in progress
        if (!this.state) {
            console.log("Invalid Command: Available Only When A Game Is In Progress !");
            return;
        } else {
            console.log("Command: Exit Game !");
        }

        // Sends quit command
        if(this.logic.exitGame() != 'success') 
            return;
        else {
            this.state = false;
            console.log("Request successful.");
        }
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
        
        if (pickId-- && this.state && (this.currPlayer['playerID'] == 'playerOne' || this.currPlayer['playerID'] == 'playerTwo')) { 
            // Picking variables
            var cellLine = Math.floor(pickId / 13); 
            var cellColumn = pickId % 13;
            
            this.logic.gameStep(this.board.boardCells, this.playerOne, this.playerTwo, cellLine, cellColumn);

            this.addPiece(cellLine, cellColumn);

        }
        else if(this.state && (this.currPlayer['playerID'] != 'playerOne') && (this.currPlayer['playerID'] != 'playerTwo')) {            
            
            this.logic.gameStep(this.board.boardCells, this.playerOne, this.playerTwo);
        }

        // Draw game (board)
        this.board.display();
    }
}