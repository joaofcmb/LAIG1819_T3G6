/**
 * Vehicle class
 */
class Vehicle extends CGFobject {

    /**
     * Vehicle constructor.
     * 
     * @param {any} scene
     * @param {any} data 
     */
    constructor(scene, data) {
        super(scene);

        this.data = data;
        this.new = new Cylinder2(this.scene, 10, 10, 10, 20, 20);
        this.buildObject();

        this.fusilageTexture = new CGFtexture(scene, this.data.textures["camo"]);
        this.glassTexture = new CGFtexture(scene, this.data.textures["glass"]);
        this.steelTexture = new CGFtexture(scene, this.data.textures["steel"]);
        this.flameTexture = new CGFtexture(scene, this.data.textures["flame"]);
    };

    /**
     * Builds object parts.
     */
    buildObject() {

        this.nose = new Patch(
            this.scene, 2, 6, 20, 20, [
            this.circleVertexes([0, -0.75, 14], 0.01),
            this.circleVertexes([0, -0.25, 12], 1),
            this.circleVertexes([0, 0, 10], 1.5)
        ]);

        this.cockpit = new Patch(
            this.scene, 2, 6, 20, 20, [
            this.circleVertexes([0, 0, 10], 1.5),
            this.circleVertexes([0, 1, 6], 2.5),
            this.circleVertexes([0, 0.5, 4], 2)
        ]);

        this.cockpitGlass = new Patch(
            this.scene, 2, 6, 20, 20, [
            this.circleVertexes([0, 0, 10], 1.5),
            this.circleVertexes([0, 1.2, 6], 2.5),
            this.circleVertexes([0, 0.52, 4], 2)
        ]);

        this.base = new Cylinder2(
            this.scene,
            1,
            1,
            12,
            20,
            20
        );

        this.baseCover = new MyCircle(this.scene, 1, 100);

        this.tail = new Patch(
            this.scene, 4, 6, 20, 20, [
            this.circleVertexes([0, 0.5, 4], 2),
            this.circleVertexes([0, 0.25, 2], 1.75),
            this.circleVertexes([0, 0.25, 0], 1.75),
            this.circleVertexes([0, 0.25, -4], 1.75),
            this.circleVertexes([0, 0.25, -8], 1.75)
        ]);

        this.burst = new Patch(
            this.scene, 1, 6, 20, 20, [
            this.circleVertexes([0, 0.25, -8], 1.75),
            this.circleVertexes([0, 0.25, -10], 1.5)
        ]);

        this.burstCover = new MyCircle(this.scene, 1.25, 100);

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

        this.missile = new Patch(
            this.scene, 3, 6, 20, 20, [
            this.circleVertexes([0, 0, 14], 0.1),
            this.circleVertexes([0, 0, 10], 2),
            this.circleVertexes([0, 0, 8], 2),
            this.circleVertexes([0, 0, 0], 2)
        ]);

        this.missileFlats = new Plane(
            this.scene,
            20,
            20
        );
    }

    /**
     * Auxilary function to produce circle nurb.
     * 
     * @param {Array} center 
     * @param {Number} radius 
     */
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
        this.scene.pushMatrix();
            this.scene.scale(.05, .05, .05);           
            
            this.fusilageTexture.bind(0);

            this.displayFusilage();
            this.displayFrontalWings();
            this.displayBackWings();
            this.displayFlats();        
            this.displayMissiles(1, 0);
            this.displayMissiles(-1, 1.25);

        this.scene.popMatrix();
    }

    /**
     * Displays fusilage.
     */
    displayFusilage() {
        this.nose.display();
        this.cockpit.display();
        this.tail.display();
        this.burst.display();

        this.scene.pushMatrix();       
            this.scene.scale(0.75, 0.75, 1.2);  
            this.scene.translate(0.5, -1.0, -7);
            this.base.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();       
            this.scene.scale(0.75, 0.75, 1.2);  
            this.scene.translate(0.5, -1.025, -7);
            this.scene.rotate(Math.PI, 1, 0, 0);  
            this.baseCover.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();       
            this.scene.scale(0.75, 0.75, 1.2);  
            this.scene.translate(0.5, -1.025, 5);
            this.baseCover.display();
        this.scene.popMatrix();

        this.flameTexture.bind(0);
        this.scene.pushMatrix();       
            this.scene.scale(0.925, 1, 1); 
            this.scene.translate(0.35, 0.25, -9.75); 
            this.scene.rotate(Math.PI, 1, 0, 0);  
            this.burstCover.display();
        this.scene.popMatrix();

        this.glassTexture.bind(0);
        this.cockpitGlass.display();
        
        this.fusilageTexture.bind(0);
    }

    /**
     * Displays frontal wings.
     */
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
            this.scene.translate(-1.35, 0, 0); 
            this.scene.rotate(-Math.PI/2, 0, 1, 0); 
            this.leftWing.display();
        this.scene.popMatrix();
    }

    /**
     * Displays back wings.
     */
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

    /**
     * Displays flats.
     */
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

    /**
     * Displays missiles.
     * 
     * @param {Number} translateFactor 
     * @param {Number} offset 
     */
    displayMissiles(translateFactor, offset) {
        this.steelTexture.bind(0);

        this.scene.pushMatrix();              
            this.scene.translate(translateFactor*-10.5 + offset, 0, -5.5); 
            this.scene.scale(0.25, 0.25, 0.5);                         
            this.missile.display();            
        this.scene.popMatrix();

        this.scene.pushMatrix();            
            this.scene.translate(translateFactor*-10.5 + offset, 0, -5.5);           
            this.scene.scale(1, 1, 0.25); 
            this.scene.rotate(Math.PI/4, 0, 0, 1); 
            this.missileFlats.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();            
            this.scene.translate(translateFactor*-10.5 + offset, 0, -5.5); 
            this.scene.rotate(Math.PI, 0, 0, 1); 
            this.scene.scale(1, 1, 0.25); 
            this.scene.rotate(Math.PI/4, 0, 0, 1); 
            this.missileFlats.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();            
            this.scene.translate(translateFactor*-10.5 + offset, 0, -5.5); 
            this.scene.scale(1, 1, 0.25); 
            this.scene.rotate(- Math.PI/4, 0, 0, 1); 
            this.missileFlats.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();            
            this.scene.translate(translateFactor*-10.5 + offset, 0, -5.5); 
            this.scene.rotate(Math.PI, 0, 0, 1); 
            this.scene.scale(1, 1, 0.25); 
            this.scene.rotate(- Math.PI/4, 0, 0, 1); 
            this.missileFlats.display();
        this.scene.popMatrix();

        this.fusilageTexture.bind(0);
    }
}