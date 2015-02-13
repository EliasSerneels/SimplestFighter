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

// Square Component
CSquare = function(width, height) {
	this.width = width;
	this.height = height;
}
CSquare.prototype = { type : 'CSquare' };

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
SControlChar.process = function(player) {
	
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

// Render To Camera System: A Render System variation
var SRenderToCamera = new SBase();
SRenderToCamera.process = function(toolboxRenderContext, toolboxAssetManager) {
	toolboxRenderContext.clear();
	
	var camera = this.EntityManager.getByTag('CAMERA');
	var cameraPos = this.EntityManager.getComponent(camera, 'CPos'); // Render to camera position
	var componentsRender = this.EntityManager.getAllComponentsOfType('CRender'); // Process for all entities with component CRender
	for(entity in componentsRender) {
		// Get each component needed of this entity
		var componentRender = componentsRender[entity];
		var componentPos = this.EntityManager.getComponent(entity, 'CPos');
		
		// Get the image object by ID
		var img = toolboxAssetManager.getImage(componentRender.imgId);
		
		// Perform the logic / update the data
		toolboxRenderContext.renderObject(img, componentPos.vector.x - cameraPos.vector.x, componentPos.vector.y - cameraPos.vector.y);
	}
}

var SCenterCameraToObject = new SBase();
SCenterCameraToObject.process = function(camera, player) {
	var cameraPos = this.EntityManager.getComponent(camera, 'CPos');
	var cameraSquare = this.EntityManager.getComponent(camera, 'CSquare');
	var playerPos = this.EntityManager.getComponent(player, 'CPos');
	cameraPos.vector.x = playerPos.vector.x - cameraSquare.width / 2;
	cameraPos.vector.y = playerPos.vector.y - cameraSquare.height / 2;
}

/* Detects Collision between a list of convex shapes */
// Components : CShape, CPos, CCollision

// Implements Seperating Axis Theorem
SCollisionDetection = new SBase();

// @param collidableIdList List of entity IDs that can collide with each other (so you can define a group tag in the entity manager)
// Does not yet support e.g. bullets vs hitables (collision between different groups but not with entities from it's own group)
SCollisionDetection.process = function(collidableIdList) {
	// Loop through all the shapes and test them against each other
	// http://lab.Polygonal.de/articles/recursive-dimensional-clustering/
	for(var i=0; i < collidableIdList.length; i++) { // Test for each object...
		var testCShapeOne = this.EntityManager.getComponent(collidableIdList[i], 'CShape'); //CHANGE to "this.EntityManager.getComponent(collidableIdList[i], 'CShape')"
		
		for (var j=i+1; j < collidableIdList.length; j++) { // ... against all object afterwards (don't check twice for the same objects)
			var testCShapeTwo = this.EntityManager.getComponent(collidableIdList[j], 'CShape');
			
			switch(testCShapeOne.shapeType, testCShapeTwo.shapeType) {
				case "circle" && "circle":
					var testCircleOne = this._circlePlusPos(testCShapeOne.shapeToolboxObject, this.EntityManager.getComponent(i, 'CPos'));
					var testCircleTwo = this._circlePlusPos(testCShapeTwo.shapeToolboxObject, this.EntityManager.getComponent(j, 'CPos'));
					var resultingVector = TOOLBOX.SAT.CircleToCircle(testCircleOne, testCircleTwo);
					break;
				case "poly" && "poly":
					var testPolyOne = this._polyPlusPos(testCShapeOne.shapeToolboxObject, this.EntityManager.getComponent(i, 'CPos'));
					var testPolyTwo = this._polyPlusPos(testCShapeTwo.shapeToolboxObject, this.EntityManager.getComponent(j, 'CPos'));
					var resultingVector = TOOLBOX.SAT.PolyToPoly(testPolyOne, testPolyTwo);
					break;
				case "poly" && "circle":
					var testPoly = this._polyPlusPos(testCShapeOne.shapeToolboxObject, this.EntityManager.getComponent(i, 'CPos'));
					var testCircle = this._circlePlusPos(testCShapeTwo.shapeToolboxObject, this.EntityManager.getComponent(j, 'CPos'));
					var resultingVector = TOOLBOX.SAT.PolyToCircle(testPoly, testCircle);
					break;
				case "circle" && "poly":
					var testCircle = this._circlePlusPos(testCShapeOne.shapeToolboxObject, this.EntityManager.getComponent(i, 'CPos'));
					var testPoly = this._polyPlusPos(testCShapeTwo.shapeToolboxObject, this.EntityManager.getComponent(j, 'CPos'));
					var resultingVector = TOOLBOX.SAT.PolyToCircle(testCircle, testPoly);
					break;
			}
			
			// If there is a collision
			if(resultingVector) {
				// Create collision entities
				if(this.EntityManager.getComponent(i, 'CVelocity')) {
					var e = this.EntityManager.create();
					this.EntityManager.addComponent(e, new CCollision(i, j, resultingVector));
				}
				
				if(this.EntityManager.getComponent(j, 'CVelocity')) {
					var e = this.EntityManager.create();
					this.EntityManager.addComponent(e, new CCollision(j, i, resultingVector));
				}
			}
		}
	
	}
}

// Add position component coords to a toolbox circle object
SCollisionDetection._circlePlusPos = function(circle, CPos) {
	return new TOOLBOX.Circle(circle.x + CPos.vector.x, circle.y + CPos.vector.y, circle.r);
}

// Add position component coords to a toolbox polygon object
SCollisionDetection._polyPlusPos = function(poly, CPos) {
	var newPoly = new TOOLBOX.Polygon();
	for(i=0; i < poly.vertices.length; i++) {
		var vertex = poly.vertices[i];
		newPoly.addVertex(vertex.x + CPos.vector.x, vertex.y + CPos.vector.y);
	}
	newPoly.setCenter(poly.center.x + CPos.vector.x, poly.center.y + CPos.vector.y);
	return newPoly;
}

// System Collision Resolver
// Uses: CCollision, CPos, CVelocity
SCollisionResolver = new SBase();
SCollisionResolver.process = function() {
	var entities = this.EntityManager.getEntitiesWithComponents(['CCollision']);
	
	for(i=0; i < entities.length; i++) {
		var collision = this.EntityManager.getComponent(entities[i], 'CCollision');
		
		var position = this.EntityManager.getComponent(collision.thisEntity, 'CPos');
		var velocity = this.EntityManager.getComponent(collision.thisEntity, 'CVelocity');
		
		position.vector.x += collision.resultingVector.x;
		position.vector.y += collision.resultingVector.y;
		
		// Clean up the collision
		this.EntityManager.destroy(entities[i]);
	}
}

// Animation System
var SAnimation = new SBase();
SAnimation.process = function() {
	
}

/* Palette = a factory to create specific types of entities (= with a specific set of components) */
// e.g.
/*
PMovingObject = function() {
	// Create new entity
	var e = EntityManager.create();
	
	// Add components
	EntityManager.addComponent(e, new CPos(5, 6));
	EntityManager.addComponent(e, new CMove(2, 0));
}
*/


