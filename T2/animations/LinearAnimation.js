/**
 * Linear Animation class
 */

class LinearAnimation extends Animation {
    constructor(scene, span, controlPoints) {
        super(scene);

        this.span = span;
        this.segmentDirections = [];
        this.segmentDistances = [];
        this.totalDistance = 0;

        for (var i = 0; i < this.controlPoints.length - 1; i++) {
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
        var animDirection = vec3.create();
        var deltaDistance;

        do {
            deltaDistance = 

        } while(deltaDistance > this.segmentDistances[segmentI])
    }
}