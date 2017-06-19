var TurboStorage = function(config){

	var currentDropzone = null
	
	var initializeDropzone = function(el, completion){
		if (el == null){
			completion(new Error('dropzone element not specified'), null)
			return
		}

		var dropzone = document.getElementById(el)
		if (dropzone == null){
			completion(new Error('dropzone element required'), null)
			return
		}

		if (dropzone.className.indexOf('dz-clickable') != -1){
			if (currentDropzone != null){
				document.getElementById(el).click()
				completion(null, currentDropzone)
				return
			}
		}

		var _config = config
		var site = null // full json of site, not just site id
		var uploadUrl = null
		var headers = null
		var method = 'PUT'

		var options = {
			url: '/temp', // this is not the actual url. it gets reset in turbo.executeFunction(...)
			method: method,
			headers: headers,
			init: function() {
				this.on('processing', function(file){
					this.options.url = uploadUrl
					this.options.headers = headers
					this.options.method = (file.type.toLowerCase().indexOf('image') == -1) ? 'PUT' : 'POST'
				})

				// progres is 0-100, e.g. "37.67389454804663"
				this.on('totaluploadprogress', function(progress){
					console.log('totaluploadprogress: '+progress)
				})
			},
			sending: function(file, xhr){
				console.log('Upload Starting: ' + file.name)
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

					// TODO: send this to Turbo to create Blob entity:
					var blob = {
						filename: file.name, 
						type: file.type,
						size: file.size,
						url: url,
						site: site.id
					}

					console.log('FILE METADATA: ' + JSON.stringify(blob))
				})

				// this is an image
				if (file.type.toLowerCase().indexOf('image') != -1){
					xhr.open('POST', uploadUrl, true)

					var formData = new FormData()
					formData.append('file', file)
					xhr.send(formData)
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
					    	completion(new Error('Error: ' + data.message), null)
					    	return
			        	}

						console.log('UPLOAD URL: '+JSON.stringify(data))
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

		currentDropzone = new Dropzone('#'+el, options)
		document.getElementById(el).click()
		completion(null, currentDropzone)
	}

	return {
		initializeDropzone: initializeDropzone
	}
}
