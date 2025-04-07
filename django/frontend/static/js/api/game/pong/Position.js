import { AExchangeable } from "../../AExchangable.js";
import { Point } from "./Point.js";

export class Position extends AExchangeable
{
    /**
     * @param {Point | Number} location 
     * @param {Number} time 
     */
    constructor(location = new Point(), time)
    {
        super();
        /**
         * @type {Point | Number}
         */
        this.location = location;

        /**
         * @type {Number}
         */
        this.time = time;
    }

    /**
     * @param {[]} additionalFieldList 
     */
    export(additionalFieldList)
    {
        super.export([...additionalFieldList + "location", "time"]);
    }
}