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
	GAME.Engine = new TOOLBOX.Engine(120, updateGame);
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
	GAME.EntityManager.registerComponentType('CRectangle');
	GAME.EntityManager.registerComponentType('CShape');
	GAME.EntityManager.registerComponentType('CCollision');
	GAME.EntityManager.registerComponentType('CCooldown');
	GAME.EntityManager.registerComponentType('CDash');
	
	// Create a group for basic collisions
	GAME.EntityManager.createGroup('COLLISION_BODIES_PLAYERS');
	
	// Set entity manager for Systems
	SMove.setEntityManager(GAME.EntityManager);
	SRender.setEntityManager(GAME.EntityManager);
	SControlChar.setEntityManager(GAME.EntityManager);
	SGravity.setEntityManager(GAME.EntityManager);
	STouchGround.setEntityManager(GAME.EntityManager);
	STouchWall.setEntityManager(GAME.EntityManager);
	SCoolDown.setEntityManager(GAME.EntityManager);
	SDash.setEntityManager(GAME.EntityManager);

	// Create player 1
	var e = GAME.EntityManager.create();
	GAME.EntityManager.addComponent(e, new CPos(100, 100))
		.addComponent(e, new CRectangle(50, 75))
		.addComponent(e, new CVelocity(0, 0))
		.addComponent(e, new CAccel(60))
		.addComponent(e, new CRender(0))
		.addComponent(e, new CCooldown(0, 0))
		.addToGroup(e, 'COLLISION_BODIES_PLAYERS')
		.addTag(e, 'PLAYER1');
	
	// Create player 2
	var e = GAME.EntityManager.create();
	GAME.EntityManager.addComponent(e, new CPos(350, 100))
		.addComponent(e, new CRectangle(50, 75))
		.addComponent(e, new CVelocity(0, 0))
		.addComponent(e, new CAccel(60))
		.addComponent(e, new CRender(1))
		.addComponent(e, new CCooldown(0, 0))
		.addToGroup(e, 'COLLISION_BODIES_PLAYERS')
		.addTag(e, 'PLAYER2');
	
	// Start the tools
	GAME.EventHandler.startEventHandler();
	GAME.Engine.startEngine();
}

// Update function called eahc frame
function updateGame() {
	// SAccelChar.process(GAME.EventHandler, GAME.Engine.getDeltaTime());
	// SMove.process();
	// SCollisionDetection.process(GAME.EntityManager.getGroup('COLLISION_BODIES'));
	
	SControlChar.process(GAME.EventHandler, GAME.Engine.getDeltaTime(), GAME.EntityManager.getByTag('PLAYER1'), 800);
	SControlChar.process(GAME.EventHandler, GAME.Engine.getDeltaTime(), GAME.EntityManager.getByTag('PLAYER2'), 800);
	SGravity.process(GAME.EntityManager.getGroup('COLLISION_BODIES_PLAYERS'), 3);
	SMove.process(GAME.Engine.getDeltaTime());
	STouchGround.process(GAME.EntityManager.getGroup('COLLISION_BODIES_PLAYERS'), 800);
<<<<<<< HEAD
	SDash.process(GAME.Engine.getDeltaTime(), 100, 2000);
=======
	STouchWall.process(GAME.EntityManager.getGroup('COLLISION_BODIES_PLAYERS'), 800);
	SDash.process(GAME.Engine.getDeltaTime(), 100, 1200);
>>>>>>> origin/master
	SCoolDown.process(GAME.Engine.getDeltaTime());
	
	SRender.process(GAME.Renderer, GAME.AssetManager);
}



