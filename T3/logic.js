/**
 * 
 */
class Logic {

    constructor(game) {
        this.game = game;
        this.initCMD = "startGame";
        this.exitCMD = "quit";
    }

    makePrologRequest(requestString) {
        var game = this.game;
        var request = new XMLHttpRequest();

        request.open("GET", "http://localhost:8081/" + requestString, false);
        request.onload = function (data) {
            if (data.target.response == "success") {
                game.state = requestString == "startGame" ? true : game.state;
                game.state = requestString == "quit" ? false : game.state;
            }
            console.log("Request successful.");
        };
        request.onerror = function () {
            game.state = false;
            console.log("Error waiting for response");
        };
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.send();
    }

    initGame() {
        if (!this.game.state) {
            console.log("Command: Play Game !");
            this.makePrologRequest(this.initCMD);
        } else {
            console.log("Invalid Command: Game In Progress !");
        }

    }

    exitGame() {
        if (this.game.state) {
            console.log("Command: Exit Game !");
            this.makePrologRequest(this.exitCMD);
        } else {
            console.log("Invalid Command: Available Only When A Game Is In Progress !");
        }
    }

    gameStep(board, currPlayer, nextPlayer, line, column) {
        // Build request string
        var requestString = "gameStepPlayer(" + this.buildBoardString(board) + "," 
                                        + this.buildPlayerString(currPlayer) + ","  
                                        + this.buildPlayerString(nextPlayer) + ","  + line + "," + column
                                    +")";

        console.log(requestString); // gameStep(Board, CurrPlayer, NextPlayer, Line, Column)
        this.makePrologRequest(requestString);
    }

    buildBoardString(board) {
        var string = "[";
        for (var i = 0; i < board.length; i++) {
            string += "[" + board[i] + "]";
            string += i != (board.length - 1) ? "," : "";
        }
        return string + "]";
    }

    buildPlayerString(player) {
        return "player(" + player['playerID'] + ',' + player['piece'] + ',' + player['captures'] + ',' + player['currSequence'] + ")";
    }

}