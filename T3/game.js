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

        // Game and Replay States
        this.eventTypes = {IDLE: 1, GAME: 2, REPLAY: 3};
        this.event = this.eventTypes.IDLE;

        this.gameStates = {IDLE: 1, PICKING: 2, TURN: 3, ANIM_START: 4, ANIM_APPLY: 5};
        this.state = this.gameStates.IDLE;

        this.difficulty = {}; this.difficulty = 'Easy';
        this.gameMode   = {}; this.gameMode   = 'Player vs Player';

        this.board = new Board(scene);
        this.logic = new Logic();
        this.info = new Info(scene);

        this.allMoves = [];
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
        
        // this.selectedTime = this.time;
        this.selectedMode = this.gameMode;
        this.selectedDifficulty = this.difficulty;
        this.allMoves.push({
            differences: [], 
            currPlayer: JSON.parse(JSON.stringify(this.currPlayer)), 
            nextPlayer: JSON.parse(JSON.stringify(this.nextPlayer))
        });

        this.endGame = false;
        this.board.reset();

        this.event = this.eventTypes.GAME,
        this.state = this.gameStates.ANIM_START;
    }

    /**
     * Exit's current game by terminating Prolog connection.
     */
    exitGame() {
        // Send init command 
        if (!this.logic.exitGame()) {
            console.warn("Game exit failed.")
            return;
        }
        
        console.log("Game Exit successful. Server closed.");

        this.event = this.eventTypes.IDLE;
        this.state = this.gameStates.IDLE;
    }

    /**
     * Undos a certain amount of maden moves depending on the selected game mode.
     */
    undo() {
        if (this.state == this.gameStates.PICKING && this.selectedMode != 'AI vs AI' && this.allMoves.length > 1 
            && this.humanPlayers.includes(this.currPlayer['playerID'])) {
            var currNumUndo = 0;
            var numberOfUndos = this.selectedMode == 'Player vs Player' ? 1 : 2;

            while(currNumUndo < numberOfUndos) {
                var lastMove = this.allMoves.pop();

                for (var index = 0; index < lastMove['differences'].length; index++) {
                    var cellLine = lastMove['differences'][index]['line'];
                    var cellColumn = lastMove['differences'][index]['column'];
                    var cellElement = lastMove['differences'][index]['element'];
                    var previousElement = lastMove['differences'][index]['previousElement'];
                    
                    if (cellElement != 0)  
                        this.board.removePiece(cellLine, cellColumn);
                    else 
                        this.board.addPiece(cellLine, cellColumn, previousElement);
                }

                this.currPlayer = this.allMoves[this.allMoves.length - 1]['currPlayer'];
                this.nextPlayer = this.allMoves[this.allMoves.length - 1]['nextPlayer'];

                currNumUndo++;
            }

            this.board.picking = false;
            this.state = this.gameStates.ANIM_START;
        }
        else    console.warn("Invalid use of undo (Must be used during your turn).");
    }

    /**
     * Shows all the moves performed so far
     */
    replay() {
        if (this.event != this.eventTypes.GAME || this.state == this.gameStates.TURN || this.state == this.gameStates.ANIM_APPLY) {
            console.warn("Invalid use of replay (Must be used during a game without an ongoing turn).");
            return;
        }

        // Resets board and changes to replay event
        this.board.reset();
        this.board.picking = false;

        this.event = this.eventTypes.REPLAY;
        this.state = this.gameStates.ANIM_START;
        this.replayMove = 0;
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
        var diff = [];

        // Updates board internal representation
        for(var index = 0; index < boardDifferences.length; index++) {
            var difference = boardDifferences[index].match(/[0-9]+-[0-9]+-[0-9]+/)[0].split("-");
            var cellLine = Number(difference[0]) - 1;
            var cellColumn = Number(difference[1]) - 1;
            var cellElement = Number(difference[2]);

            diff.push({line: cellLine, column: cellColumn, element: cellElement, previousElement: this.board.boardCells[cellLine][cellColumn]});
            
            if (cellElement != 0)  
                this.board.addPiece(cellLine, cellColumn, cellElement);
            else 
                this.board.removePiece(cellLine, cellColumn);                
        } 
        
        // Players information
        var playerInfo = response.match(/\].*/)[0].split(",")[1];
        
        // Updates player information
        this.currPlayer['captures'] = Number(playerInfo.split("-")[0]);
        this.currPlayer['currSequence'] = Number(playerInfo.split("-")[1]);

        // In case a capture occurs
        if(diff.length > 1)
            this.nextPlayer['currSequence'] -= 2;
        
        var tmpPlayer = this.currPlayer; this.currPlayer = this.nextPlayer; this.nextPlayer = tmpPlayer;

        // Updates player info on Info class
        if(this.currPlayer['piece'] == '1') 
            this.info.updatePlayersInfo(this.currPlayer, this.nextPlayer);
        else
            this.info.updatePlayersInfo(this.nextPlayer, this.currPlayer);

        // Check possible winning or draw condition
        var endGameMessage = {0: this.nextPlayer['playerID'] + " was won the game !", 1: "Draw !"}
        var gameState = response.match(/\].*/)[0].split(",")[2];
        
        console.log(gameState);
        if (gameState == '0' || gameState == '1') {
            console.log("Request successful.");
            console.log(endGameMessage[gameState]);
            this.endGame = true;
        }        

        this.allMoves.push({
            differences: diff,  
            currPlayer: JSON.parse(JSON.stringify(this.currPlayer)), 
            nextPlayer: JSON.parse(JSON.stringify(this.nextPlayer))
        });
    
        console.log("Request successful.");
    }



    updateGame(deltaTime) {
        switch (this.state) {
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
                // Resets the time for the animations
                this.state = this.gameStates.ANIM_APPLY;
                break;
            case this.gameStates.ANIM_APPLY:
                this.updateAnimations(deltaTime);
                break;
            default:
                break;
        }
    }

    /**
     * 
     * @param {*} deltaTime 
     */
    updateAnimations(deltaTime) {
        if (!this.board.update(deltaTime)) { // When there's no more animations, proceed to next state
            if (this.endGame) {
                this.event = this.eventTypes.IDLE;
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

    /**
     * 
     * @param {*} deltaTime 
     */
    updateReplay(deltaTime) {
        switch (this.state) {
            case this.gameStates.TURN:
                for(var j = 0; j < this.allMoves[this.replayMove]['differences'].length; j++) {
                    var cellLine = this.allMoves[this.replayMove]['differences'][j]['line'];
                    var cellColumn = this.allMoves[this.replayMove]['differences'][j]['column'];
                    var cellelement = this.allMoves[this.replayMove]['differences'][j]['element'];
                    
                    if (cellelement != 0)   this.board.addPiece(cellLine, cellColumn, cellelement);
                    else                    this.board.removePiece(cellLine, cellColumn);
                }

                this.state = this.gameStates.ANIM_START;
                break;
            case this.gameStates.ANIM_START:
                // Resets the time for the animations
                this.state = this.gameStates.ANIM_APPLY;
                break;
            case this.gameStates.ANIM_APPLY:
                if (!this.board.update(deltaTime)) {
                    if (++this.replayMove >= this.allMoves.length) {
                        this.event = this.eventTypes.GAME;
                        this.updateAnimations();
                    }
                    else {
                        this.state = this.gameStates.TURN;
                    }
                }
                break;
            default:
                break;
        }
    }
    
    /**
     * 
     * @param {*} deltaTime 
     */
    update(deltaTime) {
        switch(this.event) {
            case this.eventTypes.GAME:
                // Updates game state
                this.updateGame(deltaTime);
                break;
            case this.eventTypes.REPLAY:
                this.updateReplay(deltaTime);
                break;
            default:
                break;
        }
    }

    /**
     * 
     */
    display() {
        // Draw game (board)
        this.board.display();
        this.info.display();
    }
}