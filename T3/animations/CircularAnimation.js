/**
 * Circular Animation class
 */
class CircularAnimation extends Animation {

    /**
     * Circular Animation constructor.
     * 
     * @param {any} scene
     * @param {number} span
     * @param {vec3} center
     * @param {number} radius
     * @param {number} startAng
     * @param {number} rotAng
     */
    constructor(scene, span, center, radius, startAng, rotAng, rotAxis = vec3.fromValues(0, 1, 0)) {
        super(scene);

        this.span = span;

        this.center = center;
        this.radius = radius;

        this.rotAxis = vec3.create();
        vec3.normalize(this.rotAxis, rotAxis);

        this.startAng = startAng * Math.PI / 180;
        this.rotAng = rotAng * Math.PI / 180;
        this.endAng = this.startAng + this.rotAng;

        this.currAng = this.startAng;
    }
    
    /**
     * Updates the animation's transformation matrix.
     * 
     * @param {number} deltaTime
     */
    update(deltaTime) {
        if (Math.abs(this.currAng - this.startAng) >= Math.abs(this.rotAng))     return deltaTime;

        this.currAng += this.rotAng * deltaTime / this.span;

        // Check if delta surpassed the end of the animation and calculate the remainder
        var remainingDeltaTime = 0;
        
        if (Math.abs(this.currAng - this.startAng) >= Math.abs(this.rotAng)) {
            remainingDeltaTime = (this.currAng - this.endAng) * this.span / this.rotAng;
            this.currAng = this.endAng;
        }

        /* // Calculate Translation Vector (Center + rotationTranslation)
        var animTranslationVector = vec3.create();
        vec3.copy(animTranslationVector, this.center);

        vec3.add(animTranslationVector, animTranslationVector, vec3.fromValues(this.radius * Math.cos(this.currAng), 0, -this.radius * Math.sin(this.currAng)));

        // Calculate current object orientation (Assuming front of object is on the positive Z axis) then apply it with the translation to the transformation matrix
        mat4.identity(this.animTransform);
        mat4.translate(this.animTransform, this.animTransform, animTranslationVector);
        mat4.rotateY(this.animTransform, this.animTransform, Math.PI + this.currAng); */

        mat4.identity(this.animTransform);
        mat4.translate(this.animTransform, this.animTransform, this.center);
        mat4.rotate(this.animTransform, this.animTransform, this.currAng, this.rotAxis);
        mat4.translate(this.animTransform, this.animTransform, vec3.fromValues(this.radius * this.rotAxis[2], 0, this.radius * -this.rotAxis[0]));
        
        return remainingDeltaTime;
    }
}