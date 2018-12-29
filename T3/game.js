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

        // Game States
        this.gameStates = {IDLE: 1, PICKING: 2, TURN: 3, ANIM_START: 4, ANIM_APPLY: 5};
        this.state = this.gameStates.IDLE;

        this.difficulty = {}; this.difficulty = 'Easy';
        this.gameMode   = {}; this.gameMode   = 'Player vs Player';

        this.board = new Board(scene);
        this.logic = new Logic();
    }
    
    /**
     * Initializes game.
     */
    playGame() {
        // Send init command 
        if(!this.logic.initGame()) {
            console.warn("Game Start failed.")
            return;
        }
        
        console.log("Game Start successful.");

        // Initialize game variables
        this.humanPlayers = ['playerOne', 'playerTwo'];
        this.currPlayer = {playerID: 'playerOne', piece: '1', captures: 0, currSequence: 0}; 
        this.nextPlayer = {playerID: 'playerTwo', piece: '2', captures: 0, currSequence: 0};

        // Updates player info depending on the game mode selected
        this.difficultyConverter = {Easy: 'easyAI', Medium: 'mediumAI', Hard: 'hardAI'}

        if (this.gameMode == 'Player vs AI') {            
            this.nextPlayer['playerID'] = this.difficultyConverter[this.difficulty];            
        }
        else if (this.gameMode == 'AI vs AI') {
            this.currPlayer['playerID'] = this.difficultyConverter[this.difficulty];
            this.nextPlayer['playerID'] = this.difficultyConverter[this.difficulty];
        }

        this.endGame = false;
        this.board.reset();
        this.state = this.gameStates.ANIM_START;
    }

    /**
     * Exit's current game by terminating Prolog connection.
     */
    exitGame() {
        // Send init command 
        if(!this.logic.exitGame()) {
            console.warn("Game exit failed.")
            return;
        }
        
        console.log("Game Exit successful. Server closed.");

        this.state = this.gameStates.IDLE;
    }

    // TODO ----- Replay should be made first in order to store moves and then undo is going back 2 moves.
    undo() {
        console.log("undo");
    }

    replay() {
        console.log("replay");
    }


    /**
     * Executes a move made by the player/AI.
     */
    gameStep(pickId) {
         if (this.humanPlayers.includes(this.currPlayer['playerID'])) { 
            // Picking variables
            var cellLine = Math.floor(pickId / 13) + 1;
            var cellColumn = pickId % 13 + 1;
            
            console.log("Command: Player Move !");

            var response = this.logic.gameStep(this.board.boardCells, this.currPlayer, this.nextPlayer, cellLine, cellColumn);
            this.updatedGameState(response.substring(1, response.length - 1));
         }
         else {
            console.log("Command: AI Move !");

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
             
        // Updates board internal representation
        for(var index = 0; index < boardDifferences.length; index++) {
            var difference = boardDifferences[index].match(/[0-9]+-[0-9]+-[0-9]+/)[0].split("-");
            var cellLine = Number(difference[0]) - 1;
            var cellColumn = Number(difference[1]) - 1;
            var element = Number(difference[2]);

            if (element != 0)  
                this.board.addPiece(cellLine, cellColumn, element);
            else 
                this.board.removePiece(cellLine, cellColumn);                
        } 

        // Players information
        var playerInfo = response.match(/\].*/)[0].split(",")[1];
        
        // Updates player information
        this.currPlayer['captures'] = Number(playerInfo.split("-")[0]);
        this.currPlayer['currSequence'] = Number(playerInfo.split("-")[1]);

        this.tmpPlayer = this.currPlayer; this.currPlayer = this.nextPlayer; this.nextPlayer = this.tmpPlayer;

        // Check possible winning or draw condition
        var endGameMessage = {0: this.nextPlayer['playerID'] + " was won the game !", 1: "Draw !"}
        var gameState = response.match(/\].*/)[0].split(",")[2];
    
        if (gameState == '0' || gameState == '1') {
            console.log("Request successful.");
            console.log(endGameMessage[gameState]);
            this.endGame = true;
        }        

        console.log("Request successful.");
    }


    updateAnimations(deltaTime) {
        if (!this.board.update(deltaTime)) { // When there's no more animations, proceed to next state
            if (this.endGame){
                this.state = this.gameStates.IDLE;
                return
            } 

            if (this.humanPlayers.includes(this.currPlayer['playerID'])) {
                this.state = this.gameStates.PICKING;
                this.board.picking = true;
            }
            else {
                this.state = this.gameStates.TURN;
            }
        }
    }
    
    update(deltaTime) {
        // Updates game state
        switch(this.state) {
            case this.gameStates.PICKING:
                this.pickId = this.scene.getPicks()[0];
                if (this.pickId--) {
                    this.state = this.gameStates.TURN;
                    this.board.picking = false;
                }
                break;
            case this.gameStates.TURN:
                this.gameStep(this.pickId);
                this.state = this.gameStates.ANIM_START;
                break;
            case this.gameStates.ANIM_START:
                // This state resets the time for the animations
                this.state = this.gameStates.ANIM_APPLY;
                break;
            case this.gameStates.ANIM_APPLY:
                this.updateAnimations(deltaTime);
                break;
        }
    }

    display() {
        // Draw game (board)
        this.board.display();
    }
}