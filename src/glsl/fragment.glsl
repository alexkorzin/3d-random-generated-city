uniform float time;

varying vec3 v_position;
varying vec2 vUv;

void main() {
    gl_FragColor=vec4(vec3(sin(vUv.x + time/10.)),1.);
}