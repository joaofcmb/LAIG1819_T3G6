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
        this.playerOne = {playerID: 'playerOne', piece: '1', captures: 0, currSequence: 0}; this.currPlayer = this.playerOne;
        this.playerTwo = {playerID: 'playerTwo', piece: '2', captures: 0, currSequence: 0}; this.nextPlayer = this.playerTwo;

        if(this.gameMode == 'Player vs AI') {
            this.playerTwo['playerID'] = this.difficulty;
        }
        else if(this.gameMode == 'AI vs AI') {
            this.playerOne['playerID'] = this.difficulty;
            this.playerTwo['playerID'] = this.difficulty;
        }        
    }

    gameStep() {
         // Detect picking from board
         var pickId = this.scene.getPicks()[0];
        
         if (pickId-- && this.state && (this.currPlayer['playerID'] == 'playerOne' || this.currPlayer['playerID'] == 'playerTwo')) { 
            // Picking variables
            var cellLine = Math.floor(pickId / 13); 
            var cellColumn = pickId % 13;
            
            var response = this.logic.gameStep(this.board.boardContent, this.currPlayer, this.nextPlayer, 13 - cellColumn, cellLine + 1);
            this.updatedGameState(response.substring(1, response.length - 1));

            this.board.addPiece(cellLine, cellColumn);
        
         }
         else if(this.state && (this.currPlayer['playerID'] != 'playerOne') && (this.currPlayer['playerID'] != 'playerTwo')) {                         
            
            // Not done yet //
            this.logic.gameStep(this.board.boardContent, this.currPlayer, this.nextPlayer);
         }

    }

    updatedGameState(response) {
        // Board information
        var boardDifferences = response.split(",")[0].substring(1, response.split(",")[0].length - 1).split(",");
        
        // Updates board internal representation
        for(var index = 0; index < boardDifferences.length; index++) {
            var difference = boardDifferences[index].match(/[0-9]+-[0-9]+-[0-9]+/)[0].split("-");
            var line = Number(difference[0]) - 1;
            var column = Number(difference[1]) - 1;
            var element = Number(difference[2]);

            this.board.boardContent[line][column] = element;
        } 

        // Players information
        var playerInfo = [response.split(",")[1], response.split(",")[2]];
        
        if(this.currPlayer == this.playerOne) {
            this.playerOne['captures'] = Number(playerInfo[0].split("-")[2]);
            this.playerOne['currSequence'] = Number(playerInfo[0].split("-")[3]);

            this.currPlayer = this.playerTwo;
            this.nextPlayer = this.playerOne;
        }
        else {
            this.playerTwo['captures'] = Number(playerInfo[0].split("-")[2]);
            this.playerTwo['currSequence'] = Number(playerInfo[0].split("-")[3]);

            this.currPlayer = this.playerOne;
            this.nextPlayer = this.playerTwo;
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
    
    update(deltaTime) {
        this.board.update(deltaTime);
    }

    display() {
        // Updates game state
        this.gameStep();

        // Draw game (board)
        this.board.display();
    }
}