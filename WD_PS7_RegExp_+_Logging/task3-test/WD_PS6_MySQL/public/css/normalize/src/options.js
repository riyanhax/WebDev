/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const ImportDependency = require("./ImportDependency");
const ImportEagerDependency = require("./ImportEagerDependency");
const ImportWeakDependency = require("./ImportWeakDependency");
const ImportContextDependency = require("./ImportContextDependency");
const ImportParserPlugin = require("./ImportParserPlugin");

class ImportPlugin {
	constructor(options) {
		this.options = options;
	}

	apply(compiler) {
		const options = this.options;
		compiler.hooks.compilation.tap(
			"ImportPlugin",
			(compilation, { contextModuleFactory, normalModuleFactory }) => {
				compilation.dependencyFactories.set(
					ImportDependency,
					normalModuleFactory
				);
				compilation.dependencyTemplates.set(
					ImportDependency,
					new ImportDependency.Template()
				);

				compilation.dependencyFactories.set(
					ImportEagerDependency,
					normalModuleFactory
				);
				compilation.dependencyTemplates.set(
					ImportEagerDependency,
					new ImportEagerDependency.Template()
				);

				compilation.dependencyFactories.set(
					ImportWeakDependency,
					normalModuleFactory
				);
				compilation.dependencyTemplates.set(
					ImportWeakDependency,
					new ImportWeakDependency.Template()
				);

				compilation.dependencyFactories.set(
					ImportContextDependency,
					contextModuleFactory
				);
				compilation.dependencyTemplates.set(
					ImportContextDependency,
					new ImportContextDependency.Template()
				);

				const handler = (parser, parserOptions) => {
					if (
						typeof parserOptions.import !== "undefined" &&
						!parserOptions.import
					)
						return;

					new ImportParserPlugin(options).apply(parser);
				};

				normalModuleFactory.hooks.parser
					.for("javascript/auto")
					.tap("ImportPlugin", handler);
				normalModuleFactory.hooks.parser
					.for("javascript/dynamic")
					.tap("ImportPlugin", handler);
				normalModuleFactory.hooks.parser
					.for("javascript/esm")
					.tap("ImportPlugin", handler);
			}
		);
	}
}
module.exports = ImportPlugin;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   import * as ts from 'typescript'

export interface CompilerInfo {
	compilerPath: string
	compilerVersion: string
	tsImpl: typeof ts
}

export interface LoaderConfig {
	instance?: string
	compiler?: string
	configFileName?: string
	configFileContent?: string
	forceIsolatedModules?: boolean
	errorsAsWarnings?: boolean
	transpileOnly?: boolean
	ignoreDiagnostics?: number[]
	compilerOptions?: ts.CompilerOptions
	useTranspileModule?: boolean
	useBabel?: boolean
	babelCore?: string
	babelOptions?: any
	usePrecompiledFiles?: boolean
	silent?: boolean
	useCache?: boolean
	cacheDirectory?: string
	entryFileIsJs?: boolean
	debug?: boolean
	reportFiles?: string[]
	context?: string
	getCustomTransformers?: string | ((program: ts.Program) => ts.CustomTransformers | undefined)
}

export interface OutputFile {
	text: string
	sourceMap: string
	declaration: ts.OutputFile
}

export type TsConfig = ts.ParsedCommandLi