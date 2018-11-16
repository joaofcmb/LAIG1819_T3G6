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

vec4 getNoise(vec2 uv){
    vec2 uv0 = (uv/103.0)+vec2(timeFactor/17.0, timeFactor/29.0);
    vec2 uv1 = uv/107.0-vec2(timeFactor/-19.0, timeFactor/31.0);
    vec2 uv2 = uv/vec2(897.0, 983.0)+vec2(timeFactor/101.0, timeFactor/97.0);
    vec2 uv3 = uv/vec2(991.0, 877.0)-vec2(timeFactor/109.0, timeFactor/-113.0);
    vec4 noise = (texture2D(uSamplerHeight, uv0)) +
                 (texture2D(uSamplerHeight, uv1)) +
                 (texture2D(uSamplerHeight, uv2)) +
                 (texture2D(uSamplerHeight, uv3));
    return noise*0.5-1.0;
}

void main() {
    vTextureCoord = aTextureCoord;

    vec4 color = getNoise(vTextureCoord);

    vec3 offset = aVertexNormal*normScale*((color.r + color.g + color.b) / 3.0);

    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + offset, 1.0);
}