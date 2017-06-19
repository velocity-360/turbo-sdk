var TurboEmail = function(config){
	const BASE_URL = 'https://velocity-microservices.herokuapp.com'

	var sendEmail = function(params, completion){
		if ($ == null){
			completion(new Error('Please include jQuery'), null)
			return
		}
		
		if (completion == null){
			completion(new Error('Please include completion callback'), null)
			return
		}

		if (config.site_id == null){
			completion(new Error('Please Set Your TURBO_APP_ID'), null)
			return
		}

		if (config.site_id.length < 20){
			completion(new Error('Please Set Your TURBO_APP_ID'), null)
			return
		}

		if (params == null){
			completion(new Error('Params required to create entity.'), null)
			return
		}

		params['site'] = config.site_id
		params['exec'] = 'sendemail'

	    $.ajax({
	        url: BASE_URL+'/functions',
	        type: 'POST',
	        data: JSON.stringify(params),
	        contentType: 'application/json; charset=utf-8',
	        dataType: 'json',
	        async: true,
	        success: function(data, status) {
	        	if (data.confirmation != 'success'){
			    	completion(new Error(data.message), null)
			    	return
	        	}

		    	completion(null, data)
	        },
		    error: function(xhr, status, error) { 
		    	completion(error, null)
		    }
	    })
	}

	return {
		sendEmail: sendEmail
	}

}