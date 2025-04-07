const vertex_shader_source = `
	attribute vec4 aPos;
	attribute vec3 aNormal;

	uniform mat4 uMod;
	uniform mat4 uView;
	uniform mat4 uProj;
	uniform mat4 uNormalMat;

	varying highp vec3 vLighting;

	void main()
	{
		gl_Position = uProj * uView * uMod * aPos;

		highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
		highp vec3 directionalLightColor = vec3(1, 1, 1);
		highp vec3 directionalVector = vec3(-10, 2, -10);

		highp vec4 transformedNormal = uNormalMat * vec4(aNormal, 1.0);

		highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
		vLighting = ambientLight + (directionalLightColor * directional);
	}
`;

const fragment_shader_source = `
	varying highp vec3 vLighting;

	void main()
	{
		highp vec3 color = vec3(1.0, 1.0, 1.0);
		gl_FragColor = vec4(color * vLighting, 1.0);
	}
`;

export function initShaderProgram(gl)
{
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertex_shader_source);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragment_shader_source);

	const prog = gl.createProgram();
	gl.attachShader(prog, vertexShader);
	gl.attachShader(prog, fragmentShader);
	gl.linkProgram(prog);

	const shaderInfos = {
		program: prog,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(prog, "aPos"),
			vertexNormal: gl.getAttribLocation(prog, "aNormal"),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(prog, "uProj"),
			modelMatrix: gl.getUniformLocation(prog, "uMod"),
			viewMatrix: gl.getUniformLocation(prog, "uView"),
			normalMatrix: gl.getUniformLocation(prog, "uNormalMat"),
		},
	};

	if(!gl.getProgramParameter(prog, gl.LINK_STATUS))
	{
		alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(prog)}`);
		return null;
	}

	return shaderInfos;
}

function loadShader(gl, type, source)
{
	const shader = gl.createShader(type);

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
	{
		alert(`An error occurred while compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}
