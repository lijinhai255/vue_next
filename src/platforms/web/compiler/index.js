/* @flow */

import { baseOptions } from './options'
import { createCompiler } from 'compiler/index'

//生成编译函数
const { compile, compileToFunctions } = createCompiler(baseOptions)

export { compile, compileToFunctions }
