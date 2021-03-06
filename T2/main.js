//From https://github.com/EvanHahn/ScriptInclude
include=function(){function f(){var a=this.readyState;(!a||/ded|te/.test(a))&&(c--,!c&&e&&d())}var a=arguments,b=document,c=a.length,d=a[c-1],e=d.call;e&&c--;for(var g,h=0;c>h;h++)g=b.createElement("script"),g.src=arguments[h],g.async=!0,g.onload=g.onerror=g.onreadystatechange=f,(b.head||b.getElementsByTagName("head")[0]).appendChild(g)};
serialInclude=function(a){var b=console,c=serialInclude.l;if(a.length>0)c.splice(0,0,a);else b.log("Done!");if(c.length>0){if(c[0].length>1){var d=c[0].splice(0,1);b.log("Loading "+d+"...");include(d,function(){serialInclude([]);});}else{var e=c[0][0];c.splice(0,1);e.call();};}else b.log("Finished.");};serialInclude.l=new Array();

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
    function(m,key,value) {
      vars[decodeURIComponent(key)] = decodeURIComponent(value);
    });
    return vars;
}	 

//Include additional files here
serialInclude([ '../lib/CGF.js', 'parser.js', 'scene.js', 'data.js', "interface.js", 
                './primitives/MyRectangle.js', './primitives/MyTriangle.js', 
                './primitives/MyCylinder.js', './primitives/MySphere.js', 
                './primitives/MyCircle.js', './primitives/MyTorus.js',
                './primitives/Plane.js', './primitives/Patch.js', './primitives/Vehicle.js',
                './primitives/Cylinder2.js', './primitives/Terrain.js', './primitives/Water.js',
                './animations/Animation.js', './animations/LinearAnimation.js', './animations/CircularAnimation.js',
                
main=function()
{
	// Standard application, scene and interface setup
    var app = new CGFapplication(document.body);
    var data = new Data();
    var interface = new Interface();
    var scene = new Scene(data, interface);

    app.init();
    app.setScene(scene);
    app.setInterface(interface);

	// Get file name provided in URL, http://localhost/myproj/?file=myfile.xml or use "LAIG_TP1_YAS_T#_G0#_v0#.xml" as default 
    var filename=getUrlVars()['file'] || "LAIG_TP2_YAS_T3_G06_v04.xml";

	//Parse information present on XML named "filename"
	new Parser(filename, data, scene);
	
	// Start
    app.run();
}

]);