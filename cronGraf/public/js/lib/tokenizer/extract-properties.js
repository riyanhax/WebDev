/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const DllEntryDependency = require("./dependencies/DllEntryDependency");
const SingleEntryDependency = require("./dependencies/SingleEntryDependency");
const DllModuleFactory = require("./DllModuleFactory");

class DllEntryPlugin {
	constructor(context, entries, name) {
		this.context = context;
		this.entries = entries;
		this.name = name;
	}

	apply(compiler) {
		compiler.hooks.compilation.tap(
			"DllEntryPlugin",
			(compilation, { normalModuleFactory }) => {
				const dllModuleFactory = new DllModuleFactory();
				compilation.dependencyFactories.set(
					DllEntryDependency,
					dllModuleFactory
				);
				compilation.dependencyFactories.set(
					SingleEntryDependency,
					normalModuleFactory
				);
			}
		);
		compiler.hooks.make.tapAsync("DllEntryPlugin", (compilation, callback) => {
			compilation.addEntry(
				this.context,
				new DllEntryDependency(
					this.entries.map((e, idx) => {
						const dep = new SingleEntryDependency(e);
						dep.loc = {
							name: this.name,
							index: idx
						};
						return dep;
					}),
					this.name
				),
				this.name,
				callback
			);
		});
	}
}

module.exports = DllEntryPlugin;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        "use strict";

const InputValidate = require("webpack-addons").InputValidate;
const validate = require("./validate");

/**
 *
 * Prompts for entry points, either if it has multiple or one entry
 *
 * @param	{Object} self 	- A variable holding the instance of the prompting
 * @param	{Object} answer - Previous answer from asking if the user wants single or multiple entries
 * @returns	{Object} An Object that holds the answers given by the user, later used to scaffold
 */

module.exports = (self, answer) => {
	let entryIdentifiers;
	let result;
	if (answer["entryType"] === true) {
		result = self
			.prompt([
				InputValidate(
					"multipleEntries",
					"Type the names you want for your modules (entry files), separated by comma [example: app,vendor]",
					validate
				)
			])
			.then(multipleEntriesAnswer => {
				let webpackEntryPoint = {};
				entryIdentifiers = multipleEntriesAnswer["multipleEntries"].split(",");
				function forEachPromise(obj, fn) {
					return obj.reduce((promise, prop) => {
						const trimmedProp = prop.trim();
						return promise.then(n => {
							if (n) {
								Object.keys(n).forEach(val => {
									if (
										n[val].charAt(0) !== "(" &&
										n[val].charAt(0) !== "[" &&
										!n[val].includes("function") &&
										!n[val].includes("path") &&
										!n[val].includes("process")
									) {
										n[val] = `\'${n[val].replace(/"|'/g, "").concat(".js")}\'`;
									}
									webpackEntryPoint[val] = n[val];
								});
							} else {
								n = {};
							}
							return fn(trimmedProp);
						});
					}, Promise.resolve());
				}
				return forEachPromise(entryIdentifiers, entryProp =>
					self.prompt([
						InputVal