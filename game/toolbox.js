
// TOOLBOX is a collection of code snippets build together to create javascript browser games.
// I will build simple demos and extend TOOLBOX along the way, just adding what I need or what I can single out of custom game code.

// JAVASCRIPT STYLE GUIDE && CODE CONVENTIONS
// I try to follow the Google Javascript Style Guide as much as possible: http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
// My reason for not using getters/setters and to always put methods in the .prototype when I can: http://w3net.eu/code/privateMembers/
// Instead I will use the underscore (" _ ") convention to indicate if a variable is _private or public/protected
//     => I am using getters on _private members if I need to know the var but not update the var
//     => and I am using getters and setters if I need to update more than 1 var with specific input
// http://java.dzone.com/articles/getter-setter-use-or-not-use-0
// http://www.javaworld.com/javaworld/jw-09-2003/jw-0905-toolbox.html?page=1
// The book "Javascript - The Good Parts" is a reference (e.g. cascading)

/* **** IMPROVEMENTS (???) ****

 - Game loop : http://codeofrob.com/archive/2011/03/17/a-javascript-game-loop-for-multiplayer-webgl.aspx
 
*/

// The TOOLBOX namespace
var TOOLBOX = {};

// The engine is a main thriving source for most games and handles frame rate and updating the game world
TOOLBOX.Engine = function(_fps, _func) {
	this._fps = _fps; // Frames Per Second
	this._update = _func; // The function to call each loop
	
	this._running = false; // State is 'false' (=off) or 'true' (=on)
	this._engineLoop = null;
	
	this._timePassed = 0; // Time passed since starting the engine
	this._lastFrame = null; // Used to calculate deltaTime
	this._deltaTime = null; // Time passed since last frame
};
TOOLBOX.Engine.prototype = {
	
	/* Public */
	
	startEngine : function() {
		this._running = true;
		this._lastFrame = new Date().getTime(); // Used to calculate deltaTime
		this._deltaTime = 0; // Time passed since last frame
		var my = this;
		this._engineLoop = setInterval(function() { my._run(my) }, 1000 / this._fps);
	},
	
	stopEngine : function() {
		this._timePassed = 0;
		this.pauseEngine();
	},
	
	pauseEngine : function() {
		this._running = false;
		clearInterval(this._engineLoop);
	},
	
	isRunning : function() {
		return this._running;
	},
	
	getTimePassed : function() {
		return this._timePassed;
	},
	
	getDeltaTime : function() {
		return this._deltaTime;
	},
	
	/* Private */
	
	_updateTime : function() {
		var currentTime = new Date().getTime();
		this._deltaTime = (currentTime - this._lastFrame) / 1000;
		this._lastFrame = currentTime;
		this._timePassed += this._deltaTime;
	},
	
	// Most custom part of the engine, update all that needs to be updated
	_run : function(my) {
		my._updateTime(); // Update the engine's time
		my._update(); // Call the update function passed to this engine
	},
};

/* List Class */
// I am working with getters and setters here to simplify the updating of a non-array list (of objects)
TOOLBOX.List = function() {
	this._entities = {};
	this._length = 0;
};
TOOLBOX.List.prototype = {
	
	/* Public */
	
	getLength : function() {
		return this._length;
	},
	
	getOne : function (id) {
		return this._entities[id];
	},
	
	getAll : function() {
		return this._entities;
	},
	
	// @param {Object} item The item to add
	addOne : function (item) {
		this._length++; // Update length
		var id = this._length; // Id of new item is new length
		this._entities[id] = item; // Add the item with it's id
		return id; // Return the id
	},
	
	// @param {Array} items The list of items to add
	addMore : function (items) {
		for(var i=0; i < items.length; i++) {
			this.addOne(items[i]);
		}
	},
	
	del : function (id) {
		delete this._entities[id];
		this._length--;
	},
};

/*
* Render Contexts
*/

// Different renderers will implement the same simple render functions so they can be swapped easily (e.g. canvas and divs)

// RenderContextCanvas
TOOLBOX.RenderContextCanvas = function(_canvas) {
	this._canvas = document.getElementById(_canvas); // A reference to the HTML canvas
	this._ctx = this._canvas.getContext('2d'); // A reference to the canvas' 2d context
};
TOOLBOX.RenderContextCanvas.prototype = {
	
	/* Public */
	
	clear : function() {
		this._ctx.clearRect(0, 0, this.getWidth(), this.getHeight());
	},
	
	getScreen : function() { // Returns the screen html element (here a canvas)
		return this._canvas;
	},
	
	getWidth : function() {
		return this._canvas.width;
	},
	
	getHeight : function() {
		return this._canvas.height;
	},
	
	renderObject : function (img, x, y) {
		this._ctx.drawImage(img, x, y);
	},
	
	renderText : function (string, x, y) {
		this._ctx.fillText(string, x, y);  
	},
	
	getCoords : function(e) { // Get coords from event
		var coords = [e.clientX-this._canvas.offsetLeft, e.clientY-this._canvas.offsetTop];
		return coords;
	},
};

// Event Handler
// Read user input from the OS/hardware
// Only useable for google chrome (not bothering with annoying cross-browser stuff etc)
TOOLBOX.EventHandler = function(_context) {
	this._context = _context;
	
	// Initialise variable data
	this._mouseDown = false;
	this._mousePos = {
		'x' : 0,
		'y' : 0,
	};
	this._keysActive = { // For onKeyDown and onKeyUp => Detect if it is 'active' (off <-> on))
		'32' : false, // space
		'38' : false, // up
		'40' : false, // down
		'37' : false, // left
		'39' : false, // right
		'65' : false, // a
		'90' : false, // z
		'69' : false, // e
		'82' : false, // r
		'81' : false, // q
		'83' : false, // s
		'68' : false, // d
		'70' : false, // f
		'87' : false, // w
		'88' : false, // x
		'67' : false, // c
		'86' : false  // v
	};
}
TOOLBOX.EventHandler.prototype = {
	
	/* Public */
	
	// Getters
	getMouseDown : function() {
		return this._mouseDown;
	},
	
	getMousePos : function() {
		return this._mousePos;
	},
	
	getKeysActive : function() {
		return this._keysActive;
	},
	
	// Coords may be buggy when there is a SCROLLBAR (not an urgent fix)
	startEventHandler : function() {
		my = this; // Points to this function in eventlisteners, instead of to the element it is on
		
		this._context.getScreen().addEventListener('mousedown', mousedownHandler = function(e) { // if MOUSEDOWN set to 'active'
			my._mouseDown = true;
			my._calcMousePos(e); // save mouse coords
		}, false);
		
		this._context.getScreen().addEventListener('mouseup', mouseupHandler = function(e) { // if MOUSEUP set to 'non-active'
			my._mouseDown = false;
			my._calcMousePos(e); // save mouse coords
		}, false);
		
		/* MAY BE SLOW, thus not included atm (maybe later for drag-n-drop etc)
		this._context.getScreen().addEventListener('mousemove', clickHandler = function(e) {
			_calcMousePos(e);
		}, false);
		*/
		
		/* for key events add them to the window not to any other DOM element */
		
		window.addEventListener('keydown', keydownHandler = function(e) { // if KEYDOWN set to 'active'
			my._keysActive[e.keyCode] = true;
		}, false);
		
		window.addEventListener('keyup', keyupHandler = function(e) { // if KEYUP set to 'non-active'
			my._keysActive[e.keyCode] = false;
		}, false);
	},
	
	stopEventHandler : function() {
		this._context.getScreen().removeEventListener('mousedown', mousedownHandler, false);
		this._context.getScreen().removeEventListener('mouseup', mouseupHandler, false);
		this._context.getScreen().removeEventListener('keydown', keydownHandler, false);
		this._context.getScreen().removeEventListener('keyup', keyupHandler, false);
	},
	
	/* Private */
	
	_calcMousePos : function(e) {
		// Position relative to the window
		var x = 0;
		var y = 0;
		
		// Check cross-browser way
		if (e.pageX || e.pageY) { 
		  x = e.pageX;
		  y = e.pageY;
		} else { 
		  x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
		  y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
		} 
		
		// Position relative to the element
		this._mousePos.x = x - this._context.getScreen().offsetLeft;
		this._mousePos.y = y - this._context.getScreen().offsetTop;
	},
};

// Asset Manager
// Basics: array to graphics, VERY BASIC pre-loading
TOOLBOX.AssetManager = function(_path, _srcArray) {
	this._path = _path;
	this._srcArray = _srcArray;
	
	this._images = [];
};
TOOLBOX.AssetManager.prototype = {
	
	/* Public */
	
	load : function() {
		for(var i=0; i < this._srcArray.length; i++) {
			this._images[i] = new Image();
			this._images[i].src = this._path + this._srcArray[i];
		}
	},
	
	getImage : function(id) {
		return this._images[id];
	}
};

/* ASSET MANAGEMENT */
// Some general reflections on asset mangement: http://gamedev.stackexchange.com/questions/1702/how-to-design-an-assetmanager

// Asset Loader
// Loads an asset from a certain source and returns it
// Based on: http://gamedev.stackexchange.com/questions/34051/how-should-i-structure-an-extensible-asset-loading-system
TOOLBOX.AssetLoader = function(_streamProvider) {
	this._streamProvider = _streamProvider;
	this._loaders = {};
};
TOOLBOX.AssetLoader.prototype = {
	
	/* Public */
	
	registerType : function(type, loader) {
		this._loaders[type] = loader;
		return this; // Enable cascading
	},
	
	getRegisteredTypes : function() {
		var types = [];
		for(type in this._loaders) {
			if(this._loaders.hasOwnProperty(type)) { // Don't count prototype stuff
				types.push(type);
			}
		}
		return types;
	},
	
	/* Callback function takes parameter asset */
	load : function(type, name, callback) {
		var loader = this._loaders[type];
		this._streamProvider.getStream(type, name, function(stream) {
			loader.load(stream, callback);
		});
	}
};

TOOLBOX.StreamProviders = {}; // Create namespace

TOOLBOX.StreamProviders.File = function(_baseDir) {
	this._baseDir = _baseDir; // baseDir to find assets
	
	this.fs = require('fs'); // Load filesystem module
	this.path = require('path'); // Load path module
};
TOOLBOX.StreamProviders.File.prototype = {
	getStream : function(type, name, callback) {
		this.fs.readFile(this.path.resolve(this._baseDir, type, name), function(err, logData) {
			if (err) throw err;
			callback(logData); // Return logData (= Buffer object)
		}); // Find file in subdirectory of type in baseDir
	},
};

TOOLBOX.AssetLoaders = {}; // Create namespace

TOOLBOX.AssetLoaders.AnimationXML = function() {
	this._xml2js = require('xml2js'); // Load module
};
TOOLBOX.AssetLoaders.AnimationXML.prototype = {
	load : function(stream, callback) {
		var parseString = require('xml2js').parseString;
		parseString(stream, {explicitRoot: false, explicitArray: false}, function (err, result) {
			if (err) throw err;
			callback(result);
		});
	},
};

// Asset Cache
// Holds and keeps track of assets in a cache
// Eventually should aim to take care of both shared assets and reference counting
// Atm only takes care of shared assets
// http://gamedev.stackexchange.com/questions/1702/how-to-design-an-assetmanager
TOOLBOX.AssetCache = function(_assetLoader) {
	this._assetLoader = _assetLoader;
	
	this._assets = {};
};
TOOLBOX.AssetCache.prototype = {

	/* Private */
	
	// Get registered types from the loader
	_updateTypes : function(type) {
		var types = this._assetLoader.getRegisteredTypes();
		for(i = 0; i < types.length; i++) {
			var type = types[i];
			if(!this._assets[type]) {
				this._assets[type] = {};
				console.log(type + ' added as a type to the AssetCache');
			} else {
				console.log(type + " is already registered to this AssetCache");
			}
		}
	},
	
	/* Public */

	get : function(type, name, callback) {
		if(typeof this._assets[type] === 'undefined') { // Check if the type is already registered, if not update types
			this._updateTypes();
		}
		if(!this._assets[type][name]) { // If the asset doesn't exist yet in the cache, load it first
			this._assetLoader.load(type, name, function(asset) {
				this._assets[type][name] = asset;
				callback(asset);
			}.bind(this));
		} else {
			callback(this._assets[type][name]);
		}
	}	
};

/*      */

// Entity System
// Based on RDBMS With Code in Systems (the t-machine approach) => http://entity-systems.wikidot.com/rdbms-with-code-in-systems
// then more elaborate in Fast Entity Component System => http://entity-systems.wikidot.com/fast-entity-component-system#java
// then concrete and even more elaborate in Artemis Entity System Framework => http://entity-systems.wikidot.com/artemis-entity-system-framework#artemis
// Official site of Artemis ESF + source code and explanation => http://www.gamadu.com/artemis/

// My implementation (Javascript) :

/* EntityManager (singleton-like class, this implementation should be good enough) */

TOOLBOX.EntityManager = function() {
	var entities = []; // List of unique id's a.k.a Entities
	var map = {};
	
	/* Example
	- hashmap[unique component type][an enity id][the component object itself (aka the data)]
	map = {
		'CPos' : { 0 : 'obj', 2 : 'obj', 3 : 'obj' },
		'CMove' : { 0 : 'obj', 5 : 'obj' },
	};
	*/
	
	var tags = {};
	var groups = {};
	
	/* Public */
	
	// Add a new component type to support (maybe update this later to make it easier to load a bunch of types or something)
	this.registerComponentType = function(componentType) {
		if(!map[componentType]) {
			map[componentType] = {};
		} else {
			console.log(componentType + " is already loaded into the Entity Manager");
		}
		return this; // Enable cascading
	}
	
	// Create a new entity
	this.create = function() {
		var id = getNextAvailableId();
		entities[id] = true;
		return id; // unique id = entity
	}
	
	// Destroy an entity
	this.destroy = function(entity) {
		for(componentType in map) {
			if(map[componentType][entity]) {
				delete map[componentType][entity]; // Delete each component of the entity
			}
		}
		entities[entity] = false; // Free up the unique id of the destroyed entity
	}
	
	// Add a component to an entity
	this.addComponent = function(entity, component) {
		map[component.type][entity] = component;
		return this; // Enable cascading
	}
	
	// Get a component from an entity
	this.getComponent = function(entity, componentType) {
		return map[componentType][entity];
	}
	
	// Get all components of a certain type in the db
	this.getAllComponentsOfType = function(componentType) {
		return map[componentType];
	}
	
	// Return a list of entities who posses all the given component types
	/* OPTIMIZE ??? */
	this.getEntitiesWithComponents = function(listOfComponentTypes) {
		var entitiesList = {};
		var returnList = [];
		
		// Grab all the entities that have the first component types
		for(entity in map[listOfComponentTypes[0]]) {
			entitiesList[entity] = true;
		}
		
		// Loop through the other (i=1, we did 0 already) component type
		for(i=1; i < listOfComponentTypes.length; i++) {
			// Check if the entities in the list have this component type also
			for(entity in map[listOfComponentTypes[i]]) {
				if(!entitiesList[entity]) {
					// If not delete this entity from the list, it doesn't fit the requirements
					delete entitiesList[entity];
				}
			}
		}
		
		// Now get the index of entitiesList, these are all the entity IDs that need to be returned
		for(entity in entitiesList) {
			returnList.push(entity);
		}
		
		return returnList;
	},
	
	// @param entity Object
	// @param tag string
	this.addTag = function(entity, tag) {
		tags[tag] = entity;
		return this; // Enable cascading
	},
	
	// Delete by "entity" or by "tag" or both ???
	// delTag
	
	// @param tag string
	this.getByTag = function(tag) {
		return tags[tag];
	},
	
	// Create a new group
	this.createGroup = function(name) {
		if(!groups[name]) {
			groups[name] = [];
		} else {
			console.log(name + " is already loaded into the Entity Manager");
		}
	},
	
	// Destroy a group
	this.destroyGroup = function(name) {
		delete groups[name];
	},
	
	// Add an entity to a group
	this.addToGroup = function(entity, group) {
		groups[group].push(entity);
		return this; // Enable cascading
	},
	
	// Remove an entity from a group
	this.removeFromGroup = function(entity, group) {
		for(i=0; i < groups[group].length; i++) {
			if(i === entity) {
				groups[group].splice(i, 1);
			}
		}
	},
	
	// Return an array of the entities in a group
	this.getGroup = function(group){
		return groups[group];
	}
	
	/* Private */
	
	// Returns the next available id
	getNextAvailableId = function() {
		for(var i=0; i < entities.length; i++) {
			if(!entities[i]) { // If place is empty, use that one
				return i;
			}
		}
		return entities.length++; // If we get here, no existing places were available, return the empty space at the end
	}
}


/* PHYSICS */



/* COLLISION DETECTION */

// Math Definitions and Shapes
	
// vector Class
// A coordinate vector (with start in the origin and a given end)
// http://en.wikipedia.org/wiki/Coordinate_vector
// @param x The x coordinate of the vector
// @param y The y coordinate of the vector
TOOLBOX.Vector = function(x, y) {
	this.x = x;
	this.y = y;
};
TOOLBOX.Vector.prototype = {
	
	/* Public */
	
	// Calculate the length of the vector
	// @param void
	// @return vector
	getLength : function() {
		return Math.sqrt((this.x * this.x) + (this.y * this.y));
	},
	
	// substract 2 vectors
	// @param v A vector
	// @return vector
	substract : function(v) {
		return new TOOLBOX.Vector(this.x - v.x, this.y - v.y);
	},
	
	// Calculate a vector dot product
	// @param v A vector
	// @return The dot product
	dotProduct : function(v) {
		return (this.x * v.x + this.y * v.y);
	},
	
	// normalize the vector
	// http://www.fundza.com/vectors/normalize/index.html
	// http://prograMMedlessons.org/vectorLessons/vch04/vch04_4.html
	// @param void
	// @return vector
	normalize : function() {
		var length = this.getLength();
		
		if(length === 0) {
			return new TOOLBOX.Vector(0, 0);
		} else {
			var x = this.x / length;
			var y = this.y / length;
			return new TOOLBOX.Vector(x, y);
		}
	},
	
	// Calculate the perpendicular vector (normal)
	// http://en.wikipedia.org/wiki/perpendicular_vector
	// @param void
	// @return vector
	perp : function() {
		return new TOOLBOX.Vector(-this.y, this.x);
	},
	
	// Negate a vector (multiply by -1)
	negate : function() {
		this.x = -this.x;
		this.y = -this.y;
	},
};

// Circle Class
// http://en.wikipedia.org/wiki/circle
// @param x The x coordinate of the center
// @param y The y coordinate of the center
// @param r The radius of the circle
TOOLBOX.Circle = function(x, y, r) {
	this.x = x;
	this.y = y;
	this.r = r;
}

// Rectangle Class
TOOLBOX.Rectangle = function(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}

// Polygon Class
TOOLBOX.Polygon = function() {
	this.center = null;
	this.vertices = [];
}
TOOLBOX.Polygon.prototype = {
	
	/* Public */
	
	// Add a vertex to the list
	// @param x The x coordinate of the vertex
	// @param y The y coordinate of the vertex
	addVertex : function(x, y) {
		var vertex = new TOOLBOX.Vector(x, y);
		this.vertices.push(vertex);
	},
	
	setCenter : function(x, y) {
		this.center = new TOOLBOX.Vector(x, y);
	},
};

// 2D Collision Detection
TOOLBOX.CollisionDetection2D = {
	
	/* Public */
	
	// Axis-Aligned Bounding Box
	// Checks if 2 axis-aligned rectangles are overlapping
	// TODO: Return resulting vector
	AABB : function(r1, r2) {
		if(r1.x < r2.x + r2.width && r1.x + r1.width > r2.x && r1.y < r2.y + r2.height && r1.height + r1.y > r2.y) {
			return true;
		}
		return false;
	}
}

// Separating Axis Theorem

// http://www.codezealot.org/archives/55#sat-convex
// http://pogopixels.com/blog/2d-polygon-collision-detection/
// http://www.metanetsoftware.com/technique/tutorialA.html

TOOLBOX.SAT = {
	
	/* Public */
	
	// Checks if 2 polygons are overlapping
	// @param p1 The first polygon (list of vectors)
	// @param p2 The second polygon (list of vectors)
	// @return false if they don't overlap, a resulting vector if they do
	PolyToPoly : function(p1, p2) {
		var overlap = 0; // The amount of overlap, needed to determine the resulting vector
		var smallestOverlapAxis = null;
		
		for(var n=0; n < p1.vertices.length; n++) { // Test polygon 1 edges
			var v1 = p1.vertices[n]; // First vector of the side
			var v2 = p1.vertices[(n + 1) % p1.vertices.length]; // Second vector of the side ("%" cycle through the polygon until first vector)
			
			var edge = v2.substract(v1);
			var axis = edge.perp(); // Find the side's normal...
			axis = axis.normalize(); // ...and make it a unit vector
			
			var p1Interval = this._PolyInterval(axis, p1);
			var p2Interval = this._PolyInterval(axis, p2);
			
			if(!this._PolyToPolyOverlap(p1Interval, p2Interval)) { // If there is no overlap
				return false; // No overlap (exit loop)
			} else { // ... but if there IS an overlap:
				var overlapOfThisAxis = this._PolyToPolyOverlap(p1Interval, p2Interval);
				
				// Check for containment
				/* TODO
				if(p1.contains(p2) || p2.contains(p1) {
					var mins = abs(p1Interval.min - p2Interval.max);
					var max = abs(p1Interval.max - p2Interval.max);
					
					// Result needs to be overlap + the amount the poly is actually inside the other poly
					if(mins < maxs) {
						overlapOfThisAxis += mins;
					} else {
						overlapOfThisAxis += maxs;
					}
				}
				*/
				
				// Find the smallest overlap
				if(overlapOfThisAxis < overlap || overlap === 0) { // If the new overlap is smaller, or it's the first overlap
					overlap = overlapOfThisAxis; // The smallest overlap found until now
					smallestOverlapAxis = axis; // Take the current axis as the smallest until a smaller overlap is found
				}
			}
		}
		
		for(var n=0; n < p2.vertices.length; n++) { // Test polygon 2 edges
			var v1 = p2.vertices[n]; // First vector of the side
			var v2 = p2.vertices[(n + 1) % p2.vertices.length]; // Second vector of the side ("%" cycle through the polygon until first vector)
			
			var edge = v2.substract(v1);
			var axis = edge.perp(); // Find the side's normal...
			axis = axis.normalize(); // ...and make it a unit vector
			
			var p1Interval = this._PolyInterval(axis, p1);
			var p2Interval = this._PolyInterval(axis, p2);
			
			if(!this._PolyToPolyOverlap(p2Interval, p1Interval)) { // If there is no overlap
				return false; // No overlap (exit loop)
			} else { // ... but if there IS an overlap:
				var overlapOfThisAxis = this._PolyToPolyOverlap(p2Interval, p1Interval);
				
				if(overlapOfThisAxis < overlap || overlap === 0) { // If the new overlap is smaller, or it's the first overlap
					overlap = overlapOfThisAxis; // The smallest overlap found until now
					smallestOverlapAxis = axis; // Take the current axis until a smaller overlap is found
				}
			}
		}
		
		// TODO: MAKE SURE RESULTING vector IS CORRECT IN ALL CASES
		
		// If we haven't exited by now there is an overlap on each side of each polygon and we have a collision, return resulting vector
		// Resulting vector = MTV = Minimum Translation vector
		// The coords are the axis (normalised direction) * the overlap (size of overlap)
		
		
		// Create the resulting vector (Minimum Translation Vector)
		var MTV = new TOOLBOX.Vector(smallestOverlapAxis.x * overlap, smallestOverlapAxis.y * overlap);
		
		// Return the resulting vector, always from first to next polygon (so check with direction of the vector from centerA to centerB)
		var ca = p1.center;
		var cb = p2.center;
		var cacb = ca.substract(cb);
		if(MTV.dotProduct(cacb) < 0) {
			MTV.negate();
		}
		
		return MTV;
	},
	
	// Checks if a polygon and a circle are overlapping
	// @param p A polygon (list of vectors)
	// @param c A circle
	// @return false if they don't overlap, a resulting vector if they do
	PolyToCircle : function(p, c) {
		for(var n = 0; n < p.vertices.length; n++) { // Test polygon edges
			var v1 = p.vertices[n]; // First vector of the side
			var v2 = p.vertices[(n + 1) % p.vertices.length]; // Second vector of the side ("%" cycle through the polygon until first vector)
			
			var edge = v1.substract(v2);
			var axis = edge.perp(); // Find the side's normal...
			axis = axis.normalize(); // ...and make it a unit vector
			
			if(!this._PolyToCircleOverlap(axis, p, c)) { // If there is no overlap
				return false; // No overlap (exit loop)
			}
		}
		
		for(var n = 0; n < p.vertices.length; n++) { // Test polygon vertexes
			var axis = p.vertices[n].substract(c); // Create axis by circle's center and a vertex
			axis = axis.normalize(); // ...and make it a unit vector
			
			if(!this._PolyToCircleOverlap(axis, p, c)) { // If there is no overlap
				return false; // No overlap (exit loop)
			}
		}
		
		// TODO: resulting vector
		return true;
	},
	
	// Checks if 2 circles are overlapping
	// @param c1 The first circle
	// @param c1 The second circle
	// @return false if they don't overlap, a resulting vector if they do
	circleToCircle : function(c1, c2)  {
		var totalRadius = c1.r + c2.r; // Calculate their combined radii
		var centerDistance = Math.sqrt((c2.x - c1.x) * (c2.x - c1.x) + (c2.y - c1.y) * (c2.y - c1.y)); // Calculate the distance between their centers: http://en.wikipedia.org/wiki/Cartesian_coordinates#Distance_between_two_points
		if(centerDistance < totalRadius) { // Check for overlap
			var difference = totalRadius - centerDistance; // Find out how much they overlap
			return new TOOLBOX.Vector((c2.x - c1.x) * difference, (c2.y - c1.y) * difference); // Return the resulting vector
		}
		return false; // No overlap
	},
	
	/* Private */
	
	// Check if 2 projected polygons overlap on the axis
	// @param axis The axis to project both polygons on
	// @param p1 The first polygon
	// @param p2 The second polygon
	// @return A statement to be evaluated
	_PolyToPolyOverlap : function(axis, p1Interval, p2Interval) {
		if(p1Interval.min <= p2Interval.max && p2Interval.min <= p1Interval.max) { // Check if there is an overlap
			return this._intervalDistance(p1Interval.min, p1Interval.max, p2Interval.min, p2Interval.max);
		} else {
			return false;
		}
	},
	
	// Check if a projected polygon and a projected circle overlap on the axis
	// @param axis The axis to project both polygons on
	// @param p The polygon
	// @param c The circle
	// @return A statement to be evaluated
	_PolyToCircleOverlap : function(axis, p, c) {
		var pInterval = this._PolyInterval(axis, p);
		var cInterval = this._circleInterval(axis, c);
		return (pInterval.min <= cInterval.max && cInterval.min <= pInterval.max); // Check if there is an overlap
	},
	
	// Projects all vertexes of a polygon on an axis and calculates a scalar, then returns the min and max values
	// @param axis The axis to project the vertexes on
	// @param p The polygon to be projected
	// @return A container with the min and max value
	_PolyInterval : function(axis, p) {
		var min = max = axis.dotProduct(p.vertices[0]); // A scalar to express the projection's distance, start with first point
		for(var n = 1, point; point = p.vertices[n]; n++) { // Project all points (vectors) of the first polygon (0th was done already)
			var scalar = axis.dotProduct(point); // The scalar that expresses this projection's distance
			if(scalar > max) { max = scalar; } // If new scalar is a max, update max
			if(scalar < min) { min = scalar; } // If new scalar is a min, update min
		}
		return {'min' : min, 'max' : max};
	},
	
	// Projects a circle on an axis and returns min and max values
	// @param axis The axis to project the circle on
	// @param c The circle to be projected
	// @return A container with the min and max value
	_circleInterval : function(axis, c) {
		var scalar = axis.DotProduct(c);
		var min = scalar - c.r;
		var max = scalar + c.r;
		
		return {'min' : min, 'max' : max};
	},
	
	// Calculate the distance between the boundaries of an interval
	_intervalDistance : function(minA, maxA, minB, maxB) {
		if (minA < minB) {
			return minB - maxA;
		} else {
			return minA - maxB;
		}
	},
}





