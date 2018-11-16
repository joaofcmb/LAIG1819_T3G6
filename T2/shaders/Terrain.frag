#ifdef GL_ES
precision highp float;
#endif

struct lightProperties {
    vec4 position;                  
    vec4 ambient;                   
    vec4 diffuse;                   
    vec4 specular;                  
    vec4 half_vector;
    vec3 spot_direction;            
    float spot_exponent;            
    float spot_cutoff;              
    float constant_attenuation;     
    float linear_attenuation;       
    float quadratic_attenuation;    
    bool enabled;                   
};

struct materialProperties {
    vec4 ambient;
    vec4 diffuse;
    vec4 specular;
    vec4 emission;
    float shininess;
};

varying vec4 coords;
varying vec4 normal;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;

uniform sampler2D uSamplerHeight;

void main() {       

    // Step 1 & 2 //
    /* gl_FragColor = vec4(0.0,0.0,0.5, 1.0);  */

    // Step 3 //
    /* if(coords.x > 0.0)
        gl_FragColor = normal;
    else {
        gl_FragColor.rgb = abs(coords.xyz)/3.0;
        gl_FragColor.a = 1.0;
    } */

    // Step 4 //
    /* gl_FragColor = texture2D(uSampler, vTextureCoord); */

    // Step 5 & 6 //
    vec4 color = texture2D(uSampler, vTextureCoord);
    //vec4 filter = texture2D(uSamplerHeight, vec2(0.0, 0.1) + vTextureCoord);

    //if(filter.b > 0.5)
      //  color = vec4(0.52, 0.18, 0.11, 1.0);
    
    gl_FragColor = color;
    
}