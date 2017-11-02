var Turbo = function(credentials){
	// const BASE_URL = 'https://velocity-microservices.herokuapp.com'
	const BASE_URL = 'http://api.turbo360.co'
	const DASHBOARD_URL = 'https://www.turbo360.co'
	const APP_HEADER = 'Turbo-App-Id'

	var config = {
		site_id: credentials['site_id'],
		base_url: BASE_URL,
		dashboard_url: DASHBOARD_URL
	}

	var createUser = function(params, completion){
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

		var headers = {}
		headers[APP_HEADER] = config.site_id

		params['site'] = config.site_id

		var _config = config
	    $.ajax({
	        // url: BASE_URL+'/api/user',
	        url: BASE_URL+'/auth/createuser',
	        type: 'POST',
	        headers: headers,
	        data: JSON.stringify(params),
	        contentType: 'application/json; charset=utf-8',
	        dataType: 'json',
	        async: true,
	        success: function(data, status) {
	        	if (data.confirmation != 'success'){
			    	completion(new Error(data.message), null)
			    	return
	        	}

	        	// login user after creation:
	        	var dbRef = IndexDB(_config)
	        	var __config = _config
			    var user = data.user || data.result
				dbRef.dbTransaction(function(err, store){
					if (err){
				    	completion(err, null)
						return
					}

			        // console.log('DB SUCCESS: '+JSON.stringify(user))
				    store.put({id:__config.site_id, token:data.token})
				    completion(null, user)
				})

		    	// completion(null, data)
	        },
		    error: function(xhr, status, error) { 
		    	completion(error, null)
		    }
	    })
	}

	var login = function(params, completion){ // email, password
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
			completion(new Error('Post parameters required.'), null)
			return
		}

		var headers = {}
		headers[APP_HEADER] = config.site_id

		params['site'] = config.site_id
		// console.log('PARAMS: '+JSON.stringify(params))

		var url = config.base_url+'/auth/login'
		var _config = config
	    $.ajax({
	        url: url,
	        type: 'POST',
	        headers: headers,
	        data: JSON.stringify(params),
	        contentType: 'application/json; charset=utf-8',
	        dataType: 'json',
	        async: true,
	        success: function(data, status) {
	        	if (data.confirmation != 'success'){
			    	completion(new Error(data.message), null)
			    	return
	        	}

	        	var dbRef = IndexDB(_config)
	        	var __config = _config
			    var user = data.user || data.result

				dbRef.dbTransaction(function(err, store){
					if (err){
				    	completion(err, null)
						return
					}

			        // console.log('DB SUCCESS: '+JSON.stringify(user))
				    store.put({id:__config.site_id, token:data.token})
				    completion(null, user)
				})
	        },
		    error: function(xhr, status, error) { 
	        	console.log('FAIL: '+error.message)
		    	completion(error, null)
		    }
	    })
	}

	var logout = function(completion){
		if ($ == null){
			completion(new Error('Please include jQuery'), null)
			return
		}

		if (completion == null){
			completion(new Error('Please include completion callback'), null)
			return
		}

		if (config.site_id == null){
			reject(new Error('Please Set Your TURBO_APP_ID'))
			return
		}

		if (config.site_id.length < 20){
			reject(new Error('Please Set Your TURBO_APP_ID'))
			return
		}

		var dbRef = IndexDB(config)
		_config = config
		dbRef.dbTransaction(function(err, store){
			if (err){
				completion(err, null)
				return
			}

		    var query = store.delete(_config.site_id)
		    query.onsuccess = function() {
		    	// console.log('Token Removed')
				completion(null, null)
		    }

		    query.onerror = function(event){
				completion(event.target, null)
		    }
		})
	}	

	var currentUser = function(completion){
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

		var dbRef = IndexDB(config)
		var _config = config
		dbRef.dbTransaction(function(err, store){
			if (err){
				completion(err, null)
				return
			}

		    // Query the data
		    var query = store.get(_config.site_id)
		    var __config = _config
		    query.onsuccess = function() {
		    	if (query.result == null){
					completion(new Error('Not Logged In'), null)
		    		return
		    	}

			    $.ajax({
			        url: __config.base_url+'/auth/currentuser',
			        type: 'GET',
					headers: {'turbo-token': query.result.token},
			        contentType: 'application/json; charset=utf-8',
			        dataType: 'json',
			        async: true,
			        success: function(data, status) {
			        	if (data.confirmation != 'success') // silently return here because user might not be logged in
					    	return

			    		var user = data.user || data.result
				    	completion(null, data)
			        },
				    error: function(xhr, status, error) { 
				    	completion(error, null)
				    }
			    })
		    }

		    query.onerror = function(event){
		    	reject(event.target)
		    }
		})
	}

	var queryParams = function(){
		var qstr = window.location.href
	    var query = {}
	    var a = (qstr[0] === '?' ? qstr.substr(1) : qstr).split('&')
	    for (var i = 0; i < a.length; i++) {
	        var b = a[i].split('=')
	        query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '')
	    }

	    return query
	}

	var create = function(resource, params, completion){
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

		var headers = {}
		headers[APP_HEADER] = config.site_id

		params['site'] = config.site_id
	    $.ajax({
	        url: BASE_URL+'/api/'+resource.toLowerCase(),
	        type: 'POST',
	        headers: headers,
	        data: JSON.stringify(params),
	        contentType: 'application/json; charset=utf-8',
	        dataType: 'json',
	        async: true,
	        success: function(data, status) {
	        	if (data.confirmation != 'success'){
			    	completion(new Error(data.message), null)
			    	return
	        	}

	        	// console.log('SUCCESS: '+JSON.stringify(data))
		    	completion(null, data)
	        },
		    error: function(xhr, status, error) { 
	        	// console.log('FAIL: '+JSON.stringify(error))
		    	completion(error, null)
		    }
	    })
	}

	var fetch = function(resource, params, completion){
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

		var headers = {}
		headers[APP_HEADER] = config.site_id

		if (params == null)
			params = {}

		params['site'] = config.site_id
	    $.ajax({
	        url: BASE_URL+'/api/'+resource.toLowerCase(),
	        type: 'GET',
	        headers: headers,
	        contentType: 'application/json; charset=utf-8',
	        dataType: 'json',
	        async: true,
	        success: function(data, status) {
	        	if (data.confirmation != 'success'){
			    	completion(new Error(data.message), null)
			    	return
	        	}

	        	// console.log('SUCCESS: '+JSON.stringify(data))
		    	completion(null, data)
	        },
		    error: function(xhr, status, error) { 
	        	// console.log('FAIL: '+JSON.stringify(error))
		    	completion(error, null)
		    }
	    })
	}

	var fetchOne = function(resource, id, completion){
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

		if (id == null){
			completion(new Error('Please include resource identifier'), null)
			return
		}


		var headers = {}
		headers[APP_HEADER] = config.site_id

		// params['site'] = config.site_id
		var params = {site: config.site_id}
	    $.ajax({
	        url: BASE_URL+'/api/'+resource.toLowerCase()+'/'+id,
	        type: 'GET',
			headers: headers,
	        contentType: 'application/json; charset=utf-8',
	        dataType: 'json',
	        async: true,
	        success: function(data, status) {
	        	if (data.confirmation != 'success'){
			    	completion(new Error(data.message), null)
			    	return
	        	}

	        	// console.log('SUCCESS: '+JSON.stringify(data))
		    	completion(null, data)
	        },
		    error: function(xhr, status, error) { 
	        	// console.log('FAIL: '+JSON.stringify(error))
		    	completion(error, null)
		    }
	    })
	}

	var update = function(resource, entity, params, completion){
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

		// update the entity itself with new values then send to microservice
		Object.keys(params).forEach(function(key, i){
			var value = params[key]
			entity[key] = value
		})

		var headers = {}
		headers[APP_HEADER] = config.site_id

		params['site'] = config.site_id
	    $.ajax({
	        url: BASE_URL+'/api/'+resource.toLowerCase()+'/'+entity.id,
	        type: 'PUT',
	        headers: headers,
	        data: JSON.stringify(params),
	        contentType: 'application/json; charset=utf-8',
	        dataType: 'json',
	        async: true,
	        success: function(data, status) {
	        	if (data.confirmation != 'success'){
			    	completion(new Error(data.message), null)
			    	return
	        	}

	        	// console.log('SUCCESS: '+JSON.stringify(data))
		    	completion(null, data)
	        },
		    error: function(xhr, status, error) { 
	        	// console.log('FAIL: '+JSON.stringify(error))
		    	completion(error, null)
		    }
	    })
	}

	var remove = function(resource, entity, completion){
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

		var headers = {}
		headers[APP_HEADER] = config.site_id

		// params['site'] = config.site_id
		var params = {site: config.site_id}
	    $.ajax({
	        url: BASE_URL+'/api/'+resource.toLowerCase()+'/'+entity.id,
	        type: 'DELETE',
	        headers: headers,
	        data: null,
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
	
	var emailUtils = TurboEmail(config)
	var stripeManager = StripeMgr(config)
	var functionsManager = TurboFunctions(config)
	var storageMgr = TurboStorage(config)
	var vectorsMgr = TurboVectors(config)

	var client = {
		createUser: createUser,
		currentUser: currentUser,
		login: login,
		logout: logout,
		queryParams: queryParams,
		create: create,
		fetch: fetch,
		fetchOne: fetchOne,
		update: update,
		remove: remove,
		sendEmail: emailUtils.sendEmail,
		loadStripeHandler: stripeManager.loadStripeHandler,
		executeFunction: functionsManager.executeFunction,
		uploadFile: storageMgr.uploadFile
	}

	return client
}

