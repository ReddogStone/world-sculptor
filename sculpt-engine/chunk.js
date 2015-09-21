var Chunk = (function() {
	var DESCRIPTION = {
		aPosition: { components: 3, type: "FLOAT", normalized: false },
		aNormal: { components: 3, type: "FLOAT", normalized: false },
		aTangent: { components: 3, type: "FLOAT", normalized: false },
		aTexCoord: { components: 2, type: "FLOAT", normalized: false }
	};

	var CUBE_VERTICES = [
		//x	y z nx ny nz tangx, tangy, tangz, tu tv
		// front
		[-0.5,  0.5, 0.5, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0],
		[ 0.5,  0.5, 0.5, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0],
		[-0.5, -0.5, 0.5, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0],
		[ 0.5, -0.5, 0.5, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0],
		 // back
		[ 0.5,  0.5, -0.5, 0.0, 0.0, -1.0, -1.0, 0.0, 0.0, 0.0, 0.0],
		[-0.5,  0.5, -0.5, 0.0, 0.0, -1.0, -1.0, 0.0, 0.0, 1.0, 0.0],
		[ 0.5, -0.5, -0.5, 0.0, 0.0, -1.0, -1.0, 0.0, 0.0, 0.0, 1.0],
		[-0.5, -0.5, -0.5, 0.0, 0.0, -1.0, -1.0, 0.0, 0.0, 1.0, 1.0],
		 // right
		[0.5,  0.5,  0.5, 1.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0],
		[0.5,  0.5, -0.5, 1.0, 0.0, 0.0, 0.0, 0.0, -1.0, 1.0, 0.0],
		[0.5, -0.5,  0.5, 1.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, 1.0],
		[0.5, -0.5, -0.5, 1.0, 0.0, 0.0, 0.0, 0.0, -1.0, 1.0, 1.0],
		 // left
		[-0.5,  0.5, -0.5, -1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0],
		[-0.5,  0.5,  0.5, -1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0],
		[-0.5, -0.5, -0.5, -1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0],
		[-0.5, -0.5,  0.5, -1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0],
		 // top
		[-0.5, 0.5, -0.5, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0],
		[ 0.5, 0.5, -0.5, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0],
		[-0.5, 0.5,  0.5, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0],
		[ 0.5, 0.5,  0.5, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0],
		 // bottom
		[ 0.5, -0.5, -0.5, 0.0, -1.0, 0.0, -1.0, 0.0, 0.0, 0.0, 0.0],
		[-0.5, -0.5, -0.5, 0.0, -1.0, 0.0, -1.0, 0.0, 0.0, 1.0, 0.0],
		[ 0.5, -0.5,  0.5, 0.0, -1.0, 0.0, -1.0, 0.0, 0.0, 0.0, 1.0],
		[-0.5, -0.5,  0.5, 0.0, -1.0, 0.0, -1.0, 0.0, 0.0, 1.0, 1.0],
	];

	var CUBE_INDICES = [
		0, 1, 2, 2, 1, 3,
		4, 5, 6, 6, 5, 7,
		8, 9, 10, 10, 9, 11,
		12, 13, 14, 14, 13, 15,
		16, 17, 18, 18, 17, 19,
		20, 21, 22, 22, 21, 23,
	];

	return {
		make: function(sizes, data) {
			return {
				sizes: { x: sizes.x, y: sizes.y, z: sizes.z },
				data: data.slice()
			};
		},
		createMeshData: function(chunk) {
			var stride = 0;
			for (var key in DESCRIPTION) {
				stride += DESCRIPTION[key].components;
			}

			var sx = chunk.sizes.x;
			var sy = chunk.sizes.y;
			var sz = chunk.sizes.z;
			var data = chunk.data;

			var vertices = [];
			var indices = [];

			var currentBlock = 0;
			var visibleBlocks = 0;
			for (var y = 0; y < sy; y++) {
				for (var z = 0; z < sz; z++) {
					for (var x = 0; x < sx; x++) {
						var block = data[currentBlock++];
						if (!block) { continue; }

						for (var i = 0; i < CUBE_VERTICES.length; i++) {
							var vertex = CUBE_VERTICES[i];
							vertices.push(vertex[0] + x);
							vertices.push(vertex[1] + y);
							vertices.push(vertex[2] + z);
							for (var j = 3; j < vertex.length; j++) {
								vertices.push(vertex[j]);
							}
						}

						var startIndex = visibleBlocks * CUBE_VERTICES.length;
						for (var i = 0; i < CUBE_INDICES.length; i++) {
							indices.push(CUBE_INDICES[i] + startIndex);
						}

						visibleBlocks++;
					}
				}
			}

			return {
				vertices: vertices,
				indices: indices,
				description: DESCRIPTION
			};
		}
	};
})();