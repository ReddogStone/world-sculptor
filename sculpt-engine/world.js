var World = (function() {
	var CHUNK_SIZE = { x: 16, y: 8, z: 16 };

	function createChunk(offset, generate) {
		var offX = offset.x * CHUNK_SIZE.x;
		var offY = offset.y * CHUNK_SIZE.y;
		var offZ = offset.z * CHUNK_SIZE.z;

		var data = [];
		for (var y = 0; y < CHUNK_SIZE.y; y++) {
			for (var z = 0; z < CHUNK_SIZE.z; z++) {
				for (var x = 0; x < CHUNK_SIZE.x; x++) {
					data.push(generate(offX + x, offY + y, offZ + z));
				}
			}
		}
		return Chunk.make(CHUNK_SIZE, data);
	}


	function expand(x) {
		x &= 0x3FF;
		x = (x | (x << 16)) & 4278190335;
		x = (x | (x << 8))  & 251719695;
		x = (x | (x << 4))  & 3272356035;
		x = (x | (x << 2))  & 1227133513;
		return x;
	}

	//Hash is actually invertible over domain (+/- 2^10)^3
	function unhash(x) {
		x &= 1227133513;
		x = (x | (x >> 2)) & 3272356035;
		x = (x | (x >> 4)) & 251719695;
		x = (x | (x >> 8)) & 4278190335;
		x = (x | (x >> 16)) & 0x3FF;
		return (x << 22) >> 22;
	}

	function hashCode(i, j, k) {
		return expand(i) + (expand(j) << 1) + (expand(k) << 2);
	}

	function getChunkId(chunkCoords) {
		return hashCode(chunkCoords.x, chunkCoords.y, chunkCoords.z);
	}

	return {
		make: function(meshLib, generateBlock) {
			var chunkCache = [];

			function getAndCacheChunk(chunkCoords) {
				var id = getChunkId(chunkCoords);
				if (chunkCache[id]) {
					var cached = chunkCache[id];
					if (cached.empty) {
						return undefined;
					}

					return {
						mesh: cached.mesh,
						transform: cached.transform
					};
				}

				var chunk = createChunk(chunkCoords, generateBlock);
				var transform = new Matrix4().translate(chunkCoords.multiply(CHUNK_SIZE));

				var empty = !chunk.data.some(function(block) { return !!block; });
				if (empty) {
					chunkCache[id] = {
						chunk: chunk,
						transform: transform.clone(),
						empty: true
					};
					return undefined;
				}

				var mesh = meshLib.make(Chunk.createMeshData(chunk));

				chunkCache[id] = {
					chunk: chunk,
					mesh: mesh,
					transform: transform.clone(),
					empty: false
				};

				return {
					mesh: mesh,
					transform: transform
				};
			}

			return {
				getChunksForPlayerPos: function(pos, neighbors) {
					var res = [];

					var chunkCoords = pos.clone().divide(CHUNK_SIZE);
					chunkCoords.x = Math.floor(chunkCoords.x);
					chunkCoords.y = Math.floor(chunkCoords.y);
					chunkCoords.z = Math.floor(chunkCoords.z);

					for (var x = -neighbors.x; x <= neighbors.x; x++) {
						for (var y = -neighbors.y; y <= neighbors.y; y++) {
							for (var z = -neighbors.z; z <= neighbors.z; z++) {
								var chunk = getAndCacheChunk(chunkCoords.clone().add(new Vector3(x, y, z)));
								chunk && res.push(chunk);
							}
						}
					}

					return res;
				}
			};
		}
	};
})();