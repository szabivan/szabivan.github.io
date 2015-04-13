// TODO külön kell szedni a gombokat a rajtuk levő klózoktól!

/** MAGIC CONSTANTS **/
var round = 5; 			// rounded rectangles' corner
var Width = 400;		// width of the game window
var clauseSize = 80;	// default diameter of a clause
var buttonSize = 100;	// size of a button
var Height = 3 * buttonSize;		// height of the game window
var buttonRowCount = 3; // number of rows
var activeMenuColor = "lightgreen";
var inactiveMenuColor = "white";
var shootingTime = 0.2; // one shot's duration in secs
var obsoletingTime = 1; // how long obsolete fading takes
var mobPosX = Width / 2;
var mobPosY = clauseSize * 2.5;
var mobSize = 2 * clauseSize;
var ticksPerSec = 50;	// tick per sec
var gravity = 9.81;	// 9.81m/ss. No real meaning tough :D

/** GLOBAL VARIABLES **/
var stage;
var mob;			// current target clause in the center
var origMob;		// original target clause, saved for restart
var sigma = [];		// weapon clauses
var origSigma = []; // original weapon clauses, saved for restart
var shot;			// the shot clause, if exists (firing > 0)
var firing = 0;		// >0 during firing (frames left), 0 otherwise
var shotX0, shotY0; // source of the shot
var shotX1, shotY1; // target of the shot (i.e. position of the mob)
var activeGun;		// 0..sigma.length-1 , the index of the active clause
var gameState = 1;  // game state. 1: playing

/** LITERAL CLASS **/
var colorArray = ["red", "green", "blue", "black","cyan","magenta","silver"];
function getColor( i ){
	return colorArray[i];
}

function drawThings( x, y, radius, count ){
	if( count <= 0 ) return [];
	var ret = [ {x:0, y:0, r:1 } ]; // {x,y,r} tömb jön vissza
	// ha 1 a sugar, mennyi pont fel er? szummaval megkapjuk a gyurunkenti max erteket
	var layers = 1;
	var total = 1;
	while( total < count ){
		var alpha = Math.asin( 0.5 / layers ) * 1.98; // ennyi fok elteres KELL
		var countOnThisLayer = Math.floor( 2*Math.PI / alpha ); // akkor ennyi kor fer el
		if( countOnThisLayer > (count-total)) countOnThisLayer = count - total; //ha nem kell mar ennyi, akkor csak ennyi lesz
		alpha = 2*Math.PI / countOnThisLayer; // tehat ennyi lesz a fok
		for( var i = 0; i < countOnThisLayer; i++ ){
			ret.push( {x: 2*layers*Math.sin( alpha*i) , y: 2*layers*Math.cos(alpha*i), r:1 } ); 
		}
		total += countOnThisLayer;
		layers++;
	}
	var scale = radius / (2*layers-1) ;
	for( var i = 0; i < ret.length; i++ ){ ret[i].r = scale; ret[i].x *= scale; ret[i].y *= scale; }
	return ret;
}
function drawLiteral( graphics, color, background, polarity, radius, x, y ){
  graphics.beginFill( color ).drawCircle( x, y, radius );
  if( polarity < 0 ){
     graphics.beginFill( "white" ).drawCircle( x, y, radius*2/3 );
  }
}

function getLiteral( color, polarity, radius, x, y, count ){
  var shape = new createjs.Shape();
  var innerRadius = radius / count;  
  for( var i = 0; i < count; i++ ){
	var Theta = Math.random() * 2 * Math.PI;
	var radi = 1 * ( radius - innerRadius );
    shape.graphics.beginFill( color ).drawCircle( radi * Math.sin( Theta ), radi * Math.cos( Theta ), innerRadius );
    if( polarity < 0 ){
      shape.graphics.beginFill( inactiveMenuColor ).drawCircle( radi * Math.sin( Theta ), radi * Math.cos( Theta ), innerRadius*2/3 );
    }
  }
  shape.x = x;
  shape.y = y;
  return shape;
}

/** CLAUSE CLASS **/

/** Clause( int arr[], double radius, boolean framed )
 **/
function Clause( arr, radius ){
  this.size = 0;
  this.container = new createjs.Container();
  this.arr = arr.slice();  
  this.tmpArr = [];
  for( var i = 0; i < this.arr.length; i++ ) if( this.arr[i] ) { this.size++; this.tmpArr.push( (i+1)*sign(this.arr[i] )); }
  this.setRadius( radius );
}
Clause.prototype.addToStage = function(){ this.addToContainer( stage ); }
Clause.prototype.removeFromStage = function(){ this.removeFromContainer( stage ); }
Clause.prototype.removeFromContainer = function( cont ){ cont.removeChild( this.container ); }
Clause.prototype.addToContainer = function( cont ){ cont.addChild( this.container ); }
Clause.prototype.setPosition = function( x, y ){ this.container.x = x; this.container.y = y; }
Clause.prototype.getPosition = function(){ return {x: this.container.x, y: this.container.y }; }
Clause.prototype.setRotation = function( theta ){ this.container.rotation = theta; }
Clause.prototype.recalculateGraphics = function() {
  this.container.removeAllChildren();
  var shape = new createjs.Shape();
  shape.graphics.beginStroke("black").drawCircle( 0, 0, this.radius );
  this.container.addChild( shape );
  switch( this.size ){
	case 1: this.container.addChild( getLiteral( getColor( Math.abs(this.tmpArr[0]) - 1 ), this.tmpArr[0], this.radius*3/4, 0, this.radius / 4, Math.abs( this.arr[ Math.abs( this.tmpArr[0] ) - 1 ] ) ) );
    case 0: break;
	case 2:
	  for( var i = 0; i < 2; i++ ){
		  this.container.addChild( getLiteral( getColor( Math.abs(this.tmpArr[i])-1 ), this.tmpArr[i], this.radius/2, 0, this.radius/2 - i*this.radius , Math.abs( this.arr[ Math.abs( this.tmpArr[i] ) - 1 ] ) ) );
	  }
	  break;
	case 3:
	case 4:
	case 5:
    case 6:
      var spn = Math.sin( Math.PI / this.size );
      var r = this.radius * spn / (1+spn);
      for( var i = 0; i < this.size; i++ ){
		  this.container.addChild( getLiteral( getColor(Math.abs(this.tmpArr[i])-1),this.tmpArr[i],r,(this.radius-r)*Math.sin(i*2*Math.PI/this.size),(this.radius-r)*Math.cos(i*2*Math.PI/this.size), Math.abs( this.arr[ Math.abs( this.tmpArr[i] ) - 1 ] ) ) );
	  }	  
	  break;	  
	case 7:
	  var r = this.radius / 3;
	  this.container.addChild( getLiteral( getColor(Math.abs(this.tmpArr[0])-1),this.tmpArr[0],r,0,0, Math.abs( this.arr[ Math.abs( this.tmpArr[0] ) - 1 ] ) ) );	  
      for( var i = 1; i < this.size; i++ ){
		  this.container.addChild( getLiteral( getColor(Math.abs(this.tmpArr[i])-1),this.tmpArr[i],r,(this.radius-r)*Math.sin(i*Math.PI/3),(this.radius-r)*Math.cos(i*Math.PI/3), Math.abs( this.arr[ Math.abs( this.tmpArr[i] ) - 1 ] ) ) );
	  }	  
	  break;	  
	default:
	  alert("Call support, that many literals per clause are not supported yet");
	  break;
  }
}
Clause.prototype.setRadius = function( radius ){
  this.radius = radius;
  this.recalculateGraphics();
}

/** BUTTON CLASS **/
function FireButton( p ){
  this.clause = null;
  this.frame = new createjs.Shape();
  this.frame.x = this.frame.y = 0;
  this.setActive( 0 );
  this.container = new createjs.Container();
  this.container.addChild( this.frame );
  this.container.x = p.x;
  this.container.y = p.y;
  this.container.parentButton = this;
  this.container.mouseChildren = false;
  var hitArea = new createjs.Shape();
  hitArea.graphics.beginFill("lightgreen").drawRect( -buttonSize/2, -buttonSize/2, buttonSize, buttonSize );
  this.container.hit = hitArea;
  this.text = null;
}
var FireButtonInactive = new createjs.Graphics();
FireButtonInactive.beginStroke("black").drawRoundRect( -buttonSize/2, -buttonSize/2, buttonSize, buttonSize, round );
var FireButtonActive = new createjs.Graphics();
FireButtonActive.beginFill(activeMenuColor).drawRoundRect( -buttonSize/2, -buttonSize/2, buttonSize, buttonSize, round );
FireButtonActive.beginStroke("black").drawRoundRect( -buttonSize/2, -buttonSize/2, buttonSize, buttonSize, round );

/** getButtonGraphics( boolean isActive ) 
    returns a Graphics() object, drawing the clause firing button's borders.
 **/
function getButtonGraphics( isActive ){
	var g = new createjs.Graphics();
	if( isActive ){
	  g.beginFill(activeMenuColor).drawRoundRect( -buttonSize/2, -buttonSize/2, buttonSize, buttonSize, round );		
	}else{
	  g.beginFill(inactiveMenuColor).drawRoundRect( -buttonSize/2, -buttonSize/2, buttonSize, buttonSize, round );				
	}
	g.beginStroke("black").drawRoundRect( -buttonSize/2, -buttonSize/2, buttonSize, buttonSize, round );
	return g;
}

FireButton.prototype.setActive = function( isActive ){ this.frame.graphics = getButtonGraphics( isActive ); }
FireButton.prototype.addToStage = function(){ stage.addChild( this.container ); }
FireButton.prototype.getPosition = function(){ return {x: this.container.x, y: this.container.y }; }
FireButton.prototype.setClause = function( c ){ 
  if( this.clause != null ){
    this.clause.removeFromContainer( this.container );
  }
  this.clause = c;
  if( c != null ){
	this.clause.setPosition( 0,0 );
	this.clause.container.x = 0;
	this.clause.container.y = 0;
    this.clause.addToContainer( this.container );
	this.clause.setRadius( clauseSize / 2 );
  }
}


FireButton.prototype.handleTick = function( event ){
  var matrix = new createjs.ColorMatrix().adjustSaturation(-100 * this.obsoleteCount / (obsoletingTime * ticksPerSec ) );
  this.clause.container.filters = [ new createjs.ColorMatrixFilter( matrix ) ];
  this.clause.container.cache( -clauseSize/2, -clauseSize/2, clauseSize, clauseSize );
  this.obsoleteCount++;
  if( this.obsoleteCount > obsoletingTime * ticksPerSec  ){
	  createjs.Ticker.removeEventListener("tick",this.obsfn );
	  this.setClause( null );
	  this.setObsoleted( 0 );
  }
}

FireButton.prototype.setObsoleted = function( isObsoleted ){
  if( isObsoleted ){
	this.isObsoleted = 1;
    this.obsoleteText = new createjs.Text("Obsolete","30px bold sans", "red");
    this.obsoleteText.textAlign = "center";
    this.obsoleteText.textBaseline = "middle";
    this.obsoleteText.rotation = -30;
    this.container.addChild( this.obsoleteText );
    this.obsoleteCount = 0;
    this.obsfn = this.handleTick.bind( this );
    createjs.Ticker.addEventListener("tick",this.obsfn );
  }else{
	this.isObsoleted = 0;
	this.container.removeChild( this.obsoleteText );	
  }
}

/** **/
function Path( p, q, g, t, shape, callback ){
	this.p = p;
	this.q = q;
	this.g = g;
	this.t = t;
	this.tCurrent = 0;
	this.shape = shape;
	this.callback = callback;
	this.listener = this.handleTick.bind( this );
	this.shape.x = p.x;
	this.shape.y = p.y;
	
	// computation:
	this.v0 = (q.y - p.y - g*t*t) / t;
	
	createjs.Ticker.addEventListener("tick", this.listener );
}
Path.prototype.handleTick = function( event ){
	this.tCurrent++;
	this.shape.y = this.p.y + (this.q.y - this.p.y) * this.tCurrent / this.t;
	// helyett: ha qy = py + tv0 + gtt, akkor v0 = (qy-py-gtt)/t 
	this.shape.y = this.p.y + this.tCurrent * ( this.tCurrent * this.g + this.v0 );
	this.shape.x = this.p.x + (this.q.x - this.p.x) * this.tCurrent / this.t;
	if( this.tCurrent == this.t ){
		createjs.Ticker.removeEventListener( this.listener );
		if( this.callback !== null ) {
			console.log( this.callback );
			this.callback();
		}
	}
}

/** GLOBAL HELPER FUNCTIONS **/
function createBorders(){
	var shape = new createjs.Shape();
	shape.graphics.beginStroke("black").drawRoundRect(0,0,Width,Height,round);
	stage.addChild( shape );
}

function setMob( newMob ){
	if( mob != null){
		mob.removeFromStage();		
	}
//	alert( "mob is " + newMob.arr );
	mob = newMob;
	newMob.setPosition( mobPosX, mobPosY );
	newMob.setRadius( mobSize / 2 );
	newMob.addToStage();
}

var buttonsPerRow = Math.floor( Width / buttonSize );
function getButtonPos( i ){
	var ret = { x : (buttonSize) * (i % buttonsPerRow + 0.5), y : Height + buttonSize * (0.5 + Math.floor( i / buttonsPerRow ) ) };
	return ret;
}

function handleClick( event ){
//	alert( event.target );
	var button = event.target.parentButton;
	if( button.clause === null ) return;
	if( button.isObsoleted ) return;
	setActiveMenuIndex( button.index );
	fire();
}


var buttonArray = [];
function addButtons() {
	for( var i = buttonsPerRow * buttonRowCount - 1; i >= 0; i--){		
		var button = new FireButton( getButtonPos( i ) );
		button.index = i;
		button.addToStage();
		buttonArray[ i ] = button;
		button.container.addEventListener("click", handleClick );
	}
}

function setmod( i, t ){
	if( i < 0 ) return t - 1;
	if( i >= t ) return 0;
	return i;
}

function setActiveMenuIndex( i, dir ){
	if( buttonArray[ activeGun ] ) buttonArray[ activeGun ].setActive( 0 );
	i = setmod( i, buttonsPerRow * buttonRowCount );
	while( buttonArray[ i ].clause === null ){
		i = setmod( i + dir, buttonsPerRow * buttonRowCount );
	}
	buttonArray[ i ].setActive( 1 );
	activeGun = i;
}

function setClause( i, c ){
	buttonArray[ i ].setClause( c );
}

function getEmptyFiringIndex( ) {
	var i = 0;
	while( i < buttonsPerRow * buttonRowCount ){
		if( buttonArray[i].clause === null ) return i;
		i++;
	}
	return null;
}

function addSigma( c ){
	var i = getEmptyFiringIndex();
	if( i === null ) return null;
	setClause( i, c );
	return i;
}

function clearSigma( i ){
	buttonArray[i].setClause( null );
}

var dropThis;
var dropHere;

function endFire(){
	  var newMob = resolve( mob, shot );
	  shot.removeFromStage();
	  shot = null;
	  if( newMob === "BOOM"){
//	    parallelResolve();
		stage.update();
		return;
	  }else{
		for( var i = 0; i < mob.arr.length; i++ ) mob.arr[i] = sign( mob.arr[i] );
		var origMob = new Clause( mob.arr, clauseSize / 2 );
		stage.addChild( origMob.container );
		var i = getEmptyFiringIndex();		
		dropThis = origMob;
		dropHere = i;
	    setMob( newMob );
/*    	new Path(
		  mob.getPosition(),
		  buttonArray[ i ].getPosition(),
		  gravity, shootingTime * ticksPerSec, origMob.container, theDrop ); */
		  addSigma( origMob );
		  checkObsoletes();
        //checkObsoletes();
	  }
}

function theDrop(){
	console.log("herllo");
    stage.removeChild( dropThis );
	//setClause( dropHere, dropThis );
	addSigma( dropThis );
	stage.update();
	checkObsoletes();
}

function fire(){
	var shotThis = buttonArray[ activeGun ].clause;
	if( shotThis === null ) return;
	shot = new Clause( shotThis.arr, clauseSize / 2 );
	shot.addToStage();
	new Path( buttonArray[ activeGun ].getPosition(), mob.getPosition(), gravity, shootingTime * ticksPerSec, shot.container, endFire );
}

function sign( n ){
	if( n > 0 ) return 1;
	if( n < 0 ) return -1;
	return 0;
}

function resolve( c, d ){
  var conflict = -1;
  var ret = [];
  for( var i = 0; i < c.arr.length; i++ ){
    if( c.arr[i] == 0){
	  ret[i] = d.arr[i];
	}else if(( d.arr[i] == 0 ) || (sign(d.arr[i]) == sign(c.arr[i]) )){
	  ret[i] = sign( d.arr[i]+c.arr[i] );
	}else{
      if( conflict == -1 ){
	    conflict = i;
		ret[i] = sign( d.arr[i]+c.arr[i] );
	  } else {
	    return "BOOM";
	  }
	}
  }
  return new Clause( ret, clauseSize / 2 );
}


function newGame(){
	setActiveMenuIndex( 0, 1 );
}
/** TIMING **/
var rot = 0;

function handleTick( event ){
  stage.update();
}

/**
    boolean containsArray( int[] a1, int[] a2 )
	@returns true iff sgn(a1)-nek részhalmaza sgn(a2)
 **/
function containsArray( a1, a2 ){
	for( var i = 0; i < a1.length; i++ ){
		if(( a1[i] == 0 )&&(a2[i] != 0)) return 0;
		if(( a1[i] != 0 )&&(a2[i] * a1[i] < 0)) return 0;
	}
	return 1;
}

/**
    void checkObsoletes()	
	if the mob is a proper subset of some weapon, then the weapon is marked as obsolete (and eventually disappears).
	assumption: the weapons themselves are NOT subsets of each other.
 **/
function checkObsoletes( ){
  for( var j = 0; j < buttonsPerRow * buttonRowCount; j++ ){
	  if( buttonArray[j].clause === null ) continue;
	  if( buttonArray[j].isObsoleted ) continue;
	  // if a weapon is a subset of the mob, then the mob does not give new obsolete weapons due to transitivity
	  if( containsArray( mob.arr, buttonArray[j].clause.arr )){ return; }
	  if( containsArray( buttonArray[j].clause.arr, mob.arr )){ buttonArray[j].setObsoleted(1); }
  }
}

function handleKeyDown(e) {
    switch (e.keyCode) {
        case 32:
		    if( gameState == 1 && firing === 0 ) fire();
            break;
        case 39:
			if( gameState == 1 ) setActiveMenuIndex( activeGun + 1, 1 );
            break;
        case 37:
			if( gameState == 1 ) setActiveMenuIndex( activeGun - 1, -1 );
            break;
		case 'R':
		case 82:
		case 114:
			restartLevel();
			break;
		case 'N':
		case 78:
		case 110:
			newGame();
			break;
		case 'A':
		case 65:
		case 97:
			if( variables < literalColors.length ){
			  variables++;
			  stepLimits+=2;
			  generate( variables );
			}
			break;
		case 'S':
		case 83:
		case 115:
			if( variables > 1 ){
			  variables--;
			  stepLimits -= 2;
			  generate( variables );
			}
			break;
		case 'H':
		case 72:
		case 104:
			gameState = 0;
			displayHelp();
			break;
    }
}

function satisfies( box, clause ){
	for( var i = 0; i < clause.length; i++ ){
		switch( clause[i] ){
			case 0: break;
			case 1: if((box & (1<<i))==1<<i) return 1; break;
			case -1: if((box & (1<<i))==0) return 1; break;
			default  : throw "IllegalStateException";
		}
	}
	return 0;
}

function checkSatWithout( task, i, n ){
  for( var box = 0; box < (1<<n); box++){
	  var ci;
	  for( ci = 0; ci < task.length; ci++ ){
		  if( i == ci ) continue;
		  if( satisfies( box, task[ci]) == 0 ) break;
	  }
	  if( ci == task.length ) return 1;
  }
  return 0;
}

function createMinimal( task ){
	var text = "Minimizing " + task;
	for( var i = 0; i < task.length; ){
		if( checkSatWithout( task, i, task[0].length ) == 0 ) { 
		  task.splice( i, 1 );
		} else {
			i++;
		}
	}
	text = text + " Result is " + task;
//	alert( text );
	return task;
}

function generate( n ){
	var ret = []; //array of arrays
	var truthTable = [];
	for( var i = 0; i < (1<<n); i++ ) truthTable[i] = 1; // everything is true
	var truesLeft = 1 << n;
	var j = 0;
	while( truesLeft ){
		while( truthTable[j] == 0 ) j++;
		// generate something contradicting to "j"
		var newClause = [];
		for( var k = 0; k < n; k++ ) newClause[k] = 0;
		// random throwing four dices
		for( var k = 0; k < 3; k++ ){
			var index = Math.floor( Math.random() * n );
			newClause[ index ] = (j & ( 1 << index )) ? -1 : 1;
		}
		// filtering out newly satisfied nodes
//		alert("New clause is " + newClause );
		for( var k = j; k < (1<<n); k++){
			if( truthTable[k] == 0 ) continue;
			if( satisfies( k, newClause ) == 0 ){
//				alert( newClause + " kills off " + k );
				truthTable[k] = 0;
				truesLeft--;
			}
		}
		// adding new clause
		ret.push( newClause );
		j++;		
	}
	/*  maintaining a minimal unsat */
	return createMinimal( ret );
}

function init(){
	
  
  stage = new createjs.Stage("gameCanvas");
  createBorders();
  addButtons();

/*  var arr = drawThings(0,0,100,90);
  var shape = new createjs.Shape();
  for( var i = 0; i < arr.length; i++ ){
	  drawLiteral( shape.graphics, colorArray[ Math.floor( Math.random() * 7 ) ], "white", Math.random() - 0.5, arr[i].r, arr[i].x,arr[i].y);
  }
  shape.x = Width / 2;
  shape.y = Height / 2;
  stage.addChild( shape );*/
 	
  var task = generate( 7 );
  
  for( var i = 1; i < task.length; i++ ){
	  addSigma( new Clause( task[i], clauseSize / 2 ) );
  }
  setActiveMenuIndex( 0 );
  stage.update();
  //return;
  setMob( new Clause( task[0] ), clauseSize );
  
  createjs.Ticker.framerate = ticksPerSec;
  createjs.Ticker.addEventListener("tick",handleTick);
  document.onkeydown = handleKeyDown;
  
  return;
}