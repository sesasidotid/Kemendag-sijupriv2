export class Serializable {

    fromObject(object: any) {
        this.serialize(this, object)
    }

    private serialize(instance: any, object: any) {
        Object.getOwnPropertyNames(instance).forEach(prop => {
            if (object.hasOwnProperty(prop))
                instance[prop] = object[prop];
            else
                instance[prop] = undefined;
        })
    }
}
