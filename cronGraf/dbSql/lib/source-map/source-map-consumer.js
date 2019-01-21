/// <amd-module name="@angular/compiler-cli/src/diagnostics/typescript_symbols" />
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CompilePipeSummary, StaticSymbol } from '@angular/compiler';
import * as ts from 'typescript';
import { SymbolQuery, SymbolTable } from './symbols';
export declare function getSymbolQuery(program: ts.Program, checker: ts.TypeChecker, source: ts.SourceFile, fetchPipes: () => SymbolTable): SymbolQuery;
export declare function getClassMembers(program: ts.Program, checker: ts.TypeChecker, staticSymbol: StaticSymbol): SymbolTable | undefined;
export declare function getClassMembersFromDeclaration(program: ts.Program, checker: ts.TypeChecker, source: ts.SourceFile, declaration: ts.ClassDeclaration): SymbolTable;
export declare function getClassFromStaticSymbol(program: ts.Program, type: StaticSymbol): ts.ClassDeclaration | undefined;
export declare function getPipesTable(source: ts.SourceFile, program: ts.Program, checker: ts.TypeChecker, pipes: CompilePipeSummary[]): SymbolTable;
export declare const toSymbolTableFactory: (tsVersion: string) => (symbols: ts.Symbol[]) => ts.UnderscoreEscapedMap<ts.Symbol>;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 {
  "_from": "chrome-trace-event@^0.1.1",
  "_id": "chrome-trace-event@0.1.3",
  "_inBundle": false,
  "_integrity": "sha512-sjndyZHrrWiu4RY7AkHgjn80GfAM2ZSzUkZLV/Js59Ldmh6JDThf0SUmOHU53rFu2rVxxfCzJ30Ukcfch3Gb/A==",
  "_location": "/chrome-trace-event",
  "_phantomChildren": {},
  "_requested": {
    "type": "range",
    "registry": true,
    "raw": "chrome-trace-event@^0.1.1",
    "name": "chrome-trace-event",
    "escapedName": "chrome-trace-event",
    "rawSpec": "^0.1.1",
    "saveSpec": null,
    "fetchSpec": "^0.1.1"
  },
  "_requiredBy": [
    "/webpack"
  ],
  "_resolved": "https://registry.npmjs.org/chrome-trace-event/-/chrome-trace-event-0.1.3.tgz",
  "_shasum": "d395af2d31c87b90a716c831fe326f69768ec084",
  "_spec": "chrome-trace-event@^0.1.1",
  "_where": "E:\\angular\\google_tools\\my-app\\node_modules\\webpack",
  "author": {
    "name": "Trent Mick, Sam Saccone"
  },
  "bundleDependencies": false,
  "dependencies": {},
  "deprecated": false,
  "description": "A library to create a trace of your node app per Google's Trace Event format.",
  "devDependencies": {
    "tape": "4.8.0"
  },
  "engines": {
    "node": ">=6.0"
  },
  "keywords": [
    "trace-event",
    "trace",
    "event",
    "trace-viewer",
    "google"
  ],
  "license": "MIT",
  "main": "./lib/trace-event.js",
  "name": "chrome-trace-event",
  "repository": {
    "type": "git",
    "url": "github.com:samccone/chrome-trace-event"
  },
  "scripts": {
    "test": "tape test/*.test.js"
  },
  "version": "0.1.3"
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        "use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Lint = require("tslint");
var sprintf_js_1 = require("sprintf-js");
var SyntaxKind = require("./util/syntaxKind");
var UsePropertyDecorator = (function (_super) {
    __extends(UsePropertyDecorator, _super);
    function UsePropertyDecorator(config, options) {
        var _this = _super.call(this, options) || this;
        _this.config = config;
        return _this;
    }
    UsePropertyDecorator.formatFailureString = function (config, decoratorName, className) {
        var decorators = config.decoratorName;
        if (decorators instanceof Array) {
            decorators = decorators.map(function (d) { return "\"@" + d + "\""; }).join(', ');
        }
        else {
            decorators = "\"@" + decorators + "\"";
        }
        return sprintf_js_1.sprintf(config.errorMessage, decoratorName, className, config.propertyName, decorators);
    };
    UsePropertyDecorator.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new DirectiveMetadataWalker(sourceFile, this.getOptions(), this.config));
    };
    return UsePropertyDecorator;
}(Lint.Rules.AbstractRule));
exports.UsePropertyDecorator = UsePropertyDecorator;
var DirectiveMetadataWalker = (function (_super) {
    __extends(DirectiveMetadataWalker, _super);
    function DirectiveMetadataWalker(sourceFile, options, config) {
        var _this = _super.call(this, sourceFile, options) || this;
        _this.config = config;
        return _this;
    }
    DirectiveMetadataWalker.prototype.visitClassDeclaration = function (node) {
        (node.decorators || [])
            .forEach(this.validateDecorator.bind(this, node.name.text));
        _super.prototype.visitClassDeclaration.call(this, node);
    };
    DirectiveMetadataWalker.prototype.validateDecorator = function (className, decorator) {
        var baseExpr = decorator.expression || {};
        var expr = baseExpr.expression || {};
        var name = expr.text;
        var args = baseExpr.arguments || [];
        var arg = args[0];
        if (/^(Component|Directive)$/.test(name) && arg) {
            this.validateProperty(className, name, arg);
        }
    };
    DirectiveMetadataWalker.prototype.validateProperty = function (className, decoratorName, arg) {
        var _this = this;
        if (arg.kind === SyntaxKind.current().ObjectLiteralExpression) {
            arg
                .properties
                .filter(function (prop) { return prop.name.text === _this.config.propertyName; })
                .forEach(function (prop) {
                var p = prop;
                _this.addFailure(_this.createFailure(p.getStart(), p.getWidth(), UsePropertyDecorator.formatFailureString(_this.config, decoratorName, className)));
            });
        }
    };
    return DirectiveMetadataWalker;
}(Lint.RuleWalker));
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          /**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimateTimings, AnimationMetadataType, AnimationOptions, ɵStyleData } from '@angular/animations';
export interface AstVisitor {
    visitTrigger(ast: TriggerAst, context: any): any;
    visitState(ast: StateAst, context: any): any;
    visitTransition(ast: TransitionAst, context: any): any;
    visitSequence(ast: SequenceAst, context: any): any;
    visitGroup(ast: GroupAst, context: any): any;
    visitAnimate(ast: AnimateAst, context: any): any;
    visitStyle(ast: StyleAst, context: any): any;
    visitKeyframes(ast: KeyframesAst, context: any): any;
    visitReference(ast: ReferenceAst, context: any): any;
    visitAnimateChild(ast: AnimateChildAst, context: any): any;
    visitAnimateRef(ast: AnimateRefAst, context: any): any;
    visitQuery(ast: QueryAst, context: any): any;
    visitStagger(ast: StaggerAst, context: any): any;
}
export interface Ast<T extends AnimationMetadataType> {
    type: T;
    options: AnimationOptions | null;
}
export interface TriggerAst extends Ast<AnimationMetadataType.Trigger> {
    type: AnimationMetadataType.Trigger;
    name: string;
    states: StateAst[];
    transitions: TransitionAst[];
    queryCount: number;
    depCount: number;
}
export interface StateAst extends Ast<AnimationMetadataType.State> {
    type: AnimationMetadataType.State;
    name: string;
    style: StyleAst;
}
export interface TransitionAst extends Ast<AnimationMetadataType.Transition> {
    matchers: ((fromState: string, toState: string, element: any, params: {
        [key: string]: any;
    }) => boolean)[];
    animation: Ast<AnimationMetadataType>;
    queryCount: number;
    depCount: number;
}
export interface SequenceAst extends Ast<AnimationMetadataType.Sequence> {
    steps: Ast<AnimationMetadataType>[];
}
export interface GroupAst extends Ast<AnimationMetadataType.Group> {
    steps: Ast<AnimationMetadataType>[];
}
export interface AnimateAst extends Ast<AnimationMetadataType.Animate> {
    timings: TimingAst;
    style: StyleAst | KeyframesAst;
}
export interface StyleAst extends Ast<AnimationMetadataType.Style> {
    styles: (ɵStyleData | string)[];
    easing: string | null;
    offset: number | null;
    containsDynamicStyles: boolean;
    isEmptyStep?: boolean;
}
export interface KeyframesAst extends Ast<AnimationMetadataType.Keyframes> {
    styles: StyleAst[];
}
export interface ReferenceAst extends Ast<AnimationMetadataType.Reference> {
    animation: Ast<AnimationMetadataType>;
}
export interface AnimateChildAst extends Ast<AnimationMetadataType.AnimateChild> {
}
export interface AnimateRefAst extends Ast<AnimationMetadataType.AnimateRef> {
    animation: ReferenceAst;
}
export interface QueryAst extends Ast<AnimationMetadataType.Query> {
    selector: string;
    limit: number;
    optional: boolean;
    includeSelf: boolean;
    animation: Ast<AnimationMetadataType>;
    originalSelector: string;
}
export interface StaggerAst extends Ast<AnimationMetadataType.Stagger> {
    timings: AnimateTimings;
    animation: Ast<AnimationMetadataType>;
}
export interface TimingAst {
    duration: number;
    delay: number;
    easing: string | null;
    dynamic?: boolean;
}
export interface DynamicTimingAst extends TimingAst {
    strValue: string;
    dynamic: true;
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        INDX( 	 ��i           (   �  �      
 �a �t               �    h X     *�    ����� =��_�R����vBͥN1�       �              A N 4 5 9 7 ~ 1 . T S %�    h X     *�    R���� =��_�g�����#��N1�       �              A N 7 A D 7 ~ 1 . T S ��    h X     *�    ۓ���� =��_��Q�����,�N1�       ?              A N 9 8 6 5 ~ 1 . T S �    h X     *�    >����� =��_�Y��������N1�       x              A N B 0 2 D ~ 1 . T S ִ    h X     *�    �A���
  =��_�>�����:���N1�       �              A N B 1 A 5 ~ 1 . T S :�    h X     *�    �Q���� =��_��s������<�N1�       �              A N E B 2 3 ~ 1 . T S :�    p ^     *�    �Q���� =��_��s������<�N1�       �              a n i m a t i o n . d . t s d ��    x f     *�    ����� =��_������0~�N1�       �              a n i m a t i o n _ a s t . d . t s d ��    � v     *�    <j���� =��_�g�����X�N1�       �              a n i m a t i o n _ 
 s t _ b u i l d e r . d . t s   ��    � v     *�    4
���� =��_��8�������N1�                     a n i m a t i o n _ d s l _ v i s i t o r . d . t s ���    � �     *�    g����� =��_�>���������N1�                      a n i m a t i o n _ t i m e l i n e _ b u i l d e r . d . t s ִ    � �     *�    �A���� =��_�>�����:���N1�       �              #a n i m a t i o n _ t i m e l i n e _ i n s t r u c t i o n . d . t s �    � ~     *�    ����� =��_�R���
 vBͥN1�       �              a n i m a t i o n _ t r a n s i t i o n _ e x p r . d . t s ���    � �     *�    ۓ���� =��_��Q�����,�N1�       ?              !a n i m a t i o n _ t r a n s i t i o n _ f a c t o r y . d . t s ���    � �     *�    >����� =��_�Y��������N1�       x              %a n i m a t i o n _ t r a n s i t i o n _ i n s t r u c t i o n . d . t s ��%�    � n     *�    R���� =��_�g�����#��N1�       �              a n i m a t i o n _ 
 r i g g e r . d . t s  ��    h X     *�    <j���� =��_�g�����X�N1�       �              A N I M A T ~ 1 . T S ��    h X     *�    ����� =��_������0~�N1�       �              A N I M A T ~ 2 . T S ��    h X     *�    4
���� =��_��8�������N1�                     A N I M A T ~ 3 . T S ��    h X     *�    g����� =��_�>���������N1�                      A N I M A T ~ 4 . T S J�    � z     *�    ����� =��_�df�����i��N1�           
         e l e m e n t _ i n s t r u c t i o n _ m a p . d . t s       J�    h X     *�    ����� =��_�df�����i��N1�                     E L E M E N ~ 1 . T S ��    x h     *�    у	�������������	[�M1�                       s t y l e _ n o r m a l i z a t i o n ��    h R     *�    у	�������������	[�M1�                       S T Y L E _ ~ 1                                                                                                                   
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
 "use strict";
/**
 * @license
 * Copyright 2013 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var resolve = require("resolve");
var utils_1 = require("./utils");
var CORE_FORMATTERS_DIRECTORY = path.resolve(__dirname, "formatters");
function findFormatter(name, formattersDirectory) {
    if (typeof name === "function") {
        return name;
    }
    else if (typeof name === "string") {
        name = name.trim();
        var camelizedName = utils_1.camelize(name + "Formatter");
        // first check f