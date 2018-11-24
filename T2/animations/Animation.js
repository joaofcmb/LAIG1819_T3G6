/**
 * Abstract animation class
 * 
 * Describes the functionality shared by all animation types, describing therefore its interface.
 */
class Animation {
    /**
     * Sets up the necessary elements for the functionality meant to be extended by the particular animation classes.
     * 
     * Should only be called by its children.
     * 
     * @param {any} scene
     */

    constructor(scene) {
        this.scene = scene;
        this.animTransform = mat4.create();
    }

    /**
     * Updates the animation's transformation matrix.
     * 
     * This particular functionality must be implemented by each animation.
     * 
     * @param {number} deltaTime Time since last update in microseconds.
     * 
     * @returns {number} Returns 0 unless the end of the animation is reach. In that case, it returns the reminder of the available deltaTime.
     */
    update(deltaTime) {
        throw new Error('Attempt to call abstract class (Animation -> update())');
    }

    /**
     * Applies the current transformation matrix to the scene.
     */
    apply() {
        this.scene.multMatrix(this.animTransform);
    }
}