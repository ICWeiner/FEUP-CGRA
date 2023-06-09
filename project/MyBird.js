import {CGFobject, CGFappearance, CGFtexture} from '../lib/CGF.js';
import { MySphere } from "./MySphere.js";
import { MyCone } from "./MyCone.js";
import { MyUnitCube } from "./MyUnitCube.js";
import { MyWing } from './MyWing.js';
import { MyTriangleTail } from './MyTriangleTail.js';


/**
 * MyBird
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyBird extends CGFobject {//Gaspar
	constructor(scene) {
		super(scene);

        this.orientation = 0;
        this.speed = 0;
        this.scale = 1;
        this.position = [];
        this.position.x = 0;
        this.position.y = 0;
        this.position.z = 0;
        this.maxSpeed = 3;

        this.bodySphere = new MySphere(this.scene,10,15,false,6);;
        this.headSphere = new MySphere(this.scene,10,15,false,4);
        this.beakCone = new MyCone(this.scene,10,3);
        this.leftEyeCube = new MyUnitCube(this.scene);
        this.rightEyeCube = new MyUnitCube(this.scene);
        this.leftWing = new MyWing(this.scene);
        this.rightWing = new MyWing(this.scene);
        this.tailTriangle = new MyTriangleTail(this.scene);

        this.scene.enableTextures(true);
        this.birdTexture = new CGFtexture(this.scene, "images/textura_do_gaspar.jpg");

        this.animVal = 0;
        this.rotateAngle = 0;
        this.animAng = 0;

        this.startTime = 0;
        this.initY = 0;
        this.isCatching = false;
        this.animDuration = 2;
        this.pickedUpEgg = null; //referência ao ovo apanhado
        this.pickUpMargin = 2;
        this.dropEggMargin = 10;
        this.initMaterials(this.scene);
        this.initBuffers();

	}

    initMaterials(scene) {

        this.birdAppearance = new CGFappearance(scene);
        this.birdAppearance.setTexture(this.birdTexture);
        this.birdAppearance.setTextureWrap('REPEAT', 'REPEAT');
        this.birdAppearance.setAmbient(10.0, 10.0, 10.0, 1.0);
        this.birdAppearance.setDiffuse(0.8, 0.8, 0.8, 1.0);
        this.birdAppearance.setSpecular(0.8, 0.8, 0.8, 1.0);

        this.tailAppearance = new CGFappearance(scene);
        this.tailAppearance.setTexture(this.birdTexture);
        this.tailAppearance.setTextureWrap('REPEAT', 'REPEAT');
        this.tailAppearance.setAmbient(4.0, 0, 0, 1.0);
        this.tailAppearance.setDiffuse(0, 0, 0, 1.0);
        this.tailAppearance.setSpecular(0.8, 0, 0, 1.0);

        this.beakMaterial = new CGFappearance(scene);
        this.beakMaterial.setAmbient(4, 4, 0, 1.0);
        this.beakMaterial.setDiffuse(0, 0, 0, 1.0);
        this.beakMaterial.setSpecular(0, 0, 0, 1.0);
        this.beakMaterial.setShininess(10.0);

        this.eyesMaterial = new CGFappearance(scene);
        this.eyesMaterial.setAmbient(0.5, 1, 0.5, 1.0);
        this.eyesMaterial.setDiffuse(0, 0, 0, 1.0);
        this.eyesMaterial.setSpecular(0, 0, 0, 1.0);
        this.eyesMaterial.setShininess(10.0);

    }

    turn(v) {
        this.orientation = this.orientation + 0.1*v;
    }
    accelerate(v) {
        this.speed = this.speed + 0.01 * v;
    }

    catchEgg(groundHeight, originalAltitude) {
        const duration = 2000;
        const distance = originalAltitude - groundHeight;
        const halfDuration = duration / 2;
        const velocity = distance / halfDuration;
        let elapsedTime = 0;

        const interval = setInterval(() => {
          elapsedTime = Date.now() - this.startTime;
      
          if (elapsedTime < halfDuration) {
            //console.log("descending")
            this.position.y = originalAltitude - velocity * elapsedTime;
            
            if(this.pickedUpEgg === null) {
                for (var i = 0; i < this.scene.eggs.length; i++){
                    if(this.position.x >= (this.scene.eggs[i].position.x*0.3 - this.pickUpMargin) && this.position.x <= (this.scene.eggs[i].position.x*0.3 + this.pickUpMargin)
                        && this.position.y >= -65 //TODO arranjar y?
                        && this.position.z >= (this.scene.eggs[i].position.z*0.3 - this.pickUpMargin) && this.position.z <= (this.scene.eggs[i].position.z*0.3 + this.pickUpMargin)) {
                        //console.log("pickedUpEgg " + i)
                        this.pickedUpEgg = this.scene.eggs[i];
                        this.pickedUpEgg.position.y = -2.5;
                        this.scene.eggs.splice(i, 1);
                        break;
                     }
                }
            }
          } 
          else if (elapsedTime < duration) {
            //console.log("ascending")
            this.position.y = groundHeight + velocity * (elapsedTime - halfDuration);
      
            if (this.position.y > originalAltitude) {
              this.position.y = originalAltitude;
            }
          } 
          else {
            this.position.y = originalAltitude;
            this.isCatching = false;
            clearInterval(interval);
          }
        }, 10);
    }

    dropEgg(originalAltitude,groundHeight) {

        const duration = 2000;
        const distance = originalAltitude - groundHeight;
        let elapsedTime = 0;
        this.startTime = Date.now();

        const interval = setInterval(() => {
            elapsedTime = Date.now() - this.startTime;
            if (elapsedTime < duration) {
                const t = elapsedTime / duration;
                this.pickedUpEgg.position.y = originalAltitude - t * distance;
            } 
            else {
                if(this.pickedUpEgg !== null) {
                    if(this.position.x <= 80+this.dropEggMargin && this.position.x >= 80-this.dropEggMargin
                        && this.position.y <= -71+this.dropEggMargin && this.position.y >= -71-this.dropEggMargin //TODO arranjar y?
                        && this.position.z <= this.dropEggMargin && this.position.z >= -this.dropEggMargin) {
                        this.scene.nest.nestEggs.push(this.pickedUpEgg);
                    }
                    else {
                        this.pickedUpEgg.position.x = this.position.x/0.3;
                        this.pickedUpEgg.position.y = groundHeight;
                        this.pickedUpEgg.position.z = this.position.z/0.3;
                        this.scene.eggs.push(this.pickedUpEgg);
                    }
                    this.pickedUpEgg = null;
                }
                clearInterval(interval);
            }
        }, 10);
    }

    update(scaleFactor,speedFactor) {
        
        this.scale = scaleFactor;

        this.position.x = this.position.x - Math.cos(this.orientation) * this.speed;
        this.position.z = this.position.z + Math.sin(this.orientation) * this.speed;
        
        this.animAng = this.animAng + this.speed + 0.3*speedFactor;
        this.rotateAngle = Math.PI / 6 * Math.sin(this.animAng);
        this.animVal = 0.2 * Math.sin(this.animAng);

        //amplitude * Math.sin(2 * Math.PI * frequency * x);

        if(this.isCatching){
            this.catchEgg(-71,this.initY)
        }
        if (this.scene.gui.isKeyPressed("KeyR")) {
            this.orientation = 0;
            this.speed = 0;
            this.scale = 1;
            this.position.x = 0;
            this.position.y = 0;
            this.position.z = 0;
            this.rotateAngle = 0;
            this.animVal = 0;
            this.animAng = 0;
        }
        else {
            if (this.scene.gui.isKeyPressed("KeyW")) {
                this.accelerate(speedFactor); 
                if(this.speed > this.maxSpeed) this.speed = this.maxSpeed;
            }
            if (this.scene.gui.isKeyPressed("KeyS")) {
                this.accelerate(-speedFactor);
                if(this.speed < 0) this.speed = 0;
            }
            if (this.scene.gui.isKeyPressed("KeyA")) {
                this.turn(speedFactor);
            }
            if (this.scene.gui.isKeyPressed("KeyD")) {
                this.turn(-speedFactor);
            }
            if (this.scene.gui.isKeyPressed("KeyP")) {
                if(!this.isCatching && this.pickedUpEgg === null) {
                    this.isCatching = true;
                    this.startTime = Date.now();
                    this.initY = this.position.y;
                }
            }
            if (this.scene.gui.isKeyPressed("KeyO")) {
                if(!this.isCatching && this.pickedUpEgg !== null) {
                    this.dropEgg(-2.5,-71/0.3);
                }
            }
        }
    }

    display(){

        this.scene.pushMatrix();

        this.scene.translate(0,this.animVal,0);
        this.scene.translate(this.position.x,this.position.y,this.position.z);
        this.scene.rotate(this.orientation,0,1,0);
        this.scene.scale(this.scale,this.scale,this.scale);

        if(this.pickedUpEgg !== null) {
            this.scene.egg.eggMaterial.apply();
            this.scene.pushMatrix();
            this.scene.scale(0.3,0.3,0.3);
            this.scene.translate(0,this.pickedUpEgg.position.y,0);
            this.pickedUpEgg.display();
            this.scene.popMatrix();
        }

        this.birdAppearance.apply();

        this.scene.pushMatrix();//Corpo
        this.scene.scale(1,0.35,0.35)//elipse
        this.bodySphere.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();//Cabeca
        this.scene.translate(-0.8,0,0)
        this.scene.scale(0.3,0.3,0.3)//elipse
        this.headSphere.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();//Asa esquerda
        this.scene.rotate(this.rotateAngle,1,0,0);
        this.leftWing.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();//Asa direita
        this.scene.rotate(Math.PI,1,0,0);
        this.scene.rotate(-this.rotateAngle,1,0,0);
        this.rightWing.display();
        this.scene.popMatrix();

        this.tailAppearance.apply();

        this.scene.pushMatrix();//Cauda triangulo
        this.scene.translate(0.9,0,0)
        this.scene.scale(0.3,0.3,0.3)
        this.scene.rotate(Math.PI/2,1,0,0);
        this.scene.rotate(Math.PI,0,0,1);
        this.scene.rotate(this.rotateAngle,0,1,0);
        this.tailTriangle.display();
        this.scene.popMatrix();

        this.beakMaterial.apply();

        this.scene.pushMatrix();//Bico
        this.scene.translate(-1.05,-0.1,0)
        this.scene.scale(0.1,0.1,0.1)
        this.scene.rotate(100/180*Math.PI,0,0,1);
        this.beakCone.display();
        this.scene.popMatrix();

        this.eyesMaterial.apply();

        this.scene.pushMatrix();//Olho Esquerdo
        this.scene.translate(-1,0.05,0.15)
        this.scene.scale(0.1,0.1,0.1)
        this.scene.rotate(Math.PI/4,0,1,0);
        this.leftEyeCube.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();//Olho Direito
        this.scene.translate(-1,0.05,-0.15)
        this.scene.scale(0.1,0.1,0.1)
        this.scene.rotate(Math.PI/4,0,1,0);
        this.rightEyeCube.display();
        this.scene.popMatrix();

        this.scene.popMatrix();

        this.scene.setDefaultAppearance();
    }

}
