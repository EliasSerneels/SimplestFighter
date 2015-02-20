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
	this.alpha = 1;
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
CCollision.prototype = { type : 'CCollision' }

// Jump Component
CCooldown = function(jump, dash) {
	this.jump = jump;
	this.dash = dash;
}
CCooldown.prototype = { type : 'CCooldown' }

// Dash Component
CDash = function(duration, x, y) {
	this.duration = duration;
	this.x = x;
	this.y = y;
	this.timePassed = 0;
}
CDash.prototype = {type : 'CDash' }

// TouchGround
CTouchGround = function() {}
CTouchGround.prototype = { type : 'CTouchGround' }

// Airborn
CAirborn = function() {}
CAirborn.prototype = { type : 'CAirborn' }

// Vulnerable
CVulnerable = function() {}
CVulnerable.prototype = { type : 'CVulnerable' }

// Invulnerable
CInvulnerable = function() {}
CInvulnerable.prototype = { type : 'CInvulnerable' }

// Score Component
CScore = function(points) {
	this.points = points;
	this.timeInvulnerable = 0;
}
CScore.prototype = {type : 'CScore' }

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

var SAirborn

var SControlChar = new SBase();
SControlChar.process = function(toolboxEventHandler, dt, player, worldHeight) {
	var cPos = this.EntityManager.getComponent(player, 'CPos');
	var cRectangle = this.EntityManager.getComponent(player, 'CRectangle');
	
	var moveSpeed = 80;
	var jumpSpeed = 250;
	var jumpCooldown = 0.8; // In seconds
	var dashCooldown = 0.8; // In seconds
	var doubleTapDelay = 400; // In milliseconds
	var dashDuration = 0.4; // In seconds
	var timeSinceKeyUp = 400; // In milliseconds
	var groundSpeedBonus = 40;
	
	var buffer = toolboxEventHandler.getBuffer();
	var keysActive = toolboxEventHandler.getKeysActive();
	
	var player1 = this.EntityManager.getByTag('PLAYER1');
	var cPosPlayer1 = this.EntityManager.getComponent(player1, 'CPos');
	var cVelocityPlayer1 = this.EntityManager.getComponent(player1, 'CVelocity');
	var cCooldownPlayer1 = this.EntityManager.getComponent(player1, 'CCooldown');
	
	// Check input buffer for combos
	var dashPlayer1 = false;
	if(cVelocityPlayer1 != null && !dashPlayer1) {
		if(buffer[0] && buffer[1] && cCooldownPlayer1.dash <= 0) {
			// if(buffer[0].keyCode == TOOLBOX.KeyCode.KEY_W && buffer[1].keyCode == TOOLBOX.KeyCode.KEY_W && buffer[0].timeStamp - buffer[1].timeStamp < doubleTapDelay && new Date().getTime() - buffer[0].timeStamp < timeSinceKeyUp) {
			if(this._checkDoubleTap(buffer, TOOLBOX.KeyCode.KEY_W, TOOLBOX.KeyCode.KEY_A, TOOLBOX.KeyCode.KEY_S, TOOLBOX.KeyCode.KEY_D, doubleTapDelay, timeSinceKeyUp)) {
				// Dash upwards combo detected
				this.EntityManager.addComponent(player1, new CDash(dashDuration, 0, -1));
				this.EntityManager.removeComponent(player1, 'CVelocity'); // This object cannot change velocity while mid-dash
				dashPlayer1 = true;
			}
			
			// if(buffer[0].keyCode == TOOLBOX.KeyCode.KEY_D && buffer[1].keyCode == TOOLBOX.KeyCode.KEY_D && buffer[0].timeStamp - buffer[1].timeStamp < doubleTapDelay && new Date().getTime() - buffer[0].timeStamp < timeSinceKeyUp) {
			if(this._checkDoubleTap(buffer, TOOLBOX.KeyCode.KEY_D, TOOLBOX.KeyCode.KEY_A, TOOLBOX.KeyCode.KEY_S, TOOLBOX.KeyCode.KEY_W, doubleTapDelay, timeSinceKeyUp)) {
				// Dash upwards combo detected
				this.EntityManager.addComponent(player1, new CDash(dashDuration, 1, 0));
				this.EntityManager.removeComponent(player1, 'CVelocity'); // This object cannot change velocity while mid-dash
				dashPlayer1 = true;
			}
			
			// if(buffer[0].keyCode == TOOLBOX.KeyCode.KEY_A && buffer[1].keyCode == TOOLBOX.KeyCode.KEY_A && buffer[0].timeStamp - buffer[1].timeStamp < doubleTapDelay && new Date().getTime() - buffer[0].timeStamp < timeSinceKeyUp) {
			if(this._checkDoubleTap(buffer, TOOLBOX.KeyCode.KEY_A, TOOLBOX.KeyCode.KEY_W, TOOLBOX.KeyCode.KEY_S, TOOLBOX.KeyCode.KEY_D, doubleTapDelay, timeSinceKeyUp)) {
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
		
		// Go invulnerable
		if(keysActive[TOOLBOX.KeyCode.KEY_S] && !keysActive[TOOLBOX.KeyCode.KEY_D] && !keysActive[TOOLBOX.KeyCode.KEY_A] && !keysActive[TOOLBOX.KeyCode.KEY_W] && !dashPlayer1) {
			var cScore = this.EntityManager.getComponent(player1, 'CScore');
			cScore.timeInvulnerable += dt;
			var cInvulnerable = this.EntityManager.getComponent(player1, 'CInvulnerable');
			if(!cInvulnerable) {
				this.EntityManager.addComponent(player1, new CInvulnerable());
				var cRender = this.EntityManager.getComponent(player1, 'CRender');
				cRender.alpha = 0.5;
			}
		} else { // Leave inverunablity
			var cInvulnerable = this.EntityManager.getComponent(player1, 'CInvulnerable');
			if(cInvulnerable) {
				this.EntityManager.removeComponent(player1, 'CInvulnerable');
				var cRender = this.EntityManager.getComponent(player1, 'CRender');
				cRender.alpha = 1;
			}
		}
		
		if(cPosPlayer1.vector.y + cRectangle.height >= worldHeight) { // touching ground?
			if(keysActive[TOOLBOX.KeyCode.KEY_D]) { cPosPlayer1.vector.x += groundSpeedBonus * dt; }
			if(keysActive[TOOLBOX.KeyCode.KEY_A]) { cPosPlayer1.vector.x += - groundSpeedBonus * dt; }
		}
	}
	
	
	var player2 = this.EntityManager.getByTag('PLAYER2');
	var cPosPlayer2 = this.EntityManager.getComponent(player2, 'CPos');
	var cVelocityPlayer2 = this.EntityManager.getComponent(player2, 'CVelocity');
	var cCooldownPlayer2 = this.EntityManager.getComponent(player2, 'CCooldown');
	
	// Check input buffer for combos
	var dashPlayer2 = false;
	if(cVelocityPlayer2 != null  && !dashPlayer2) {
		if(buffer[0] && buffer[1] && cCooldownPlayer2.dash <= 0) {
			// if(buffer[0].keyCode == TOOLBOX.KeyCode.UP_ARROW && buffer[1].keyCode == TOOLBOX.KeyCode.UP_ARROW && buffer[0].timeStamp - buffer[1].timeStamp < doubleTapDelay && new Date().getTime() - buffer[0].timeStamp < timeSinceKeyUp) {
			if(this._checkDoubleTap(buffer, TOOLBOX.KeyCode.UP_ARROW, TOOLBOX.KeyCode.DOWN_ARROW, TOOLBOX.KeyCode.RIGHT_ARROW, TOOLBOX.KeyCode.LEFT_ARROW, doubleTapDelay, timeSinceKeyUp)) {
				// Dash upwards combo detected
				this.EntityManager.addComponent(player2, new CDash(dashDuration, 0, -1));
				this.EntityManager.removeComponent(player2, 'CVelocity'); // This object cannot change velocity while mid-dash
				dashPlayer2 = true;
			}
			
			// if(buffer[0].keyCode == TOOLBOX.KeyCode.RIGHT_ARROW && buffer[1].keyCode == TOOLBOX.KeyCode.RIGHT_ARROW && buffer[0].timeStamp - buffer[1].timeStamp < doubleTapDelay && new Date().getTime() - buffer[0].timeStamp < timeSinceKeyUp) {
			if(this._checkDoubleTap(buffer, TOOLBOX.KeyCode.RIGHT_ARROW, TOOLBOX.KeyCode.DOWN_ARROW, TOOLBOX.KeyCode.UP_ARROW, TOOLBOX.KeyCode.LEFT_ARROW, doubleTapDelay, timeSinceKeyUp)) {
				// Dash upwards combo detected
				this.EntityManager.addComponent(player2, new CDash(dashDuration, 1, 0));
				this.EntityManager.removeComponent(player2, 'CVelocity'); // This object cannot change velocity while mid-dash
				dashPlayer2 = true;
			}
			
			// if(buffer[0].keyCode == TOOLBOX.KeyCode.LEFT_ARROW && buffer[1].keyCode == TOOLBOX.KeyCode.LEFT_ARROW && buffer[0].timeStamp - buffer[1].timeStamp < doubleTapDelay && new Date().getTime() - buffer[0].timeStamp < timeSinceKeyUp) {
			if(this._checkDoubleTap(buffer, TOOLBOX.KeyCode.LEFT_ARROW, TOOLBOX.KeyCode.DOWN_ARROW, TOOLBOX.KeyCode.RIGHT_ARROW, TOOLBOX.KeyCode.UP_ARROW, doubleTapDelay, timeSinceKeyUp)) {
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
		
		if(keysActive[TOOLBOX.KeyCode.RIGHT_ARROW]) { cPosPlayer2.vector.x += moveSpeed * dt; }
		if(keysActive[TOOLBOX.KeyCode.LEFT_ARROW]) { cPosPlayer2.vector.x += - moveSpeed * dt; }
		
		// Go invulnerable
		if(keysActive[TOOLBOX.KeyCode.DOWN_ARROW] && !keysActive[TOOLBOX.KeyCode.RIGHT_ARROW] && !keysActive[TOOLBOX.KeyCode.LEFT_ARROW] && !keysActive[TOOLBOX.KeyCode.UP_ARROW] && !dashPlayer2) {
			var cScore = this.EntityManager.getComponent(player2, 'CScore');
			cScore.timeInvulnerable += dt;
			var cInvulnerable = this.EntityManager.getComponent(player2, 'CInvulnerable');
			if(!cInvulnerable) {
				this.EntityManager.addComponent(player2, new CInvulnerable());
				var cRender = this.EntityManager.getComponent(player2, 'CRender');
				cRender.alpha = 0.5;
			}
		} else { // Leave inverunablity
			var cInvulnerable = this.EntityManager.getComponent(player2, 'CInvulnerable');
			if(cInvulnerable) {
				this.EntityManager.removeComponent(player2, 'CInvulnerable');
				var cRender = this.EntityManager.getComponent(player2, 'CRender');
				cRender.alpha = 1;
			}
		}
		
		if(cPosPlayer2.vector.y + cRectangle.height >= worldHeight) { // touching ground?
			if(keysActive[TOOLBOX.KeyCode.RIGHT_ARROW]) { cPosPlayer2.vector.x += groundSpeedBonus * dt; }
			if(keysActive[TOOLBOX.KeyCode.LEFT_ARROW]) { cPosPlayer2.vector.x += - groundSpeedBonus * dt; }
		}
	}
}
SControlChar._findTaps = function(buffer, keyCodeInclude, keyCodeExclude1, keyCodeExclude2, keyCodeExclude3) {
	var taps = [];
	var depth = buffer.length; // Check last X inputs
	for(i=0; i < buffer.length; i++) {
		if(buffer[i] !== undefined) {
			if(buffer[i].keyCode == keyCodeInclude) {
				taps.push(buffer[i]);
				if(taps.length == 2) {
					return taps;
				}
			} else if(buffer[i].keyCode == keyCodeExclude1) {
				return taps;
			} else if(buffer[i].keyCode == keyCodeExclude2) {
				return taps;
			} else if(buffer[i].keyCode == keyCodeExclude3) {
				return taps;
			}
		}
	}
	return taps;
}
SControlChar._checkDoubleTap = function(buffer, keyCodeInclude, keyCodeExclude1, keyCodeExclude2, keyCodeExclude3, maxDelay, maxTimeKeyUp) {
	var taps = this._findTaps(buffer, keyCodeInclude, keyCodeExclude1, keyCodeExclude2, keyCodeExclude3);
	if(taps.length == 2) {
		if(taps[0].timeStamp - taps[1].timeStamp < maxDelay && new Date().getTime() - taps[0].timeStamp < maxTimeKeyUp) {
			return true;
		}
	}
	return false;
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

var STouchRoof = new SBase();
STouchRoof.process = function(players) {
	for(entity in players) {
		var cPos = this.EntityManager.getComponent(entity, 'CPos');
		var cRectangle = this.EntityManager.getComponent(entity, 'CRectangle');
		
		if(cPos.vector.y < 0) {
			cPos.vector.y = 0;
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
		} else if(cPos.vector.x +cRectangle.width < 0) {
			while(cPos.vector.x < 0){
				cPos.vector.x = worldWidth;
			}
		}
	}
}

// Box collsion
var SBoxCollision = new SBase();
SBoxCollision.process = function(player1, player2) {
	var cRectangle1 = this.EntityManager.getComponent(player1, 'CRectangle');
	var cPos1 = this.EntityManager.getComponent(player1, 'CPos');
	
	var cRectangle2 = this.EntityManager.getComponent(player2, 'CRectangle');
	var cPos2 = this.EntityManager.getComponent(player2, 'CPos');
	
	var r1 = new TOOLBOX.Rectangle(cPos1.vector.x, cPos1.vector.y, cRectangle1.width, cRectangle1.height);
	var r2 = new TOOLBOX.Rectangle(cPos2.vector.x, cPos2.vector.y, cRectangle2.width, cRectangle2.height);
	
	if(TOOLBOX.CollisionDetection2D.AABBCollision(r1, r2)) { // If collision
		var cDash1 = this.EntityManager.getComponent(player1, 'CDash');
		var cDash2 = this.EntityManager.getComponent(player2, 'CDash');
		var cInvulnerable1 = this.EntityManager.getComponent(player1, 'CInvulnerable');
		var cInvulnerable2 = this.EntityManager.getComponent(player2, 'CInvulnerable');
		
		if(!cInvulnerable1 && !cInvulnerable2) {
			if(cDash1) {
				if(cDash2) {
					// point for the one in dash first
					if(cDash1.timePassed > cDash2) {
						// point for player 1
						this._awardPointToPlayer(player1);
					} else {
						// point for player 2
						this._awardPointToPlayer(player2);
					}
				} else {
					// point for player 1
					this._awardPointToPlayer(player1);
				}
				
				// Reset level
				this._resetLevel(player1, player2);
			} else if(cDash2) {
				// point for player 2
				this._awardPointToPlayer(player2);
				
				// Reset level
				this._resetLevel(player1, player2);
			}
		}
	}
}
SBoxCollision._awardPointToPlayer = function(player) {
	var cScore = this.EntityManager.getComponent(player, 'CScore');
	cScore.points += 1;
}
SBoxCollision._resetLevel = function(player1, player2) {
	
	// Reset player 1
	
	var cDash1 = this.EntityManager.getComponent(player1, 'CDash');
	if(cDash1) {
		this.EntityManager.removeComponent(player1, 'CDash');
		this.EntityManager.addComponent(player1, new CVelocity(0, 0));
	}
	
	var cPos1 = this.EntityManager.getComponent(player1, 'CPos');
	cPos1.vector.x = 100;
	cPos1.vector.y = 100;
	
	var cVelocity1 = this.EntityManager.getComponent(player1, 'CVelocity');
	cVelocity1.vector.x = 0;
	cVelocity1.vector.y = 0;
	
	var cCoolDown1 = this.EntityManager.getComponent(player1, 'CCooldown');
	cCoolDown1.jump = 1;
	cCoolDown1.dash = 1;
	
	var cScore1 = this.EntityManager.getComponent(player1, 'CScore');
	cScore1.timeInvulnerable = 0;
	
	// Reset player 2
	
	var cDash2 = this.EntityManager.getComponent(player2, 'CDash');
	if(cDash2) {
		this.EntityManager.removeComponent(player2, 'CDash');
		this.EntityManager.addComponent(player2, new CVelocity(0, 0));
	}
	
	var cPos2 = this.EntityManager.getComponent(player2, 'CPos');
	cPos2.vector.x = 650;
	cPos2.vector.y = 100;
	
	var cVelocity2 = this.EntityManager.getComponent(player2, 'CVelocity');
	cVelocity2.vector.x = 0;
	cVelocity2.vector.y = 0;
	
	var cCoolDown2 = this.EntityManager.getComponent(player2, 'CCooldown');
	cCoolDown2.jump = 1;
	cCoolDown2.dash = 1;
	
	var cScore2 = this.EntityManager.getComponent(player2, 'CScore');
	cScore2.timeInvulnerable = 0;
}

// Display Score
SDisplayScore = new SBase();
SDisplayScore.process = function(player1, player2) {
	var cScore1 = this.EntityManager.getComponent(player1, 'CScore');
	var cScore2 = this.EntityManager.getComponent(player2, 'CScore');
	document.getElementById("Player1Score").innerHTML = cScore1.points;
	document.getElementById("Player2Score").innerHTML = cScore2.points;
	document.getElementById("Player1TimeInvunerable").innerHTML = cScore1.timeInvulnerable;
	document.getElementById("Player2TimeInvunerable").innerHTML = cScore2.timeInvulnerable;
}

// Dash System
var SDash = new SBase();
SDash.process = function(dt, startSpeed, endSpeed) {
	var componentsDash = this.EntityManager.getAllComponentsOfType('CDash'); // Process for all entities with component CVelocity
	for(entity in componentsDash) {
		// Get each component needed of this entity
		cDash = componentsDash[entity];
		cPos = this.EntityManager.getComponent(entity, 'CPos');
		
		cDash.timePassed += dt;
		
		var speed = startSpeed + (endSpeed - startSpeed) * cDash.timePassed;
		
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
		if(componentRender.alpha != 1) { // TODO: Can this if be eliminated???
			toolboxRenderContext.renderObjectWithAlpha(img, componentPos.vector.x, componentPos.vector.y, componentRender.alpha);
		} else {
			toolboxRenderContext.renderObject(img, componentPos.vector.x, componentPos.vector.y);
		}
	}
}


