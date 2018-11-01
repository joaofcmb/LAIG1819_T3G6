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
            vec3.subtract(direction, controlPoints[i + 1], controlPoints[i]);
            vec3.normalize(direction, direction);

            var distance = vec3.distance(controlPoints[i], controlPoints[i + 1]);

            this.segmentDirections.push(direction);
            this.segmentDistances.push(distance);
            this.totalDistance += distance;
        }

        this.segmentI = 0;
        this.accDistance = 0;
    }
    
    update(deltaTime) {
        if (this.segmentI >= this.segmentDistances.length)     return deltaTime;

        // Add the current delta distance to the accumulated distance and check if there's a change in segment
        this.accDistance += this.totalDistance * deltaTime / this.span;

        while (this.accDistance >= this.segmentDistances[this.segmentI]) {
            this.accDistance -= this.segmentDistances[this.segmentI];
            this.segmentI++;
        }

        // Knowing the current segment, get translation vector to the start of that segment plus the remaining accumulated distance in that segment's direction
        var animTranslationVector = vec3.create();
        vec3.copy(animTranslationVector, this.controlPoints[this.segmentI]);

        var direction, remainingDeltaTime;
        if (this.segmentI >= this.segmentDirections.length) { // delta surpasses animation end, calculate remainingDelta and use last segment's direction as orientation ref
            remainingDeltaTime = this.accDistance * this.span / this.totalDistance;
            direction = this.segmentDirections[this.segmentDirections.length - 1];  
        }
        else {
            remainingDeltaTime = 0;
            direction = this.segmentDirections[this.segmentI];

            var segmentAcc = vec3.create();
            vec3.scale(segmentAcc, direction, this.accDistance);
            
            vec3.add(animTranslationVector, animTranslationVector, segmentAcc);

            vec3.normalize(direction, direction);
        }

        // Calculate current object orientation then apply it with the translation to the transformation matrix
        var horizontalAngle = direction[2] != 0 ? -Math.sign(direction[2]) * Math.acos(direction[0]) : Math.acos(direction[0]);

        mat4.identity(this.animTransform);
        mat4.translate(this.animTransform, this.animTransform, animTranslationVector);
        mat4.rotateY(this.animTransform, this.animTransform, Math.PI / 2 + horizontalAngle);

        return remainingDeltaTime;
    }
}