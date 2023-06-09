import {CGFobject} from '../lib/CGF.js';

/**
 * MySphere
 * @constructor
 * @param scene - Reference to MyScene object
 * @param slices - number of divisions around the Y axis
 * @param stacks - number of divisions along the Y axis
 * @param drawInsideOut - draw sphere so its only visible from the inside
 * @param texMult - makes texture be drawn more times
 */
export class MySphere extends CGFobject {
	constructor(scene, slices, stacks, drawInsideOut, texMult) {
		super(scene);

		this.slices = slices;
		this.stacks = stacks;
    this.drawInsideOut = drawInsideOut;
		this.texMult = texMult;

		this.initBuffers();
	}
	
	initBuffers() {

		    this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        this.stacks = this.stacks*2;// actual number of stacks should be doubled if we want to draw up and down

        var alpha = 0;
        var beta = 0;
        var alphaAng = Math.PI / this.stacks;
        var betaAng = (2 * Math.PI) / this.slices;

        for (let lat = 0; lat <= this.stacks; lat++) {
            var sinAlpha = Math.sin(alpha);
            var cosAlpha = Math.cos(alpha);
      
            beta = 0;
            for (let long = 0; long <= this.slices; long++) {
              var x = Math.cos(beta) * sinAlpha;
              var y = cosAlpha;
              var z = Math.sin(-beta) * sinAlpha;
              this.vertices.push(x, y, z);
              this.texCoords.push(long/this.slices*this.texMult, lat/this.stacks*this.texMult);
              
              //this.texCoords.push( lat/this.stacks,long/this.slices);

              if (lat < this.stacks && long < this.slices) {
                var current = lat * (this.slices + 1) + long;
                var next = current + this.slices + 1;
                
                if(this.drawInsideOut === true){
                    this.indices.push( current, current + 1, next,
                                    next, current + 1, next + 1);
                }
                else{
                    this.indices.push( current + 1, current, next,
                                       current + 1, next, next +1);
                }
                          
              }

              if(this.drawInsideOut) {
                this.normals.push(x, y, z);
              }
              else {
                  this.normals.push(-x, -y, -z);
              }
              beta += betaAng;
      
              
            }
            alpha += alphaAng;
          }


        //The defined indices (and corresponding vertices)
		//will be read in groups of three to draw triangles
		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	}

    updateBuffers(){
        // reinitialize buffers
        this.initBuffers();
        this.initNormalVizBuffers();
    }

    setLineMode() { 
		this.indices=this.indicesLines;
		this.primitiveType=this.scene.gl.LINES;
	};

    setFillMode() { 
		this.indices=this.indicesTris;
		this.primitiveType=this.scene.gl.TRIANGLES;
	}

}
