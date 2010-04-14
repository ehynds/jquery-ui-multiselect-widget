(function($){

	module("multiselect", "methods");

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
			ok( widget().is(":disabled"), 'Widget is disabled');
			ok( el.is(":disabled"), 'Original select is disabled');
		el.multiselect("destroy").remove();
	});
	
	test("widget", function(){
		expect(1);
	 
		el = $("select").multiselect();
			ok( widget().is(":button"), 'Widget is the button element');
		el.multiselect("destroy");
	});
	
	test("checkAll", function(){
		expect(2);
	 
		el = $("select").multiselect().multiselect("checkAll");
		var inputs = menu().find("input");
			ok( el.find("option").filter(":selected").length === el.find("option").length, 'All options selected on the original?');
			ok( inputs.filter(":checked").length === inputs.length, 'All inputs selected on the widget?');
		el.multiselect("destroy");
	});

	test("uncheckAll", function(){
		expect(2);
	 
		el = $("select").multiselect().multiselect("checkAll").multiselect("uncheckAll");
			ok( el.find("option").filter(":selected").length === 0, 'All options deselected on the original?');
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
			ok( !el.is(":hidden") , 'original select is visible');
	});
})(jQuery);
