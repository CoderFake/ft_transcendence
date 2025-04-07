

class Time
{
    constructor()
    {
        /**
         * @type {Number}
         */
        this._lastFrame = undefined;

        /**
         * @type {Number}
         */
        this._currentFrame = undefined;
    }

    deltaTime()
    {
        if (this._lastFrame === undefined)
            return 0;
        return (this._currentFrame - this._lastFrame);
    }

    deltaTimeSecond()
    {
        return this.deltaTime() / 1000;
    }

    get_fps()
    {
        return 1 / this.deltaTimeSecond();
    }

    new_frame()
    {
        this._lastFrame = this._currentFrame;
        this._currentFrame = Date.now();
    }
}

export { Time };