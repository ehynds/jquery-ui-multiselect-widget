(function($){

	module("events");

	test("multiselectopen", function(){
		expect(27);
	 
	 	// inject widget
		el = $("<select multiple><option value='foo'>foo</option></select>").appendTo(body);
		el.multiselect({
			open: function(e,ui){
				ok( true, 'option: multiselect("open") fires open callback' );
				equals(this, el[0], "option: context of callback");
				equals(e.type, 'multiselectopen', 'option: event type in callback');
				equals(menu().css("display"), 'block', 'menu display css property equals block'); 
				same(ui, {}, 'option: ui hash in callback');
			}
		})
		.bind("multiselectopen", function(e,ui){
			ok(true, 'event: multiselect("open") fires multiselectopen event');
			equals(this, el[0], 'event: context of event');
			same(ui, {}, 'event: ui hash');
		});
		
		// now try to open it..
		el.multiselect("open")
		
		// make sure the width of the menu and button are equivalent
		equals( button().outerWidth(), menu().outerWidth(), 'button and menu widths are equivalent');
		
		// close
		el.multiselect("close");
		
		// make sure a click event on the button opens the menu as well.
		button().trigger("click");
		el.multiselect("close");
		
		// make sure a click event on a span inside the button opens the menu as well.
		button().find("span:first").trigger("click");
		
		// reset for next test
		el.multiselect("destroy").remove();
		
		// now try returning false prevent opening
		el = $("<select></select>")
			.appendTo(body)
			.multiselect()
			.bind("multiselectbeforeopen", function(){
				ok( true, "event: binding multiselectbeforeopen to return false (prevent from opening)" );
				return false;
			})
			.multiselect("open");
		
		ok( !el.multiselect("isOpen"), "multiselect is not open after multiselect('open')" );
		el.multiselect("destroy").remove();
	});

	test("multiselectclose", function(){
		expect(25);
	 
	 	// inject widget
		el = $("<select multiple><option>foo</option></select>").appendTo(body);
		el.multiselect({
			close: function(e,ui){
				ok( true, 'option: multiselect("close") fires close callback' );
				equals(this, el[0], "option: context of callback");
				equals(e.type, 'multiselectclose', 'option: event type in callback');
				equals(menu().css("display"), 'none', 'menu display css property equals none'); 
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
		.multiselect("open");
		
		// make sure a click event on the button closes the menu as well.
		button().click();
		el.multiselect("open");
		
		// make sure a click event on a span inside the button closes the menu as well.
		button().find("span:first").click();

		// make sure that the menu is actually closed.  see issue #68
		ok( el.multiselect('isOpen') === false, 'menu is indeed closed' );

		el.multiselect("destroy").remove();
	});
	
	test("multiselectbeforeclose", function(){
		expect(8);
	 
	 	// inject widget
		el = $("<select multiple></select>").appendTo(body);
		el.multiselect({
			beforeclose: function(e,ui){
				ok( true, 'option: multiselect("beforeclose") fires close callback' );
				equals(this, el[0], "option: context of callback");
				equals(e.type, 'multiselectbeforeclose', 'option: event type in callback');
				same(ui, {}, 'option: ui hash');
			}
		})
		.bind("multiselectbeforeclose", function(e,ui){
			ok(true, 'multiselect("beforeclose") fires multiselectclose event');
			equals(this, el[0], 'event: context of event');
			same(ui, {}, 'event: ui hash');
		})
		.multiselect("open")
		.multiselect("close");
		
		el.multiselect("destroy").remove();
		
		// test 'return false' functionality
		el = $("<select multiple></select>").appendTo(body);
		el.multiselect({
			beforeclose: function(){
				return false;
			}
		});
		
		el.multiselect('open').multiselect('close');
		ok( menu().is(':visible') && el.multiselect("isOpen"), "returning false inside callback prevents menu from closing" );
		el.multiselect("destroy").remove();
	});
	
	test("multiselectclick", function(){
		expect(28);
	 
	 	var times = 0;

	 	// inject widget
		el = $("<select multiple><option value='1'>Option 1</option><option value='2'>Option 2</option></select>")
			.appendTo(body);
		
		el.multiselect({
			click: function(e,ui){
				ok(true, 'option: triggering the click event on the second checkbox fires the click callback' );
				equals(this, el[0], "option: context of callback");
				equals(e.type, 'multiselectclick', 'option: event type in callback');
				equals(ui.value, "2", "option: ui.value equals");
				equals(ui.text, "Option 2", "option: ui.title equals");

				if(times === 0) {
          equals(ui.checked, true, "option: ui.checked equals");
				} else if(times === 1) {
          equals(ui.checked, false, "option: ui.checked equals");
				}
			}
		})
		.bind("multiselectclick", function(e,ui){
			ok(true, 'event: triggering the click event on the second checkbox triggers multiselectclick');
			equals(this, el[0], 'event: context of event');
			equals(ui.value, "2", "event: ui.value equals");
			equals(ui.text, "Option 2", "event: ui.title equals");

      if(times === 0) {
        equals(ui.checked, true, "option: ui.checked equals");
      } else if(times === 1) {
        equals(ui.checked, false, "option: ui.checked equals");
      }
		})
		.bind("change", function(e){
			if(++times === 1){
				equals(el.val().join(), "2", "event: select element val() within the change event is correct" );
			} else {
				equals(el.val(), null, "event: select element val() within the change event is correct" );
			}

			ok(true, "event: the select's change event fires");
		})
		.multiselect("open");
		
		// trigger a click event on the input
		var lastInput = menu().find("input").last();
		lastInput[0].click();

		// trigger once more.
		lastInput[0].click();

		// make sure it has focus
		equals(true, lastInput.is(":focus"), "The input has focus");

		// make sure menu isn't closed automatically
		equals( true, el.multiselect('isOpen'), 'menu stays open' );

		el.multiselect("destroy").remove();
	});

	test("multiselectcheckall", function(){
		expect(10);
	 
	 	// inject widget
		el = $('<select multiple><option value="1">Option 1</option><option value="2">Option 2</option></select>').appendTo(body);

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
		.bind("change", function(){
			ok(true, "event: the select's change event fires");
			equals( el.val().join(), "1,2", "event: select element val() within the change event is correct" );
		})
		.multiselect("open")
		.multiselect("checkAll");

		equals(menu().find("input").first().is(":focus"), true, "The first input has focus");
		
		el.multiselect("destroy").remove();
	});
	
	test("multiselectuncheckall", function(){
		expect(10);
	 
	 	// inject widget
		el = $('<select multiple><option value="1">Option 1</option><option value="2">Option 2</option></select>').appendTo(body);

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
		.bind("change", function(){
			ok(true, "event: the select's change event fires");
			equals( el.val(), null, "event: select element val() within the change event is correct" );
		})
		.multiselect("open")
		.multiselect("uncheckAll");
		
		equals(menu().find("input").first().is(":focus"), true, "The first input has focus");

		el.multiselect("destroy").remove();
	});
	
	
	test("multiselectbeforeoptgrouptoggle", function(){
		expect(10);

		// inject widget
		el = $('<select multiple><optgroup label="Set One"><option value="1">Option 1</option><option value="2">Option 2</option></optgroup></select>')
          .appendTo(body);

		el.bind("change", function(){
			ok(true, "the select's change event fires");
		})
		.multiselect({
			beforeoptgrouptoggle: function(e,ui){
				equals(this, el[0], "option: context of callback");
				equals(e.type, 'multiselectbeforeoptgrouptoggle', 'option: event type in callback');
				equals(ui.label, "Set One", 'option: ui.label equals');
				equals(ui.inputs.length, 2, 'option: number of inputs in the ui.inputs key');
			}
		})
		.bind("multiselectbeforeoptgrouptoggle", function(e,ui){
			ok( true, 'option: multiselect("uncheckall") fires multiselectuncheckall event' );
			equals(this, el[0], 'event: context of event');
			equals(ui.label, "Set One", 'event: ui.label equals');
			equals(ui.inputs.length, 2, 'event: number of inputs in the ui.inputs key');
		})
		.multiselect("open");
		
		menu().find("li.ui-multiselect-optgroup-label a").click();
		
		el.multiselect("destroy").remove();
		el = el.clone();
		
		// test return false preventing checkboxes from activating
		el.bind("change", function(){
			ok( true ); // should not fire
		}).multiselect({
			beforeoptgrouptoggle: function(){
				return false;
			},
			// if this fires the expected count will be off.  just a redundant way of checking that return false worked
            optgrouptoggle: function(){
                ok( true );
            }
		}).appendTo( body );

        var label = menu().find("li.ui-multiselect-optgroup-label a").click();
        equals( menu().find(":input:checked").length, 0, "when returning false inside the optgrouptoggle handler, no checkboxes are checked" );
        el.multiselect("destroy").remove();
	});

	test("multiselectoptgrouptoggle", function(){
		expect(12);
		
		// inject widget
		el = $('<select multiple><optgroup label="Set One"><option value="1">Option 1</option><option value="2">Option 2</option></optgroup></select>').appendTo(body);

		el.multiselect({
			optgrouptoggle: function(e,ui){
				equals(this, el[0], "option: context of callback");
				equals(e.type, 'multiselectoptgrouptoggle', 'option: event type in callback');
				equals(ui.label, "Set One", 'option: ui.label equals');
				equals(ui.inputs.length, 2, 'option: number of inputs in the ui.inputs key');
				equals(ui.checked, true, 'option: ui.checked equals true');
			}
		})
		.bind("multiselectoptgrouptoggle", function(e,ui){
			ok( true, 'option: multiselect("uncheckall") fires multiselectuncheckall event' );
			equals(this, el[0], 'event: context of event');
			equals(ui.label, "Set One", 'event: ui.label equals');
			equals(ui.inputs.length, 2, 'event: number of inputs in the ui.inputs key');
			equals(ui.checked, true, 'event: ui.checked equals true');
		})
		.multiselect("open");
		
		// trigger native click event on optgroup
		menu().find("li.ui-multiselect-optgroup-label a").click();
		equals(menu().find(":input:checked").length, 2, "both checkboxes are actually checked" );

		equals(menu().find("input").first().is(":focus"), true, "The first input has focus");
		
		el.multiselect("destroy").remove();
	});

})(jQuery);
