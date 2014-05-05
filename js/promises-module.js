
var APP = window.APP || {};

APP.promiseModule = (function (d) {

    var config = {
        baseURL: 'http://54.72.3.96:3000/',
        getAllBtn: d.getElementById('get-all-techtalks'),
        talksWrapper: d.getElementById('tech-talks-wrapper'),
        talksCount: d.getElementById('talks-count'),
        runCrudBtn: d.getElementById('run-crud-process')
    };

    return {

        init: function() {
            config.promise = this.createPromise;
            this.setupListeners();
        },

        setupListeners: function(){
            config.getAllBtn.onclick = this.getAllTalks.bind(this);
            config.runCrudBtn.onclick = this.runCRUD.bind(this);
        },

        createPromise: function(type, url, data) {

            return new Promise(function (resolve, reject) {

                var xhr = new XMLHttpRequest();

                xhr.open(type, url, true);
                xhr.setRequestHeader('Content-Type', 'application/json');

                xhr.onreadystatechange = function() {
                    var status = xhr.status;

                    if (xhr.readyState == 4) {

                        if (status >= 200 && status < 300 || status === 304 ) {
                            resolve(xhr.response);
                        } else {
                            reject(Error(xhr.statusText));
                        }
                    }
                }

                xhr.send(data);
            });
        },

        getAllTalks: function() {

            var _that = this,
                url = config.baseURL + 'techtalks';

            config.promise('GET', url, null).then(function (data) {
                _that.renderAllTalks(data)
            });
        },

        renderAllTalks: function(data) {

            var json = JSON.parse(data),
                fragment = document.createDocumentFragment(),
                li = document.createElement('li'),
                itemNumber = 0,
                title,
                lector;

                for (var i = 0, max = json.length; i < max; i++ ) {

                    if (json[i].title && json[i].title != '') {

                        li = li.cloneNode(true);
                        title = json[i].title;
                        itemNumber++;

                        if (json[i].lector) {
                            lector = json[i].lector.join(',');
                        } else {
                            lector = 'Error: lector was not found';
                        }

                        li.innerHTML = '<div>' + itemNumber + '. ' + title + '</div>' + '<em>' + lector + '</em>';
                        fragment.appendChild(li);
                    }
                }

            config.talksWrapper.appendChild(fragment);
            config.talksCount.innerHTML = 'Total talks: ' + '<strong>' + itemNumber + '</strong>';
        },

        runCRUD: function() {

            var url = config.baseURL + 'techtalks',
                newTechTalk = window.techTalkMock;

                newTechTalk = JSON.stringify(newTechTalk);

            // creating new record
            config.promise('POST', url, newTechTalk).then(function (response) {

                var parsedRes = JSON.parse(response),
                    createdID = parsedRes._id,
                    url = config.baseURL + 'techtalks/' + createdID;

                    console.log(parsedRes, 'STEP #1 - New record create - DONE!')

                return url;

            }).then(function (url) {

                // reading new record
                var createdRecord = config.promise('GET', url, null).then(function (response) {
                        console.log(JSON.parse(response), 'STEP #2 - New record read - DONE!');
                    return response;
                });

                return {
                    createdRecord: createdRecord,
                    url: url
                }

            }).then(function (options) {

                var updates = window.techTalkMock,
                    url = options.url;

                    updates.title = 'History API - Updated Title';
                    updates = JSON.stringify(updates);

                // updating new record
                config.promise('PUT', options.url, updates).then(function (updatedRecord) {
                    console.log(JSON.parse(updatedRecord), 'STEP #3 - New record update - DONE!');
                });

                return url;

            }).then(function (url) {

                //deleting new record
                config.promise('DELETE', url, null).then(function () {
                    console.log('STEP #4 - New record delete - DONE!');
                });
            });
        }
   };

})(document);

