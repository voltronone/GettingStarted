// Custom Rally App that displays Stories in a grid.
//
// Note: various console debugging messages intentionally kept in the code for learning purposes

Ext.define('CustomApp', {
    extend: 'Rally.app.App',      // The parent class manages the app 'lifecycle' and calls launch() when ready
    componentCls: 'app',          // CSS styles found in app.css

    // Entry Point to App
    launch: function() {

      console.log('our first app');     // see console api: https://developers.google.com/chrome-developer-tools/docs/console-api
	
		this.pulldownContainer = Ext.create('Ext.container.Container', {
			id : 'pulldownContainer',
			layout: {
				type: 'hbox',
				align: 'stretch'
			},
		});
	  
	  this.add(this.pulldownContainer);
	  this._loadIterations();
    },

	_loadIterations: function() {
		this.iterations = Ext.create('Rally.ui.combobox.IterationComboBox', {
		fieldLabel : 'Iteration',
		labelAlign : 'right',
		width : 500,
		listeners : {
			ready: function(combobox) {
				console.log('ready!', combobox);
				//this._loadData();
				this._loadOwners();
			},
			select: function(combobox, records) {
				this._loadData();
			},
			scope: this
		},
		});
		this.pulldownContainer.add(this.iterations);
	},
	
	_loadOwners: function() {
		this.owners = Ext.create('Rally.ui.combobox.FieldValueComboBox', {
		model : 'TestSet',
		field : 'Owner',
		fieldLabel : 'Owner',
		labelAlign : 'right',
		listeners : {
			ready: function(combobox){
				this._loadData();
			},
			select: function(combobox, records) {
				this._loadData();
			},
			scope:this
		},
		});
		this.pulldownContainer.add(this.owners);
	},
	
    // Get data from Rally
    _loadData: function() {

	var selectedIteration = this.iterations.getRecord().get('_ref');
	var selectedOwner = this.owners.getRecord().get('value');
	console.log('chosen one: ', selectedOwner);
	
	var myFilters = [
		  {
			property: 'Iteration',
			operation: '=',
			value: selectedIteration
		  }, 
		  {
			property: 'Owner',
			operation: '=',
			value: selectedOwner
		  }
		];

	if (this.myStore) {
		
		this.myStore.setFilter(myFilters);
		this.myStore.load();
		
	} else {
      this.myStore = Ext.create('Rally.data.wsapi.Store', {
          model: 'TestSet',
          autoLoad: true,                         // <----- Don't forget to set this to true! heh
		  filters: myFilters,
          listeners: {
              load: function(myStore, myData, success) {
                  console.log('got data!', myStore, myData);
                  if (!this.myGrid) {
				  this._loadGrid(myStore); // if we did NOT pass scope:this below, this line would be incorrectly trying to call _createGrid() on the store which does not exist.
				  }
              },
              scope: this                         // This tells the wsapi data store to forward pass along the app-level context into ALL listener functions
          },
          fetch: ['FormattedID', 'Name','Iteration', 'Owner']   // Look in the WSAPI docs online to see all fields available!
        });
	}

    },

    // Create and Show a Grid of given stories
    _loadGrid: function(myStoryStore) {

      this.myGrid = Ext.create('Rally.ui.grid.Grid', {
        store: myStoryStore,
        columnCfgs: [         // Columns to display; must be the same names specified in the fetch: above in the wsapi data store
          'FormattedID', 'Name', 'Iteration', 'Owner'
        ]
      });

      this.add(this.myGrid);       // add the grid Component to the app-level Container (by doing this.add, it uses the app container)

      console.log('what is this?', this);

    }

});
