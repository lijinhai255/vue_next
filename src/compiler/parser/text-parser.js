/* @flow */

import { cached } from 'shared/util'
import { parseFilters } from './filter-parser'

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g //处理{{}}类似
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g

const buildRegex = cached(delimiters => {
  const open = delimiters[0].replace(regexEscapeRE, '\\$&')
  const close = delimiters[1].replace(regexEscapeRE, '\\$&')
  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
})

type TextParseResult = {
  expression: string,
  tokens: Array<string | { '@binding': string }>
}

/**
 * 解析处理{{}} ，正常字符串，直接返回
 * @param {*} text
 * @param {*} delimiters
 */
export function parseText(
  text: string,
  delimiters?: [string, string]
): TextParseResult | void {
  const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE
  //文本没有动态的
  if (!tagRE.test(text)) {
    return
  }
  const tokens = []
  const rawTokens = []
  let lastIndex = tagRE.lastIndex = 0
  let match, index, tokenValue
  while ((match = tagRE.exec(text))) {
    //表达式开始的位置
    index = match.index
    // push text token
    if (index > lastIndex) {
      //表达式开始前的内容，放入到token中 ，比如：`我爱{{name}}`中的`我爱`
      rawTokens.push(tokenValue = text.slice(lastIndex, index))
      tokens.push(JSON.stringify(tokenValue))
    }
    // tag token  提取表达式的内容，通过_s()来包装
    const exp = parseFilters(match[1].trim())
    tokens.push(`_s(${exp})`)
    rawTokens.push({ '@binding': exp })
    lastIndex = index + match[0].length
  }
  //表达式后面还有其他的字符串，也处理到tokens中
  if (lastIndex < text.length) {
    rawTokens.push(tokenValue = text.slice(lastIndex))
    tokens.push(JSON.stringify(tokenValue))
  }

  /**
   * 是否登录：{{isLogin?'是':'否'}}
   */
  return {
    expression: tokens.join('+'),//是否登录："+_s(isLogin?'是':'否')"
    tokens: rawTokens// [是否登录，{@bind:"isLogin?'是':'否'"}]
  }
}
