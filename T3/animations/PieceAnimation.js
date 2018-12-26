/**
 * Piece Animation class
 */
class PieceAnimation extends Animation {
    constructor(scene, stackPos, cellPos, type) {
        super(scene);

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
                this.firstAnimation = new CircularAnimation(scene, 1000 * spanRatio, smallCenter, smallR, 180, -135, rotAxis);
                this.secondAnimation = new CircularAnimation(scene, 1000, bigCenter, bigR, 45, -45, rotAxis);
                break;
        }
    }

    update(deltaTime) {
        var remainingDelta = this.firstAnimation.update(deltaTime);

        if (remainingDelta > 0) {
            this.currAnimation = 'second';
            remainingDelta = this.secondAnimation.update(remainingDelta);
        }

        return remainingDelta;
    }

    apply() {
        if (this.currAnimation == 'first')  this.firstAnimation.apply();
        else                                this.secondAnimation.apply();
    }
}
