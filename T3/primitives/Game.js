/**
 * Pente game class
 */

class Game extends CGFobject {
    constructor(scene) {
        super(scene);

        this.initGame();

        this.board = new Board(scene);
    }

    /**
     * Initializes the game state
     */
    initGame() {
        this.state = 'white';
    }

    /**
     * Adds a piece to the board
     * 
     * @param {number} cellId id of the cell where the piece is added to
     */
    addPiece(cellId) {
        this.board.addPiece(cellId);
    }

    display() {
        // Detect picking from board
        var pickId = this.scene.getPicks()[0];
        if (pickId) this.addPiece(pickId);

        // Draw game (board)
        this.board.display();
    }
}