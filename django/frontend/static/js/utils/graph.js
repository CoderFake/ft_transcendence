
export function generateRandomColor()
{
	return `#${Math.floor(Math.random()*16777215).toString(16)}`;
}

/**
 * 
 * @param {[Number]} data 
 */
export function transformData(data)
{
	let newData = [];

	for (let index = 0; index < data.length; index++) {
		newData.push({x: Math.round(data[index] / 1000),
			 		  y: index + 1});
	}

	return newData;
}

/**
 * 
 */
export function range(start, stop, step = 1)
{
	if (stop === undefined)
	{
		stop = start;
		start = 0;
	}
	let newArr = [];
    for (let i = start; i <= stop; i += step)
        newArr.push(i);

	return newArr;
}

/**
 * 
 * @param {[Object]} dataset 
 */
export function get_labels(dataset)
{
	let labelsSet = new Set();

	dataset.forEach(player_data => {
		player_data.data.forEach(data => {
			labelsSet.add(data.x);
		});
	});

	let labels = Array.from(labelsSet);

	labels.sort(function(a, b){return b - a;});
	
	labels.reverse();

	return labels;
}