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

	test("setChecked", function(){
	    var compareArrays = function(arr,other_arr) {
            if (arr.length != other_arr.length) { return false; }
            var a = arr.sort(),
                b = other_arr.sort();
            for (var i = 0; other_arr[i]; i++) {
                if (a[i] !== b[i]) {
                        return false;
                }
            }
            return true;
        };

		expect(2);

		$("select").multiselect().multiselect("setChecked",["2","3","7"]);
			equals( $("select").multiselect("getChecked").length, 3, 'number of checkboxes returned after setting 3 elements with setChecked and calling getChecked');
		el.multiselect("uncheckAll");
		var options = ["4","7","2"];
		$("select").multiselect("setChecked",options);
			ok(compareArrays($.map($("select").multiselect("getChecked"),function(i){return $(i).val();}),options), 'The options selected must be identical to the array passed as parameter');
	});

})(jQuery);

