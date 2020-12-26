/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'

const arrayProto = Array.prototype//Array构造函数的原型对象{map,push,unshift}
export const arrayMethods = Object.create(arrayProto)//新对象继承了数组构造方法的原型对象

// [2,3,1]
// [1,2,3]

//对数组需要重写的方法
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',//splice(0,1212)
  'sort',
  'reverse'
]

//对于会修改数据内部变化的方法都会重新




/**
 * Intercept mutating methods and emit events
 */
//遍历，重写
methodsToPatch.forEach(function (method) {
  // cache original method
  // 'push'
  const original = arrayProto[method]//获取原来最初始的方法 'sort'



  /**
     Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true
      })
   */

  //push
  def(arrayMethods, method, function mutator(...args) {
    //push(1213)
    //[3434343,]
    const result = original.apply(this, args)//拿到结果  1213
    //[3434343,1213]


    const ob = this.__ob__//当前observer


    let inserted//新增项
    switch (method) {
      //push unshift会新增索引
      case 'push':
      case 'unshift':
        inserted = args
        break
      //新增索引的方法
      case 'splice':
        inserted = args.slice(2)
        break
    }
    //a=[1,3,5]
    //a.push({name:1212})   {name:1212}

    //[1,2,{a:{b:1}}]=yideng
    //yideng[2].a.b=1

    //a[3].name=34344
    //[1212]
    //{a:1212}
    if (inserted) ob.observeArray(inserted)//新增索引，才会重新处理响应数据
    // notify change

    ob.dep.notify();//触发视图更新,打电话
    return result
  })
})
