// to test, first create a search service in azure, and set the url and key here.

var client = require('./index')({
    url: "https://xxx.search.windows.net",
	key: "yyy"
});

describe("search service", function(){

	it("creates an index", function(done){

		var schema = { 
		  name: 'myindex',
		  fields:
		   [ { name: 'id',
		       type: 'Edm.String',
		       searchable: false,
		       filterable: true,
		       retrievable: true,
		       sortable: true,
		       facetable: true,
		       suggestions: false,
		       key: true },
		     { name: 'description',
		       type: 'Edm.String',
		       searchable: true,
		       filterable: false,
		       retrievable: true,
		       sortable: false,
		       facetable: false,
		       suggestions: true,
		       key: false } ],
		  scoringProfiles: [],
		  defaultScoringProfile: null,
		  corsOptions:  {allowedOrigins: ["*"]}
		};

		client.createIndex(schema, function(err, data){
			if (err) return done("error returned " +  err.message);
			if (!data) return done("data is not defined");
			if (data.name !== "myindex") return done("no index name");
			if (data.fields.length !== 2) return done("wrong number of fields");
			return done();
		});
	});

	it("get index stats", function(done){
		client.getIndexStats("myindex", function(err, index){
			if (err) return done("error returned");
			if (!index) return done("index is null");
			if (index.documentCount !== 0) return done("wrong document size");
			return done();
		});
	});

	it("indexes a document", function(done){

	    var doc1 = {
	      "id": "document1",
	      "description": "this is the description of my unique document"
	    }
	    client.addDocuments("myindex", [doc1], function(err, data){
			if (err) return done("error returned");
			if (!data) return done("data is null");
			return done();
	    });
	});

	it("deletes a document", function(done){

	    var doc2 = {
	      "id": "document2",
	      "description": "this is the description of my document"
	    };
    
	    client.addDocuments("myindex", [doc2], function(err, data){
			if (err) return done("error returned");
			if (!data) return done("data is null");
			
			var key = { "id":"document2" };

			client.deleteDocuments("myindex", [key], function(err, data){
				if (err) return done("error returned");
				if (!data) return done("data is null");
				return done();
	    	});

	    });
	    
	});

	it("updates a document", function(done){

	    var doc3 = {
	      "id": "document3",
	      "description": "this is the description of my document"
	    };
    
	    client.addDocuments("myindex", [doc3], function(err, data){
			if (err) return done("error returned");
			if (!data) return done("data is null");
			//update description field
			doc3.description = "updated description";

			client.updateDocuments("myindex", [doc3], function(err, data){
				if (err) return done("error returned");
				if (!data) return done("data is null");

				//ensure changes were saved
				client.lookup("myindex", "document3", function(err, results){
					if (err) return done("error returned");
					if (!results) return done("results is null");
					if (results.description !== doc3.description) return done("document not updated");
					return done();
				});
			});

	    });
	    
	});

	it("uploads a document", function(done){

	    var doc4 = {
	      "id": "document4",
	      "description": "this is the description of my document"
	    };
    
	    client.uploadDocuments("myindex", [doc4], function(err, data){
			if (err) return done("error returned");
			if (!data) return done("data is null");
			//update description field
			doc4.description = "updated description";

			client.uploadDocuments("myindex", [doc4], function(err, data){
				if (err) return done("error returned");
				if (!data) return done("data is null");

				//ensure changes were saved
				client.lookup("myindex", "document4", function(err, results){
					if (err) return done("error returned");
					if (!results) return done("results is null");
					if (results.description !== doc4.description) return done("document not updated");
					return done();
				});
			});

	    });
	    
	});


	it("lists the indexes", function(done){
		client.listIndexes(function(err, indexes){
			if (err) return done("error returned", err);
			if (!Array.isArray(indexes)) return done("indexes is not an array");
			if (indexes[0].name !== "myindex") return done("entry 0 has the wrong name");
			return done();
		});
	});

	it("get an indexes", function(done){
		client.getIndex("myindex", function(err, index){
			if (err) return done("error returned", err);
			if (!index) return done("index is null");
			if (index.name !== "myindex") return done("index has the wrong name");
			return done();
		});
	});


	it("searches with no result", function(done){
		client.search("myindex", {search:"1234"}, function(err, results){
			if (err) return done("error returned");
			if (!results) return done("results is null");
			if (!Array.isArray(results)) return done("results is not an array");
			if (results.length !== 0) return done("results is not the right length");
			return done();
		});
	});

	it("looks up a document", function(done){
		client.lookup("myindex", "document1", function(err, results){
			if (err) return done("error returned");
			if (!results) return done("results is null");
			if (results.id !== "document1") return done("wrong results");
			return done();
		});
	});

	it("counts documents in an index", function(done){
		client.count("myindex", function(err, count){
			if (err) return done("error returned");
			//if (count !== 1) return done("wrong results");
			return done();
		});
	});


	it("suggestions", function(done){
		client.suggest("myindex", {search:"doc"}, function(err, results){
			if (err) return done("error returned");
			if (!results) return done("results is null");
			if (!Array.isArray(results)) return done("results is not an array");
			return done();
		});
	});

	
	it("searches", function(done){
		client.search("myindex", {search:"unique"}, function(err, results){
			if (err) return done("error returned");
			if (!results) return done("results is null");
			if (!Array.isArray(results)) return done("results is not an array");
			if (results.length !== 1) return done("results is not the right length");
			if (results[0].id !== 'document1') return done("doc 1 is not returned")
			return done();
		});
	});

	it("searches with full results", function(done){
		client.search("myindex", {search:"unique", $count:true, fullResults: true}, function(err, results){
			if (err) return done("error returned");
			if (!results) return done("results is null");
			if (!results["@odata.count"]) return done("results[\"@odata.count\"] doesn't exists");
			if (!Array.isArray(results.value)) return done("results.value is not an array");
			if (results.value.length !== 1) return done("results.value is not the right length");
			if (results.value[0].id !== 'document1') return done("doc 1 is not returned");
			return done();
		});
	});

	it("updates an index", function(done){

		var schema = { 
		  name: 'myindex',
		  fields:
		   [ { name: 'id',
		       type: 'Edm.String',
		       searchable: false,
		       filterable: true,
		       retrievable: true,
		       sortable: true,
		       facetable: true,
		       suggestions: false,
		       key: true },
		     { name: 'description',
		       type: 'Edm.String',
		       searchable: true,
		       filterable: false,
		       retrievable: true,
		       sortable: false,
		       facetable: false,
		       suggestions: true,
		       key: false },
			{ name: 'foo',
		       type: 'Edm.String',
		       searchable: true,
		       filterable: false,
		       retrievable: true,
		       sortable: false,
		       facetable: false,
		       suggestions: true,
		       key: false } ],
		  scoringProfiles: [],
		  defaultScoringProfile: null,
		  corsOptions:  {allowedOrigins: ["*"]}
		};

		client.updateIndex("myindex", schema, function(err){
			if (err) return done("error returned " +  err.message);
			return done();
		});
	});

	it("deletes an index", function(done){
		client.deleteIndex("myindex", function(err, index){
			if (err) return done("error returned", err);
			return done();
		});
	});

	
});


