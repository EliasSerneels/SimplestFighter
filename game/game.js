// TODO: PolyvsCircle, multiple moving objects, multiple collisions, (containment)

/* Using Entity System */

var GAME = {};
// On window loading
window.onload = init;
function init() {
	// srcArray and path
	var path = 'img/';
	var srcArray = ['rectangle1.png', 'rectangle2.png'];
	
	// Create the tools
	GAME.Engine = new TOOLBOX.Engine(30, updateGame);
	GAME.Renderer = new TOOLBOX.RenderContextCanvas('level2');
	GAME.EventHandler = new TOOLBOX.EventHandler(GAME.Renderer);
	GAME.AssetManager = new TOOLBOX.AssetManager(path, srcArray);
	GAME.AssetManager.load();
	
	// Create Entity Manager and register all component types
	GAME.EntityManager = new TOOLBOX.EntityManager();
	GAME.EntityManager.registerComponentType('CPos');
	GAME.EntityManager.registerComponentType('CVelocity');
	GAME.EntityManager.registerComponentType('CRender');
	GAME.EntityManager.registerComponentType('CAccel');
	GAME.EntityManager.registerComponentType('CSquare');
	GAME.EntityManager.registerComponentType('CShape');
	GAME.EntityManager.registerComponentType('CCollision');
	
	// Create a group for basic collisions
	GAME.EntityManager.createGroup('COLLISION_BODIES_PLAYERS');
	
	// Set entity manager for Systems
	SMove.setEntityManager(GAME.EntityManager);
	SAccelChar.setEntityManager(GAME.EntityManager);
	SRender.setEntityManager(GAME.EntityManager);
	SCollisionDetection.setEntityManager(GAME.EntityManager);
	SCollisionResolver.setEntityManager(GAME.EntityManager);

	// Create player 1
	var polygon = new TOOLBOX.Polygon();
	polygon.addVertex(0, 0);
	polygon.addVertex(50, 0);
	polygon.addVertex(50, 75);
	polygon.addVertex(0, 75);
	polygon.setCenter(25, 37.5);
	
	var e = GAME.EntityManager.create();
	GAME.EntityManager.addComponent(e, new CPos(100, 300))
	GAME.EntityManager.addComponent(e, new CVelocity(0, 0));
	GAME.EntityManager.addComponent(e, new CAccel(60));
	GAME.EntityManager.addComponent(e, new CRender(0));
	GAME.EntityManager.addComponent(e, new CShape('poly', polygon));
	GAME.EntityManager.addToGroup(e, 'COLLISION_BODIES_PLAYERS');
	GAME.EntityManager.addTag(e, 'PLAYER1');
	
	// Create player 2
	var polygon = new TOOLBOX.Polygon();
	polygon.addVertex(0, 0);
	polygon.addVertex(50, 0);
	polygon.addVertex(50, 75);
	polygon.addVertex(0, 75);
	polygon.setCenter(25, 37.5);
	
	var e = GAME.EntityManager.create();
	GAME.EntityManager.addComponent(e, new CPos(100, 300))
	GAME.EntityManager.addComponent(e, new CVelocity(0, 0));
	GAME.EntityManager.addComponent(e, new CAccel(60));
	GAME.EntityManager.addComponent(e, new CRender(1));
	GAME.EntityManager.addComponent(e, new CShape('poly', polygon));
	GAME.EntityManager.addToGroup(e, 'COLLISION_BODIES_PLAYERS');
	GAME.EntityManager.addTag(e, 'PLAYER2');
	
	// Start the tools
	GAME.EventHandler.startEventHandler();
	GAME.Engine.startEngine();
}

// Update function called eahc frame
function updateGame() {
	// SAccelChar.process(GAME.EventHandler, GAME.Engine.getDeltaTime());
	// SMove.process();
	// SCollisionDetection.process(GAME.EntityManager.getGroup('COLLISION_BODIES'));
	SRender.process(GAME.Renderer, GAME.AssetManager);
}





