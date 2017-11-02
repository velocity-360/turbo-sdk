var TurboVectors = function(config){

	var vector = function(name, query, completion){
		params['site'] = config.site_id

		/*
		$.ajax({
			url: config.base_url + '/vectors/' + name,
			// headers: { // https://stackoverflow.com/questions/10093053/add-header-in-ajax-request-with-jquery
			// 	'Authorization':'Basic xxxxxxxxxxxxx',
			// 	'X_CSRF_TOKEN':'xxxxxxxxxxxxxxxxxxxx',
			// 	'Content-Type':'application/json'
			// },
			type: 'POST',
			data: JSON.stringify(query),
			contentType: 'application/json; charset=utf-8',
			// dataType: 'json',
			async: true,
			success: function(data, status) {

				return
			},
			error: function(xhr, status, error) { 
				alert('Error: '+error.message)
				return
			}
		})*/
	}

	return {
		vector: vector
	}

}