(function($){

	module("multiselect", "events");

	test("multiselectopen", function(){
		expect(9);
	 
	 	// inject widget
		el = $("<select></select>").appendTo("body");
		el.multiselect({
			open: function(e,ui){
				ok( true, 'option: multiselect("open") fires open callback' );
				equals(this, el[0], "option: context of callback");
				equals(e.type, 'multiselectopen', 'option: event type in callback');
				same(ui, {}, 'option: ui hash in callback');
			}
		})
		.bind("multiselectopen", function(e,ui){
			ok(true, 'event: multiselect("open") fires multiselectopen event');
			equals(this, el[0], 'event: context of event');
			same(ui, {}, 'event: ui hash');
		});
		
		// now try to open it..
		el.multiselect("open");
		el.multiselect("destroy").remove();
		
		// now try returning false prevent opening
		el = $("<select></select>")
		.appendTo("body")
		.multiselect()
		.bind("multiselectopen", function(){
			ok( true, "event: binding multiselectopen to return false (prevent from opening)" );
			return false;
		})
		.multiselect("open");
		
		ok( !el.multiselect("isOpen"), "multiselect is not open after multiselect('open')" );
		el.multiselect("destroy").remove();
	});


	test("multiselectclose", function(){
		expect(9);
	 
	 	// inject widget
		el = $("<select></select>").appendTo("body");
		el.multiselect({
			close: function(e,ui){
				ok( true, 'option: multiselect("close") fires close callback' );
				equals(this, el[0], "option: context of callback");
				equals(e.type, 'multiselectclose', 'option: event type in callback');
				same(ui, {}, 'option: ui hash');
			}
		})
		.bind("multiselectclose", function(e,ui){
			ok(true, 'multiselect("close") fires multiselectclose event');
			equals(this, el[0], 'event: context of event');
			same(ui, {}, 'event: ui hash');
		})
		.multiselect("open")
		.multiselect("close")
		.multiselect("destroy")
		.remove();
		
		// now try returning false prevent opening
		el = $("<select></select>")
		.appendTo("body")
		.multiselect()
		.bind("multiselectclose", function(){
			ok( true, "event: binding multiselectclose to return false (prevent from closing)" );
			return false;
		})
		.multiselect("open")
		.multiselect("close");
		
		ok( el.multiselect("isOpen"), "multiselect is still open after a multiselect('close')" );
		
		el.multiselect("destroy").remove();
	});
	

	test("multiselectclick", function(){
		expect(9);
	 
	 	// inject widget
		el = $("<select><option value='1'>Option 1</option></select>")
		.appendTo("body")
		.multiselect({
			click: function(e,ui){
				ok( true, 'option: triggering the click event on one of the checkboxes fires the click callback' );
				equals(this, el[0], "option: context of callback");
				equals(e.type, 'multiselectclick', 'option: event type in callback');
				equals(ui.value, "1", "option: ui.value equals");
				equals(ui.text, "Option 1", "option: ui.title equals");
			}
		})
		.bind("multiselectclick", function(e,ui){
			ok(true, 'event: triggering the click event on one of the checkboxes triggers multiselectclick');
			equals(this, el[0], 'event: context of event');
			equals(ui.value, "1", "event: ui.value equals");
			equals(ui.text, "Option 1", "event: ui.title equals");
		})
		.multiselect("open");
		
		// trigger a click event on the input
		menu().find("input").trigger("click");
		
		el.multiselect("destroy").remove();
	});

	test("multiselectcheckall", function(){
		expect(7);
	 
	 	// inject widget
		el = $('<select><option value="1">Option 1</option><option value="2">Option 2</option></select>').appendTo("body");
		el.multiselect({
			checkAll: function(e,ui){
				ok( true, 'option: multiselect("checkAll") fires checkall callback' );
				equals(this, el[0], "option: context of callback");
				equals(e.type, 'multiselectcheckall', 'option: event type in callback');
				same(ui, {}, 'option: ui hash in callback');
			}
		})
		.bind("multiselectcheckall", function(e,ui){
			ok( true, 'event: multiselect("checkall") fires multiselectcheckall event' );
			equals(this, el[0], 'event: context of event');
			same(ui, {}, 'event: ui hash');
		})
		.multiselect("open")
		.multiselect("checkAll");
		
		
		el.multiselect("destroy").remove();
	});
	
	test("multiselectuncheckall", function(){
		expect(7);
	 
	 	// inject widget
		el = $('<select><option value="1">Option 1</option><option value="2">Option 2</option></select>').appendTo("body");
		el.multiselect({
			uncheckAll: function(e,ui){
				ok( true, 'option: multiselect("uncheckAll") fires uncheckall callback' );
				equals(this, el[0], "option: context of callback");
				equals(e.type, 'multiselectuncheckall', 'option: event type in callback');
				same(ui, {}, 'option: ui hash in callback');
			}
		})
		.bind("multiselectuncheckall", function(e,ui){
			ok( true, 'event: multiselect("uncheckall") fires multiselectuncheckall event' );
			equals(this, el[0], 'event: context of event');
			same(ui, {}, 'event: ui hash');
		})
		.multiselect("open")
		.multiselect("uncheckAll");
		
		
		el.multiselect("destroy").remove();
	});
	
	
	test("multiselectoptgrouptoggle", function(){
		expect(0);
	 
	 	// inject widget
		el = $('<select><optgroup label="Set One"><option value="1">Option 1</option><option value="2">Option 2</option></optgroup></select>').appendTo("body");
		el.multiselect({
			optgroupToggle: function(e,ui){
				equals(this, el[0], "option: context of callback");
				equals(e.type, 'multiselectoptgrouptoggle', 'option: event type in callback');
				equals(ui.label, "Set One", 'option: ui.label equals');
				equals(ui.inputs.length, 2, 'option: number of inputs in the ui.inputs key');
			}
		})
		.bind("multiselectoptgrouptoggle", function(e,ui){
			ok( true, 'option: multiselect("uncheckall") fires multiselectuncheckall event' );
			equals(this, el[0], 'event: context of event');
			equals(ui.label, "Set One", 'event: ui.label equals');
			equals(ui.inputs.length, 2, 'event: number of inputs in the ui.inputs key');
		})
		.multiselect("open");
		
		// trigger native click event on optgroup
		menu().find("li.ui-multiselect-optgroup-label a").click();

		el.multiselect("destroy").remove();
	});
})(jQuery);
