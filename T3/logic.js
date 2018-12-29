/**
 * Logic class 
 */
class Logic {

    /**
     * Logic class default constructor.
     */
    constructor() {
        this.initCMD = "startGame";
        this.exitCMD = "quit";
    }

    /**
     * Sends a request to the server and to return it's response.
     * 
     * @param {String} requestString 
     */
    makePrologRequest(requestString) {        
        var request = new XMLHttpRequest();

        request.open("GET", "http://localhost:8081/" + requestString, false);
        request.onerror = function () {
            console.log("Error waiting for response");
        };
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.send();
        
        return request.responseText;
    }

    /**
     * Establishes connection with the server.
     */
    initGame() {
        return this.makePrologRequest(this.initCMD);
    }

    /**
     * Terminates connection with the server.
     */
    exitGame() {
        return this.makePrologRequest(this.exitCMD);
    }

    /**
     * Builds a custom request string with all information needed to perform a move and send it to the server.
     * 
     * @param {Array} board 
     * @param {Object} currPlayer 
     * @param {Object} nextPlayer 
     * @param {Number} line 
     * @param {Number} column 
     */
    gameStep(board, currPlayer, nextPlayer, line, column) {
        // Build request string
        var requestString = "gameStep(" + this.buildBoardString(board) + "," 
                                        + this.buildPlayerString(currPlayer) + ","  
                                        + this.buildPlayerString(nextPlayer);
        // Needed for player moves                                        
        if(line && column) {
            requestString += ","  + line + "," + column;
        }                                       
        
        return this.makePrologRequest(requestString + ")");
    }

    /**
     * Transforms an array of arrays into a string. It also inverts the board representation since it has opposite representations in server and client.
     * 
     * @param {Array} board 
     */
    buildBoardString(board) {
        var string = "[";
        for (var i = board.length - 1; i >= 0; i--) {
            string += "[" + board[i] + "]";
            string += i != 0 ? "," : "";
        }
        return string + "]";
    }

    /**
     * Builds a custom string that contains player information in a specific format.
     * 
     * @param {Object} player 
     */
    buildPlayerString(player) {
        return "player(" + player['playerID'] + ',' + player['piece'] + ',' + player['captures'] + ',' + player['currSequence'] + ")";
    }
}