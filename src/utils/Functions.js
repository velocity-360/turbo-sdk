var TurboFunctions = function(config){
	
	var executeFunction = function(params, completion){
		if (params.exec == null){
			completion(new Error('Missing Exec Parameter'), null)
			return
		}

		params['site'] = config.site_id

	    $.ajax({
	        url: config.base_url + '/functions',
	        type: 'POST',
	        data: JSON.stringify(params),
	        contentType: 'application/json; charset=utf-8',
	        dataType: 'json',
	        async: true,
	        success: function(data, status) {
	        	if (data.confirmation != 'success'){
			    	completion(new Error('Error: ' + data.message), null)
			    	return
	        	}

		    	completion(null, data)
				return
	        },
		    error: function(xhr, status, error) { 
		    	alert('Error: '+error.message)
				return
		    }
	    })
	}

	return {
		executeFunction: executeFunction
	}

}