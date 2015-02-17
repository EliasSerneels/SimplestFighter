// TagManager => Add to entity system
// Based on the Artemis framework
// Allow entities to be "tagged" with a unique string to circumvent creating unique components when not necesary
// e.g. "CAMERA" : CameraComponent = PositionComponent (x, y) + SquareComponent (width, height) SO tag it with "camera" and update/read that single entity in systems
// e.g. "PLAYER" : Instead of a player component to make a player move, label a moveable (pos+velo+accel) as player and only update that one on input
// This way you could also have different almost-the-same objects like "CAMERA" and "SUBCAMERA", or "PLAYER" and "PUPPET"
// It depends on when it's a good idea to create a component and when to create a unique label (or group like in Artemis)
// This might depend on when you need extra data (use component) or only a label (like: PlayerComponent = { 'player' = true; } => Use "tag" or "group" instead)


// SystemManager
// Based on the Artemis framework
// Make it convenient to store and update systems


/* Component Templates */

/* Official component class structure :
// You can add as many data parameters as you want, but components can never have methods or logic of any kind
CType = function(data1) {
	this.data1;
}
CType.prototype = { type : 'CType' };
*/

// Position Component
CPos = function(x,y) {
	this.vector = new TOOLBOX.Vector(x,y);
}
CPos.prototype = { type : 'CPos' };

// Moveable Component
CVelocity = function(dx, dy) {
	this.vector = new TOOLBOX.Vector(dx, dy);
}
CVelocity.prototype = { type : 'CVelocity' };

// CMoveChar Component
CAccel = function(accel) {
	this.accel = accel;
}
CAccel.prototype = { type : 'CAccel' };

// Moveable Component
CForce = function(dx, dy) {
	this.vector = new TOOLBOX.Vector(dx, dy);
}
CForce.prototype = { type : 'CForce' };

// Renderable Component
CRender = function(imgId) {
	this.imgId = imgId;
}
CRender.prototype = { type : 'CRender' };

// Rectangle Component
CRectangle = function(width, height) {
	this.width = width;
	this.height = height;
}
CRectangle.prototype = { type : 'CRectangle' };

// Shape Component (mainly for collision detection
// @param shapeType "poly" or "circle"
// @param shapeToolboxObject Circle, polygon, ... object from the toolbox
CShape = function(shapeType, shapeToolboxObject) {
	this.shapeType = shapeType;
	this.shapeToolboxObject = shapeToolboxObject;
}
CShape.prototype = { type : 'CShape' };

// Collision Component
CCollision = function(thisEntity, collidingEntity, resultingVector) {
	this.thisEntity = thisEntity;
	this.collidingEntity = collidingEntity;
	this.resultingVector = resultingVector;
}
CCollision.prototype = {type : 'CCollision' }

// Jump Component
CCooldown = function(jump, dash) {
	this.jump = jump;
	this.dash = dash;
}
CCooldown.prototype = {type : 'CCooldown' }

// Dash Component
CDash = function(duration, x, y) {
	this.duration = duration;
	this.x = x;
	this.y = y;
}
CDash.prototype = {type : 'CDash' }

/* System (a generic class that always takes a list of components, with their entities as index) */
// e.g. listOfSomeType = { 0 : obj, 5 : obj, 8 : obj } is returned by EntityManager.getAllComponentsOfType('SomeType');

// In most simple form, it has a "signature-method" (=process) to call each game tick
// Process will be overwritten by specific sub-systems
var SBase = function() {}
SBase.prototype = {
	process : function() {
		console.log('No process function defined for this system');
	},
	
	setEntityManager : function(EntityManager) {
		this.EntityManager = EntityManager;
	}
}

/* Sub Systems */
// Will be created on top of BaseSystem to implement specific logic on a set of components and overwrites "process" (no data in objects, please)

var SControlChar = new SBase();
SControlChar.process = function(toolboxEventHandler, dt, player) {
	var cPos = this.EntityManager.getComponent(player, 'CPos');
	var cRectangle = this.EntityManager.getComponent(player, 'CRectangle');
	
	var moveSpeed = 80;
	var jumpSpeed = 250;
	var jumpCooldown = 0.8; // In seconds
	var dashCooldown = 0.4; // In seconds
	var doubleTapDelay = 400; // In milliseconds
	var dashDuration = 0.4; // In seconds
	var timeSinceKeyUp = 400; // In milliseconds
	
	var buffer = toolboxEventHandler.getBuffer();
	var keysActive = toolboxEventHandler.getKeysActive();
	
	var player1 = this.EntityManager.getByTag('PLAYER1');
	var cPosPlayer1 = this.EntityManager.getComponent(player1, 'CPos');
	var cVelocityPlayer1 = this.EntityManager.getComponent(player1, 'CVelocity');
	var cCooldownPlayer1 = this.EntityManager.getComponent(player1, 'CCooldown');
	
	// Check input buffer for combos
	var dashPlayer1 = false;
	console.log(cVelocityPlayer1);
	if(cVelocityPlayer1 != null && !dashPlayer1) {
		if(buffer[0] && buffer[1] && cCooldownPlayer1.dash <= 0) {
			if(buffer[0].keyCode == TOOLBOX.KeyCode.KEY_W && buffer[1].keyCode == TOOLBOX.KeyCode.KEY_W && buffer[0].timeStamp - buffer[1].timeStamp < doubleTapDelay && new Date().getTime() - buffer[0].timeStamp < timeSinceKeyUp) {
				// Dash upwards combo detected
				this.EntityManager.addComponent(player1, new CDash(dashDuration, 0, -1));
				this.EntityManager.removeComponent(player1, 'CVelocity'); // This object cannot change velocity while mid-dash
				dashPlayer1 = true;
			}
			
			if(buffer[0].keyCode == TOOLBOX.KeyCode.KEY_D && buffer[1].keyCode == TOOLBOX.KeyCode.KEY_D && buffer[0].timeStamp - buffer[1].timeStamp < doubleTapDelay && new Date().getTime() - buffer[0].timeStamp < timeSinceKeyUp) {
				// Dash upwards combo detected
				this.EntityManager.addComponent(player1, new CDash(dashDuration, 1, 0));
				this.EntityManager.removeComponent(player1, 'CVelocity'); // This object cannot change velocity while mid-dash
				dashPlayer1 = true;
			}
			
			if(buffer[0].keyCode == TOOLBOX.KeyCode.KEY_A && buffer[1].keyCode == TOOLBOX.KeyCode.KEY_A && buffer[0].timeStamp - buffer[1].timeStamp < doubleTapDelay && new Date().getTime() - buffer[0].timeStamp < timeSinceKeyUp) {
				// Dash upwards combo detected
				this.EntityManager.addComponent(player1, new CDash(dashDuration, -1, 0));
				this.EntityManager.removeComponent(player1, 'CVelocity'); // This object cannot change velocity while mid-dash
				dashPlayer1 = true;
			}
		}
		
		if(dashPlayer1) {
			cCooldownPlayer1.dash = dashCooldown;
		}

		if(keysActive[TOOLBOX.KeyCode.KEY_W] && cCooldownPlayer1.jump <= 0) {
			cVelocityPlayer1.vector.y = 0; // Reset velocity
			cVelocityPlayer1.vector.y -= jumpSpeed; // Accelerate
			cCooldownPlayer1.jump = jumpCooldown;
		}
		
		if(keysActive[TOOLBOX.KeyCode.KEY_D]) { cPosPlayer1.vector.x += moveSpeed * dt; }
		if(keysActive[TOOLBOX.KeyCode.KEY_A]) { cPosPlayer1.vector.x += - moveSpeed * dt; }
	}
	
	
	var player2 = this.EntityManager.getByTag('PLAYER2');
	var cPosPlayer2 = this.EntityManager.getComponent(player2, 'CPos');
	var cVelocityPlayer2 = this.EntityManager.getComponent(player2, 'CVelocity');
	var cCooldownPlayer2 = this.EntityManager.getComponent(player2, 'CCooldown');
	
	// Check input buffer for combos
	var dashPlayer2 = false;
	if(cVelocityPlayer2 != null  && !dashPlayer2) {
		if(buffer[0] && buffer[1] && cCooldownPlayer2.dash <= 0) {
			if(buffer[0].keyCode == TOOLBOX.KeyCode.UP_ARROW && buffer[1].keyCode == TOOLBOX.KeyCode.UP_ARROW && buffer[0].timeStamp - buffer[1].timeStamp < doubleTapDelay && new Date().getTime() - buffer[0].timeStamp < timeSinceKeyUp) {
				// Dash upwards combo detected
				this.EntityManager.addComponent(player2, new CDash(dashDuration, 0, -1));
				this.EntityManager.removeComponent(player2, 'CVelocity'); // This object cannot change velocity while mid-dash
				dashPlayer2 = true;
			}
			
			if(buffer[0].keyCode == TOOLBOX.KeyCode.RIGHT_ARROW && buffer[1].keyCode == TOOLBOX.KeyCode.RIGHT_ARROW && buffer[0].timeStamp - buffer[1].timeStamp < doubleTapDelay && new Date().getTime() - buffer[0].timeStamp < timeSinceKeyUp) {
				// Dash upwards combo detected
				this.EntityManager.addComponent(player2, new CDash(dashDuration, 1, 0));
				this.EntityManager.removeComponent(player2, 'CVelocity'); // This object cannot change velocity while mid-dash
				dashPlayer2 = true;
			}
			
			if(buffer[0].keyCode == TOOLBOX.KeyCode.LEFT_ARROW && buffer[1].keyCode == TOOLBOX.KeyCode.LEFT_ARROW && buffer[0].timeStamp - buffer[1].timeStamp < doubleTapDelay && new Date().getTime() - buffer[0].timeStamp < timeSinceKeyUp) {
				// Dash upwards combo detected
				this.EntityManager.addComponent(player2, new CDash(dashDuration, -1, 0));
				this.EntityManager.removeComponent(player2, 'CVelocity'); // This object cannot change velocity while mid-dash
				dashPlayer2 = true;
			}
		}
		
		if(dashPlayer2) {
			cCooldownPlayer2.dash = dashCooldown;
		}
	
		if(keysActive[TOOLBOX.KeyCode.UP_ARROW] && cCooldownPlayer2.jump <= 0) {
			cVelocityPlayer2.vector.y = 0; // Reset velocity
			cVelocityPlayer2.vector.y -= jumpSpeed; // Accelerate
			cCooldownPlayer2.jump = jumpCooldown;
		}
		
		if(keysActive[TOOLBOX.KeyCode.UP_ARROW]) { cPosPlayer2.vector.y += - moveSpeed * dt; } // go to jump state
		if(keysActive[TOOLBOX.KeyCode.RIGHT_ARROW]) { cPosPlayer2.vector.x += moveSpeed * dt; }
		if(keysActive[TOOLBOX.KeyCode.LEFT_ARROW]) { cPosPlayer2.vector.x += - moveSpeed * dt; }
	}
}

var SCoolDown = new SBase();
SCoolDown.process = function(dt) {
	var componentsCooldown = this.EntityManager.getAllComponentsOfType('CCooldown'); // Process for all entities with component CJump
	for(entity in componentsCooldown) {
		cCooldown = componentsCooldown[entity];
		if(cCooldown.jump > 0) { cCooldown.jump -= dt; }
		if(cCooldown.dash > 0) { cCooldown.dash -= dt; }
	}
}

var STouchGround = new SBase();
STouchGround.process = function(players, worldHeight) {
	for(entity in players) {
		var cPos = this.EntityManager.getComponent(entity, 'CPos');
		var cRectangle = this.EntityManager.getComponent(entity, 'CRectangle');
		
		if(cPos.vector.y + cRectangle.height > worldHeight) {
			cPos.vector.y = worldHeight - cRectangle.height;
		}
	}
}
var STouchWall = new SBase();
STouchWall.process = function(players, worldWidth) {
	for(entity in players) {
		var cPos = this.EntityManager.getComponent(entity, 'CPos');
		var cRectangle = this.EntityManager.getComponent(entity, 'CRectangle');
		
		if(cPos.vector.x + cRectangle.width > worldWidth) {
			while(cPos.vector.x > worldWidth){
				cPos.vector.x = 0 - cRectangle.width;
			}
		} else if(cPos.vector.x +cRectangle.width< 0) {
			while(cPos.vector.x < 0){
				cPos.vector.x = worldWidth;
			}
		}
	}
}
// Dash System
var SDash = new SBase();
SDash.process = function(dt, speed) {
	var componentsDash = this.EntityManager.getAllComponentsOfType('CDash'); // Process for all entities with component CVelocity
	for(entity in componentsDash) {
		// Get each component needed of this entity
		cDash = componentsDash[entity];
		cPos = this.EntityManager.getComponent(entity, 'CPos');
		
		console.log(cDash.duration);
		console.log(cDash.x);
		console.log(cDash.y);
		
		// Perform the logic / update the data
		if(cDash.duration - dt <= 0) {
			cPos.vector.x = cPos.vector.x + (cDash.x * speed * cDash.duration);
			cPos.vector.y = cPos.vector.y + (cDash.y * speed * cDash.duration);
			this.EntityManager.removeComponent(entity, 'CDash');
			this.EntityManager.addComponent(entity, new CVelocity(0, 0));
		} else {
			cPos.vector.x = cPos.vector.x + (cDash.x * speed * dt);
			cPos.vector.y = cPos.vector.y + (cDash.y * speed * dt);
			cDash.duration -= dt;
		}
	}
}

// Move System
var SMove = new SBase();
SMove.process = function(dt) {
	var componentsVelocity = this.EntityManager.getAllComponentsOfType('CVelocity'); // Process for all entities with component CVelocity
	for(entity in componentsVelocity) {
		// Get each component needed of this entity
		componentVelocity = componentsVelocity[entity];
		componentPos = this.EntityManager.getComponent(entity, 'CPos');
		
		// Perform the logic / update the data
		componentPos.vector.x = componentPos.vector.x + (componentVelocity.vector.x * dt);
		componentPos.vector.y = componentPos.vector.y + (componentVelocity.vector.y * dt);
	}
}

// Gravitational System
var SGravity = new SBase();
SGravity.process = function(gravitationalBodies, gravitationalStrength) {
	for(entity in gravitationalBodies) {
		// Accelerate
		cVelocity = this.EntityManager.getComponent(entity, 'CVelocity');
		if(cVelocity) {
			cVelocity.vector.y += gravitationalStrength;
		}
	}
}

// Render System
var SRender = new SBase();
SRender.process = function(toolboxRenderContext, toolboxAssetManager) {
	toolboxRenderContext.clear();
		
	var componentsRender = this.EntityManager.getAllComponentsOfType('CRender'); // Process for all entities with component CRender
	for(entity in componentsRender) {
		// Get each component needed of this entity
		componentRender = componentsRender[entity];
		componentPos = this.EntityManager.getComponent(entity, 'CPos');
		
		// Get the image object by ID
		var img = toolboxAssetManager.getImage(componentRender.imgId);
		
		// Perform the logic / update the data
		toolboxRenderContext.renderObject(img, componentPos.vector.x, componentPos.vector.y);
	}
}
