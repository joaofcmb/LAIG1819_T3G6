attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float normScale;
uniform sampler2D uSampler;
uniform sampler2D uSamplerHeight;

varying vec2 vTextureCoord;

void main() {
    vTextureCoord = aTextureCoord;

    vec4 hColor = texture2D(uSamplerHeight, vTextureCoord);

    vec3 offset = aVertexNormal*normScale*((hColor.r + hColor.g + hColor.b) / 3.0);

    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + offset, 1.0);
}