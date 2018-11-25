#ifdef GL_ES
precision highp float;
#endif

uniform float texScale;
uniform float timeFactor;
uniform float texIncrement;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;

void main() {           
     gl_FragColor = texture2D(uSampler, vTextureCoord*texScale + texIncrement);
}