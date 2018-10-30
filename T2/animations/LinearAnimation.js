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

        while (this.accDistance >= this.segmentDistances[this.segmentI]) {
            this.accDistance -= this.segmentDistances[this.segmentI];
            this.segmentI++;
        }

        // Knowing the current segment, get translation vector to the start of that segment plus the remaining accumulated distance in that segment's direction
        var animTranslationVector = vec3.copy(this.controlPoints[this.segmentI]);

        // Retrieves the direction relative to the active segment
        var direction = this.segmentI > this.segmentDirections.length ? this.segmentDirections[this.segmentI - 1] : this.segmentDirections[this.segmentI];
        
        // Delta surpasses animation end, calculate remainingDelta and use last segment's direction as orientation ref
        var remainingDeltaTime = this.segmentI > this.segmentDirections.length ? this.accDistance * this.span / this.totalDistance : 0;

        // Adds to animTranslationVector, if necessary, the accumulated distance to be translated
        if (this.segmentI <= this.segmentDirections.length) {
            var segmentAcc = vec3.create();
            vec3.scale(segmentAcc, direction, this.accDistance);
            
            vec3.add(animTranslationVector, animTranslationVector, segmentAcc);
        }

        // Calculate current object orientation then apply it with the translation to the transformation matrix
        var horizontalAngle = Math.atan(direction[2] / direction[0]);

        mat4.fromRotation(this.animTransform, Math.PI / 2 + horizontalAngle, vec3.fromValues(0, 1, 0));
        mat4.translate(this.animTransform, this.animTransform, animTranslationVector);

        return remainingDeltaTime;
    }
}