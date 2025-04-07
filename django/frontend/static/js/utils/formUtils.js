export function clearIds(property_name, elements_id)
{
	elements_id.forEach(element_id => {
		let element = document.getElementById(element_id);
		element[property_name] = "";
	});	
}

export function clearElements(prop, elements) {
	elements.forEach(element => element[prop] = '');
}

export function fill_errors(errors, property_name)
{
	Object.keys(errors).forEach(error_field =>
	{
		let element = document.getElementById(error_field);
		element[property_name] = errors[error_field];
	});	
}
