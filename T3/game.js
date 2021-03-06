/**
 * Pente game class
 */
class Game extends CGFobject {
    
    /**
     * Game class constructor.
     * 
     * @param {Object} scene 
     */
    constructor(scene, whiteCamID) {
        super(scene);
        this.whiteCamID = whiteCamID;
        this.cameraSpan = 700;

        // Game and Replay States
        this.eventTypes = {IDLE: 1, GAME: 2, REPLAY: 3};
        this.event = this.eventTypes.IDLE;

        this.gameStates = {IDLE: 1, PICKING: 2, TURN: 3, ANIM_START: 4, ANIM_APPLY: 5, CAMERA_START: 6, CAMERA_APPLY: 7};
        this.state = this.gameStates.IDLE;

        this.captureStates = {IDLE: 1, ANIM_ADD: 2, ANIM_SHADER: 3, ANIM_REMOVE: 4};
        this.captureState = this.captureStates.IDLE;

        this.difficulty = {}; this.difficulty = 'Easy';
        this.gameMode   = {}; this.gameMode   = 'Player vs Player';
        this.time       = {}; this.time       = 45;

        this.cameraOrientation = '1'; // Use piece ID to identify the current orientation
        this.cameraAxis = Object.freeze({X: vec3.fromValues(1, 0, 0), Y: vec3.fromValues(0, 1, 0), Z: vec3.fromValues(0, 0, 1)});

        this.board = new Board(scene);
        this.logic = new Logic();
        this.info = new Info(scene, this.time);

        this.currTime = 0;
        this.allMoves = [];
    }

    /**
     * Changes current active camera to the game camera.
     * 
     */
    initCamera() {
        if (this.scene.interface.Views != this.whiteCamID) {
            this.oldCam = this.scene.interface.Views;
            this.scene.interface.Views = this.whiteCamID;

            this.scene.updateCameras();

            // Dummy camera to disallow user input for the camera
            this.scene.interface.setActiveCamera(new CGFcamera(1, 1, 1, vec3.create(), vec3.fromValues(1, 1, 1)));
        }
    }
    
    /**
     * Initializes a new round for the game.
     */
    playGame() {
        if ([this.gameStates.CAMERA_APPLY, this.gameStates.ANIM_APPLY].includes(this.state)) {
            console.warn('Game cannot be restarted in the middle of animations.');
            return;
        }

        // Send init command 
        if (!this.logic.initGame()) {
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
        
        this.selectedMode = this.gameMode;
        this.selectedDifficulty = this.difficulty;
        this.info.initInfo(this.time);
        this.allMoves = [{
            differences: [], 
            currPlayer: {...this.currPlayer}, 
            nextPlayer: {...this.nextPlayer}
        }];

        // Reset board and initialize game camera
        this.board.reset();
        this.initCamera();

        // Initialize State Machine
        this.endGame = false;

        this.event = this.eventTypes.GAME,
        this.state = this.gameStates.ANIM_START;
    }

    /**
     * Exit's the current game, terminating server connection. 
     * 
     * The server is also shutdown from this command.
     */
    exitGame() {
        // Send init command 
        if (!this.logic.exitGame()) {
            console.warn("Game exit failed.")
            return;
        }
        
        console.log("Game Exit successful. Server closed.");

        
        this.scene.interface.Views = this.oldCam;
        this.scene.updateCameras();

        this.event = this.eventTypes.IDLE;
        this.state = this.gameStates.IDLE;
    }

    /**
     * Undoes made moves until the last player turn.
     */
    undo() {
        if (this.allMoves.length <= 1) {
            console.log("No moves to undo.");
            return;
        }
        if (this.event != this.eventTypes.GAME || ![this.gameStates.IDLE, this.gameStates.PICKING].includes(this.state) 
            || !this.humanPlayers.includes(this.currPlayer['playerID'])) {
            console.warn("Invalid use of undo (Must be used during your turn).");
            return;
        }

        var currNumUndo = 0;
        var numberOfUndos = this.selectedMode == 'Player vs Player' ? 1 : 2;

        while (currNumUndo < numberOfUndos) {
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

            this.currPlayer = lastMove['currPlayer'];
            this.nextPlayer = lastMove['nextPlayer'];

            // Updates player info on Info class
            if (this.currPlayer['piece'] == '1') 
                this.info.updatePlayersInfo(this.currPlayer, this.nextPlayer);
            else
                this.info.updatePlayersInfo(this.nextPlayer, this.currPlayer);

            currNumUndo++;
        }

        this.endGame = false;
        this.board.picking = false;
        this.state = this.gameStates.ANIM_START;
    }

    /**
     * Shows an animated replay of all the moves made throughout the current round.
     * 
     * The game returns to its state prior to the call.
     */
    replay() {
        if (this.allMoves.length <= 1) {
            console.log("No moves to replay.");
            return;
        }

        if (this.event != this.eventTypes.GAME || ![this.gameStates.IDLE, this.gameStates.PICKING].includes(this.state)) {
            console.warn("Invalid use of replay (Must be used during a game without an ongoing turn).");
            return;
        }

        // Resets board and changes to replay event
        this.board.reset();
        this.board.picking = false;

        this.event = this.eventTypes.REPLAY;
        this.state = this.gameStates.ANIM_START;

        this.replayMove = 0;
        this.info.resetPlayerInfo();
    }

    /**
     * Executes a move made by the player/AI.
     * 
     * @param {Number} pickId Id of the cell picked by the player.
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
     * Updates the game state, both board internal representation and player information.
     * 
     * @param {String} response Updated gamestate returned by the server.
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
                this.board.removePiece(cellLine, cellColumn, 'capture');                
        } 
        
        // Players information
        var playerInfo = response.match(/\].*/)[0].split(",")[1];
        
        this.allMoves.push({
            differences: diff,  
            currPlayer: {...this.currPlayer}, 
            nextPlayer: {...this.nextPlayer}
        });

        // Updates player information
        this.currPlayer['captures'] = Number(playerInfo.split("-")[0]);
        this.currPlayer['currSequence'] = Number(playerInfo.split("-")[1]);

        // In case a capture occurs
        if(diff.length > 1)
            this.nextPlayer['currSequence'] -= 2;
        
        // Switches between players
        this.swapPlayers();

        // Updates player info on Info class
        if (this.currPlayer['piece'] == '1') 
            this.info.updatePlayersInfo(this.currPlayer, this.nextPlayer);
        else
            this.info.updatePlayersInfo(this.nextPlayer, this.currPlayer);

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

    /**
     * Alternates between players
     */
    swapPlayers() {
        [this.currPlayer, this.nextPlayer] = [this.nextPlayer, this.currPlayer];
    }

    /**********************************/
    /***** STATE MACHINE (UPDATE) *****/
    /**********************************/

    /**
     * Updates the state of the game
     * 
     * @param {Number} deltaTime Time elapsed since last update in miliseconds
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
     * Updates the state of the current game round
     * 
     * @param {Number} deltaTime Time elapsed since last update in miliseconds
     */
    updateGame(deltaTime) {
        switch (this.state) {
            case this.gameStates.PICKING:
                // Updates move remaining time
                this.updateInfoTimer(deltaTime);

                this.pickId = this.scene.getPicks()[0];
                if (this.pickId--) {
                    if(this.allMoves.length == 1) {
                        if(this.pickId == 84) {
                            this.state = this.gameStates.TURN;
                            this.board.picking = false;
                        }
                        else {
                            console.log("First move must be made at the center of the board.")
                        }
                    } 
                    else {
                        this.state = this.gameStates.TURN;
                        this.board.picking = false;
                    }
                }
                break;
            case this.gameStates.TURN: 
                this.gameStep(this.pickId);
                this.state = this.gameStates.ANIM_START;
                break;
            case this.gameStates.ANIM_START:
                // Resets the time for the animations
                this.state = this.gameStates.ANIM_APPLY;
                this.captureState = this.captureStates.IDLE;
                break;
            case this.gameStates.ANIM_APPLY:
                // Handle captures differently if that's the case
                if (this.board.isCapture()) {
                    this.updateCapture(deltaTime);
                    break;
                }

                if (!this.board.update(deltaTime)) { // When there's no more animations, proceed to next state
                    if (this.scene["Camera Rotation"] && this.currPlayer.piece != this.cameraOrientation)  
                        this.state = this.gameStates.CAMERA_START;
                    else
                        this.updateTurn();
                }
                break;
            case this.gameStates.CAMERA_START:
                this.initCamera();
                this.elapsedSpan = 0;
                this.state = this.gameStates.CAMERA_APPLY;
                break;
            case this.gameStates.CAMERA_APPLY:
                this.scene.camera.orbit(this.cameraAxis, Math.PI * deltaTime / this.cameraSpan);

                this.elapsedSpan += deltaTime;
                if (this.elapsedSpan >= this.cameraSpan) {
                    this.scene.camera.orbit(this.cameraAxis, -Math.PI * (this.elapsedSpan - this.cameraSpan) / this.cameraSpan);
        
                    this.cameraOrientation = this.currPlayer.piece;
                    this.updateTurn();
                }
                break;
            default:
                break;
        }
    }

    /**
     * Updates the current replay state
     * 
     * @param {Number} deltaTime Time elapsed since last update in miliseconds
     */
    updateReplay(deltaTime) {
        switch (this.state) {
            case this.gameStates.TURN:
                for(var j = 0; j < this.allMoves[this.replayMove]['differences'].length; j++) {
                    var cellLine = this.allMoves[this.replayMove]['differences'][j]['line'];
                    var cellColumn = this.allMoves[this.replayMove]['differences'][j]['column'];
                    var cellelement = this.allMoves[this.replayMove]['differences'][j]['element'];
                    
                    if (cellelement != 0)   this.board.addPiece(cellLine, cellColumn, cellelement);
                    else                    this.board.removePiece(cellLine, cellColumn, 'capture');
                }

                this.state = this.gameStates.ANIM_START;
                break;
            case this.gameStates.ANIM_START:
                // Resets the time for the animations
                this.state = this.gameStates.ANIM_APPLY;
                this.captureState = this.captureStates.IDLE;
                break;
            case this.gameStates.ANIM_APPLY:
                // Handle captures differently if that's the case
                if (this.board.isCapture()) {
                    this.updateCapture(deltaTime);
                    break;
                }

                if (!this.board.update(deltaTime)) {
                    if (++this.replayMove >= this.allMoves.length) {
                        this.event = this.eventTypes.GAME;
                        this.swapPlayers();
                    }
                    else {
                        this.currPlayer = this.allMoves[this.replayMove].currPlayer;
                        this.nextPlayer = this.allMoves[this.replayMove].nextPlayer;

                        if (this.currPlayer['piece'] == '1') 
                            this.info.updatePlayersInfo(this.currPlayer, this.nextPlayer);
                        else
                            this.info.updatePlayersInfo(this.nextPlayer, this.currPlayer);

                        this.state = (this.scene["Camera Rotation"] && this.currPlayer.piece != this.cameraOrientation) ?
                            this.gameStates.CAMERA_START : this.gameStates.TURN;
                    }
                }
                break;
            case this.gameStates.CAMERA_START:
                this.initCamera();
                this.elapsedSpan = 0;
                this.state = this.gameStates.CAMERA_APPLY;
                break;
            case this.gameStates.CAMERA_APPLY:
                this.scene.camera.orbit(this.cameraAxis, Math.PI * deltaTime / this.cameraSpan);

                this.elapsedSpan += deltaTime;
                if (this.elapsedSpan >= this.cameraSpan) {
                    this.scene.camera.orbit(this.cameraAxis, -Math.PI * (this.elapsedSpan - this.cameraSpan) / this.cameraSpan);
        
                    this.cameraOrientation = this.currPlayer.piece;
                    this.state = this.gameStates.TURN;
                }
                break;
            default:
                break;
        }
    }

    /**
     * Updates the current capture animation state
     * 
     * @param {Number} deltaTime Time elapsed since last update in miliseconds
     */
    updateCapture(deltaTime) {
        switch(this.captureState) {
            case this.captureStates.IDLE:
                this.captureState = this.captureStates.ANIM_ADD;
                break;
            case this.captureStates.ANIM_ADD:
                if (!this.board.updateAdd(deltaTime)) {
                    this.elapsedSpan = 0;
                    this.board.shaking = true;
                    this.captureState = this.captureStates.ANIM_SHADER;
                }
                break;
            case this.captureStates.ANIM_SHADER:
                this.elapsedSpan += deltaTime;
                this.board.shakeUpdate(this.elapsedSpan);

                if (this.elapsedSpan > 500) {
                    this.board.shaking = false;
                    this.captureState = this.captureStates.ANIM_REMOVE;
                }
                break;
            case this.captureStates.ANIM_REMOVE:
                if (!this.board.updateCapture(deltaTime))
                    this.captureState = this.captureStates.IDLE;
                break;
        }
    }

    /**
     * Switches to next turn state, depending on the gamemode.
     * 
     */
    updateTurn() {
        this.info.resetTimer();

        if (this.endGame) {
            this.state = this.gameStates.IDLE;
            return;
        }

        if (this.humanPlayers.includes(this.currPlayer['playerID'])) {
            this.state = this.gameStates.PICKING;
            this.board.picking = true;
        }
        else {
            this.state = this.gameStates.TURN;
        }
    }
    
    /**
     * Updates the timer.
     * 
     * @param {Number} deltaTime Time elapsed since last update in miliseconds 
     */
    updateInfoTimer(deltaTime) {
        // Updates current time
        this.currTime += deltaTime; 
        
        // Determines how much time is passed (1s)
        if (this.currTime > 1000) {
            if(this.info.updateTimer()) {
                this.swapPlayers();
                this.state = this.gameStates.CAMERA_START;
            }
            this.currTime = 0;
        }        
    }


    /**
     * Displays the game.
     */
    display() {
        this.board.display();
        this.info.display();
    }
}