/**
 * Pente game class
 */
class Game extends CGFobject {
    
    /**
     * Game class constructor.
     * 
     * @param {Object} scene 
     */
    constructor(scene) {
        super(scene);

        this.state  = false;  // True - Playing. False otherwise  
        this.difficulty = {}; this.difficulty = 'Easy';
        this.gameMode   = {}; this.gameMode   = 'Player vs Player';
        this.board = new Board(scene);
        this.logic = new Logic();
        this.allMoves = [];
    }
    
    /**
     * Initializes game.
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
        this.currPlayer = {playerID: 'playerOne', piece: '1', captures: 0, currSequence: 0}; 
        this.nextPlayer = {playerID: 'playerTwo', piece: '2', captures: 0, currSequence: 0};

        // Updates player info depending on the game mode selected
        this.difficultyConverter = {Easy: 'easyAI', Medium: 'mediumAI', Hard: 'hardAI'}

        if(this.gameMode == 'Player vs AI') {            
            this.nextPlayer['playerID'] = this.difficultyConverter[this.difficulty];            
        }
        else if(this.gameMode == 'AI vs AI') {
            this.currPlayer['playerID'] = this.difficultyConverter[this.difficulty];
            this.nextPlayer['playerID'] = this.difficultyConverter[this.difficulty];
        }      
        
        // this.selectedTime = this.time;
        this.selectedMode = this.gameMode;
        this.selectedDifficulty = this.difficulty;
        this.allMoves.push({differences: [], currPlayer: {playerID: this.currPlayer['playerID'], piece: this.currPlayer['piece'], captures: this.currPlayer['captures'], currSequence: this.currPlayer['currSequence']}, 
                                             nextPlayer: {playerID: this.nextPlayer['playerID'], piece: this.nextPlayer['piece'], captures: this.nextPlayer['captures'], currSequence: this.nextPlayer['currSequence']}});
    }

    /**
     * Executes a move made by the player/AI.
     */
    gameStep() {
         // Detect picking from board
         var pickId = this.scene.getPicks()[0];

         if (pickId-- && this.state && (this.currPlayer['playerID'] == 'playerOne' || this.currPlayer['playerID'] == 'playerTwo')) { 
            // Picking variables
            var cellLine = Math.floor(pickId / 13) + 1;
            var cellColumn = pickId % 13 + 1;
            
            console.log("Command: Player Move !");

            var response = this.logic.gameStep(this.board.boardCells, this.currPlayer, this.nextPlayer, cellLine, cellColumn);
            this.updatedGameState(response.substring(1, response.length - 1));
         }
         else if(this.state && (this.currPlayer['playerID'] != 'playerOne') && (this.currPlayer['playerID'] != 'playerTwo')) {            
            console.log("Command: Player Move !");

            // AI move
            var response = this.logic.gameStep(this.board.boardCells, this.currPlayer, this.nextPlayer);
            this.updatedGameState(response.substring(1, response.length - 1));
         }

    }

    /**
     * Updates game state, both board internal representation and player information.
     * 
     * @param {String} response 
     */
    updatedGameState(response) {
        // Board information
        var boardDifferences = response.match(/\[.*\]/)[0].substring(1, response.match(/\[.*\]/)[0].length - 1).split(",");
        var diff = [];

        // Updates board internal representation
        for(var index = 0; index < boardDifferences.length; index++) {
            var difference = boardDifferences[index].match(/[0-9]+-[0-9]+-[0-9]+/)[0].split("-");
            var cellLine = Number(difference[0]) - 1;
            var cellColumn = Number(difference[1]) - 1;
            var cellelement = Number(difference[2]);

            diff.push({line: cellLine, column: cellColumn, element: cellelement});

            if (cellelement != 0)  
                this.board.addPiece(cellLine, cellColumn, cellelement);
            else 
                this.board.removePiece(cellLine, cellColumn);                
        } 

        // Players information
        var playerInfo = response.match(/\].*/)[0].split(",")[1];
        
        // Updates player information
        this.currPlayer['captures'] = Number(playerInfo.split("-")[0]);
        this.currPlayer['currSequence'] = Number(playerInfo.split("-")[1]);

        var tmpPlayer = this.currPlayer; this.currPlayer = this.nextPlayer; this.nextPlayer = tmpPlayer;

        // Check possible winning or draw condition
        var endGameMessage = {0: this.nextPlayer['playerID'] + " was won the game !", 1: "Draw !"}
        var gameState = response.match(/\].*/)[0].split(",")[2];
    
        if(gameState == '0' || gameState == '1') {
            console.log("Request successful.");
            console.log(endGameMessage[gameState]);
            return this.exitGame();
        }        

        this.allMoves.push({differences: diff,  currPlayer: {playerID: this.currPlayer['playerID'], piece: this.currPlayer['piece'], captures: this.currPlayer['captures'], currSequence: this.currPlayer['currSequence']}, 
                                                nextPlayer: {playerID: this.nextPlayer['playerID'], piece: this.nextPlayer['piece'], captures: this.nextPlayer['captures'], currSequence: this.nextPlayer['currSequence']}});
    
        console.log("Request successful.");
    }
    
    /**
     * Exit's current game by terminating Prolog connection.
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

    /**
     * Undos a certain amount of maden moves depending on the selected game mode.
     */
    undo() {
        if(this.selectedMode != 'AI vs AI' && (this.allMoves.length > 1) && ((this.currPlayer['playerID'] == 'playerOne') || (this.currPlayer['playerID'] == 'playerTwo'))) {
            var currNumUndo = 0;
            var numberOfUndos = this.selectedMode == 'Player vs Player' ? 1 : 2;

            while(currNumUndo < numberOfUndos) {
                var lastMove = this.allMoves.pop();

                for(var index = 0; index < lastMove['differences'].length; index++) {
                    var cellLine = lastMove['differences'][index]['line'];
                    var cellColumn = lastMove['differences'][index]['column'];
                    var cellelement = lastMove['differences'][index]['element'];
                    
                    if (cellelement != 0)  
                        this.board.removePiece(cellLine, cellColumn);
                    else 
                        this.board.addPiece(cellLine, cellColumn, cellelement);

                    this.currPlayer = this.allMoves[this.allMoves.length - 1]['currPlayer'];
                    this.nextPlayer = this.allMoves[this.allMoves.length - 1]['nextPlayer'];
                }

                currNumUndo++;
            }
        }
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