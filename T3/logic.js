/**
 * 
 */
class Logic {

    constructor() {
        this.initCMD = "startGame";
        this.exitCMD = "quit";
    }

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

    initGame() {
        return this.makePrologRequest(this.initCMD);
    }

    exitGame() {
        return this.makePrologRequest(this.exitCMD);
    }

    gameStep(board, currPlayer, nextPlayer, line, column) {
        // Build request string
        var requestString = "gameStep(" + this.buildBoardString(board) + "," 
                                        + this.buildPlayerString(currPlayer) + ","  
                                        + this.buildPlayerString(nextPlayer);
        // Needed for player moves                                        
        if(line && column) {
            requestString += ","  + line + "," + column;
        }                                       
        console.log(requestString);
        return this.makePrologRequest(requestString + ")");
    }

    buildBoardString(board) {
        var string = "[";
        for (var i = board.length - 1; i >= 0; i--) {
            string += "[" + board[i] + "]";
            string += i != 0 ? "," : "";
        }
        return string + "]";
    }

    buildPlayerString(player) {
        return "player(" + player['playerID'] + ',' + player['piece'] + ',' + player['captures'] + ',' + player['currSequence'] + ")";
    }

}