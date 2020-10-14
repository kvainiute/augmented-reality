function checkCodes(code, adminCode, callback) {
	var data;
	firebase.database().ref(code).once('value').then(function (snapshot) {
		data = snapshot.val();
		if (data !== null) {
			if (adminCode != data.admin) {
				data = false
			}
		} else {
			data = false
		}
		console.log(data)
		callback(data)
	});

}
