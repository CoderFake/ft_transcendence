

export class AExchangeable
{
    /**
     * This abstract class implement import and export method useful to export/import data to/from the server
     * @param {[String]} fieldNameList 
     */
    export(fieldNameList = [])
    {
        let valueList = [];

        fieldNameList.forEach(fieldName => {
            let value;

            if (this[fieldName] instanceof AExchangeable)
                value = this[fieldName].export();
            else
                value = this[fieldName];
        });

        return valueList;
    }

    /**
     * @param {Object} data 
     */
    import(data)
    {
        for (const [key, value] of Object.entries(data)) {

            if (Array.isArray(value))
            {
                for (let i = 0; i < value.length; i++)
                {   
                    if (this[key][i] instanceof AExchangeable)
                        this[key][i].import(value[i]);
                    else
                        this[key][i] = value[i];
                }
            }
            else
            {
                if (this[key] instanceof AExchangeable)
                    this[key].import(value);
                else
                    this[key] = value;
            }
        }
    }
}