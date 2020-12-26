/* @flow */

import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { createCompilerCreator } from './create-compiler'

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
export const createCompiler = createCompilerCreator(function baseCompile(
  template: string,
  options: CompilerOptions
): CompiledResult {

  //转义html==>AST
  const ast = parse(template.trim(), options);

  console.log(ast)
  console.log('静态节点优化标识', options.optimize)
  //不等于false，默认都优化
  if (options.optimize !== false) {//优化AST，标记静态节点
    //优化,
    optimize(ast, options);
    console.log(ast);
  }
  //把AST,转换为可以执行的代码
  const code = generate(ast, options)
  console.log(code)

  /**
   *  生成with 方法，内部方法==>core/instance/render-helpers
   */
  return {
    ast,//返回的AST
    render: code.render,//返回的render，执行生成VNode
    staticRenderFns: code.staticRenderFns
  }
})


