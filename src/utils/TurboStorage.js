var TurboStorage = function(config){

	document.body.innerHTML += '<div id="dropzone" style="display:none"></div>'
	var currentDropzone = null
	
	var uploadFile = function(completion, onUploadStart, onProgressUpdate){
		var dropzone = document.getElementById('dropzone')
		if (dropzone == null){
			completion(new Error('dropzone element required'), null)
			return
		}

		if (dropzone.className.indexOf('dz-clickable') != -1){
			if (currentDropzone != null){
				dropzone.click()
				return
			}
		}

		var _config = config
		var site = null // full json of site, not just site id
		var uploadUrl = null
		var headers = null
		var maxSize = 512
		var method = 'PUT'
		var _completion = completion
		var _onProgressUpdate = onProgressUpdate

		var options = {
			createImageThumbnails: false,
			url: '/temp', // this is not the actual url. it gets reset in turbo.executeFunction(...)
			method: method,
			maxFilesize: maxSize,
			headers: headers,
			init: function() {
				this.on('processing', function(file){
					this.options.url = uploadUrl
					this.options.headers = headers
					this.options.method = (file.type.toLowerCase().indexOf('image') == -1) ? 'PUT' : 'POST'
				})

				// progres is 0-100, e.g. "37.67389454804663"
				this.on('totaluploadprogress', function(progress){
					console.log('progress: ' + progress + '%')
					if (_onProgressUpdate != null)
						_onProgressUpdate(progress)
				})
			},
			canceled: function(event){
				console.log('Upload Cacneled')
			},
			sending: function(file, xhr){
				console.log('Upload Starting: ' + file.name)
				if (onUploadStart)
					onUploadStart()

				xhr.addEventListener('load', function(response){
					// console.log('RESPNONSE TEXT: ' + JSON.stringify(xhr.responseText))

					// TODO: handle S3 response. xhr.responseText is an empty string on S3 upload response
					var url = null
					if (file.type.toLowerCase().indexOf('image') == -1){
						url = 'https://storage.turbo360.co/'+site.slug+'/'+file.name
					}
					else {
						var data = JSON.parse(xhr.responseText)
						console.log('Upload Complete: ' + JSON.stringify(data))
						url = data.image.address
					}

					// Image Service Returns this Response:
					// {"confirmation":"success","image":{"id":"ZBn1j_n4",
					// "address":"https://lh3.googleusercontent.com/NDnrNAGPn4sRgjDsMJLDqptOdVVHmwaBMeKLkvX6zyxEjbicA3z8kKbeO6X9d-cx6O4bVtEimzgFvstGWDECvIvR",
					// "name":"social-image-sprites.png",
					// "key":"AMIfv964PNVLrnE76eILfZ5FjHW0UIsj5V3GFGJxsNqbRPqElK9p3NaQ1rkwA_eWtE4lLeA5z7EoG6pbupiPqYQBrDxk6KxLonbCZKVos909TM7MXAjCCX49uM-IwIE8ssxgmPkS0XFPsiy4kgd-2Mw84bcweJdUO2z0RrBhOUqJj_iZBn1j_n4"},
					// "loggedIn":"no"}

					// S3 basically returns nothing

					// send this to Turbo Dashboard to create Blob entity:
					var blob = {
						name: file.name, 
						type: file.type,
						size: file.size,
						url: url,
						site: site.id
					}

				    $.ajax({
				        url: _config.dashboard_url + '/api/blob', //post this to the dashboard, not the main base url
				        type: 'POST',
				        data: JSON.stringify(blob),
				        contentType: 'application/json; charset=utf-8',
				        dataType: 'json',
				        async: true,
				        success: function(data, status) {
				        	if (data.confirmation != 'success'){
						    	_completion(new Error('Error: ' + data.message), null)
						    	return
				        	}

							// console.log('FILE UPLOADED: ' + JSON.stringify(data))
				        	_completion(null, data)
							return
				        },
					    error: function(xhr, status, error) { 
					    	// alert('Error: '+error.message)
						    _completion(new Error('Error: ' + error.message), null)
							return
					    }
				    })
				})

				// this is an image
				if (file.type.toLowerCase().indexOf('image') != -1){
					xhr.open('POST', uploadUrl, true)

					var formData = new FormData()
					formData.append('file', file)
					// xhr.send(formData)

					var _send = xhr.send
					xhr.send = function(){
						_send.call(xhr, formData)
					}

					return
				}

				var _send = xhr.send
				xhr.send = function(){
					_send.call(xhr, file)
				}
			},
			accept: function(file, done){
				// console.log('ACCEPT FILE: ' + file.name + ', MIME: '+file.type)
				var params = {
					site: _config.site_id,
					exec: 'upload-string',
					filename: file.name, 
					filetype: file.type
				}

				headers = {'Content-Type': params.filetype}

			    $.ajax({
			        url: _config.base_url + '/functions',
			        type: 'POST',
			        data: JSON.stringify(params),
			        contentType: 'application/json; charset=utf-8',
			        dataType: 'json',
			        async: true,
			        success: function(data, status) {
			        	if (data.confirmation != 'success'){
					    	_completion(new Error('Error: ' + data.message), null)
					    	return
			        	}

						// console.log('UPLOAD URL: '+JSON.stringify(data))
						// {"confirmation":"success","result":
						// {"signedRequest":"https://s3.amazonaws.com/apps.velocity360.io%2Frec-league-iseysu/myfile.jpg…=1497822827&Signature=jRS6ZqfJvsvoXy66zHHgYIKn2bE%3D&x-amz-acl=public-read",
						// "url":"https://apps.velocity360.io.s3.amazonaws.com/myfile.jpg"}}
						// uploadUrl = data.result.signedRequest

						uploadUrl = data.result
						site = data.site
						done() // this initiates the upload  - kicks off the process
						return
			        },
				    error: function(xhr, status, error) { 
				    	alert('Error: '+error.message)
						return
				    }
			    })
			}
		}

		// currentDropzone = new Dropzone('#'+el, options)
		currentDropzone = new Dropzone('#dropzone', options)
		document.getElementById('dropzone').click()
	}

	var getFiles = function(params, completion){
		if (params == null) // can be null so check here
			params = {}

		params['site'] = config.site_id

		var headers = {}
		headers[config.turbo_app_header] = config.site_id

		$.ajax({
			url: _config.dashboard_url + '/api/blob',
			type: 'GET',
			headers: headers,
			data: params,
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
			    completion(new Error('Error: ' + error.message), null)
				return
		    }
		})
	}

	return {
		uploadFile: uploadFile,
		getFiles: getFiles
	}
}
