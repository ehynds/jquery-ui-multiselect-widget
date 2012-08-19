(function($){

	module("methods");

	test("open", function(){
		expect(2);
	 
		el = $("select").multiselect().multiselect("open");
			ok( el.multiselect("isOpen"), "isOpen parameter true" );
			equals( menu().css("display"), "block", "Test display CSS property" );
		el.multiselect("destroy");
	});
	
	test("close", function(){
		expect(2);
	 
		el = $("select").multiselect().multiselect("open").multiselect("close");
			ok( !el.multiselect("isOpen"), "isOpen parameter false" );
			equals( menu().css("display"), "none", "Test display CSS property" );
		el.multiselect("destroy");
	});
	
	test("enable", function(){
		expect(2);
	 
		el = $("select").multiselect().multiselect("disable").multiselect("enable");
			ok( button().is(":disabled") === false, "Button is enabled" );
			ok( el.is(":disabled") === false, "Original select is enabled" );
		el.multiselect("destroy");
	});
	
	test("disable", function(){
		expect(2);
	 
	 	// clone this one so the original is not affected
		el = $("select").clone(true).appendTo(body).multiselect().multiselect("disable");
			ok( button().is(":disabled"), 'Button is disabled');
			ok( el.is(":disabled"), 'Original select is disabled');
		el.multiselect("destroy").remove();
	});
	
	test("enabling w/ pre-disabled tags (#216)", function(){
		expect(5);
	 
	 	el = $('<select><option disabled value="foo">foo</option><option value="bar">bar</option>')
			.appendTo(document.body)
			.multiselect();

		var boxes = menu().find("input")
		var disabled = boxes.first();
		var enabled = boxes.last();
		var key = "ech-multiselect-disabled";

		equals(disabled.is(":disabled"), true, "The first option is disabled");
		el.multiselect("disable");
		equals(disabled.data(key), undefined, "After disabling the widget, the pre-disabled option is not flagged to re-enable");
		equals(enabled.data(key), true, "and the enabled option is flagged to be re-enable");
		el.multiselect("enable");
		equals(disabled.is(":disabled"), true, "After enabling, the first option is still disabled");
		equals(disabled.data(key), undefined, "and the option no longer has the stored data flag");
		el.multiselect("destroy").remove();
	});
	
	test("widget", function(){
		expect(1);
	 
		el = $("select").multiselect();
			ok( menu().is("div.ui-multiselect-menu"), 'Widget is the menu element');
		el.multiselect("destroy");
	});
	
	test("getButton", function(){
		expect(1);
	 
		el = $("select").multiselect();
		var button = el.multiselect("getButton");
			ok( button.is("button.ui-multiselect"), 'Button is the button element');
		el.multiselect("destroy");
	});
	
	test("checkAll", function(){
		expect(1);
	 
		el = $("select").multiselect().multiselect("checkAll");
		var inputs = menu().find("input");
			ok( inputs.filter(":checked").length === inputs.length, 'All inputs selected on the widget?');
		el.multiselect("destroy");
	});

	test("uncheckAll", function(){
		expect(1);
	 
		el = $("select").multiselect().multiselect("checkAll").multiselect("uncheckAll");
			ok( menu().find("input:checked").length === 0, 'All inputs unchecked on the widget?');
		el.multiselect("destroy");
	});

	test("isOpen", function(){
		expect(2);
	 
		el = $("select").multiselect().multiselect("open");
			ok( el.multiselect("isOpen"), 'Testing isOpen method after calling open method');
		el = $("select").multiselect("close");
			ok( !el.multiselect("isOpen"), 'Testing isOpen method after calling close method');
		el.multiselect("destroy");
	});

	test("destroy", function(){
		expect(2);
	 
		el = $("select").multiselect().multiselect("destroy");
			ok( !$(".ui-multiselect").length , 'button.ui-multiselect removed from the DOM');
			ok( !el.data("multiselect") , 'no more multiselect obj attached to elem');
	});

	test("getChecked", function(){
		expect(2);
	 
		el = $("select").multiselect().multiselect("checkAll");
			equals( el.multiselect("getChecked").length, 9, 'number of checkboxes returned after checking all and calling getChecked');
		el.multiselect("uncheckAll");
			equals( el.multiselect("getChecked").length, 0, 'number of checkboxes returned after unchecking all and calling getChecked');
		el.multiselect("destroy");
	});

	test("refresh", function(){
		expect(4);
		
		el = $("select").clone().appendTo(body).multiselect();
		el.empty().html('<option value="foo">foo</option><option value="bar">bar</option>');
		el.multiselect('refresh');
		
		var checkboxes, getCheckboxes = (function hai(){
			checkboxes = menu().find('input[type="checkbox"]');
			return hai;
		})();
		
		equals( checkboxes.length, 2, "After clearing the select, adding 2 options, and refresh(), only 2 checkboxes exist");
		equals( checkboxes.eq(0).val(), 'foo', 'first is foo' );
		equals( checkboxes.eq(1).val(), 'bar', 'second is foo' );
		
		// add one more w/ append, just for safety's sake
		el.append('<option value="baz">baz</option>');
		el.multiselect('refresh');
		getCheckboxes();
		equals( checkboxes.eq(2).val(), 'baz', 'after an append() call, the third option is now' );
		
		el.multiselect("destroy").remove();
	});
})(jQuery);
