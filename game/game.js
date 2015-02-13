// TODO: PolyvsCircle, multiple moving objects, multiple collisions, (containment)

/* Using Entity System */

var GAME = {};
// On window loading
window.onload = init;
function init() {
	// srcArray and path
	var path = 'img/';
	var srcArray = ['circle.png', 'rectangle.png', 'triangle.png'];
	
	// Create the tools
	GAME.Engine = new TOOLBOX.Engine(30, updateGame);
	GAME.Renderer = new TOOLBOX.RenderContextCanvas('level2');
	GAME.EventHandler = new TOOLBOX.EventHandler(GAME.Renderer);
	GAME.AssetManager = new TOOLBOX.AssetManager(path, srcArray);
	GAME.AssetManager.load();
	
	// Asset management
	GAME.FileStreamProvider = new TOOLBOX.StreamProviders.File("D:/Game development/javascript/node-webkit/prototypev2/assets");
	GAME.AssetLoader = new TOOLBOX.AssetLoader(GAME.FileStreamProvider);
	GAME.AssetLoader.registerType("AnimationXML", new TOOLBOX.AssetLoaders.AnimationXML());
	GAME.AssetCache = new TOOLBOX.AssetCache(GAME.AssetLoader);
	
	GAME.AssetCache.get("AnimationXML", "test.xml", function(animation) {
		//

	});
	
	
	
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
	GAME.EntityManager.createGroup('COLLISION_BODIES');
	
	// Set entity manager for Systems
	SMove.setEntityManager(GAME.EntityManager);
	SAccelChar.setEntityManager(GAME.EntityManager);
	SRender.setEntityManager(GAME.EntityManager);
	SCollisionDetection.setEntityManager(GAME.EntityManager);
	SCollisionResolver.setEntityManager(GAME.EntityManager);
	
	// Create camera (pos, square, tag)
	var camera = GAME.EntityManager.create();
	GAME.EntityManager.addComponent(camera, new CPos(0, 0))
		.addComponent(camera, new CSquare(500, 500))
		.addTag(camera, 'CAMERA');

	// Create an entity
	var polygon = new TOOLBOX.Polygon();
	polygon.addVertex(0, 0);
	polygon.addVertex(50, 0);
	polygon.addVertex(50, 50);
	polygon.addVertex(0, 50);
	polygon.setCenter(25, 25);
	
	var e = GAME.EntityManager.create();
	GAME.EntityManager.addComponent(e, new CPos(50, 50))
	GAME.EntityManager.addComponent(e, new CVelocity(0, 0));
	GAME.EntityManager.addComponent(e, new CAccel(60));
	GAME.EntityManager.addComponent(e, new CRender(1));
	GAME.EntityManager.addComponent(e, new CShape('poly', polygon));
	GAME.EntityManager.addToGroup(e, 'COLLISION_BODIES');
	GAME.EntityManager.addTag(e, 'PLAYER');
	
	// Create an entity
	var polygon = new TOOLBOX.Polygon();
	polygon.addVertex(0, 0);
	polygon.addVertex(50, 0);
	polygon.addVertex(50, 50);
	polygon.addVertex(0, 50);
	polygon.setCenter(25, 25);
	
	var e = GAME.EntityManager.create();
	GAME.EntityManager.addComponent(e, new CPos(100, 100));
	GAME.EntityManager.addComponent(e, new CRender(1));
	GAME.EntityManager.addComponent(e, new CShape('poly', polygon));
	GAME.EntityManager.addToGroup(e, 'COLLISION_BODIES');
	
	// Create an entity
	var polygon = new TOOLBOX.Polygon();
	polygon.addVertex(25, 0);
	polygon.addVertex(50, 50);
	polygon.addVertex(0, 50);
	polygon.setCenter(25, 25);
	
	var e = GAME.EntityManager.create();
	GAME.EntityManager.addComponent(e, new CPos(200, 200));
	GAME.EntityManager.addComponent(e, new CRender(2));
	GAME.EntityManager.addComponent(e, new CShape('poly', polygon));
	GAME.EntityManager.addToGroup(e, 'COLLISION_BODIES');
	
	// Create a canvas
	/*
	var e = GAME.EntityManager.create();
	GAME.EntityManager.addComponent(e, new CPos(0, 0));
	GAME.EntityManager.addComponent(e, new CSquare(GAME.Renderer.getWidth, GAME.Renderer.getHeight)); // This must be the height and width of the screen in a simple game
	GAME.EntityManager.addTag(e, 'WORLD');
	*/
	
	// Start the tools
	GAME.EventHandler.startEventHandler();
	GAME.Engine.startEngine();
}

// Update function called eahc frame
function updateGame() {
	SAccelChar.process(GAME.EventHandler, GAME.Engine.getDeltaTime());
	SMove.process();
	SCollisionDetection.process(GAME.EntityManager.getGroup('COLLISION_BODIES'));
	SCollisionResolver.process();
	SRender.process(GAME.Renderer, GAME.AssetManager);
}





