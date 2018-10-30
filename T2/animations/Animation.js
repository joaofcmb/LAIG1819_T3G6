/**
 * Animation class
 */
class Animation {
    constructor(scene) {
        this.scene = scene;
        this.animTransform = mat4.create();
    }

    update(deltaTime) {
        throw new Error('Attempt to call abstract class (Animation -> update())');
    }

    apply() {
        this.scene.multMatrix(animTransform);
    }
}