function renderCube(ctx, shader_infos, x, y, z, angle = 0, sx = 1, sy = 1, sz = 1)
{
	const modelMatrix = mat4.create();

	mat4.translate(
		modelMatrix,
		modelMatrix,
		[x, y, z]
	);

	mat4.rotate(
		modelMatrix,
		modelMatrix,
		angle,
		[0, 1, 0],
	);

	mat4.scale(
		modelMatrix,
		modelMatrix,
		[sx, sy, sz]
	);

	const normalMatrix = mat4.create();
	mat4.invert(normalMatrix, modelMatrix);
	mat4.transpose(normalMatrix, normalMatrix);

	ctx.uniformMatrix4fv(shader_infos.uniformLocations.modelMatrix, false, modelMatrix);
	ctx.uniformMatrix4fv(shader_infos.uniformLocations.normalMatrix, false, normalMatrix);

	ctx.drawElements(ctx.TRIANGLES, 36, ctx.UNSIGNED_SHORT, 0);
}

export { renderCube };
