/**
 * Linear Animation class
 */
class LinearAnimation extends Animation {
    constructor(scene, span, controlPoints) {
        super(scene);

        this.span = span;
        this.controlPoints = controlPoints;
        this.segmentDirections = [];
        this.segmentDistances = [];
        this.totalDistance = 0;

        for (var i = 0; i < controlPoints.length - 1; i++) {
            var direction = vec3.create();
            vec3.subtract(direction, controlPoints[i], controlPoints[i + 1]);

            var distance = vec3.distance(controlPoints[i], controlPoints[i + 1]);

            this.segmentDirections.push(direction);
            this.segmentDistances.push(distance);
            this.totalDistance += distance;
        }

        this.segmentI = 0;
        this.accDistance = 0;
    }
    
    update(deltaTime) {
        if (this.accDistance >= this.totalDistance)     return deltaTime;

        // Add the current delta distance to the accumulated distance and check if there's a change in segment
        this.accDistance += this.totalDistance * deltaTime / this.span;

        while (this.accDistance >= this.segmentDistances[segmentI]) {
            this.accDistance -= this.segmentDistances[segmentI];
            segmentI++;
        }


        // Knowing the current segment, get translation vector to the start of that segment plus the remaining accumulated distance in that segment's direction
        var animTranslationVector = vec3.copy(this.controlPoints[segmentI]);

        var direction, remainingDeltaTime;
        if (segmentI > this.segmentDirections.length) { // delta surpasses animation end, calculate remainingDelta and use last segment's direction as orientation ref
            remainingDeltaTime = this.accDistance * this.span / this.totalDistance;
            direction = this.segmentDirections[segmentI - 1];  
        }
        else {
            remainingDeltaTime = 0;
            direction = this.segmentDirections[segmentI];

            segmentAcc = vec3.create();
            vec3.scale(segmentAcc, direction, this.accDistance);
            
            vec3.add(animTranslationVector, animTranslationVector, segmentAcc);
        }

        // Calculate current object orientation then apply it with the translation to the transformation matrix
        var horizontalAngle = Math.atan(direction[2] / direction[0]);

        mat4.fromRotation(this.animTransform, horizontalAngle, vec3.fromValues(0, 1, 0));
        mat4.translate(this.animTransform, this.animTransform, animTranslationVector);

        return remainingDeltaTime;
    }
}