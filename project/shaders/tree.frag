#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main() {
  vec4 textureColor = texture2D(uSampler, vTextureCoord);

  if (textureColor.a < 1.0) {
        discard;
    }

	gl_FragColor = textureColor;

}

