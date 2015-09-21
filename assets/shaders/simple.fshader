precision mediump float;

varying mat3 vTBN;
varying vec2 vTexCoord;
varying vec3 vWorldPos;

uniform sampler2D uTexture;
uniform sampler2D uNormalTexture;

uniform vec3 uPosCamera;
uniform vec3 uPosLight1;
uniform vec3 uColorLight1;
uniform vec3 uPosLight2;
uniform vec3 uColorLight2;
uniform vec4 uColor;
uniform float uLuminosity;
uniform vec3 uAmbient;

void main() {
	vec4 texNormal = texture2D(uNormalTexture, vTexCoord);
//	texNormal = vec4(0.5, 1.0, 0.5, 0.0);
	vec3 normal = vTBN * normalize(texNormal.xyz * 2.0 - 1.0);

	vec4 textureColor = texture2D(uTexture, vTexCoord);

	vec3 toLight1 = normalize(uPosLight1 - vWorldPos);
	vec3 toLight2 = normalize(uPosLight2 - vWorldPos);
	vec3 diffuse1 = uColorLight1 * clamp(dot(toLight1, normal), 0.0, 1.0);
	vec3 diffuse2 = uColorLight2 * clamp(dot(toLight2, normal), 0.0, 1.0);

	vec3 fromCamera = normalize(vWorldPos - uPosCamera);
	vec3 reflected1 = reflect(toLight1, normal);
	vec3 reflected2 = reflect(toLight2, normal);

	float specular1 = pow(max(dot(reflected1, fromCamera), 0.0), 32.0);
	float specular2 = pow(max(dot(reflected2, fromCamera), 0.0), 32.0);
	vec3 white = vec3(0.2);

	vec3 diffuse = diffuse1 + diffuse2;
	vec3 specular = (specular1/* + specular2*/) * white;

	textureColor.rgb *= (specular + (diffuse + uAmbient) * uColor.rgb) * uColor.a;
	textureColor.rgb += uColor.rgb * uLuminosity * textureColor.a * uColor.a;

	//textureColor.rgb = diffuse1;
	//textureColor.rgb = vec3((normal + 1.0) * 0.5);
	//textureColor.rgb = vec3((vTBN[1] + 1.0) * 0.5);
	//textureColor.rgb = vec3(vTexCoord, 0);
	//textureColor.rgb = texNormal.xyz;

	textureColor.a = uColor.a;
	
	gl_FragColor = textureColor;
}