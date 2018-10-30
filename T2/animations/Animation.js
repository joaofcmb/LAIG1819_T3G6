/**
 * Animation class
 */
class Animation {
    constructor(scene) {
        this.scene = scene;
        this.animTransform = mat4.create();
    }

    /**
     * Called from the scene to update the current Transformation Matrix, indicating the time passed since the last update.
     * 
     * @param {number} deltaTime 
     * 
     * @returns {number} Returns 0 unless the end of the animation is reach. In that case, it returns the reminder of the available deltaTime.
     */
    update(deltaTime) {
        throw new Error('Attempt to call abstract class (Animation -> update())');
    }

    apply() {
        this.scene.multMatrix(this.animTransform);
    }
}