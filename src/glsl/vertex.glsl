varying vec2 vUv;
varying vec3 vecPos;
varying vec3 v_position;
uniform float time;

void main() {
  vUv = uv;
  v_position = position.xyz;
  vecPos = (modelViewMatrix * vec4(v_position, 1.0)).xyz;
  gl_Position = projectionMatrix * vec4(vecPos, 1.0);
}