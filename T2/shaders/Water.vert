attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float normScale;

varying vec4 coords;
varying vec4 normal;

varying vec2 vTextureCoord;

uniform sampler2D uSamplerHeight;

void main() {

    // Step 1
    /* gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); */

    // Step 2
    /* gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + aVertexNormal*normScale*0.1, 1.0); */

    // Step 3
    /* vec4 vertex = vec4(aVertexPosition + aVertexNormal*normScale*0.1, 1.0);

    gl_Position = uPMatrix * uMVMatrix * vertex;

    normal = vec4(aVertexNormal, 1.0);
    coords =  vertex / 10.0; */

    // Step 4 & 5
    /* gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);

    vTextureCoord = aTextureCoord; */

    // Step 6
    vec3 offset = vec3(0.0,0.0,0.0);
	
	vTextureCoord = aTextureCoord;

	if (texture2D(uSamplerHeight, vec2(0.0,0.1)+vTextureCoord).b > 0.5)
		offset=aVertexNormal*normScale*0.1;

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition+offset, 1.0);
}