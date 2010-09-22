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
			ok( !widget().is(":disabled"), "Widget is enabled" );
			ok( !el.is(":disabled"), "Original select is enabled" );
		el.multiselect("destroy");
	});
	
	test("disable", function(){
		expect(2);
	 
	 	// clone this one so the original is not affected
		el = $("select").clone(true).insertAfter("body").multiselect().multiselect("disable");
			ok( widget().prev().is(":disabled"), 'Widget is disabled');
			ok( el.is(":disabled"), 'Original select is disabled');
		el.multiselect("destroy").remove();
	});
	
	test("widget", function(){
		expect(2);
	 
		el = $("select").multiselect();
			ok( widget().is("div.ui-multiselect-menu"), 'Widget is the menu element');
			ok( widget().prev().is("button"), 'multiselect("button") is the button element');
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
			equals( el.multiselect("getChecked").length, 7, 'number of checkboxes returned after checking all and calling getChecked');
		el.multiselect("uncheckAll");
			equals( el.multiselect("getChecked").length, 0, 'number of checkboxes returned after unchecking all and calling getChecked');
	});
	
})(jQuery);
