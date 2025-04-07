import { AExchangeable } from "../../AExchangable.js";

class Point extends AExchangeable
{
    /**
     * @param {Number} x
     * @param {Number} y
     */
    constructor(x, y)
    {
        super();
        
        /**
         * @type {Number}
         */
        this.x = x;
        /**
         * @type {Number}
         */
        this.y = y;
    }

    /**
     * @type {[String]}
     */
    export(additionalFieldList)
    {
        super.export([...additionalFieldList, "x", "y"])
    }
}

export { Point };
