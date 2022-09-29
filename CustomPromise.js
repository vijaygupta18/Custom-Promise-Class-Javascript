

class CustomPromise {
    constructor(executer) {
        this.state = 'PENDING'
        this.result;
        this.handlers = [];
        try {
            // use bind to maintain this when using any function as callback
            executer(this.resolve.bind(this), this.reject.bind(this));
        } catch (error) {
            this.reject(error)
        }
    }

    //using setimeout to make the process asynchronous
    resolve(result) {
        setTimeout(() => {
            // if promise is alaready fulfilled i.e either rsolved or rejected then return
            if (this.state !== 'PENDING') {
                return;
            }
            // to check if the result is also a Promise
            if (result && result instanceof CustomPromise) {
                return result.then(this.resolve, this.reject);
            }
            this.result = result;
            this.state = 'RESOLVED';
            this.runAllHandlers();
        }, 10);
    }

    reject(reason) {
        setTimeout(() => {
            if (this.state !== 'PENDING') {
                return;
            }
            if (reason && reason instanceof CustomPromise) {
                return reason.then(this.resolve, this.reject);
            }
            this.result = reason;
            this.state = 'REJECTED';
            this.runAllHandlers();
        }, 10);
    }


    then(successful, failed) {
        return new CustomPromise((resolve, reject) => {
            this.handlers.push({
                // for chaining if no successful provided resolve the result for next chain and doing the same in case of failed
                successful: function (result) {
                    if (!successful) {
                        return resolve(result);
                    }
                    try {
                        return resolve(successful(result))
                    } catch (error) {
                        return reject(error);
                    }
                },
                failed: function (result) {
                    if (!failed) {
                        return reject(result);
                    }
                    try {
                        return resolve(failed(result))
                    } catch (error) {
                        return reject(error);
                    }
                }
            });
            this.runAllHandlers();
        });
    }
    // catch is like then with succefull as null
    catch(failed) {
        return this.then(null, failed);
    }
    
    runAllHandlers() {
        // if promise in pending then return and dont execute the handlers
        if (this.state === 'PENDING') {
            return null;
        }
        this.handlers.forEach((handler) => {
            if (this.state === 'RESOLVED') {
                return handler.successful(this.result);
            }
            else {
                return handler.failed(this.result);
            }
        });
        // after task completion set the handler as empty
        this.handlers = [];
    }
}

const test1 = new CustomPromise((resolve, reject) => {
    resolve('promise resolved');
});
const test2 = new CustomPromise((resolve, reject) => {
    reject('promise rejected');
});
const test3 = new CustomPromise((resolve, reject) => {
    reject('promise rejected for test 3');
});
test1.then((res) => { console.log(res); })
test2.then((res) => { console.log(res); }).catch((error) => { console.log(error); })
