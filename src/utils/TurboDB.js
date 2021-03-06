var IndexDB = function(config){
	var config = config
	var MY_OBJECT_STORE = 'MyObjectStore'
	var DB_NAME = 'turbo'

	var dbTransaction = function(success){
		if (!window)
			return

		if (config.site_id == null){
			var err = new Error('Please Set Your TURBO_APP_ID')
			success(err, null)
			return
		}

		if (config.site_id.length < 20){
			var err = new Error('Please Set Your TURBO_APP_ID')
			success(err, null)			
			return
		}

		// https://gist.github.com/BigstickCarpet/a0d6389a5d0e3a24814b
		var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB

		// Open (or create) the database
		var dbRef = indexedDB.open(DB_NAME, 1)
		dbRef.onupgradeneeded = function() {
		    var db = dbRef.result
		    var store = db.createObjectStore(MY_OBJECT_STORE, {keyPath:'id'})
		}

		dbRef.onsuccess = function() {
		    // Start a new transaction
		    var db = dbRef.result
		    var tx = db.transaction(MY_OBJECT_STORE, 'readwrite')
		    var store = tx.objectStore(MY_OBJECT_STORE)
		    success(null, store)

		    // Close the db when the transaction is done
		    tx.oncomplete = function() {
		        db.close()
		    }
		}

		return dbRef
	}

	return {
		dbTransaction: dbTransaction
	}
}