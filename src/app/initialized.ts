export function Initialized(target: Object, key: string, descriptor: TypedPropertyDescriptor<any>) {
    var original = descriptor.value
    descriptor.value = function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var a = args.map(function (a) { return JSON.stringify(a); }).join();
        console.log(a)
        console.log("Call: " + key + "(" + a + ") => ");
        return new Promise((resolve, reject) => {
            this.__initialized__.then( () => {
                console.log("initialized OK " + typeof this)
                resolve(original.apply(this, args))
            })
        })
    }
    return descriptor
}