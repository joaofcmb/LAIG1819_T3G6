attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float normScale;
uniform float timeFactor;

varying vec2 vTextureCoord;

uniform sampler2D uSamplerHeight;

void main() {
    vTextureCoord = aTextureCoord;

    vec4 noise = texture2D(uSamplerHeight, vTextureCoord);

    vec3 offset = aVertexNormal * normScale * timeFactor * ((noise.r + noise.g + noise.b) / 3.0);

    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + offset, 1.0);
}