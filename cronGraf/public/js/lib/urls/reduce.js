/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";
const NullDependency = require("./NullDependency");

class RequireEnsureDependency extends NullDependency {
	constructor(block) {
		super();
		this.block = block;
	}

	get type() {
		return "require.ensure";
	}
}

RequireEnsureDependency.Template = class RequireEnsureDependencyTemplate {
	apply(dep, source, runtime) {
		const depBlock = dep.block;
		const promise = runtime.blockPromise({
			block: depBlock,
			message: "require.ensure"
		});
		const errorCallbackExists =
			depBlock.expr.arguments.length === 4 ||
			(!depBlock.chunkName && depBlock.expr.arguments.length === 3);
		const startBlock = `${promise}.then((`;
		const middleBlock = ").bind(null, __webpack_require__)).catch(";
		const endBlock = `).bind(null, __webpack_require__)).catch(${runtime.onError()})`;
		source.replace(
			depBlock.expr.range[0],
			depBlock.expr.arguments[1].range[0] - 1,
			startBlock
		);
		if (errorCallbackExists) {
			source.replace(
				depBlock.expr.arguments[1].range[1],
				depBlock.expr.arguments[2].range[0] - 1,
				middleBlock
			);
			source.replace(
				depBlock.expr.arguments[2].range[1],
				depBlock.expr.range[1] - 1,
				")"
			);
		} else {
			source.replace(
				depBlock.expr.arguments[1].range[1],
				depBlock.expr.range[1] - 1,
				endBlock
			);
		}
	}
};

module.exports = RequireEnsureDependency;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  import path from 'path';
import webpack from 'webpack';
import Promise from 'bluebird';
import MemoryFs from 'memory-fs';

const fs = new MemoryFs();
const unitTestFixtures = path.resolve(__dirname, 'fixtures');

/**
 *
 *
 * @param {string} fixtureName
 * @param {string} [withQueryString='']
 * @returns {string} Absolute path of a file with query that is to be run by a loader.
 */
function getFixtureResource(fixtureName, withQueryString = '') {
	return `${getFixture(fixtureName)}?${withQueryString}`;
}

/**
 *
 *
 * @param {string} fixtureName
 * @returns {string} Absolute pat