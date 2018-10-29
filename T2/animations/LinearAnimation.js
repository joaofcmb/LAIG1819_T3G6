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

            var distance = distance(controlPoints[i], controlPoints[i + 1]);

            this.segmentDirections.push(direction);
            this.segmentDistances.push(distance);
            this.totalDistance += distance;
        }

        this.segmentI = 0;
        this.accDistance = 0;
    }
    
    update(deltaTime) {
        // TODO stop animation after reaching the end

        // Add the current delta distance to the accumulated distance and check if there's a change in segment
        this.accDistance += this.totalDistance * deltaTime / this.span;

        while (this.accDistance >= this.segmentDistances[segmentI]) {
            this.accDistance -= this.segmentDistances[segmentI];
            segmentI++;
        }

        // Knowing the current segment, get translation vector to the start of that segment plus the remaining accumulated distance in that segment's direction
        var direction = this.segmentDirections[segmentI];

        var segmentAcc = vec3.create();
        vec3.scale(segmentAcc, direction, this.accDistance);

        var animTranslationVector = vec3.create();
        vec3.add(animTranslationVector, this.controlPoints[segmentI], segmentAcc);

        // Calculate current object orientation then apply it with the translation to the transformation matrix
        var horizontalAngle = Math.atan(direction[2] / direction[0]);
        var verticalAngle = Math.atan(direction[1] / Math.sqrt(direction[0] * direction[0] + direction[2] * direction[2]));

        mat4.fromRotation(this.animTransform, verticalAngle, vec3.fromValues(0, 0, 1));
        mat4.rotate(this.animTransform, this.animTransform, -horizontalAngle, vec3.fromValues(0, 1, 0));
        mat4.translate(this.animTransform, this.animTransform, animTranslationVector);
    }
}