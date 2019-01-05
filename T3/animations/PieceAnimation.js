/**
 * Piece Animation class
 * 
 * Used by the game board for the animations between pieces
 */
class PieceAnimation extends Animation {
    /**
     * Piece animation constructors
     * 
     * @param {Object} scene The active scene
     * @param {vec3} stackPos Start/Endpoint for the animated piece. Corresponds to its position in the stack 
     * @param {vec3} cellPos Start/Endpoint for the animated piece. Corresponds to its position on the board.
     * @param {String} type Determins whether the piece is being added to be board 'add' or removed from it by reset 'remove' or capture 'capture'
     */
    constructor(scene, stackPos, cellPos, type) {
        super(scene);
        this.type = type;

        var deltaVec = vec3.create();
        vec3.subtract(deltaVec, stackPos, cellPos);

        var h = deltaVec[1];
        deltaVec[1] = 0;
        var d = vec3.length(deltaVec);

        var smallR = (d + h - Math.sqrt(2) * h) / 2;
        var bigR = smallR + Math.sqrt(2) * h;

        var spanRatio = 3 * smallR / bigR;


        vec3.normalize(deltaVec, deltaVec);
        var rotAxis = vec3.fromValues(deltaVec[2], 0, -deltaVec[0]);

        var smallCenter = vec3.create();
        vec3.scale(smallCenter, deltaVec, -smallR); 
        vec3.add(smallCenter, stackPos, smallCenter);

        var bigCenter = vec3.create();
        vec3.scale(bigCenter, deltaVec, bigR);
        vec3.add(bigCenter, cellPos, bigCenter);

        this.currAnimation = 'first';
        switch(type) {
            case 'add':
                this.firstAnimation = new CircularAnimation(scene, 300 * spanRatio, smallCenter, smallR, 180, -135, rotAxis);
                this.secondAnimation = new CircularAnimation(scene, 300, bigCenter, bigR, 45, -45, rotAxis);
                break;
            case 'remove':
            case 'capture':
                this.firstAnimation = new CircularAnimation(scene, 300, bigCenter, bigR, 0, 45, rotAxis);
                this.secondAnimation = new CircularAnimation(scene, 300 * spanRatio, smallCenter, smallR, 45, 135, rotAxis);
                break;
        }
    }

    /**
     * Updates the animation's transformation matrix.
     * 
     * @param {number} deltaTime Time elapsed since last update in miliseconds
     * 
     * @returns {number} Returns 0 unless the end of the animation is reach. In that case, it returns the reminder of the available deltaTime.
     * 
     * @override Animation.update()
     */
    update(deltaTime) {
        var remainingDelta = this.firstAnimation.update(deltaTime);

        if (remainingDelta > 0) {
            this.currAnimation = 'second';
            remainingDelta = this.secondAnimation.update(remainingDelta);
        }

        return remainingDelta;
    }

    /**
     * Applies the current transformation matrix to the scene.
     * 
     * @override Animation.apply()
     */
    apply() {
        if (this.currAnimation == 'first')  this.firstAnimation.apply();
        else                                this.secondAnimation.apply();
    }
}
