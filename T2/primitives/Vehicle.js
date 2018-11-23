/**
 * Vehicle class
 */
class Vehicle extends CGFobject {

    /**
     * Vehicle constructor.
     * 
     * @param {any} scene 
     */
    constructor(scene) {
        super(scene);

        this.new = new Cylinder2(this.scene, 10, 10, 10, 20, 20);
        this.buildObject();
    };

    buildObject() {

        this.nose = new Patch(
            this.scene, 2, 6, 20, 20, [
            this.circleVertexes([0, -0.75, 14], 0.01),
            this.circleVertexes([0, -0.25, 12], 1),
            this.circleVertexes([0, 0, 10], 1.5)
        ]);

        this.pilot = new Patch(
            this.scene, 2, 6, 20, 20, [
            this.circleVertexes([0, 0, 10], 1.5),
            this.circleVertexes([0, 1, 6], 2.5),
            this.circleVertexes([0, 0.5, 4], 2)
        ]);

        this.base = new Cylinder2(
            this.scene,
            1,
            1,
            12,
            20,
            20
        );

        this.tail = new Patch(
            this.scene, 3, 6, 20, 20, [
            this.circleVertexes([0, 0.5, 4], 2),
            this.circleVertexes([0, 0.25, 2], 1.75),
            this.circleVertexes([0, 0.25, 0], 1.75),
            this.circleVertexes([0, 0.25, -8], 1.75)
        ]);

        this.burst = new Patch(
            this.scene, 1, 6, 20, 20, [
            this.circleVertexes([0, 0.25, -8], 1.75),
            this.circleVertexes([0, 0.25, -10], 1.5)
        ]);

        this.leftWing = new Patch(
            this.scene, 1, 1, 20, 20, [
            [
                [-1, 0, 1, 1],
                [-1, 0, -1, 1]
            ],
            [
                [-0.5, 0, 1, 1],
                [1, 0, -1, 1]
            ]
        ]);

        this.rightWing = new Patch(
            this.scene, 1, 1, 20, 20, [
            [
                [-1, 0, 1, 1],
                [-1, 0, -1, 1]
            ],
            [
                [1, 0, 1, 1],
                [-0.5, 0, -1, 1]
            ]
        ]);

        this.leftFlat = new Patch(
            this.scene, 1, 1, 20, 20, [
            [
                [-1, 0, 1, 1],
                [-0.5, 0, -1, 1]
            ],
            [
                [1, 0, 1, 1],
                [0.5, 0, -1, 1]
            ]
        ]);

        this.rightFlat = new Patch(
            this.scene, 1, 1, 20, 20, [
            [
                [-0.5, 0, 1, 1],
                [-1, 0, -1, 1]
            ],
            [
                [0.5, 0, 1, 1],
                [1, 0, -1, 1]
            ]
        ]);
    }

    circleVertexes(center, radius) {
        return [
            [center[0] + radius, center[1] + 0, center[2], 1],
            [center[0] + radius, center[1] + radius * 4.0 / 3.0, center[2], 1],
            [center[0] - radius, center[1] + radius * 4.0 / 3.0, center[2], 1],
            [center[0] - radius, center[1] + 0, center[2], 1],
            [center[0] - radius, center[1] + radius * -4.0 / 3.0, center[2], 1],
            [center[0] + radius, center[1] + radius * -4.0 / 3.0, center[2], 1],
            [center[0] + radius, center[1] + 0, center[2], 1]
        ];
    }

    /**
	 * Vehicle display function
	 */
    display() {
        this.displayFusilage();
        this.displayFrontalWings();
        this.displayBackWings();
        this.displayFlats();

    }

    displayFusilage() {
        this.nose.display();
        this.pilot.display();
        this.tail.display();
        this.burst.display();

        this.scene.pushMatrix();       
            this.scene.scale(1.1, 0.75, 1.2);  
            this.scene.translate(0.5, -1.0, -7); 
            this.base.display();
        this.scene.popMatrix();
    }

    displayFrontalWings() {
        // Left wing 
        this.scene.pushMatrix();    
            this.scene.scale(5, 1, 5);     
            this.scene.translate(-1.15, 0, 0); 
            this.scene.rotate(-Math.PI/2, 0, 1, 0); 
            this.leftWing.display();
        this.scene.popMatrix();

        // Left wing - Reverse
        this.scene.pushMatrix(); 
            this.scene.rotate(Math.PI, 0, 0, 1);   
            this.scene.scale(5, 1, 5);     
            this.scene.translate(1.15, 0, 0); 
            this.scene.rotate(-Math.PI/2, 0, 1, 0); 
            this.rightWing.display();
        this.scene.popMatrix();

        // Right wing
        this.scene.pushMatrix();    
            this.scene.scale(5, 1, 5);     
            this.scene.translate(1.35, 0, 0); 
            this.scene.rotate(-Math.PI/2, 0, 1, 0); 
            this.rightWing.display();
        this.scene.popMatrix();

        // Right wing - Reverse
        this.scene.pushMatrix(); 
            this.scene.rotate(Math.PI, 0, 0, 1);   
            this.scene.scale(5, 1, 5);     
            this.scene.translate(-1, 0, 0); 
            this.scene.rotate(-Math.PI/2, 0, 1, 0); 
            this.leftWing.display();
        this.scene.popMatrix();
    }

    displayBackWings() {
        // Left wing 
        this.scene.pushMatrix();    
            this.scene.scale(2, 1, 2);     
            this.scene.translate(-1.4, 0, -4); 
            this.scene.rotate(-Math.PI/2, 0, 1, 0); 
            this.leftWing.display();
        this.scene.popMatrix();

        // Left wing - Reverse
        this.scene.pushMatrix(); 
            this.scene.rotate(Math.PI, 0, 0, 1);   
            this.scene.scale(2, 1, 2);     
            this.scene.translate(1.4, 0, -4); 
            this.scene.rotate(-Math.PI/2, 0, 1, 0); 
            this.rightWing.display();
        this.scene.popMatrix();

        // Right wing
        this.scene.pushMatrix();    
            this.scene.scale(2, 1, 2);     
            this.scene.translate(1.75, 0, -4); 
            this.scene.rotate(-Math.PI/2, 0, 1, 0); 
            this.rightWing.display();
        this.scene.popMatrix();

        // Right wing - Reverse
        this.scene.pushMatrix(); 
            this.scene.rotate(Math.PI, 0, 0, 1);   
            this.scene.scale(2, 1, 2);     
            this.scene.translate(-1.75, 0, -4); 
            this.scene.rotate(-Math.PI/2, 0, 1, 0); 
            this.leftWing.display();
        this.scene.popMatrix();
        
        // Mid wing - Left side
        this.scene.pushMatrix(); 
            this.scene.rotate(-Math.PI/2, 0, 0, 1);    
            this.scene.scale(2, 1, 2);     
            this.scene.translate(-1.75, 0.25, -4); 
            this.scene.rotate(-Math.PI/2, 0, 1, 0); 
            this.leftWing.display();
        this.scene.popMatrix();

        // Mid wing - Right side
        this.scene.pushMatrix();  
            this.scene.rotate(Math.PI/2, 0, 0, 1);  
            this.scene.scale(2, 1, 2);     
            this.scene.translate(1.75, -0.25, -4); 
            this.scene.rotate(-Math.PI/2, 0, 1, 0); 
            this.rightWing.display();
        this.scene.popMatrix();
    }

    displayFlats() {
        // Left Flat
        this.scene.pushMatrix();            
            this.scene.translate(-1.05,-1.75, -6); 
            this.scene.rotate(Math.PI/4, 0, 0, 1); 
            this.scene.rotate(Math.PI/2, 0, 1, 0); 
            this.leftFlat.display();
        this.scene.popMatrix();

        // Left Flat - Reverse
        this.scene.pushMatrix();  
            this.scene.rotate(Math.PI, 0, 0, 1);          
            this.scene.translate(1.05,1.75, -6); 
            this.scene.rotate(Math.PI/4, 0, 0, 1); 
            this.scene.rotate(Math.PI/2, 0, 1, 0); 
            this.rightFlat.display();
        this.scene.popMatrix();

        // Right Flat 
        this.scene.pushMatrix();        
            this.scene.translate(1.75,-1.75, -6); 
            this.scene.rotate(-Math.PI/4, 0, 0, 1); 
            this.scene.rotate(Math.PI/2, 0, 1, 0); 
            this.rightFlat.display();
        this.scene.popMatrix();

        // Right Flat - Reverse
        this.scene.pushMatrix();         
            this.scene.rotate(Math.PI, 0, 0, 1);    
            this.scene.translate(-1.75, 1.75, -6); 
            this.scene.rotate(-Math.PI/4, 0, 0, 1); 
            this.scene.rotate(Math.PI/2, 0, 1, 0); 
            this.leftFlat.display();
        this.scene.popMatrix();

    }
}