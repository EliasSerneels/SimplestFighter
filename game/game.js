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
	GAME.Engine = new TOOLBOX.Engine(60, updateGame);
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
	GAME.EntityManager.registerComponentType('CScore');
	GAME.EntityManager.registerComponentType('CInvulnerable');
	GAME.EntityManager.registerComponentType('CFade');
	
	// Create a group for basic collisions
	GAME.EntityManager.createGroup('COLLISION_BODIES_PLAYERS');
	
	// Set entity manager for Systems
	SMove.setEntityManager(GAME.EntityManager);
	SRender.setEntityManager(GAME.EntityManager);
	SControlChar.setEntityManager(GAME.EntityManager);
	SGravity.setEntityManager(GAME.EntityManager);
	STouchGround.setEntityManager(GAME.EntityManager);
	STouchRoof.setEntityManager(GAME.EntityManager);
	STouchWall.setEntityManager(GAME.EntityManager);
	SCoolDown.setEntityManager(GAME.EntityManager);
	SDash.setEntityManager(GAME.EntityManager);
	SBoxCollision.setEntityManager(GAME.EntityManager);
	SDisplayScore.setEntityManager(GAME.EntityManager);
	SFade.setEntityManager(GAME.EntityManager);

	// Create player 1
	var e = GAME.EntityManager.create();
	GAME.EntityManager.addComponent(e, new CPos(100, 100))
		.addComponent(e, new CRectangle(50, 75))
		.addComponent(e, new CVelocity(0, 0))
		.addComponent(e, new CRender(0))
		.addComponent(e, new CCooldown(0, 0))
		.addComponent(e, new CScore(0))
		.addToGroup(e, 'COLLISION_BODIES_PLAYERS')
		.addTag(e, 'PLAYER1');
	
	// Create player 2
	var e = GAME.EntityManager.create();
	GAME.EntityManager.addComponent(e, new CPos(650, 100))
		.addComponent(e, new CRectangle(50, 75))
		.addComponent(e, new CVelocity(0, 0))
		.addComponent(e, new CRender(1))
		.addComponent(e, new CCooldown(0, 0))
		.addComponent(e, new CScore(0))
		.addToGroup(e, 'COLLISION_BODIES_PLAYERS')
		.addTag(e, 'PLAYER2');	
		
	// Start the tools
	GAME.EventHandler.startEventHandler();
	GAME.Engine.startEngine();
}

// Update function called eahc frame
function updateGame() {
	SControlChar.process(GAME.EventHandler, GAME.Engine.getDeltaTime(), GAME.EntityManager.getByTag('PLAYER1'), 800);
	SControlChar.process(GAME.EventHandler, GAME.Engine.getDeltaTime(), GAME.EntityManager.getByTag('PLAYER2'), 800);
	SGravity.process(GAME.EntityManager.getGroup('COLLISION_BODIES_PLAYERS'), 6);
	SMove.process(GAME.Engine.getDeltaTime());
	SDash.process(GAME.Engine.getDeltaTime(), 100, 2000);
	SCoolDown.process(GAME.Engine.getDeltaTime());
	SBoxCollision.process(GAME.EntityManager.getByTag('PLAYER1'), GAME.EntityManager.getByTag('PLAYER2'));
	SDisplayScore.process(GAME.EntityManager.getByTag('PLAYER1'), GAME.EntityManager.getByTag('PLAYER2'));
	STouchGround.process(GAME.EntityManager.getGroup('COLLISION_BODIES_PLAYERS'), 800);
	STouchRoof.process(GAME.EntityManager.getGroup('COLLISION_BODIES_PLAYERS'));
	STouchWall.process(GAME.EntityManager.getGroup('COLLISION_BODIES_PLAYERS'), 800);
	SFade.process(GAME.Engine.getDeltaTime());
	SRender.process(GAME.Renderer, GAME.AssetManager);
}



