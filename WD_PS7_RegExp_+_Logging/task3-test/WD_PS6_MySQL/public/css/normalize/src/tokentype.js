/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const { ConcatSource } = require("webpack-sources");

/** @typedef {import("./Compilation")} Compilation */

/**
 * @param {string[]} accessor the accessor to convert to path
 * @returns {string} the path
 */
const accessorToObjectAccess = accessor => {
	return accessor.map(a => `[${JSON.stringify(a)}]`).join("");
};

class ExportPropertyMainTemplatePlugin {
	/**
	 * @param {string|string[]} property the name of the property to export
	 */
	constructor(property) {
		this.property = property;
	}

	/**
	 * @param {Compilation} compilation the compilation instance
	 * @returns {void}
	 */
	apply(compilation) {
		const { mainTemplate, chunkTemplate } = compilation;

		const onRenderWithEntry = (source, chunk, hash) => {
			const postfix = `${accessorToObjectAccess([].concat(this.property))}`;
			return new ConcatSource(source, postfix);
		};

		for (const template of [mainTemplate, chunkTemplate]) {
			template.hooks.renderWithEntry.tap(
				"ExportPropertyMainTemplatePlugin",
				onRenderWithEntry
			);
		}

		mainTemplate.hooks.hash.tap("ExportPropertyMainTemplatePlugin", hash => {
			hash.update("export property");
			hash.update(`${this.property}`);
		});
	}
}

module.exports = ExportPropertyMainTemplatePlugin;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              /*! *****************************************************************************
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


declare namespace Intl {
    type DateT