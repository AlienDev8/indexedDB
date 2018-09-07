var DBClient = {exist:true};
(function($){
	window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
	window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
	if (!window.indexedDB) {
		DBClient.exist = false;
	   console.log("Your browser doesn't support this stable version of IndexedDB.");
	}
})($, window);


DBClient = Object.assign(DBClient, {
	BDRequest:null,	
	nameObjectStored:"record",
	nameDataBase:"bd_personas",
	initialize: function(){
		var _this = this;
		this.BDRequest = indexedDB.open(this.nameDataBase,1);
		this.BDRequest.onupgradeneeded = function (e) { // cuando es necesario crear las tablas de la base de datos	        
	        thisDB = e.target.result;
	        if (!thisDB.objectStoreNames.contains(_this.nameObjectStored)) {
	            var objectStore = thisDB.createObjectStore(_this.nameObjectStored, {keyPath:"id", autoIncrement: true});
	            objectStore.createIndex("id", "id",{unique:true});
	            objectStore.createIndex("name", "name",{unique:false});
	            objectStore.createIndex("age","name",{unique:false});	                
	        }
	    }
	    //agrega evento agregar persona al boton
	    var botonAdd = document.getElementById("btnAdd"); 
	    botonAdd.addEventListener("click", function(){	    	
	    	_this.addPerson();
	    }, false);
	    // agrega evento para eleiminar todas las personas
	    var botonDeleteAll = document.getElementById("btnDeleteAll"); 
	    botonDeleteAll.addEventListener("click", function(){	    	
	    	_this.deleteAllPerson();
	    }, false);

	    this.BDRequest.onsuccess = function (e) {
	         console.log("se ha creado con exito");
	    }
	    this.BDRequest.onerror = function (e) {
	         console.log("Failed initialized datobjectStore");
	    }
	    this.listarDatos();
	},
	addPerson: function(){
		var _this = this;
		var name = document.getElementById("name").value;
		var age = document.getElementById("age").value;
		if(name !== "" && age !== ""){
			var objectPerson = {			
				name:name,
				age:age
			}
			console.log("addPerson")
			this.BDRequest = indexedDB.open(this.nameDataBase,1);
			this.BDRequest.onsuccess = function(event){
				 thisDB = event.target.result;
				 console.log(_this.nameObjectStored);
		        var transaction = thisDB.transaction([_this.nameObjectStored], "readwrite");
		        var store = transaction.objectStore(_this.nameObjectStored);
		      
		        var request = store.add(objectPerson);
		        request.onsuccess = function (e) {
		             console.log("Record of the person saved succesfully");
		             _this.listarDatos();
		        }
		        request.onerror = function (e) {
		             console.log("Fail in the save person record");
		             _this.listarDatos();
		        }
			}
		}
	},
	deleteAllPerson: function(){
		var _this = this;
		console.log("deleteAllPerson")
		this.BDRequest = indexedDB.open(this.nameDataBase,1);
		this.BDRequest.onsuccess = function(event){
			 thisDB = event.target.result;
	        var transaction = thisDB.transaction([_this.nameObjectStored], "readwrite");
	        var store = transaction.objectStore(_this.nameObjectStored);
	      	store.openCursor().onsuccess = function (event) {
	            var cursor = event.target.result;
	            if(cursor){
			        var request = store.delete(cursor.value.id);
			        request.onsuccess = function (e) {
			             console.log("Record deleted: ", cursor.value);
			        }
			        request.onerror = function (e) {
			             // console.log("Fallo el guardado del registro de la persona");
			        }
			        cursor.continue();
			    }
		    }
		    _this.listarDatos();
		}
	},
	deletePerson: function(id){
		if(id > 0){
			var _this = this;
			console.log("deleteOnePerson")
			this.BDRequest = indexedDB.open(this.nameDataBase,1);
			this.BDRequest.onsuccess = function(event){
				 thisDB = event.target.result;
		        var transaction = thisDB.transaction([_this.nameObjectStored], "readwrite");
		        var store = transaction.objectStore(_this.nameObjectStored);		       
		        var resultAfterDelete = store.delete(parseInt(id));
		        resultAfterDelete.onsuccess = function(e){
			    	_this.listarDatos();
		        }		      	
			}
		}
	},
	listarDatos: function(){
		var _this = this;
		document.getElementById("tplPersonas").innerHTML = "";
		document.getElementById("name").value = "";
		document.getElementById("age").value = "";
		document.getElementById("name").focus();
		this.BDRequest = indexedDB.open(this.nameDataBase,1);
		this.BDRequest.onsuccess = function(event){
			 thisDB = event.target.result;
	        var transaction = thisDB.transaction([_this.nameObjectStored], "readwrite");
	        var store = transaction.objectStore(_this.nameObjectStored);
	      
	        store.openCursor().onsuccess = function (event) {
	            var cursor = event.target.result;
	            var ul = document.getElementById("tplPersonas");
	            if (cursor) {
	                var li = document.createElement("li");
	                var divName = document.createElement("div");
	                var divAge = document.createElement("div");
	                var divOpt = document.createElement("div");
	               	divName.className = "element name";
	               	divAge.className = "element age";
	               	divOpt.className = "element";
	                console.log(cursor.value);
	                divName.textContent = cursor.value.name;
	                divAge.textContent = cursor.value.age;
	                divOpt.innerHTML = '<small class="delete" data-id-person="'+cursor.value.id+'">Delete</small>';
	                
	                li.appendChild(divName);
	                li.appendChild(divAge);
	                li.appendChild(divOpt);
	                ul.appendChild(li);
	                divOpt.addEventListener("click", function(){
	                	var id = this.children[0].getAttribute("data-id-person");
	                	_this.deletePerson(id);	                	
	                });
	                cursor.continue();
	            }        
	        }
		}
	}
});

DBClient.initialize();
