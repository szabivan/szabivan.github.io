var stage;

/** MAGIC CONSTANTS **/
var round = 5; 			// rounded rectangles' corner
var Width = 400;		// width of the game window
var Height = 400;		// height of the game window
var clauseSize = 80;	// default diameter of a clause
var buttonSize = 100;	// size of a button
var activeMenuColor = "lightgreen";

/** GLOBAL VARIABLES **/
var mob;			// current target clause in the center
var origMob;		// original target clause, saved for restart
var sigma = [];		// weapon clauses
var shot;			// the shot clause, if exists (firing == 1)
var firing;			// 1 during firing, 0 otherwise


var colorArray = ["red", "green", "blue", "black","cyan","magenta","silver"];
function getColor( i ){
	return colorArray[i];
}

function getLiteral( color, polarity, radius, x, y ){
  var shape = new createjs.Shape();
  shape.graphics.beginFill( color ).drawCircle( 0, 0, radius );//.beginFill( "white" ).drawRoundRect( -radius*3/4, -radius*1/4, radius*3/2, radius*1/2, 3 );
  if( polarity < 0 ){
    shape.graphics.beginFill( "white" ).drawCircle( 0, 0, radius*2/3 );
  }
  shape.x = x;
  shape.y = y;
  return shape;
}

function getButtonGraphics( isActive ){
	var g = new createjs.Graphics();
	if( isActive ){
	  g.beginFill(activeMenuColor).drawRoundRect( -buttonSize/2, -buttonSize/2, buttonSize, buttonSize, round );		
	}
	g.beginStroke("black").drawRoundRect( -buttonSize/2, -buttonSize/2, buttonSize, buttonSize, round );
	return g;
}

function Clause( arr, radius, framed ){
  this.size = 0;
  this.container = new createjs.Container();
  var shape = new createjs.Shape();
  shape.graphics.beginStroke("black").drawCircle( 0, 0, radius );
  this.container.addChild( shape );
  if( framed ){
	  this.frame = new createjs.Shape();
	  this.frame.graphics = getButtonGraphics( 0 );
  }
  this.arr = arr.slice();
  var tmpArr = [];
  for( var i = 0; i < arr.length; i++ ) if( arr[i] ) { this.size++; tmpArr.push( (i+1)*arr[i] ); }
  switch( this.size ){
	case 1: this.container.addChild( getLiteral( getColor( Math.abs(tmpArr[0]) - 1 ), tmpArr[0], radius*3/4, 0, radius / 4 ) );
    case 0: break;
	case 2:
	  for( var i = 0; i < 2; i++ ){
		  this.container.addChild( getLiteral( getColor( Math.abs(tmpArr[i])-1 ), tmpArr[i], radius/2, 0, radius/2 - i*radius ) );
	  }
	  break;
	case 3:
	case 4:
	case 5:
    case 6:
      var spn = Math.sin( Math.PI / this.size );
      var r = radius * spn / (1+spn);
      for( var i = 0; i < this.size; i++ ){
		  this.container.addChild( getLiteral( getColor(Math.abs(tmpArr[i])-1),tmpArr[i],r,(radius-r)*Math.sin(i*2*Math.PI/this.size),(radius-r)*Math.cos(i*2*Math.PI/this.size) ) );
	  }	  
	  break;	  
	case 7:
	  var r = radius / 3;
	  this.container.addChild( getLiteral( getColor(Math.abs(tmpArr[0])-1),tmpArr[0],r,0,0 ) );	  
      for( var i = 1; i < this.size; i++ ){
		  this.container.addChild( getLiteral( getColor(Math.abs(tmpArr[i])-1),tmpArr[i],r,(radius-r)*Math.sin(i*Math.PI/3),(radius-r)*Math.cos(i*Math.PI/3) ) );
	  }	  
	  break;	  
	default:
	  alert("Call support, that many literals per clause are not supported yet");
	  break;
  }
}
Clause.prototype.addToStage = function(){
	if( this.frame ) stage.addChild( this.frame );
	stage.addChild( this.container );
}
Clause.prototype.setPosition = function( x, y ){ this.container.x = x; this.container.y = y; if( this.frame ) {this.frame.x = x; this.frame.y = y ;} }
Clause.prototype.setRotation = function( theta ){ this.container.rotation = theta; }
Clause.prototype.setActive = function( isActive ){ if( this.frame ){ this.frame.graphics = getButtonGraphics( isActive ); } }

function createBorders(){
	var shape = new createjs.Shape();
	shape.graphics.beginStroke("black").drawRoundRect(0,0,Width,Height,round);
	stage.addChild( shape );
}

function init(){
	stage = new createjs.Stage("gameCanvas");
	createBorders();
	
    var c = new Clause( [0,1,0], 25, 1 );
	c.setPosition( 100,100 );
	c.addToStage();
	
	c = new Clause([1,0,-1], 25, 1);
	c.setPosition( 150,100 );
	c.setRotation(30);
	c.addToStage();
	
    var c = new Clause( [1,1,-1], 25, 1 );
	c.setPosition( 200,100 );
	c.addToStage();

    var c = new Clause( [1,-1,-1,1], 25, 1 );
	c.setPosition( 100,150 );
	c.setActive( 1 );
	c.addToStage();

    var c = new Clause( [-1,1,-1,-1,1], 25 );
	c.setPosition( 150,150 );
	c.addToStage();

    var c = new Clause( [1,1,-1,1,-1,-1], 25 );
	c.setPosition( 200,150 );
	c.addToStage();
	
    var c = new Clause( [1,1,-1,1,-1,-1,1], 25 );
	c.setPosition( 100,200 );
	c.addToStage();

	stage.update();
}