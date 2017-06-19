
var StripeMgr = function(config){ // config container BASE_URL and site_id
	// var createStripeCharge = function(config){
	//     return new Promise(function (resolve, reject){
	//     	if (config.stripeRef == null){
	// 	        reject(new Error('Missing stripeRef'))
	//     		return
	//     	}
	//     	if (config.amount == null){
	// 	        reject(new Error('Missing Amount Parameter'))
	//     		return
	//     	}
	//     	if (config.stripeToken == null){
	// 	        reject(new Error('Missing StripeToken Parameter'))
	//     		return
	//     	}
	//     	if (config.description == null){
	// 	        reject(new Error('Missing Description Parameter'))
	//     		return
	//     	}

	// 		config.stripeRef.charges.create({
	// 			amount: config.amount*100, // amount in cents
	// 			currency: 'usd',
	// 			source: config.stripeToken,
	// 			description: config.description,
	// 		}, function(err, charge) {
	// 			if (err){
	// 	            reject(err)
	// 	            return
	// 			}

	// 	    	resolve(charge)
	// 		})
	//     })
	// }

	// var recurringCharge = function(config){
	//     return new Promise(function (resolve, reject){
	//     	if (config.stripeRef == null){
	// 	        reject(new Error('Missing stripeRef'))
	//     		return
	//     	}

	//     	if (config.amount == null){
	// 	        reject(new Error('Missing amount parameter'))
	//     		return
	//     	}

	//     	if (config.customerId == null){
	// 	        reject(new Error('Missing customerId parameter'))
	//     		return
	//     	}

	//     	if (config.description == null){
	// 	        reject(new Error('Missing description parameter'))
	//     		return
	//     	}

	// 		config.stripeRef.charges.create({
	// 			amount: config.amount*100, // convert amount to cents
	// 			currency: 'usd',
	// 			customer: config.customerId,
	// 			description: config.description,
	// 		}, function(err, charge) {
	// 			if (err){ // check for `err`
	// 	            reject(err)
	// 	            return
	// 			}

	// 	    	resolve(charge)
	// 		})
	//     })
	// }

	var loadStripeHandler = function(params, callback){
		if (config.site_id == null){
			alert('Please Set Your TURBO_APP_ID')
			return null
		}

		if (config.site_id.length < 20){
			alert('Please Set Your TURBO_APP_ID')
			return null
		}

		if (params.key == null){
			alert('Missing Stripe Key')
			return null
		}

		if (params.label == null){
			alert('Missing Label')
			return null
		}

		if (params.action == null){
			alert('Missing Action Parameter: charge or card')
			return null
		}

		if (params.action!='card' && params.action!='charge'){
			alert('Invalid Action Parameter. Must be charge or card.')
			return null
		}

		if (params.action == 'charge'){
			if (params.amount == null){
				alert('Missing Amount Parameter.')
				return null
			}

			if (params.description == null){
				alert('Missing Description Parameter.')
				return null
			}
		}

		var _callback = callback
		var _action = params.action
		var _params = params
		var stripeHandler = StripeCheckout.configure({
		    key: params.key,
		    image: params.image,
		    address: true,
		    locale: 'auto',
		    panelLabel: params.label,
		    token: function(token) {
		    	if (_action == 'card'){ // submit card, create new customer
					var params = {
						site: config.site_id,
						exec: 'create-stripe-customer',
						stripeToken: token.id,
						email: token.email,
						name: token.card.name
					}

			    	var __callback = _callback
				    $.ajax({
				        url: config.base_url+'/functions',
				        type: 'POST',
				        data: JSON.stringify(params),
				        contentType: 'application/json; charset=utf-8',
				        dataType: 'json',
				        async: true,
				        success: function(data, status) {
				        	if (data.confirmation != 'success'){
						    	__callback(new Error(data.message), null)
						    	return
				        	}

					    	__callback(null, data)
				        },
					    error: function(xhr, status, error) { 
					    	__callback(error, null)
					    }
				    })

				    return
		    	}

		    	if (_action == 'charge'){
					var body = {
						site: config.site_id,
						exec: 'create-stripe-charge',
						stripeToken: token.id,
						email: token.email,
						name: token.card.name,
						amount: _params.amount,
						description: _params.description
					}

			    	var __callback = _callback
				    $.ajax({
				        url: config.base_url+'/functions',
				        type: 'POST',
				        data: JSON.stringify(body),
				        contentType: 'application/json; charset=utf-8',
				        dataType: 'json',
				        async: true,
				        success: function(data, status) {
				        	if (data.confirmation != 'success'){
						    	__callback(new Error(data.message), null)
						    	return
				        	}

					    	__callback(null, data)
				        },
					    error: function(xhr, status, error) { 
					    	__callback(error, null)
					    }
				    })
		    	}
		    },
		    closed: function() {

		    }
		})

		return stripeHandler
	}

	return {
		loadStripeHandler: loadStripeHandler
		// createStripeAccount: createStripeAccount,
		// createStripeCharge: createStripeCharge,
		// recurringCharge: recurringCharge,
	}
}

