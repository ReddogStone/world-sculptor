attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aTangent;
attribute vec2 aTexCoord;

varying mat3 vTBN;
varying vec3 vTangent;
varying vec2 vTexCoord;
varying vec3 vWorldPos;

uniform mat4 uWorld;
uniform mat4 uWorldIT;
uniform mat4 uView;
uniform mat4 uProjection;

void main() {
	vec4 worldPos = uWorld * vec4(aPosition, 1.0);
	mat4 vp = uProjection * uView;
	
	gl_Position = vp * worldPos;
	
	vWorldPos = worldPos.xyz;
	vTexCoord = aTexCoord;
	vec3 normal = normalize((uWorldIT * vec4(aNormal, 0.0)).xyz);
	vec3 tangent = normalize((uWorldIT * vec4(aTangent, 0.0)).xyz);
	vec3 biTangent = normalize((uWorldIT * vec4(cross(aNormal, aTangent), 0.0)).xyz);

	vTBN = mat3(tangent, biTangent, normal);
}