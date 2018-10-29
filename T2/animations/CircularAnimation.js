/**
 * Circular Animation class
 */

class CircularAnimation extends Animation {
    constructor(scene, span, center, radius, startAng, rotAng) {
        super(scene);

        this.span = span;

        this.center = center;
        this.radius = radius;

        this.startAng = startAng * Math.PI / 180;
        this.rotAng = rotAng * Math.PI / 180;
        this.endAng = this.startAng + this.rotAng;

        this.currAng = this.startAng;
    }
    
    update(deltaTime) {
        if (this.currAng >= this.endAng)     return;

        this.currAng += this.rotAng * deltaTime / this.span;
        this.currAng = Math.min(this.currAng, this.endAng);

        // Calculate Translation Vector (Center + rotationTranslation)
        var animTranslationVector = vec3.copy(this.center);
        vec3.add(animTranslationVector, animTranslationVector, vec3.fromValues(this.radius * Math.cos(this.currAng), 0, this.radius * Math.sin(this.currAng)));

        // Calculate current object orientation (Assuming front of object is on the positive Z axis) then apply it with the translation to the transformation matrix
        mat4.fromRotation(this.animTransform, Math.PI / 2 + this.currAng, vec3.fromValues(0, 1, 0));
        mat4.translate(this.animTransform, this.animTransform, animTranslationVector);
    }
}