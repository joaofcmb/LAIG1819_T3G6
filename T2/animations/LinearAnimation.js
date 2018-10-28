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
    }
    
    update(deltaTime) {
        var segmentI = 0;
        var deltaDistance = this.totalDistance * deltaTime / this.span;

        while (deltaDistance >= this.segmentDistances[segmentI]) {
            deltaDistance -= this.segmentDistances[segmentI];
            segmentI++;
        }
        
        var direction = this.segmentDirections[segmentI];

        // Knowing the current segment, get translation vector starting on the start of that segment, adding the remaining delta direction
        var segmentDelta = vec3.create();
        vec3.scale(segmentDelta, direction, deltaDistance);

        var animTranslationVector = vec3.create();
        vec3.add(animTranslationVector, this.controlPoints[segmentI], segmentDelta);

        // Calculate current object orientation
        var horizontalAngle = Math.atan(direction[2] / direction[0]);
        var verticalAngle = Math.atan(direction[1] / Math.sqrt(direction[0] * direction[0] + direction[2] * direction[2]));

        mat4.fromRotation(this.animTransform, verticalAngle, vec3.fromValues(0, 0, 1));
        mat4.rotate(this.animTransform, this.animTransform, -horizontalAngle, vec3.fromValues(0, 1, 0));
        mat4.translate(this.animTransform, this.animTransform, animTranslationVector);
    }
}