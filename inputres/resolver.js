var stage;

function Literal( color, polarity, innerRadius, outerRadius ){
  this.color = color;
  this.shape = new createjs.Shape();
  if( polarity > 0 ){
    this.shape.graphics.beginFill( color ).drawCircle( outerRadius ).beginFill( "white" ).drawCircle( innerRadius );
  }else{
    this.shape.graphics.beginFill( color ).drawCircle( innerRadius + 1 );
  }
  this.shape.x = this.shape.y = 0;
}

function init(){
	stage = new createjs.Stage("gameCanvas");
	
	var l = new Literal( "green", 1, 10, 20 );
	l.shape.x = l.shape.y = 100;
	stage.addChild( l );
	
	stage.update();
}