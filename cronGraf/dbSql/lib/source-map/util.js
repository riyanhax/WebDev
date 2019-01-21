/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved. 
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0  
 
THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, 
MERCHANTABLITY OR NON-INFRINGEMENT. 
 
See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */



/// <reference no-default-lib="true"/>


/// <reference path="lib.es2017.d.ts" />
/// <reference path="lib.es2018.promise.d.ts" />
/// <reference path="lib.es2018.regexp.d.ts" />
/// <reference path="lib.es2018.intl.d.ts" />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          /*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

/** @typedef {import("./Module")} Module */
/** @typedef {import("./DependenciesBlock")} DependenciesBlock */

/** @typedef {false | true | string[]} UsedExports */

const addToSet = (a, b) => {
	for (const item of b) {
		if (!a.includes(item)) a.push(item);
	}
	return a;
};

const isSubset = (biggerSet, subset) => {
	if (biggerSet === true) return true;
	if (subset === true) return false;
	return subset.every(item => biggerSet.indexOf(item) >= 0);
};

class FlagDependencyUsagePlugin {
	apply(compiler) {
		compiler.hooks.compilation.tap("FlagDependencyUsagePlugin", compilation => {
			compilation.hooks.optimizeDependencies.tap(
				"FlagDependencyUsagePlugin",
				modules => {
					const processModule = (module, usedExports) => {
						module.used = true;
						if (module.usedExports === true) return;
						if (usedExports === true) {
							module.usedExports = true;
						} else if (Array.isArray(usedExports)) {
							const old = module.usedExports ? module.usedExports.length : -1;
							module.usedExports = addToSet(
								module.usedExports || [],
								usedExports
							);
							if (module.usedExports.length === old) {
								return;
							}
						} else if (Array.isArray(module.usedExports)) {
							return;
						} else {
							module.usedExports = false;
						}

						// for a module without side effects we stop tracking usage here when no export is used
						// This module won't be evaluated in this case
						if (module.factoryMeta.sideEffectFree) {
							if (module.usedExports === false) return;
							if (
								Array.isArray(module.usedExports) &&
								module.usedExports.length === 0
							)
								return;
						}

						queue.push([module, module, module.usedExports]);
					};

					const processDependenciesBlock = (module, depBlock, usedExports) => {
						for (const dep of depBlock.dependencies) {
							processDependency(module, dep);
						}
						for (const variable of depBlock.variables) {
							for (const dep of variable.dependencies) {
								processDependency(module, dep);
							}
						}
						for (const block of depBlock.blocks) {
							queue.push([module, block, usedExports]);
						}
					};

					const processDependency = (module, dep) => {
						const reference = compilation.getDependencyReference(module, dep);
						if (!reference) return;
						const referenceModule = reference.module;
						const importedNames = reference.importedNames;
						const oldUsed = referenceModule.used;
						const oldUsedExports = referenceModule.usedExports;
						if (
							!oldUsed ||
							(importedNames &&
								(!oldUsedExports || !isSubset(oldUsedExports, importedNames)))
						) {
							processModule(referenceModule, importedNames);
						}
					};

					for (const module of modules) {
						module.used = false;
					}

					/** @type {[Module, DependenciesBlock, UsedExports][]} */
					const queue = [];
					for (const preparedEntrypoint of compilation._preparedEntrypoints) {
						if (preparedEntrypoint.module) {
							processModule(preparedEntrypoint.module, true);
						}
					}

					while (queue.length) {
						const queueItem = queue.pop();
						processDependenciesBlock(queueItem[0], queueItem[1], queueItem[2]);
					}
				}
			);
		});
	}
}
module.exports = FlagDependencyUsagePlugin;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         /*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

class FlagInitialModulesAsUsedPlugin {
	constructor(explanation) {
		this.explanati