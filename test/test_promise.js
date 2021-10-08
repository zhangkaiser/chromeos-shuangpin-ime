/**
 * 测试promise的请求终止.
 */

function a() {
  let _reject
  let timeout
  let promise = new Promise((resolve, reject) => {
    _reject = reject;
    timeout = setTimeout(() => {
      console.log('a is running!');
      resolve('hello, I\'m a');
    }, 3000)
    promise.catch(() => clearTimeout(timeout))
  })

  return {
    promise,
    reject: _reject,
    timeout
  }

}

class Hello {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;

      let a1 = a();
      a1.promise.then(resolve).catch(reject)
      this.reject = (ret) => {
        clearTimeout(a1.timeout);
        reject(ret);
      }
      
    })
  }
}


let hello = new Hello;
hello.promise.then(console.log).catch(console.error)
hello.reject('Abort the promise.')