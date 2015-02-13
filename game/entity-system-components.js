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
CCollision.prototype= {type : 'CCollision' }

// Jump Component
CJump = function(time, speed) {
	this.time;
	this.speed;
}

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
	
	var worldHeight = 500;
	var gravitySpeed = 40;
	
	if(cPos.vector.y + cRectangle.height < worldHeight) {
		cPos.vector.y += gravitySpeed * dt;
	} else {
		cPos.vector.y = worldHeight - cRectangle.height;
	}
	
	var moveSpeed = 60;
	var jumpSpeed = 100;
	
	var keysActive = toolboxEventHandler.getKeysActive();
	
	var player1 = this.EntityManager.getByTag('PLAYER1');
	var cPosPlayer1 = this.EntityManager.getComponent(player1, 'CPos');
	
	if(keysActive[TOOLBOX.KeyCode.KEY_W]) { GAME.EntityManager.addComponent(e, new CJump(2000, jumpSpeed)) } // go to jump state
	
	if(keysActive[TOOLBOX.KeyCode.KEY_D]) { cPosPlayer1.vector.x += moveSpeed * dt; }
	if(keysActive[TOOLBOX.KeyCode.KEY_A]) { cPosPlayer1.vector.x += - moveSpeed * dt; }
	
	
	var player2 = this.EntityManager.getByTag('PLAYER2');
	var cPosPlayer2 = this.EntityManager.getComponent(player2, 'CPos');

	if(keysActive[TOOLBOX.KeyCode.UP_ARROW]) { cPosPlayer2.vector.y += - moveSpeed * dt; } // go to jump state
	if(keysActive[TOOLBOX.KeyCode.RIGHT_ARROW]) { cPosPlayer2.vector.x += moveSpeed * dt; }
	if(keysActive[TOOLBOX.KeyCode.LEFT_ARROW]) { cPosPlayer2.vector.x += - moveSpeed * dt; }
}

var SJump = new SBase();
SJump.process = function(dt) {
	var jumpComponents = this.EntityManager.getAllComponentsOfType('CJump');
	for(entity in jumpComponents) {
		cJump = jumpComponents[entity];
		cPos = this.EntityManager.getComponent(entity, 'CPos');
		
		if(cJump.time - dt <= 0) {
			cPos.vector.x += cJump.speed * (cJump.time - dt);
			this.EntityManager.removeComponent(entity, 'CJump');
		} else {
			cPos.vector.x += cJump.speed * dt;
			cJump.time - dt;
		}
	}
}

// Move System
var SMove = new SBase();
SMove.process = function() {
	var componentsVelocity = this.EntityManager.getAllComponentsOfType('CVelocity'); // Process for all entities with component CVelocity
	for(entity in componentsVelocity) {
		// Get each component needed of this entity
		componentVelocity = componentsVelocity[entity];
		componentPos = this.EntityManager.getComponent(entity, 'CPos');
		
		// Perform the logic / update the data
		componentPos.vector.x = componentPos.vector.x + componentVelocity.vector.x;
		componentPos.vector.y = componentPos.vector.y + componentVelocity.vector.y;
	}
}

// Move Char (by arrow keys) System
var SAccelChar = new SBase();
SAccelChar.process = function(toolboxEventHandler, dt) {
	var componentsAccelChar = this.EntityManager.getAllComponentsOfType('CAccel'); // Process for all entities with component CMoveChar
	
	for(entity in componentsAccelChar) {
		// Get each component needed of this entity
		componentAccelChar = componentsAccelChar[entity];
		componentMove = this.EntityManager.getComponent(entity, 'CVelocity');
		
		// Perform the logic / update the data
		componentMove.vector.x = 0;
		componentMove.vector.y = 0;
		
		var keysActive = toolboxEventHandler.getKeysActive();
		if(keysActive['39']) { componentMove.vector.x = componentAccelChar.accel * dt; }
		if(keysActive['37']) { componentMove.vector.x = - componentAccelChar.accel * dt; }
		if(keysActive['38']) { componentMove.vector.y = - componentAccelChar.accel * dt; }
		if(keysActive['40']) { componentMove.vector.y = componentAccelChar.accel * dt; }
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
